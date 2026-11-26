# Implementation Plan: Rəsmi məzənnə bülleteninin Excel importu

**Branch**: `025-currency-rates-xlsx-import` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/025-currency-rates-xlsx-import/spec.md`

## Summary

Redaktor admin paneldə tarix seçib Mərkəzi Bankın gündəlik bülletenini (`.xlsx`) yükləyir;
`api-cbar-admin` faylın aktiv vərəqindən `B7:G100`-ü oxuyur (B = kod, G = məzənnə, 4 rəqəm,
`XDR → SDR`), həmin tarix üçün mövcud `PUT` ilə eyni merge məntiqi ilə dərhal yazır və nəticəni
qaytarır. Legacy (`UploadCurrencyBehavior.php`) ilə eyni davranış. Bunun işləməsi üçün valyuta
master-i 12-dən 42 koda tamamlanır (məlumat migration-u) və `api-cbar` XML feed-i yeni metalları
legacy kimi ayrıca "Bank metalları" blokuna qoyur ki, kontrakt pozulmasın.

Texniki yanaşma ([research.md](research.md)): yeni NuGet yoxdur — BCL (`ZipArchive` +
`XmlReader`) ilə kiçik reader; `decimal` ilə 15 əhəmiyyətli rəqəm → 4 onluq `AwayFromZero`
(PHP `round` ilə eyni); `POST /currency-rates/import` (multipart), `409 sheet_exists` +
`overwrite=true` ilə təsdiqli üstünə yazma.

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`, `api-cbar`); TypeScript 5 / React 19 (`web-cbar-admin-new`)

**Primary Dependencies**: ASP.NET Core, EF Core + Npgsql; BCL `System.IO.Compression`, `System.Xml`.
Panel: `@cbar/lib-react-ui-kit`, TanStack Query/Router, Axios, Zod, react-i18next. **Yeni paket yoxdur.**

**Storage**: PostgreSQL — `currencies`, `currency_translations` (məlumat), `currency_rates` (yazı). Fayl saxlanılmır.

**Testing**: API-lərdə test layihəsi yoxdur → CI `dotnet build` + test mühitində [quickstart.md](quickstart.md).
Panel: Vitest + MSW, `npm run verify`.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline), admin panel brauzerdə.

**Project Type**: Web — iki API + SPA admin panel.

**Performance Goals**: Import < 2 s (≤ 100 sətir, ≤ 5 MB fayl). SC-001: redaktor üçün < 1 dəqiqə.

**Constraints**: request ≤ 5 MB; açılmış zip entry hədləri (workbook/rels/sharedStrings/sheet hər biri ≤ 20 MB); XXE qadağan; tək tranzaksiya; XML feed kontraktı (Maddə VII.1).

**Scale/Scope**: Gündə 1 bülleten, ~42 kod, bir neçə redaktor.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I — `product-host` referansdır | Davranış `UploadCurrencyBehavior.php`, `CurrencyRates.php`, `xml.php`, `messages/*/other.php`-dən götürülüb; legacy redaktə olunmur | ✅ |
| II — Dörd müstəqil proyekt | 3 komponent → 3 ayrı MR: `api-cbar-admin`, `api-cbar`, `web-cbar-admin-new` | ✅ |
| III — Admin və client ayrılığı | Yazı yalnız `api-cbar-admin`-də; `api-cbar` yalnız oxuyur (XML qruplaşdırması) | ✅ |
| IV — Start/deploy sırası | `api-cbar-admin` (migration) → `api-cbar` → panel. `api-cbar` yeni sətirlərsiz də işləyir (metal yoxdursa blok buraxılır) | ✅ |
| V — Sxem/migration/ikidillilik | Sxem dəyişmir, `Cbar.Domain` dəyişmir; migration `0010-currency-bulletin-master.sql` append-only, idempotent (`ON CONFLICT DO NOTHING`), `BEGIN/COMMIT` yoxdur, ad iki repoda unikal (`api-cbar`-da migration yoxdur); hər yeni valyuta üçün az **və** en ad | ✅ |
| VI — admin `new-template` | Mövcud `features/currency` FSD seqmentinə əlavə; kit komponentləri; `check:kit` | ✅ |
| VII — Xarici kontraktlar | XML: URL/element adları/format dəyişmir; metallar legacy strukturuna qaytarılır, metalsız tarixlərin çıxışı bayt-bayt eynidir; `TODO(compat)` qalır. Yeni admin endpoint spec-first | ✅ (qeydlə: [public-xml-feed.md](contracts/public-xml-feed.md)) |
| VIII — Real icra ilə verification | Test mühitində [quickstart.md](quickstart.md) 1–7; panel `npm run verify` + Node 22 | ✅ |

