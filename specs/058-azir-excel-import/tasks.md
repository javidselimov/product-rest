---

description: "Task list for spec 058 — AZIR Excel import"
---

# Tasks: AZIR indekslərinin Excel faylından yüklənməsi

**Input**: `specs/058-azir-excel-import/` — plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: daxildir — CLAUDE.md (admin API saf qaydaları `Cbar.AdminApi.Tests`-də) və panelin TDD qaydası (`frontend-standards`, funksional
komponent testləri: rol, `userEvent`, MSW).

**Yollar**: `API = product-rest/api-cbar-admin`, `ADMIN = product-rest/web-cbar-admin-new`.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 OpenAPI-ni contracts/admin-api.md §1–2 üzrə yaz: `API/openapi/paths/statistics.yaml` (`azirImport`), `API/openapi/components/schemas/statistics.yaml`
  (`AzirImportForm`, `AzirImportResult`, `AzirImportValue`, `AzirImportSkipped`, `AzirImportProblem`; `AzirValue.term` təsviri `1D`, `30D`, `90D`, `180D`),
  `API/openapi/openapi.yaml` (path ref `/api/v1/azir/import`, `# Sync:` sətrinə `azir import (spec 058) işçi ağac 2026-11-24`); `npm run lint && npm run bundle`
  (`API/openapi`) — controller-dən əvvəl (spec-first hook)
- [X] T002 [P] Bankın nümunə faylını `tools/AZIR Website 2026-10-27.xlsx` → `API/tests/Cbar.AdminApi.Tests/Fixtures/azir-2026-10-27.xlsx` kopyala; `API/tests/Cbar.AdminApi.Tests/Cbar.AdminApi.Tests.csproj`-a
  `<None Include="Fixtures\**" CopyToOutputDirectory="PreserveNewest" />`

---

## Phase 2: Foundational

- [X] T003 [P] `API/src/Cbar.AdminApi/Time/BakuClock.cs` — `api-cbar`-dakı `Cbar.WebApi.Time.BakuClock` ilə eyni (sabit `+04:00`, `Today()`), namespace `Cbar.AdminApi.Time`
- [X] T004 [P] `API/tests/Cbar.AdminApi.Tests/TestWorkbook.cs` — `TestWorkbook.Build(IReadOnlyDictionary<string, object> cells)`: `ZipArchive` ilə minimal `.xlsx`
  (`[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/sharedStrings.xml`, `xl/worksheets/sheet1.xml`); `string` → shared string,
  `decimal`/`int`/`double` → rəqəm xanası; `MemoryStream` qaytarır
- [X] T005 `API/src/Cbar.AdminApi/Validation/AzirSheetReader.cs` — tiplər və skelet: `AzirSheet`, `AzirSheetTerm`, `AzirSkippedRow` (data-model §1), `AzirSheetException(Code, Message, Row?, Column?)`,
  kod sabitləri (`date_missing`, `date_in_future`, `header_missing`, `unknown_index`, `duplicate_index`, `missing_1d`, `invalid_value`, `ambiguous_volume`), hədd sabitləri
  (`MlnVolumeMax = 10_000m`, `ManatVolumeMin = 1_000_000m`, `RateLimit = 10_000m`, `RateDecimals = 4`, `VolumeDecimals = 2`, `FirstRow = 1`, `LastRow = 200`, sütunlar B–E);
  `public static AzirSheet Read(Stream xlsx, DateOnly today)` (`internal` sinif)

**Checkpoint**: OpenAPI bundle-da route var, tiplər kompilyasiya olunur.

---

## Phase 3: User Story 1 — Günün faylını yükləmək (P1) 🎯 MVP

**Goal**: nümunə fayl boş tarixə bir yükləmə ilə yazılır, panel xülasəni göstərir.

**Independent Test**: boş 27.10.2026-ya nümunə fayl → siyahıda 1D `6.3048` ehtiyat plan, həcm 0, say 0, min/max boş, 30D `5.9748`, 90D `6.1316`, 180D `6.3484`; xülasədə TFAI qeydi.

### API

