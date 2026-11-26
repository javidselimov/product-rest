# Research: AZIR indekslərinin Excel faylından yüklənməsi (spec 058)

Hər bölmə: **Qərar** · **Səbəb** · **Rədd edilən alternativlər**. Texniki kontekstdə `NEEDS CLARIFICATION` qalmayıb; həcmin vahidi
spec-in Assumptions bölməsindəki kimi açıq qalır, amma R5-in iki diapazonu onu bloklamır.

## R1 — Faylı server oxuyur, mövcud `XlsxSheetReader` ilə

- **Qərar**: `api-cbar-admin`-də yeni `POST /api/v1/azir/import` (multipart: `file`, `overwrite`). Fayl `Validation/XlsxSheetReader.Read`
  ilə oxunur (aktiv vərəq, B–E sütunları, 1–200 sətirlər). Bütün yoxlama yazmadan əvvəl, yazma bir tranzaksiyada.
- **Səbəb**: gəlirlik əyrisi (`YieldCurvesController`) və valyuta bülleteni (`CurrencyRatesController`, spec 025) eyni yolu gedir: xarici paket yox,
  zip-bomb və XML hücumuna qarşı sərhədlər, PHP-uyğun yuvarlaqlaşdırma (`NormalizeNumber`) artıq var. Server təhlükəsizlik sərhədidir —
  brauzerdə oxunan fayl yenə serverdə yoxlanmalı olardı. Bütöv yazma yalnız serverdə mümkündür.
- **Rədd**: (a) brauzerdə `DecompressionStream` + `DOMParser` ilə oxuyub mövcud `POST /azir`-i hər müddət üçün çağırmaq — API dəyişmir, amma
  4–5 ayrı sorğu bütöv deyil, audit faylın adını bilmir, yoxlama iki yerdə yazılır; (b) SheetJS/exceljs — yeni runtime asılılıq (admin
  constitution-u spec tələb edir), SheetJS-in npm versiyası köhnə və zəiflikli.

## R2 — Oxuyucu ayrıca təmiz funksiya: `AzirSheetReader`

- **Qərar**: `Validation/AzirSheetReader.cs` — `static AzirSheet Read(Stream xlsx, DateOnly today)`. Nəticə: tarix, müddət sətirləri (`AzirSheetTerm`),
  yazılmayan sətirlər (`AzirSkippedRow`), həcmin manatdan çevrildiyi bayraq. Səhv: `AzirSheetException(code, message, row?, column?)`. Controller
  yalnız yükləməni yoxlayır, oxuyucunu çağırır, mövcud dəyərləri müqayisə edir və yazır.
- **Səbəb**: CLAUDE.md qaydası — saf funksiya olan məntiq `internal`, `Cbar.AdminApi.Tests`-də verilənlər bazasız test olunur
  (`WorkingPaperRules`, `StrategyDocRules` kimi). Spec-in bütün oxuma qaydaları (FR-004…FR-012) bir yerdə və testlə qorunur.
- **Rədd**: qaydaları controller-in içində yazmaq (`YieldCurvesController` kimi) — test etmək üçün stack qaldırmaq lazım gələrdi.

## R3 — Testlərin faylları

- **Qərar**: (1) bankın nümunə faylı `tests/Cbar.AdminApi.Tests/Fixtures/azir-2026-10-27.xlsx` kimi kopyalanır (`CopyToOutputDirectory`) — "real
  fayl" testi (SC-002 dəyərləri); (2) səhv halları üçün testdə kiçik köməkçi `TestWorkbook.Build(cells)` `ZipArchive` ilə minimal `.xlsx` qurur
  (workbook, rels, sharedStrings, sheet1).
- **Səbəb**: real fayl formatın (shared strings, üslublar, boş sətirlər, birləşmiş xanalar) bütün xüsusiyyətlərini yoxlayır; sintetik fayl hər
  qayda üçün bir dəyişiklik edir. Faylın dəyərləri ictimaidir (köhnə saytda dərc olunub).
- **Rədd**: binary fixture-ləri hər səhv üçün Excel-də hazırlamaq — dəyişəndə kimin nəyi dəyişdiyi görünmür.

## R4 — Cədvəlin tapılması və adların tanınması

