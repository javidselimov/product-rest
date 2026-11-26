---

description: "Task list — 025 Rəsmi məzənnə bülleteninin Excel importu"
---

# Tasks: Rəsmi məzənnə bülleteninin Excel importu

**Input**: `specs/025-currency-rates-xlsx-import/` — [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/),
[quickstart.md](quickstart.md)

**Tests**: API-lərdə test layihəsi yoxdur (Maddə VIII.1) — backend `dotnet build` (CI) +
[quickstart.md](quickstart.md) test mühitində. Admin panel üçün Vitest + MSW testləri `npm run verify`
gate-inin hissəsidir, ona görə daxil edilib.

**Organization**: User story-lərə görə. Üç upstream MR: `api-cbar-admin` → `api-cbar` →
`web-cbar-admin-new` (deploy sırası bu).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel işlənə bilər (fərqli fayl, tamamlanmamış tapşırıqdan asılı deyil)
- **[Story]**: US1 / US2 / US3 (spec.md)
- Yollar repo kökündən: `product-rest/<component>/…`

## Path Conventions

- Admin API: `product-rest/api-cbar-admin/` (`src/Cbar.AdminApi/`, `db/migrations/`, `openapi/`)
- Public API: `product-rest/api-cbar/` (`src/Cbar.WebApi/`, `openapi/`)
- Admin panel: `product-rest/web-cbar-admin-new/src/`

---

## Phase 1: Setup (spec-first kontrakt)

**Purpose**: CLAUDE.md qaydası — endpoint əvvəl OpenAPI-də, təsdiqdən sonra controller.
`.claude/hooks/spec-first.mjs` route bundle-da olmadan controller redaktəsini rədd edir.

- [X] T001 `/api-endpoint` skill-i ilə başla; `product-rest/api-cbar-admin/openapi/components/schemas/statistics.yaml`-a `CurrencyRateImportResult` (`date` date, `imported` int, `skipped` string[], `rates` → `{currencyCode, rate}[]`) və `CurrencyRateImportForm` (multipart: `date` date məcburi, `file` binary məcburi, `overwrite` boolean default false) sxemlərini əlavə et — [contracts/admin-api-import.md](contracts/admin-api-import.md)
- [X] T002 `product-rest/api-cbar-admin/openapi/paths/statistics.yaml`-a `rateImport.post` əlavə et: tag `Statistics`, `operationId: importCurrencyRateSheet`, `x-permission: currency_rates.prepare`, `200` → `CurrencyRateImportResult`, `400` (BusinessRule; `code` dəyərləri `date_required`, `file_required`, `not_xlsx`, `file_too_large`, `no_rates`, `invalid_rate`, `duplicate_code`; extension-lar `row`, `currency`, `skipped`), `409` (`sheet_exists`, `count`), `413`, `401`, `403`; təsvirdə merge semantikası və "xəta → heç nə yazılmır"
- [X] T003 `product-rest/api-cbar-admin/openapi/openapi.yaml`-da `/api/v1/currency-rates/import: $ref: paths/statistics.yaml#/rateImport` sətrini `/api/v1/currency-rates/dates`-in yanına əlavə et; `openapi/` qovluğunda lint + bundle (`openapi/README.md`-dəki əmrlər) — `dist/openapi.json` yenilənməlidir
- [X] T004 [P] `product-rest/api-cbar/openapi/paths/currencies.yaml`-da `ratesXml` cavab təsvirini/nümunəsini [contracts/public-xml-feed.md](contracts/public-xml-feed.md)-ə görə yenilə ("Bank metalları" bloku birinci, `XPD, XPT, XAG, XAU`, `1 t.u.`; metal yoxdursa blok yoxdur); lint + bundle
- [X] T005 **İstifadəçi təsdiqi**: T001–T004 diff-ini göstər, təsdiq alınmadan Phase 2 controller tapşırıqlarına keçmə

**Checkpoint**: Spec bundle-da, təsdiqlənib.

---

## Phase 2: Foundational (bütün story-lər üçün blok)

**Purpose**: Master tamamlanmadan nümunə faylın 30 kodu ötürülər (FR-010a); reader olmadan heç bir story işləmir.