- [X] T006 [US1] `API/tests/Cbar.AdminApi.Tests/AzirSheetReaderTests.cs` — uğur testləri (əvvəl, qırmızı): (a) nümunə fixture → tarix 2026-10-27, dörd müddət dəyərləri,
  1D `IsReservePlan`, `DealVolume 0`, `DealCount 0`, `MinRate/MaxRate null`, 30D–180D detallar `null`, `Skipped = [(10, "AZIR TFAI", tfai)]`, `VolumeConverted false`;
  (b) sintetik: `1D AZIR*` və `AZIR` → 1D, işarə yalnız ulduzla; boşluq/hərf ölçüsü (`tf azir 30d `); (c) həcm: `27.5` → `27.50`, `10000` → `10000`, `1000000` → `1.00`,
  `132000000` → `132.00` + `VolumeConverted`; (d) min `0.06` / max `0.0602` → `6.00` / `6.02`, min/max `0` → `null`; (e) 30D faizi `-` / boş / 0 → `Skipped(empty)`;
  (f) `B2` mətn `27.10.2026`; (g) qeyd sətirləri (`* Ehtiyat…`) və boş sətirlər nəzərə alınmır; (h) başlıq bir sətir aşağı sürüşəndə də oxunur
- [X] T007 [US1] `API/src/Cbar.AdminApi/Validation/AzirSheetReader.cs` — `Read`-in uğur yolu: `XlsxSheetReader.Read(xlsx, FirstRow, LastRow, {B,C,D,E})`; `B2` tarixi (Excel seriya
  `new DateOnly(1899, 12, 30).AddDays(n)`, mətn `dd.MM.yyyy`), başlıq sətri (`Ad`/`Faiz`), ad normallaşdırması və xəritə (research R4), rəqəmlər (R5: `decimal` parse `× 100` →
  `XlsxSheetReader.NormalizeNumber(…, 4)`, həcm diapazonları, say tam ədəd, `-`/boş → `null`), min/max 1D-yə; T006 yaşıl
- [X] T008 [US1] `API/src/Cbar.AdminApi/Controllers/AzirController.cs` — `[HttpPost("import")]`, `[RequirePermission(Permissions.Azir.Create)]`, `[RequestSizeLimit]` +
  `[RequestFormLimits]` 5 MB; özəl `ReadUploadAsync(IFormFile?)` (`file_required`, `.xlsx` uzantısı, `MediaUploadRules.MatchesSignature`, `not_xlsx`; `YieldCurvesController` forması,
  tarixsiz); `XlsxReadException` → 400 eyni kodla, `AzirSheetException` → 400 `code` + `row`/`column` (+ `valueDate` `date_in_future`-da) `ErrorProblem` ilə; mövcud sətirlər yoxdursa
  bir tranzaksiyada yaz (data-model §2, mövcud `ApplyDetails`), `audit.Log("azir.import", "azir_index_value", yyyyMMdd, before: null, after: { fileName, values })`; cavab
  `AzirImportResult` (`previous: null`) — contracts/admin-api.md §3
- [X] T009 [US1] `dotnet build` + `dotnet test CbarAdminApi.slnx` (`API`), sonra repo kökündən `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin` — fərq yoxdur

### Panel

- [X] T010 [P] [US1] `ADMIN/src/features/azir/model/schemas.ts` — `azirImportValueSchema`, `azirImportResultSchema` (Zod, contracts §2), `AzirImportResult` tipi, `AZIR_IMPORT_ERROR_CODES`
  (data-model "Rədd kodları" + `file_required`, `date_exists`); `ADMIN/src/features/azir/model/import-state.ts` — `AzirImportState` birliyi (data-model §3)
- [X] T011 [P] [US1] `ADMIN/src/shared/testing/fixtures/azir.ts` — `azirImportResultFixture` (contracts §3 cavabı); `ADMIN/src/shared/testing/handlers/azir.ts` — `POST /azir/import`
  handler: multipart `file` yoxdursa 400 `file_required`, `overwrite` yoxdursa və test vəziyyətində tarix "mövcuddursa" 409, əks halda fikstür