- **Qərar**:
  - Tarix: `B2` — rəqəm xanası Excel seriya tarixidir (1900 sistemi, `DateOnly(1899-12-30).AddDays(n)`), mətn xanası `dd.MM.yyyy`.
  - Başlıq: B–E-də `B == "Ad"` və `C == "Faiz"` olan ilk sətir (kəsilmiş, hərf ölçüsü nəzərə alınmır). Ondan sonrakı sətirlər cədvəldir.
  - Ad normallaşdırması: ardıcıl boşluqlar bir boşluq, kənar boşluqlar kəsilir, `ToUpperInvariant`; `*` varsa `isReservePlan`, sonra silinir.
  - Xəritə: `AZIR`, `1D AZIR` → `1D`; `TF AZIR 30D|90D|180D` → `30D|90D|180D`; `AZIR TFAI` → yazılmır (`skipped: tfai`);
    `LAST MIN RATE` / `LAST MAX RATE` → 1D min/max. `*` ilə başlayan və boş B → nəzərə alınmır. Başqa → `unknown_index` (sətir, `B`).
- **Səbəb**: köhnə panelin başlıqları `1D AZIR*`, bankın faylı `AZIR*` yazır — hər ikisi qəbul olunur. Başlıq sətri ilə tapmaq sətir sürüşməsinə
  dözür, tanınmayan ad isə şablon dəyişikliyini səssiz itki əvəzinə xəta edir.
- **Rədd**: sabit sətir nömrələri (`B5`, `B7`…) — bank bir boş sətir əlavə etsə dəyərlər yanlış müddətə düşərdi.

## R5 — Rəqəm qaydaları

- **Qərar** (`AzirSheetReader` sabitləri):

  | Sahə | Xana | Qayda |
  |---|---|---|
  | faiz (1D/30D/90D/180D) | C, rəqəm | `× 100`, `NormalizeNumber(…, 4)`; `0 ≤ x < 10 000`. 1D: `> 0` məcburi. Digər: boş/`-`/0 → yazılmır (`skipped: empty`) |
  | min / max | C, rəqəm | `× 100`, 4 onluq; 0 və ya boş → `null`; `min ≤ max` |
  | həcm (1D) | D | boş/`-` → `null`; `0…10 000` → olduğu kimi, 2 onluq; `≥ 1 000 000` → `÷ 1 000 000`, 2 onluq, `volumeConverted = true`; arası, mənfi → `ambiguous_volume` |
  | say (1D) | E | boş/`-` → `null`; `≥ 0` tam ədəd; əks halda `invalid_value` |
  | D/E (30D/90D/180D) | — | oxunmur |

  `-` dışında mətn xanası rəqəm sahəsində `invalid_value`-dur. Yuvarlaqlaşdırma `decimal` ilə, `double`-sız: `decimal.Parse(raw) * 100` sonra
  `NormalizeNumber`. Yoxlama: `0.063047774476156684 → 6.3048` (köhnə sayt `6.3048%`).
- **Səbəb**: xana formatları (`0.0000%`, `0.00%`, `#,##0`) və köhnə canlı saytın eyni günü (`6.3048% * | 0.00 | 0`). Həcmin iki diapazonu
  real həyatda üst-üstə düşmür: köhnə tarixçədə ən böyük gün 1295.56 mln, ən kiçik əqd ~12 mln manat.
- **Rədd**: həcm vahidini sabit seçmək (ya mln, ya manat) — nümunə faylda 0 olduğu üçün təsdiqlənməyib; səhv seçim saytda 10⁶ dəfə səhv rəqəm
  deməkdir.

## R6 — Yazma semantikası və 409

- **Qərar**: yazılacaq müddətlər (1D + dəyəri olan 30D/90D/180D) üçün mövcud sətirlər bir sorğu ilə oxunur. Hər hansı biri varsa və
  `overwrite != true` → `409 date_exists` (`count`, `terms`). Əks halda bir tranzaksiyada hər müddət `POST /azir`-in upsert-i kimi yazılır:
  mövcuddursa `Rate` + detallar tam əvəzlənir və `UpdatedAt` irəli gedir, yoxdursa yaradılır; 30D/90D/180D-nin detal sətri yalnız işarəni daşıyır.
  Faylda olmayan / yazılmayan müddətlər toxunulmur. Bir audit qeydi: `azir.import`, `azir_index_value`, entity id = `yyyyMMdd`,
  `before` = mövcud müddətlərin snapshot-ı, `after` = `{ fileName, values }`.