**Post-design re-check**: dəyişiklik yoxdur, bütün maddələr keçir. Complexity Tracking boşdur.

## Project Structure

### Documentation (this feature)

```text
specs/025-currency-rates-xlsx-import/
├── spec.md
├── plan.md                       # bu fayl
├── research.md                   # R1–R10
├── data-model.md                 # 30 yeni kod, sətir qaydaları, nəticə
├── quickstart.md                 # test mühitində yoxlama
├── contracts/
│   ├── admin-api-import.md       # POST /api/v1/currency-rates/import
│   └── public-xml-feed.md        # api-cbar XML: Bank metalları bloku
├── checklists/requirements.md
└── tasks.md                      # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/
├── openapi/
│   ├── openapi.yaml                              # + /api/v1/currency-rates/import
│   ├── paths/statistics.yaml                     # + rateImport
│   └── components/schemas/statistics.yaml        # + CurrencyRateImportResult
├── db/migrations/0010-currency-bulletin-master.sql   # 30 kod + az/en adlar
└── src/Cbar.AdminApi/
    ├── Validation/RateBulletinReader.cs          # yeni: xlsx → BulletinRow[] (saf, statik)
    └── Controllers/CurrencyRatesController.cs    # + Import; PUT ilə ortaq merge metodu

product-rest/api-cbar/
├── openapi/…                                     # XML cavab təsviri/nümunəsi
└── src/Cbar.WebApi/Controllers/CurrenciesController.cs   # GetRatesXml: metal bloku

product-rest/web-cbar-admin-new/src/
├── features/currency/
│   ├── api/currency.service.ts                   # + importSheet (FormData)
│   ├── hooks/use-currency.ts                     # + useImportSheet (invalidate sheet/dates)
│   ├── model/schemas.ts                          # + rateImportResultSchema
│   ├── components/rate-import-dialog.tsx         # yeni: tarix + fayl, 409 təsdiqi
│   └── currency.test.tsx                         # + import ssenariləri
├── pages/currency-rates/index.tsx                # header-də "Excel-dən yüklə" (prepare icazəsi)
├── locales/{az,en}/currency.json                 # import mətnləri + xəta kodları
└── shared/testing/handlers/currency.ts           # + POST /currency-rates/import
```

**Structure Decision**: Mövcud strukturlar saxlanılır. Reader `Validation/`-a qoyulur
(`MediaUploadRules` kimi saf, statik, DI-siz qaydalar). Merge yazısı `PUT` ilə import arasında
controller-in private metoduna çıxarılır — yeni service layer yaradılmır.

## İş sırası və MR-lar

1. **`api-cbar-admin` MR** (əvvəl deploy):
   1. OpenAPI: `rateImport` + `CurrencyRateImportResult` → lint + bundle → **təsdiq** (`/api-endpoint`).
   2. Migration `0010` (30 kod, az/en).
   3. `RateBulletinReader` + `Import` action; `PUT`-un merge kodu ortaq metoda.
   4. `/sync-openapi api-cbar-admin`, `route-diff.mjs` təmiz.
2. **`api-cbar` MR**: XML-də metal bloku; deploy-dan əvvəl metalsız tarixin XML-i saxlanılır və
   sonra müqayisə olunur.
3. **`web-cbar-admin-new` MR**: servis, hook, dialoq, i18n, MSW, testlər; `npm run verify` + Node 22.
4. Sonda: `/sync-business-logic` — `diff_report_logic.md` #8 və §4.1 sətirləri (Excel import, SDR,
   metallar, XML metal bloku) həll olunmuş kimi yenilənir.

## Riskler və açıq məsələlər

- **Public sayt metalları ümumi cədvəldə göstərəcək.** `web-cbar-new` məzənnə cədvəli bütün
  kodları bir siyahıda verir; legacy-dəki kimi ayrıca "Bank metalları" bölməsi bu spec-ə daxil
  deyil. İstəsəniz ayrıca kiçik spec (yalnız `web-cbar-new`).
- **Valyuta sırası XML-də legacy-dən fərqli qalır** (mövcud `TODO(compat)`); bu spec onu dəyişmir.
- **Test/prod bazada master artıq əl ilə genişlənibsə**: `ON CONFLICT DO NOTHING` mövcud kodlara
  toxunmur, amma onların nominalı bülletendən fərqlidirsə import səhv miqyasda göstərər — deploy-dan
  əvvəl `SELECT code, nominal FROM currencies` yoxlanmalıdır.
- **Bülleten formatı dəyişərsə** (sütun/sətir sürüşməsi) import `no_rates` və ya `invalid_rate` ilə
  dayanır — səssiz səhv yazı olmur.

## Complexity Tracking

Pozuntu yoxdur.