- [X] T012 [US1] `ADMIN/src/features/azir/api/azir.service.ts` — `importFile({ file, overwrite })`: `FormData` (`file`, `overwrite=true` yalnız lazım olanda), `apiClient.post('/azir/import')`,
  `azirImportResultSchema` ilə parse (`contractError('azir.import')`); `ADMIN/src/features/azir/hooks/use-azir.ts` — `useAzirImport()` (`useMutation`, uğurda `azirKeys.all` invalidasiya)
- [X] T013 [P] [US1] `ADMIN/src/locales/az/azir.json` və `ADMIN/src/locales/en/azir.json` — `import.*`: `open`, `title`, `description`, `file`, `pickFile`, `fileHint`, `submit`, `done`
  (`{{count}}`, `{{date}}`), `close`, xülasə sütunları, `converted`, `skipped.tfai`, `skipped.empty`, `confirm`, `overwrite`, `errors.*` (contracts/admin-ui.md §3; en tərcümə)
- [X] T014 [US1] `ADMIN/src/features/azir/azir.test.tsx` — import testləri (əvvəl, qırmızı): `azir.create` istifadəçisi "Excel-dən yüklə" → dialoq; fayl seçmədən "Yüklə" → "Fayl seçin";
  `.xlsx` seçilir → "Yüklə" → xülasə: tarix `27.10.2026`, dörd müddət sətri, "Ehtiyat plan", TFAI qeydi; çevirmə fikstüründə sarı xəbərdarlıq; uğurdan sonra siyahı sorğusu təkrarlanır
- [X] T015 [P] [US1] `ADMIN/src/features/azir/components/azir-import-summary.tsx` — semantik `<table>` (Müddət, Dəyər, Ehtiyat plan, Həcm, Say, Min, Maks), `previous` olan xanada köhnə dəyər
  (`line-through`, `text-muted-foreground`), `volumeConverted` → sarı `Alert`, `skipped` siyahısı (boşdursa render olunmur); rəqəm formatı `Intl.NumberFormat` (i18n dili), sabitlər `model/constants.ts`
- [X] T016 [US1] `ADMIN/src/features/azir/components/azir-import-dialog.tsx` — kit `Dialog` + `Upload`/`UploadDropzone` (`XLSX_ACCEPT`), vəziyyət `AzirImportState` (`pick` → `done`), `Spinner`,
  xəta `Alert` (`import.errors.<code>` + `row`/`column`, naməlum → `message`, `AppError` deyil → `common:errors.unexpected`), `done`-da `AzirImportSummary` + "Bağla"
- [X] T017 [US1] `ADMIN/src/pages/azir/index.tsx` — `CrudListPage`-ə `extraActions`: `<Can permission="azir.create"><Button>…FileUploadIcon… import.open</Button></Can>`; dialoq şərti render olunur
  (hər açılış təmiz vəziyyət); T014 yaşıl
- [X] T018 [US1] Review: `ui-kit-review` + senior-front review checklist — T010–T017 faylları, plan.md "Frontend Skills Gate"-ə qarşı; tapıntıları düzəlt
- [X] T019 [US1] `npm run verify` (`ADMIN`, PowerShell-dən) — yaşıl

**Checkpoint**: US1 tam — boş tarixə import işləyir (API + panel).

---

## Phase 4: User Story 2 — Mövcud günü əvəz etmək (P1)

**Goal**: tarixdə müddət varsa təsdiq, sonra fayldakı müddətlər əvəzlənir, digərləri toxunulmur.

**Independent Test**: eyni fayl ikinci dəfə → təsdiq; "Ləğv et" → dəyişiklik yoxdur; "Əvəz et" → dəyərlər yenilənir, xülasədə köhnə dəyərlər.

- [X] T020 [US2] `API/src/Cbar.AdminApi/Controllers/AzirController.cs` — import: yazılacaq müddətlərin mövcud sətirləri (`Include(Details)`); varsa və `overwrite != true` → 409 `date_exists`
  (`valueDate`, `count`, `terms`); `overwrite`-da mövcud sətir yenilənir (`Rate`, `ApplyDetails`, `UpdatedAt = now`), `previous` cavabda doldurulur, audit `before` = mövcud snapshot-lar;
  faylda olmayan / `skipped` müddətlər oxunmur; `[FromForm] bool overwrite = false`