- [X] T006 `product-rest/api-cbar-admin/db/migrations/0010-currency-bulletin-master.sql` yarat: [data-model.md](data-model.md) cədvəlindəki 30 kod üçün `INSERT INTO currencies (code, nominal, sort_order, is_active, show_on_homepage) … ON CONFLICT (code) DO NOTHING`; tərcümələr `INSERT INTO currency_translations (currency_code, locale, name) SELECT v.code, v.locale, v.name FROM (VALUES …) v JOIN locales l ON l.code = v.locale ON CONFLICT (currency_code, locale) DO NOTHING` — boş bazada migration-lar `db/seed.sql`-dan **əvvəl** işləyir və `locales` hələ boşdur (`db/seed.sql:18`, 0002 qeydi `seed.sql:38`), `JOIN` FK xətasının qarşısını alır; `BEGIN/COMMIT` yoxdur; başlıq şərhində spec 025, mənbələr (bülleten `C` sütunu, `product-host/common/messages/en/other.php`) və bu sıra qeydi; mövcud 12 koda toxunma. Fayl adının `product-rest/api-cbar/db/migrations/`-də olmadığını yoxla
- [X] T007 `product-rest/api-cbar-admin/db/seed.sql`: boş Development bazası üçün eyni 30 kodun `currency_translations` (az + en) sətirlərini mövcud translation blokundan sonra əlavə et (`currencies` sətirləri `0010`-dan gəlir; seed-in mövcud 12 kodluq `INSERT INTO currencies`-i `0010` ilə toqquşmur — kəsişmə yoxdur); 0002 qeydi kimi qısa şərh: "Migration 0010 adds these currencies; on a fresh DB it runs before locales exist, so their names are seeded here"
- [X] T008 `product-rest/api-cbar-admin/src/Cbar.AdminApi/Validation/RateBulletinReader.cs` yarat (saf statik sinif, `MediaUploadRules` üslubunda XML şərhlər): `Read(Stream) → BulletinReadResult` — `ZipArchive` ilə `xl/workbook.xml` (`bookViews/workbookView/@activeTab`, default 0 → `sheets/sheet[i]/@r:id`), `xl/_rels/workbook.xml.rels` (Target nisbi `worksheets/…` və ya mütləq `/xl/…`), `xl/sharedStrings.xml` (yoxdursa boş; `si/t` və `si/r/t` birləşdirilir), aktiv vərəq; `XmlReaderSettings { DtdProcessing = Prohibit, XmlResolver = null }`; hər entry açılmış ölçüsü ≤ 20 MB (aşarsa `file_too_large`); yalnız `B` və `G` sütunları, 7–100-cü sətirlər, 100-dən sonra oxumanı dayandır; xana tipləri research R2; nəticə `BulletinRow(int Row, string Code, string? RawValue, bool IsNumeric)` siyahısı; zip/xml xətası və ya vərəq tapılmaması → `not_xlsx`
- [X] T009 `RateBulletinReader.cs`-ə `NormalizeRate(string raw) → decimal?` əlavə et: `decimal.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture)`, 15 əhəmiyyətli rəqəmə yuvarlaqlaşdırma, sonra `Math.Round(x, 4, MidpointRounding.AwayFromZero)` (research R3); `double` istifadə etmə. XML şərhdə nümunələr: `0.56379999999999997 → 0.5638`, `1.7899999999999999E-2 → 0.0179`, `0.12344999999999999 → 0.1235`
- [X] T010 `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/CurrencyRatesController.cs`: `Upsert`-in yazı hissəsini (mövcud sətirləri tap, yenilə/əlavə et, `CreatedBy`, tranzaksiya) `private Task MergeRatesAsync(DateOnly date, IReadOnlyList<CurrencyRateItemDto> rates, int? userId)` metoduna çıxar; `PUT` davranışı və audit (`currency_rates.upsert`) dəyişmir

**Checkpoint**: Migration + reader + ortaq merge hazırdır.

---

## Phase 3: User Story 1 — Redaktor günün bülletenini fayl ilə yükləyir (P1) 🎯 MVP

**Goal**: Tarix + nümunə fayl → 42 kod həmin tarixə yazılır, nəticə panel-də görünür; mövcud tarixdə təsdiqlə üstünə yazma.

**Independent Test**: [quickstart.md](quickstart.md) §1–§3, §6, §7 — 13.10.2026 + `Resmi Mezenne 13 10 2026.xlsx` → `USD 1.7000`, `EUR 1.8992`, `BYN 0.5638`, `SDR 2.3005`, `XAU 7133.2510`; XML-də metal bloku.

### api-cbar-admin

