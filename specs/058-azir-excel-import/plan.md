# Implementation Plan: AZIR indekslərinin Excel faylından yüklənməsi

**Branch**: `058-azir-excel-import` | **Date**: 2026-11-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/058-azir-excel-import/spec.md`

## Summary

Bankın gündəlik "AZIR Website" `.xlsx` faylı panelin AZIR bölməsində bir hərəkətlə yüklənir. `api-cbar-admin`-də yeni `POST /api/v1/azir/import`
faylı mövcud `XlsxSheetReader` ilə oxuyur; qaydalar saf funksiya `AzirSheetReader`-dədir (tarix `B2`, cədvəl "Ad / Faiz" başlığından, adlara görə
1D/30D/90D/180D + 1D min/max, `*` = ehtiyat plan, faiz `× 100` 4 onluq, həcm iki diapazonla, TFAI tanınır və yazılmır) və xUnit ilə bankın real
faylı üzərində test olunur. Yazma bütövdür, müddət üzrə upsert, tarix varsa `409 date_exists` → təsdiq → `overwrite`. Panel gəlirlik əyrisi
dialoqunun axınını təkrarlayır, uğurda xülasəni (köhnə → yeni, çevirmə qeydi, TFAI) dialoqda göstərir; kartın müddət siyahısı `1D/30D/90D/180D`
olur. Baza, `api-cbar` və `web-cbar-new` dəyişmir.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`); TypeScript 5 strict, React 19 (`web-cbar-admin-new`)

**Primary Dependencies**: ASP.NET Core, EF Core (Npgsql), BCL `ZipArchive` + `XmlReader` (`XlsxSheetReader`); TanStack Query, Zod,
react-i18next, `@cbar/lib-react-ui-kit` (`dialog`, `upload`, `alert`, `button`, `spinner`, `icons`). Yeni paket yoxdur.

**Storage**: PostgreSQL — mövcud `azir_index_values` + `azir_index_value_details` (spec 021); migration yoxdur

**Testing**: `tests/Cbar.AdminApi.Tests` (xUnit, bazasız) — `AzirSheetReaderTests`; panel Vitest + Testing Library + MSW (`features/azir/azir.test.tsx`,
handler `shared/testing/handlers/azir.ts`); canlı yoxlama `quickstart.md`

**Target Platform**: Linux konteyner (API), nginx-də statik SPA (panel)

**Project Type**: web — iki müstəqil komponent (API + SPA), iki MR

**Performance Goals**: bir fayl (≤ 5 MB, ~15 dolu sətir) bir sorğuda; redaktor üçün < 1 s

**Constraints**: hər yoxlama yazmadan əvvəl, yazma bir tranzaksiya; 5 MB, açılmış hissə ≤ 20 MB; `ALTER TABLE` yoxdur; spec-first OpenAPI;
`no-magic-numbers` (spec 032) hər iki tərəfdə sabitlərlə

**Scale/Scope**: gündə 1 fayl, 4 müddət; ~6 yeni/dəyişən API faylı, ~10 panel faylı

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | köhnə panel (`AzirController.php`) və canlı `/indeks/rates` yalnız oxunub; redaktə yoxdur | ✅ |
| II — dörd müstəqil proyekt | `api-cbar-admin` və `web-cbar-admin-new` ayrı MR; ortaq kod yoxdur | ✅ |
| III — admin/client ayrılığı | yazma yalnız admin API-də; `api-cbar` read-only qalır | ✅ |
| IV — start/deploy sırası | əvvəl `api-cbar-admin`, sonra panel (quickstart §6) | ✅ |
| V — sxem/migration | sxem dəyişmir; `Cbar.Domain` nüsxələri toxunulmur | ✅ |
| VI — admin `new-template` | kit komponentləri, FSD, CRUD mühərrikinin `extraActions` slotu | ✅ |
| VII — xarici kontraktlar | `GET /currencies/*.xml`, public URL-lər, `api-cbar` endpoint-ləri dəyişmir; yeni admin endpoint əlavədir | ✅ |
| VIII — real verification | `dotnet test` + `dotnet build`, `npm run verify`, endpoint-in əl ilə çağırışı (quickstart) | ✅ |

Phase 1-dən sonra təkrar: dizayn heç bir maddəni pozmur. Complexity Tracking-də iki şüurlu təkrar qeyd olunub (pozuntu deyil).

## Frontend Skills Gate

