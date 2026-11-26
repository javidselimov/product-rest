# Research: Rəsmi məzənnə bülleteninin Excel importu

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-20

## R1. xlsx faylını `api-cbar-admin`-də nə ilə oxumaq

- **Decision**: Yeni NuGet paketi yoxdur. BCL ilə kiçik, yalnız oxuyan reader yazılır:
  `System.IO.Compression.ZipArchive` + `System.Xml.XmlReader`. Oxunanlar:
  `xl/workbook.xml` (`workbookView/@activeTab` + `sheets/sheet`),
  `xl/_rels/workbook.xml.rels` (vərəq faylının yolu), `xl/sharedStrings.xml` və aktiv vərəqin
  XML-i. Yalnız `B` və `G` sütunları, 7–100-cü sətirlər.
- **Rationale**:
  - Lazım olan çox kiçikdir: 2 sütun, 94 sətir, formatlama yoxdur, yazma yoxdur.
  - Paylaşılan pipeline-a və iki `Cbar.Domain` nüsxəsinə yeni asılılıq girmir (bank mühitində
    hər paket ayrıca yoxlanılır).
  - Lokalda .NET SDK yoxdur (memory: `no-dotnet-sdk-locally`): tanış olmayan kitabxana API-sini
    burada sınamaq mümkün deyil, BCL API-si isə sabit və sənədlidir.
  - Təhlükəsizlik sərhədləri tam bizim əlimizdədir: zip entry-lərin açılmış ölçüsünə hədd
    (zip bomb), `DtdProcessing.Prohibit` + `XmlResolver = null` (XXE), 100-cü sətirdən sonra
    oxumanı dayandırmaq.
- **Alternatives considered**:
  - `DocumentFormat.OpenXml` (Microsoft, MIT): ən yaxşı ikinci seçim; reader bir gün daha çox
    sütun/vərəq tələb etsə ona keçmək asandır. İndi bir asılılıq üçün çox az iş görür.
  - `ClosedXML`: OpenXml-in üstündə ağır qat, yalnız oxuma üçün lazımsızdır.
  - `ExcelDataReader`: yüngüldür, amma `xls` dəstəyi üçün encoding provider gətirir; `xls`
    spec-də dəstəklənmir.
  - Frontend-də oxuyub mövcud `PUT`-a göndərmək (SheetJS): bülletenin qaydaları iki yerdə
    olardı, `xlsx` paketi də npm-də köhnəlib. Server tərəfi tək həqiqət mənbəyidir.

## R2. Hansı xana tipləri dəstəklənir

- **Decision**:
  - `B` (kod): `t="s"` (shared string, rich text run-ları birləşdirilir), `t="inlineStr"`,
    `t="str"` (düstur nəticəsi mətn). Trim + `ToUpperInvariant`; düz 3 Latın hərfi `[A-Z]{3}`
    deyilsə sətir ötürülür.
  - `G` (məzənnə): tipsiz və ya `t="n"` xana, `<v>` mətni. Düsturlu xanada keşlənmiş `<v>`
    götürülür. `t="s"`/`t="str"`/`t="b"`/`t="e"` və ya boş xana tanınan kod üçün **xətadır**
    (FR-011).
- **Rationale**: Nümunə faylda `B` shared string, `G` rəqəmdir. Legacy `rangeToArray(..., null,
  true, false, true)` formatlanmamış xam dəyəri götürürdü (`formatData = false`); `<v>` mətni
  bunun eynisidir.
- **Alternatives considered**: Mətn kimi saxlanmış rəqəmi (`"1,7"`) qəbul etmək — vergül/nöqtə
  qeyri-müəyyənliyi yaradır, rəsmi məzənnə üçün təxmin etmək olmaz.

## R3. Yuvarlaqlaşdırma legacy ilə eyni olsun

- **Decision**: `<v>` mətni `decimal.TryParse(NumberStyles.Float, InvariantCulture)` ilə birbaşa
  `decimal`-a çevrilir (`1.7899999999999999E-2` daxil). Sonra iki addım:
  1. 15 əhəmiyyətli rəqəmə yuvarlaqlaşdırma (`0.56379999999999997 → 0.5638`),
  2. `Math.Round(x, 4, MidpointRounding.AwayFromZero)`.