- [X] T011 [US1] `CurrencyRatesController.cs`-ə `[HttpPost("import")]`, `[RequirePermission(Permissions.CurrencyRates.Prepare)]`, `[RequestSizeLimit(5_242_880)]`, `[RequestFormLimits(MultipartBodyLengthLimit = 5_242_880)]`, `[Consumes("multipart/form-data")]` ilə `Import([FromForm] DateOnly? date, IFormFile? file, [FromForm] bool overwrite = false)` əlavə et; yoxlamalar ardıcıllıqla: `date` → `date_required`; `file` null/0 bayt → `file_required`; `SanitizeFileName` sonrası uzantı `.xlsx` və `MediaUploadRules.MatchesSignature(".xlsx", head)` → yoxsa `not_xlsx`. Bütün xətalar `ErrorProblem(status, message, code, extensions)` ilə
- [X] T012 [US1] `Import`-da reader nəticəsini emal et (data-model "Bülleten sətri" cədvəli): `XDR → SDR`; master kodlarını bir sorğu ilə yüklə; master-də olmayan → `skipped` (sıra ilə, təkrarsız); tanınan kodun dəyəri yox/rəqəm deyil/`NormalizeRate ≤ 0` → `400 invalid_rate` + `row`, `currency`; təkrar kod → `400 duplicate_code` + `row`, `currency`; tanınan kod yoxdursa → `400 no_rates` + `skipped`
- [X] T013 [US1] `Import`-da mövcud vərəqi yoxla: `date` üçün `currency_rates` sətri varsa və `overwrite == false` → `409 sheet_exists` + `count`; əks halda `before` üçün mövcud dəyərləri götür, `MergeRatesAsync` çağır, `audit.Log("currency_rates.import", "currency_rate_sheet", long.Parse(date.ToString("yyyyMMdd")), before: new { rates = … }, after: new { fileName, rates })`, `200` → `{ date, imported, skipped, rates }`. Fayl heç yerdə saxlanılmır
- [X] T014 [US1] `node .claude/skills/sync-openapi/scripts/route-diff.mjs` ilə `api-cbar-admin` route-larının spec ilə uyğunluğunu yoxla; `/sync-openapi api-cbar-admin` (cavab forması / status kodları əl ilə tutuşdurulur)

### api-cbar

- [X] T015 [P] [US1] `product-rest/api-cbar/src/Cbar.WebApi/Controllers/CurrenciesController.cs` `GetRatesXml`: `private static readonly string[] MetalCodes = ["XPD", "XPT", "XAG", "XAU"]` (legacy `$ignoreCurrencies`, `product-host/visitor/views/currency/xml.php`); metallar varsa `<ValType Type="Bank metalları">` bloku **birinci**, `MetalCodes` sırası ilə, `<Nominal>1 t.u.</Nominal>`, `<Name>` = az adı (prefikssiz); "Xarici valyutalar" bloku metallar çıxılmaqla indiki kimi; metal yoxdursa yalnız indiki blok (çıxış bayt-bayt eyni); `TODO(compat)` qalır — [contracts/public-xml-feed.md](contracts/public-xml-feed.md)

### web-cbar-admin-new