`senior-front`, `frontendpatterns`, `web-cbar-admin-new` `frontend-standards` və `ui-kit-usage` yükləndi (2026-11-24). `web-cbar-new` dəyişmir.

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| "Excel-dən yüklə" düyməsi | `button` + `icons/FileUploadIcon` | server yoxlaması (403 dialoqda göstərilir; panelin bölmə icazəsi yoxdur) | permission-u rol adı ilə müqayisə |
| `AzirImportDialog` | `dialog`, `upload` (`UploadDropzone`, `XLSX_ACCEPT`), `alert` (red/yellow/green), `spinner`, `button` (`outline`+`black` ləğv) | async state machine (`pick → confirm → done`, diskriminasiya birliyi), focus restore (kit `Dialog`), live region (`Alert`), 4xx-i təkrarlamamaq | boolean soup (`isConfirming && !error && data`), derived state saxlamaq (`isPending`/xəta `useMutation`-dan) |
| Xülasə cədvəli | kit `data-table` (`aria-label`) + kit token-ləri (`text-muted-foreground`, `line-through`) | semantic HTML, empty state (`skipped` boşdursa bölmə yoxdur) | toast-a sığmayan məlumatı toast-a yığmaq |
| Servis / hook | — (`apiClient`, `FormData`) | single fetch wrapper, Zod ilə kontrakt (`CONTRACT` xətası) | komponentdə API çağırışı, ikinci fetch yolu |
| Müddət siyahısı | `select` (mövcud) | — | eyni siyahını iki yerdə yazmaq (`AZIR_TERMS` tək mənbə) |
| Mətnlər | — | i18n (`azir.import.*`, az/en) | hardcoded UI mətni, magic number (sabitlər `model/constants.ts`) |

Review: each frontend phase in tasks.md ends with `ui-kit-review` + the senior-front review checklist before `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/058-azir-excel-import/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R10
├── data-model.md        # fayl modeli, rədd kodları, yazma, panel vəziyyəti
├── quickstart.md        # yoxlama və deploy sırası
├── contracts/
│   ├── admin-api.md     # POST /api/v1/azir/import (OpenAPI delta)
│   └── admin-ui.md      # düymə, dialoq, mətnlər
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/
├── openapi/
│   ├── openapi.yaml                              # path ref + Sync sətri
│   ├── paths/statistics.yaml                     # azirImport
│   └── components/schemas/statistics.yaml        # AzirImport* sxemləri, AzirValue.term təsviri
├── src/Cbar.AdminApi/
│   ├── Time/BakuClock.cs                         # yeni (api-cbar-dakının nüsxəsi)
│   ├── Validation/AzirSheetReader.cs              # yeni: saf oxuyucu + AzirSheet/AzirSheetTerm/AzirSkippedRow/AzirSheetException
│   └── Controllers/AzirController.cs              # POST import, ReadUploadAsync, upsert köməkçiləri bölüşülür
└── tests/Cbar.AdminApi.Tests/
    ├── Cbar.AdminApi.Tests.csproj                 # Fixtures/*.xlsx → output
    ├── Fixtures/azir-2026-10-27.xlsx              # bankın nümunə faylı
    ├── TestWorkbook.cs                            # sintetik .xlsx qurucusu
    └── AzirSheetReaderTests.cs

product-rest/web-cbar-admin-new/src/
├── features/azir/
│   ├── api/azir.service.ts                        # importFile
│   ├── hooks/use-azir.ts                          # useAzirImport
│   ├── model/schemas.ts                           # AZIR_TERMS, azirImportResultSchema, AZIR_IMPORT_ERROR_CODES
│   ├── model/constants.ts                         # importla bağlı sabitlər
│   ├── components/azir-import-dialog.tsx          # yeni
│   ├── components/azir-import-summary.tsx         # yeni: xülasə cədvəli
│   └── azir.test.tsx                              # import ssenariləri
├── pages/azir/index.tsx                           # extraActions + dialoq
├── shared/testing/handlers/azir.ts                # POST /azir/import handler (kontrakt)
├── shared/testing/fixtures/azir.ts                # import cavabı fikstürü
└── locales/{az,en}/azir.json                      # import.*

dokumentasiyalar/azir-guide.md                     # Excel ilə yükləmə bölməsi
```

**Structure Decision**: iki mövcud komponentin mövcud AZIR slice-larına əlavə. API-də oxuma qaydaları `Validation/` altında saf funksiyadır
(CLAUDE.md test qaydası), controller yalnız HTTP + yazma. Panel FSD `features/azir` daxilində qalır; səhifə yalnız kompozisiya edir.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `.xlsx` yükləmə yoxlamasının 3-cü nüsxəsi (`AzirController.ReadUploadAsync`) | spec-in əhatəsi AZIR-dir | ortaq köməkçiyə çıxarmaq işləyən valyuta və əyri controller-lərini də dəyişir; ayrıca refaktor MR-ı kimi təklif olunur |
| 3-cü import dialoqu (`AzirImportDialog`) | tarix seçicisi yoxdur, xülasə və 409 məzmunu fərqlidir | ortaq `xlsx-import-dialog` üç fərqli cavab formasını parametrləşdirməli olardı; ayrıca refaktor |
| `BakuClock`-un admin API-də nüsxəsi | admin API-də Bakı günü yoxdur | iki API arasında ortaq paket yoxdur (`Cbar.Domain` kimi bilərəkdən təkrar) |