- [X] T021 [US2] `dotnet build` (`API`)
- [X] T022 [US2] `ADMIN/src/features/azir/azir.test.tsx` — testlər (əvvəl, qırmızı): 409 → sarı təsdiq tarix və müddətlərlə; "Ləğv et" → `pick`, ikinci sorğu yoxdur; "Əvəz et" → `overwrite=true`
  göndərilir, xülasədə köhnə dəyər görünür
- [X] T023 [US2] `ADMIN/src/features/azir/components/azir-import-dialog.tsx` — `confirm` addımı: 409 `date_exists` (`AppError.status`/`code`, `details.valueDate`, `details.terms`) → `confirm`;
  "Əvəz et" eyni faylla `overwrite`; "Ləğv et" → `pick` + `mutation.reset()`; T022 yaşıl
- [X] T024 [US2] Review: `ui-kit-review` + senior-front checklist — dəyişən dialoq faylı
- [X] T025 [US2] `npm run verify` (`ADMIN`)

---

## Phase 5: User Story 3 — Səhv faylın aydın rədd edilməsi (P2)

**Goal**: hər səhv növü heç nə yazmadan, sətir/sütunla, redaktorun dilində rədd edilir.

**Independent Test**: hər rədd kodu üçün bir fayl → bazada dəyişiklik yoxdur, mesaj sətir/sütunu göstərir.

- [X] T026 [US3] `API/tests/Cbar.AdminApi.Tests/AzirSheetReaderTests.cs` — rədd testləri (`TestWorkbook` ilə): `date_missing` (B2 boş / mətn), `date_in_future` (today + 1), `header_missing`,
  `unknown_index` (`TF AZIR 60D`, sətir 8, `B`), `duplicate_index` (1D iki dəfə; `LAST MIN RATE` iki dəfə), `missing_1d` (1D yoxdur; 1D faizi `-`), `invalid_value` (mətn faiz `"6.3%"`,
  mənfi faiz, `≥ 10000`, say `2.5`, `min > max`), `ambiguous_volume` (`10000.01`, `999999.99`, `250000`), mənfi həcm → `invalid_value`; `.xlsx` olmayan stream → `XlsxReadException not_xlsx`
- [X] T027 [US3] `API/src/Cbar.AdminApi/Validation/AzirSheetReader.cs` — bütün rədd yolları (data-model "Rədd kodları"), mesajlar ingiliscə `Cell B8: …` formasında; T026 yaşıl
- [X] T028 [US3] `dotnet test CbarAdminApi.slnx` (`API`)
- [X] T029 [US3] `ADMIN/src/features/azir/azir.test.tsx` — xəta testləri: MSW 400 `unknown_index` (`row 8`, `column B`) → "Sətir 8, sütun B: tanınmayan indeks adı"; `ambiguous_volume`; naməlum kod →
  serverin `message`-i; heç bir halda siyahı sorğusu təkrarlanmır
- [X] T030 [US3] Lazım olarsa `ADMIN/src/features/azir/components/azir-import-dialog.tsx` — xəta interpolyasiyası (`row`, `column`, `date` → `dd.MM.yyyy`); T029 yaşıl
- [X] T031 [US3] Review: `ui-kit-review` + senior-front checklist — dəyişən fayllar
- [X] T032 [US3] `npm run verify` (`ADMIN`)

---

## Phase 6: User Story 4 — Əl ilə girişdə 30D/90D/180D (P3)

**Goal**: kart və siyahı filtri `1D, 30D, 90D, 180D` təklif edir.

**Independent Test**: kartın müddət siyahısı `1D, 30D, 90D, 180D`; 30D yazılır.