- **Rationale**: Legacy PHP `round($double, 4)` ilə işləyirdi. PHP 7/8 `round()` əvvəlcə 15
  əhəmiyyətli rəqəmə "pre-rounding" edir və yarımı sıfırdan uzağa yuvarlaqlaşdırır. Excel də
  dəyəri 15 rəqəmlə göstərir. Bu iki addım `0.12344999999999999` kimi sərhəd hallarında da
  PHP ilə eyni nəticə verir; birbaşa `Math.Round(…, 4)` `0.1234` verərdi. Real bülletendə
  dəyərlər onsuz da ≤ 4 onluq rəqəmlidir, ona görə praktikada fərq yalnız sərhəd halında olur.
  `double`-a heç vaxt çevrilmir.
- **Alternatives considered**: `double.Parse` + `Math.Round` — ikili təqdimat xətası və banker's
  rounding (`ToEven`) default-u legacy-dən fərqli nəticə verə bilər.

## R4. SDR üçün master kodu: `SDR` yoxsa `XDR`

- **Decision**: Master-də kod **`SDR`**. Import faylın `XDR` kodunu `SDR`-ə çevirir.
- **Rationale**:
  - Legacy SDR-i `sdr` sütununda saxlayırdı və XML feed `Code="SDR"` verirdi
    (`product-host/visitor/views/currency/xml.php`, `strtoupper($code)`). XML feed kontraktdır
    (Maddə VII.1); `SDR` kodu yeni `api-cbar`-da heç bir dəyişiklik olmadan düzgün çıxır.
  - `diff_report_logic.md` §4.1: "XML-də `SDR`" köhnə davranışdır.
  - `currencies.code` `char(3)`-dür, `SDR` sığır.
- **Alternatives considered**: `XDR` (ISO 4217) saxlayıb XML-də `SDR`-ə map etmək —
  `api-cbar`-da xüsusi hal yaradır və public cədvəl/XML arasında kod uyğunsuzluğu olur.
  Legacy HTML cədvəldə `XDR` göstərirdi; bu fərq kiçikdir (diff report-da `O` prioriteti).

## R5. Bank metalları və XML feed

- **Decision**: `api-cbar` XML feed-i legacy kimi iki blok verir:
  1. `<ValType Type="Bank metalları">`: **birinci**, sabit sıra `XPD, XPT, XAG, XAU`,
     `<Nominal>1 t.u.</Nominal>`, `<Name>` = az adı nominal prefiksi olmadan
     (`Palladium`, `Platin`, `Gümüş`, `Qızıl`).
  2. `<ValType Type="Xarici valyutalar">`: qalan bütün kodlar, metallar **çıxılır**.
  Metal kodları `api-cbar`-da sabit set kimi saxlanılır (legacy `$ignoreCurrencies` kimi).
  Həmin tarix üçün metal yoxdursa birinci blok buraxılır. Hər iki `TODO(compat)` marker-i qalır.
- **Rationale**: Metallar master-ə əlavə olunanda (FR-010a) indiki feed onları
  "Xarici valyutalar" blokuna qoyardı. Bu, kontraktın pozulması olardı: banklar və ERP-lər
  `XAU`-nu valyuta kimi oxuyardı. Legacy struktur artıq məlumdur (yuxarıdakı fayl), ona görə
  onu bərpa etmək kontrakta yaxınlaşmaqdır, onu dəyişmək deyil.
- **Alternatives considered**:
  - Metalları XML-dən sadəcə çıxarmaq — daha kiçik iş, amma legacy-dən fərq qalır.
  - `currencies` cədvəlinə `kind` sütunu əlavə etmək — sxem dəyişikliyi və hər iki `Cbar.Domain`
    üçün entity dəyişikliyi; 4 sabit ISO kodu üçün çox ağırdır.

## R6. Yeni valyutaların sırası, adları, nominalı

- **Decision**:
  - Mövcud 12 valyutanın sətrinə toxunulmur (redaktorun seçdiyi sıra və ana səhifə bayrağı
    qalır).
  - 30 yeni kodun `sort_order`-i 13-dən başlayır və legacy siyahının sırasını izləyir
    (`product-host/common/messages/az/other.php` → `'currencies'`): əvvəl valyutalar, sonda
    metallar `XAU, XAG, XPT, XPD`.
  - Nominal bülletenin `A` sütunundandır (legacy siyahı ilə də uyğundur): `KRW, HUF, UZS, PKR`
    = 100, qalanları = 1.
  - az adı bülletenin `C` sütunundan; en adı legacy `common/messages/en/other.php`-dən
    (nominal prefiksi atılır).
  - `is_active = true`, `show_on_homepage = false`.
  - Migration idempotentdir: `ON CONFLICT DO NOTHING` (test/prod-da kod artıq əl ilə əlavə
    olunubsa toxunulmur).