- **Səbəb**: spec FR-013/FR-014; valyuta importu (`sheet_exists` + merge) və əyri importu (`date_exists`) ilə eyni kod adı, panel artıq bu axını
  tanıyır. Upsert məntiqi `AzirController`-in `ApplyDetails`/`Snapshot` köməkçiləri ilə bölüşülür (eyni controller-dədir).
- **Rədd**: tarixin bütün müddətlərini silib yenidən yazmaq (əyri importu kimi) — əl ilə yazılmış 30D faylda boş olanda silinərdi.

## R7 — Yükləmə yoxlaması və Bakı günü

- **Qərar**: `AzirController`-də özəl `ReadUploadAsync` (fayl məcburi, `.xlsx` uzantısı, `MediaUploadRules.MatchesSignature`, 5 MB
  `RequestSizeLimit`, yaddaşda bufer) — `YieldCurvesController`-dəki ilə eyni forma, tarix sahəsi olmadan. Bakı günü üçün admin API-də
  `Time/BakuClock` (`api-cbar`-dakı ilə eyni: sabit `+04:00`, DST yoxdur).
- **Səbəb**: bu yükləmə yoxlamasının üçüncü nüsxəsidir (valyuta, əyri, AZIR). Ortaq köməkçiyə çıxarmaq iki işləyən controller-i də dəyişmək
  deməkdir — bu spec-in əhatəsindən kənar riskdir; ayrıca refaktor kimi qeyd olunur (Complexity Tracking).
- **Rədd**: `TimeZoneInfo.FindSystemTimeZoneById("Asia/Baku")` — konteynerdə tzdata tələb edir; `api-cbar` eyni səbəbdən sabit ofset seçib.

## R8 — Cavab forması

- **Qərar**: `200` → `AzirImportResult { valueDate, values[], skipped[], volumeConverted, overwritten }`. `values[]` hər yazılan müddət üçün yeni
  dəyərlər + `previous` (əvəzlənibsə, eyni formada, yoxsa `null`). `skipped[]` → `{ row, name, reason: 'tfai' | 'empty' }`. Problemlər
  `application/problem+json`, `code` + `message` (+ `row`, `column`, `count`, `terms`).
- **Səbəb**: FR-015 (xülasə, köhnə → yeni, çevirmə qeydi) panelin əlavə sorğusu olmadan qurulur.

## R9 — Panel: dialoq, vəziyyət, yer

- **Qərar**: `features/azir/components/azir-import-dialog.tsx` — kit `Dialog` + `Upload`/`UploadDropzone` (`XLSX_ACCEPT`), vəziyyət
  diskriminasiya olunmuş birlik: `pick` → (`409`) `confirm` → `done(result)`. `done` dialoqda xülasə cədvəlini göstərir (bağlanana qədər), siyahı
  `azirKeys.all` invalidasiyası ilə yenilənir. Düymə səhifə başlığında `CrudListPage.extraActions` ilə, `<Can permission="azir.create">` içində.
  Servis `azirService.importFile`, hook `useAzirImport`, Zod `azirImportResultSchema`, xəta kodları `AZIR_IMPORT_ERROR_CODES` → `azir.import.errors.*`.
- **Səbəb**: istifadəçi "gəlirlik əyrisi məntiqi" istədi — eyni kit komponentləri və 409 axını, redaktor üçün tanış. Xülasə dialoqda qalır, çünki
  toast 5 sətirlik cədvəli və "manatdan çevrildi" xəbərdarlığını daşımır (FR-015, yanlış vahidin gözdən qaçmaması).
- **Rədd**: `YieldCurveImportDialog`-u ümumiləşdirmək — tarix seçicisi, cavab forması və xülasə fərqlidir; ortaq hissə (`Upload` + 409 təsdiqi) ~40
  sətirdir. Üçüncü nüsxədir (valyuta importu da var), amma ortaq `shared/ui/xlsx-import-dialog` ayrıca refaktor olmalıdır (Complexity Tracking).

## R10 — Müddət siyahısı

- **Qərar**: `features/azir/model/schemas.ts` `AZIR_TERMS = ['1D', '30D', '90D', '180D']` — kart və siyahı filtri eyni siyahını işlədir. API-nin
  `term` yoxlaması dəyişmir (≤ 10 simvol).
- **Səbəb**: FR-019, saytın `HOME_AZIR_TERMS`. Test bazasında `1W/1M` yoxdur; prod `quickstart.md` §5-də sorğu ilə yoxlanır.