- [X] T016 [P] [US1] `product-rest/web-cbar-admin-new/src/features/currency/model/schemas.ts`-a `rateImportResultSchema` (Zod: `date` string, `imported` int ≥ 0, `skipped` string[], `rates` `{currencyCode, rate}`[]) və `RateImportResult`, `ImportSheetPayload` (`date`, `file: File`, `overwrite?: boolean`) tiplərini əlavə et
- [X] T017 [US1] `product-rest/web-cbar-admin-new/src/features/currency/api/currency.service.ts`-a `importSheet(payload)` əlavə et: `FormData` (`date`, `file` adı ilə, `overwrite` yalnız true olduqda `'true'`), `apiClient.post('/currency-rates/import', form)`, `parseOr(rateImportResultSchema, raw, 'currency.import')` (`media.service.ts` upload nümunəsi)
- [X] T018 [US1] `product-rest/web-cbar-admin-new/src/features/currency/hooks/use-currency.ts`-a `useImportSheet()` mutation əlavə et; uğurda `currency.keys.ts`-dəki sheet və dates açarlarını invalidasiya et (`useSaveSheet` nümunəsi)
- [X] T019 [US1] `product-rest/web-cbar-admin-new/src/features/currency/components/rate-import-dialog.tsx` yarat: kit `Dialog`, `DatePicker` (default: `initialDate` prop, yoxdursa bu gün), `.xlsx` fayl input (`accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"`); tarix/fayl boşdursa sorğu getmir, sahə xətası (US1 §5); `409` + `code === 'sheet_exists'` → təsdiq görünüşü ("bu tarix üçün N məzənnə var, üstünə yazılsın?") → eyni payload `overwrite: true`; digər `code`-lar → `t('import.errors.<code>', { row, currency })`, naməlum → ümumi mesaj; uğurda `onImported(result)`. Faylın başında repo üslubunda azərbaycanca blok şərh
- [X] T020 [US1] `product-rest/web-cbar-admin-new/src/pages/currency-rates/index.tsx`: `PageHeader` actions-a "Excel-dən yüklə" düyməsi (kit `FileUploadIcon`) — **icazə gate-i yoxdur**: panelin icazə modeli qabadır (`finance.manage` …, `currency_rates.*` yoxdur) və bu səhifədə "Yeni vərəq"/"Vərəqi sil" də gizlədilmir; server `403` qaytarır, `RateImportDialog`-u aç; `onImported` → toast (`imported` sayı, `skipped` boş deyilsə siyahı) + `goToDate(result.date)`; qaralama rejimində (`isDraft`) düymə deaktiv
- [X] T021 [P] [US1] `product-rest/web-cbar-admin-new/src/locales/az/currency.json` və `src/locales/en/currency.json`-a `import.*` açarları: düymə, dialoq başlığı, tarix/fayl label-ları, sahə xətaları, təsdiq mətni, uğur toast-u (`count`, `skipped`), `import.errors.{date_required,file_required,not_xlsx,file_too_large,no_rates,invalid_rate,duplicate_code}` (`invalid_rate`/`duplicate_code` `{{row}}`, `{{currency}}` ilə); `check:i18n` iki dildə eyni açarları tələb edir
- [X] T022 [P] [US1] `product-rest/web-cbar-admin-new/src/shared/testing/handlers/currency.ts`-a `POST */currency-rates/import` MSW handler-i: default `200` (nümunə nəticə), `sheet_exists` üçün `overwrite` yoxdursa `409` problem+json, test override-ları üçün export olunan köməkçilər — kontraktdakı formaya birə-bir
- [X] T023 [US1] `product-rest/web-cbar-admin-new/src/features/currency/currency.test.tsx`-a testlər: (a) uğurlu import → toast-da say və ötürülən kodlar, səhifə tarixə keçir; (b) `409` → təsdiq → ikinci sorğu `overwrite=true` ilə; (c) ~~icazəsiz istifadəçidə düymə yoxdur~~ — T020 qeydinə bax, test yazılmadı; (d) tarix/fayl seçilmədən sorğu getmir

**Checkpoint**: US1 tam işləyir — MVP.

---

## Phase 4: User Story 2 — Import-dan sonra əl ilə düzəliş (P2)

**Goal**: Import olunmuş vərəq mövcud redaktorda dəyişdirilə bilir (FR-021). Yeni kod gözlənilmir — yalnız inteqrasiya təsdiqlənir.

**Independent Test**: [quickstart.md](quickstart.md) §4.

- [X] T024 [US2] `product-rest/web-cbar-admin-new/src/features/currency/currency.test.tsx`-a test: import uğurundan sonra redaktor yeni vərəqi göstərir (`editorKey` `dataUpdatedAt` ilə remount), bir məzənnəni dəyişib saxlamaq `PUT /currency-rates`-ə yalnız redaktordakı sətirləri göndərir
- [X] T025 [US2] Yoxla ki, T010 refaktorundan sonra `PUT /api/v1/currency-rates` (`CurrencyRatesController.cs` `Upsert`) cavabı və audit action-u dəyişməyib (kod oxunuşu + test mühitində §4)

**Checkpoint**: US1 + US2.

---

## Phase 5: User Story 3 — Səhv faylın rədd edilməsi (P2)

**Goal**: Səhv fayl heç nə yazmır, səbəb lokallaşdırılmış mesajla görünür (FR-002, FR-003, FR-011–FR-014).

**Independent Test**: [quickstart.md](quickstart.md) §5.