- [X] T033 [US4] `ADMIN/src/features/azir/azir.test.tsx` — test (əvvəl, qırmızı): kartın müddət seçimində `1D, 30D, 90D, 180D` var, `1W`/`1M` yoxdur; 30D seçilib saxlananda `POST /azir` `term: '30D'`
- [X] T034 [US4] `ADMIN/src/features/azir/model/schemas.ts` — `AZIR_TERMS = ['1D', '30D', '90D', '180D'] as const`; fikstür/handler-də `1W`/`1M` istifadəsi varsa yenilə
  (`ADMIN/src/shared/testing/fixtures/azir.ts`); T033 yaşıl
- [X] T035 [US4] Review: `ui-kit-review` + senior-front checklist — dəyişən fayllar
- [X] T036 [US4] `npm run verify` (`ADMIN`)

---

## Phase 7: Polish & Cross-Cutting

- [X] T037 [P] `dokumentasiyalar/azir-guide.md` — "Excel faylı ilə yükləmə" bölməsi: şablon (B2 tarix, adlar), addımlar, təsdiq, xülasə, həcm vahidi qaydası, TFAI yazılmır, xəta mətnləri;
  müddət siyahısı `1D/30D/90D/180D`
- [X] T038 [P] Kök `CLAUDE.md` — web-cbar-admin-new bölməsinə bir maddə: AZIR Excel importu (spec 058, `POST /api/v1/azir/import`, `AzirSheetReader`, TFAI yazılmır, həcm diapazonları)
- [X] T039 `dotnet build` + `dotnet test CbarAdminApi.slnx` (`API`) və `npm run verify` (`ADMIN`) son dəfə; Node 22 ilə `npm run test:run` (`ADMIN`)
- [X] T040 quickstart.md §3 canlı yoxlama (2026-11-24, PGlite + admin API: 200 / 409 / overwrite / not_xlsx / file_required / 401 — hamısı gözlənilən; §4 brauzerdə əl ilə yoxlama edilməyib, panel MSW testləri ilə) — (PGlite və ya test mühiti) — nümunə faylı 200 / 409 / overwrite / not_xlsx; nəticəni hesabatda qeyd et (icra olunmayıbsa açıq de)
- [X] T041 `business_logic/new_business_logic.md` və `diff_report_logic.md`-ni `/sync-business-logic azir` ilə yeniləmək tövsiyə olunur (istifadəçi qərarı; skill kodu dəyişmir)

---

## Dependencies & Execution Order

- **Setup (T001–T002)** → **Foundational (T003–T005)** → hekayələr.
- **US1** API (T006–T009) panel-dən əvvəl kontrakt kimi lazım deyil (panel MSW ilə işləyir), amma deploy sırası API → panel.
- **US2** US1-in controller və dialoquna əlavədir (T020 ← T008; T023 ← T016).
- **US3** T027 ← T007 (eyni fayl); panel tərəfi T030 ← T016.
- **US4** müstəqildir — istənilən vaxt (yalnız `schemas.ts`-i T010 ilə bölüşür).
- Polish hamısından sonra.

### Parallel imkanları

- T002, T003, T004 eyni anda; T001 onlardan asılı deyil.
- US1 panel: T010, T011, T013, T015 paralel (ayrı fayllar); API T006–T009 panel işi ilə paralel.
- US4 (T033–T036) US2/US3 ilə paralel aparıla bilər.
- T037, T038 paralel.

## Implementation Strategy

1. **MVP = Setup + Foundational + US1**: boş tarixə import işləyir, redaktor əl ilə köçürməni dayandıra bilər (tarix artıq varsa API hələ əvəzləmədən yazmamalıdır —
   US1-də 409 yolu yoxdur, ona görə US2 MVP ilə birlikdə deploy olunur).
2. **US2** — eyni MR-da (əvəzləmə olmadan düzəliş faylı yüklənə bilməz).
3. **US3** — rədd yolları; reader testləri US1-lə birlikdə yazıla bilər.
4. **US4** — kiçik, istənilən mərhələdə.
5. Deploy: `api-cbar-admin` MR (T001–T009, T020–T021, T026–T028) → `web-cbar-admin-new` MR (qalan panel tapşırıqları).