- **Rationale**: Mövcud qeydlərin üzərinə yazmamaq redaktor qərarlarını qoruyur. XML-də valyuta
  sırası onsuz da legacy-dən fərqlidir (`TODO(compat)`); bu spec həmin fərqi artırmır.
- **Alternatives considered**: Bütün 42 kodu legacy sırasına görə yenidən nömrələmək — ana
  səhifə kartının və public cədvəlin redaktorun seçdiyi sırasını pozardı.

## R7. API forması

- **Decision**: `POST /api/v1/currency-rates/import`, `multipart/form-data`: `date`
  (`yyyy-MM-dd`, məcburi), `file` (məcburi), `overwrite` (bool, default `false`). İcazə:
  `currency_rates.prepare`.
  - Tarixdə artıq məzənnə var və `overwrite != true` → `409`, `code: "sheet_exists"`; panel təsdiq
    dialoqu göstərib eyni sorğunu `overwrite=true` ilə təkrarlayır (Q2).
  - Uğur → `200`: `{ date, imported, skipped[], rates[] }`.
  - Bütün xətalar `application/problem+json`, `code` extension-u ilə (panel mesajı `code`-a
    görə lokallaşdırır, FR-020); sətir xətalarında əlavə `row`, `currency`.
  - Yazı mövcud `PUT` ilə eyni merge məntiqidir (faylda olmayan kodlar toxunulmaz); kod
    controller-in ortaq private metoduna çıxarılır ki, iki yol ayrılmasın.
  - Request ölçüsü: `[RequestSizeLimit(5 MB)]` + `[RequestFormLimits]`.
- **Rationale**: Server tərəfdə `409` yoxlaması iki redaktorun eyni vaxtda yükləməsində də
  təhlükəsizdir; panelin əvvəlcədən `GET` etməsinə ehtiyac qalmır. `200` + gövdə lazımdır, çünki
  panel sayı və ötürülən kodları göstərir (FR-019).
- **Alternatives considered**:
  - `PUT /currency-rates` gövdəsinə fayl əlavə etmək — JSON və multipart bir endpoint-də
    qarışır, OpenAPI-də iki content type tələb edir.
  - Yalnız panel-də təsdiq — iki tab/redaktor halında səssiz üstünə yazma.

## R8. Audit

- **Decision**: `audit.Log("currency_rates.import", "currency_rate_sheet", yyyyMMdd, before:
  {köhnə dəyərlər}, after: { fileName, rates })`. `fileName` `MediaUploadRules.SanitizeFileName`
  ilə təmizlənir. Fayl özü heç yerdə saxlanılmır (FR-018).
- **Rationale**: Mövcud `currency_rates.upsert` ilə eyni entity tipi və açar; ayrıca action adı
  importu əl ilə saxlamadan ayırır. `before` üstünə yazılan dəyərləri bərpa etməyə imkan verir.

## R9. Frontend axını

- **Decision**: "Məzənnələr" səhifəsinin header-ində `currency_rates.prepare` icazəsi ilə
  "Excel-dən yüklə" düyməsi. Dialoq: `DatePicker` (default: seçilmiş vərəqin tarixi, yoxdursa
  bu gün) + `.xlsx` fayl seçimi. `409 sheet_exists` → təsdiq dialoqu → `overwrite=true` ilə
  təkrar. Uğurda toast (say + ötürülən kodlar), sorğu keşi (`sheet`, `dates`) invalidasiya olunur
  və səhifə həmin tarixə keçir. Cavab Zod ilə parse olunur; xəta mesajları `currency`
  namespace-də az/en.
- **Rationale**: Mövcud `currencyService` + `useSaveSheet` nümunəsi; `media.service.ts`-dəki
  `FormData` nümunəsi. Token yalnız yaddaşda qalır (spec 005) — `apiClient` bunu edir.

## R10. Verification

- **Decision**: API-lərdə test layihəsi yoxdur (Maddə VIII.1); lokalda .NET SDK də yoxdur.
  Backend `dotnet build` CI-da, davranış isə test mühitində nümunə fayl ilə yoxlanılır
  ([quickstart.md](quickstart.md)). Admin panel `npm run verify` + MSW testləri (Node 22 ilə də,
  memory: `run-tests-on-node22`).