- [X] T026 [US3] `CurrencyRatesController.cs` `Import`: bütün validasiya (T011–T012) `MergeRatesAsync`-dən **əvvəl** bitdiyini və merge-in tək tranzaksiyada olduğunu təsdiqlə (FR-014); reader-in `file_too_large`/`not_xlsx` istisnalarını tutub `400`-ə çevir — başqa istisnalar `500` kimi qalır (DbExceptionHandler)
- [X] T027 [US3] `product-rest/web-cbar-admin-new/src/features/currency/currency.test.tsx`-a test: `400 invalid_rate` (`row: 8`, `currency: 'EUR'`) → dialoqda "sətir 8, EUR" mesajı, dialoq açıq qalır; `400 not_xlsx` → lokallaşdırılmış mesaj
- [X] T028 [P] [US3] Repo xaricində (session scratchpad-ında, `025-fixtures/` alt qovluğu) quickstart §5 üçün səhv fayllar hazırla (G8 boş, B9 = USD, pdf → xlsx adı) və test mühitində yoxlama üçün istifadəçiyə ver — repo-ya commit olunmur

**Checkpoint**: Bütün story-lər.

---

## Phase 6: Polish & Cross-Cutting

- [X] T029 `product-rest/web-cbar-admin-new`-də `npm run verify` (lint → check:kit → check:i18n → tsc -b → test:run → build) və Node 22 ilə `src/features/currency` testləri
- [X] T030 [P] Hər iki API-də `dotnet build` (lokalda SDK yoxdur → MR pipeline-ı); `api-cbar-admin` əvvəl, `api-cbar` sonra deploy — _istifadəçi test mühitində yoxladı, 2026-10-20_
- [X] T031 Deploy-dan əvvəl test mühitində `SELECT code, nominal FROM currencies` — `0010`-dakı 30 koddan biri artıq fərqli nominal ilə varsa istifadəçiyə bildir (plan "Riskler"); metalsız bir tarixin XML-ini `curl` ilə saxla (quickstart §6 müqayisəsi üçün) — _istifadəçi test mühitində yoxladı, 2026-10-20_
- [X] T032 Test mühitində [quickstart.md](quickstart.md) §1–§7-ni icra et, nəticələri bu fayla qeyd et — _istifadəçi test mühitində yoxladı, 2026-10-20_
- [X] T033 [P] `/sync-business-logic` — `business_logic/new_business_logic.md` (məzənnə importu, 42 valyuta, XML metal bloku) və `business_logic/diff_report_logic.md` (#8 Excel importu məzənnə hissəsi, §4.1 "~63 valyuta"/SDR/metallar, XML "Bank metalları" sətirləri) yenilənir
- [X] T034 [P] `/sync-openapi` hər iki API üçün son yoxlama; `# Sync:` sətirləri yenilənir

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (T001–T005)** → hər şeydən əvvəl; T005 (təsdiq) controller redaktəsini açır (hook).
- **Phase 2 (T006–T010)** → Phase 1-dən sonra; US1/US2/US3-ü bloklayır.
- **US1 (T011–T023)** → Phase 2-dən sonra. MVP.
- **US2 (T024–T025)** → T010 və T018–T020-dən sonra.
- **US3 (T026–T028)** → T011–T013 və T019-dan sonra.
- **Polish (T029–T034)** → bütün story-lərdən sonra.

### Within US1

- T011 → T012 → T013 → T014 (eyni fayl, ardıcıl).
- T015 (api-cbar) T011–T014 ilə paralel.
- T016 → T017 → T018 → T019 → T020; T021, T022 paralel; T023 sonda.

### MR sərhədləri

- `api-cbar-admin` MR: T001–T003, T005–T014, T026.
- `api-cbar` MR: T004, T015.
- `web-cbar-admin-new` MR: T016–T024, T027, T029.

## Parallel Example: User Story 1

```text
# Phase 2 bitdikdən sonra eyni vaxtda:
T011–T014  api-cbar-admin controller (ardıcıl zəncir)
T015       api-cbar XML metal bloku
T016       admin schemas.ts
T021       locales az/en
T022       MSW handler
```

## Implementation Strategy

### MVP (yalnız US1)

1. Phase 1 → təsdiq.
2. Phase 2 → migration + reader + ortaq merge.
3. Phase 3 → import endpoint, XML metal bloku, panel dialoqu.
4. **Dayan**: test mühitində quickstart §1–§3, §6–§7.

### Incremental

- US2 əsasən mövcud davranışın təsdiqidir (testlər); US3 xəta yollarının tamlığı və testləridir.
- Hər MR öz komponentində müstəqil yoxlanılır; deploy sırası `api-cbar-admin` → `api-cbar` → panel.
