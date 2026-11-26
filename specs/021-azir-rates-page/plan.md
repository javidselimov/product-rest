# Implementation Plan: AZIR səhifəsi — əqd həcmi/sayı, `*` ehtiyat plan, statistika bloku, 60 günlük filtr, Excel export

**Branch**: `021-azir-rates-page` (spec qovluğu; iş `test` branch-indədir) | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/021-azir-rates-page/spec.md`

## Summary

Köhnə `/indeks/rates` səhifəsi bankların gündəlik istifadə etdiyi məlumatı verir: cədvəl, `*`, statistika bloku, filtr və Excel. Bu feature onu 4 proyektdə, 4 MR ilə bərpa edir:

1. **Məlumat** (`api-cbar-admin`). `azir_index_values` dəyişmir. Yeni 1:1 yoldaş cədvəl `azir_index_value_details` yaradılır: `deal_volume`, `deal_count`, `min_rate`, `max_rate`, `is_reserve_plan`. Migration `0008` adlı CHECK-lər, şərtli FK və `cbar_web_ro` grant-ı ilə gəlir (istifadəçi qərarı, `ALTER TABLE` sahiblik riskini aradan qaldırır). Upsert sahə səviyyəsində validasiya (`errors`) və tam audit alır. `LAST MIN/MAX RATE` ayrıca sətir olmaqdan çıxır, 1D sətrinin sahələrinə çevrilir (R1, R2).
2. **Public API** (`api-cbar`):
   - `GET /azir` additiv genişlənir: yeni sahələr gəlir, route və sıra dəyişmir (R3).
   - Yeni `GET /azir/summary` 11 göstəricini API-də hesablayır. Bunlara "tarixə qədər son dəyər" və USD lookup daxildir (R4, R5).
3. **Admin panel** (`web-cbar-admin-new`). Upsert kartına yeni sahələr gəlir. Zod `superRefine` əlavə olunur, server `fieldErrors` sahələrə bağlanır. Siyahıya sütunlar və "Formaya yüklə" sətir əməliyyatı (prefill) əlavə olunur (R14).
4. **Public sayt** (`web-cbar-new`):
   - Yeni `/{locale}/statistics/azir` səhifəsi: qrafik, xəbərdarlıq, JS-siz GET filtr, cədvəl, `*` və footnote, statistika bloku (R8–R11).
   - `/indeks/rates` → 308 yönləndirməsi `proxy.ts`-də olur (R8).
   - Excel `…/azir/export` route handler-də **dependency-siz xlsx yazıcı** ilə yaradılır (`node:zlib`). 1-ci vərəq köhnə kimi 4 sütundur, `*` 2-ci vərəqdədir (R6, R7).
   - Ana səhifə kartında `*` görünür, düymə yeni səhifəyə aparır (R15).

**Qiymət**: ~13 SP. Bölgü: admin API + migration 3, public API + summary 3, admin panel 2, public səhifə + redirect 3, xlsx yazıcı + route 2.

## Technical Context

**Language/Version**:
- C# / .NET 10: `api-cbar-admin`, `api-cbar`.
- TypeScript 5 strict:
  - Next.js 16 App Router (`web-cbar-new`);
  - React 19 + Vite (`web-cbar-admin-new`).
- Node 24 lokal, **22 CI**.

**Primary Dependencies**: mövcud olanlar (EF Core + Npgsql, `@cbar/lib-react-ui-kit`, ECharts, RHF + Zod, TanStack, MSW). **Yeni runtime dependency yoxdur**. xlsx yazıcı `node:zlib` (`deflateRawSync`, `crc32`, Node ≥ 22.2) ilə qurulur (R6).

**Storage**: PostgreSQL. **Yeni** cədvəl `azir_index_value_details (azir_index_value_id bigint PK, 5 sahə, updated_at)`, 5 CHECK, şərtli FK, `cbar_web_ro` SELECT ([data-model.md](./data-model.md) §1). `azir_index_values` dəyişmir

**Testing**:
- API-lərdə avtomatik test yoxdur (Konstitusiya VIII.1). Pipeline build olunur, test mühitində [quickstart](./quickstart.md) §3–§4 işlədilir, `npm run contract` də daxil.
- Frontendlərdə `npm run verify` (Vitest + MSW), Node 22 və 24 ilə.

**Target Platform**: Linux konteyner (k8s), `TZ=Asia/Baku`. Brauzerlər: müasir evergreen. Fayl Excel, LibreOffice və Google Sheets-də açılmalıdır.

**Project Type**: web — 2 web-service + 2 web-app, 4 ayrı upstream repo.

**Performance Goals**:
- Default görünüş < 2 s (SC-005).
- Səhifə api-cbar-a 2 sorğu edir (sətirlər + summary), hər ikisi 60 s keşlənir. Export əlavə sorğu etmir.
- Ana səhifə kartının sorğusu `?from=` ilə kiçilir.

**Constraints**:
- Spec-first OpenAPI.
- `Cbar.Domain` bayt-bayt eyni qalmalıdır.
- Migration append-only və idempotentdir.
- `api-cbar` read-only-dir.
- Brauzer api-cbar-a birbaşa müraciət etmir.
- Yeni dependency yoxdur.
- az/en key pariteti.
- Lokalda .NET SDK yoxdur.

**Scale/Scope**: ~2 500 sətir / 10 il (export həddi). 4 MR, təxminən 35 fayl.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 `product-host` referansı | Spec əvəz olunan faylları sadalayır: `IndeksController::actionRates/ChartData`, `IndeksRatesViewModel`, `AzirForm1D`, `rates.php`, `Azir::collectData`, `IndeksExportHelper::exportRates`, `AzirController` | ✅ |
| I.3 səssiz itki yoxdur | Ləğv olunanlar açıq yazılıb: ayrı az/en həcm/say sahələri, `eqd_hecm_usd`, `LAST MIN/MAX` sətirləri, `/indeks/chart-data`, `/indeks/all`. Əhatədən kənarda: TFAI, `home_view`, PDF-lər, import | ✅ |
| I.4 `product-host` yalnız oxunur | Yalnız davranış çıxarılıb, kod köçürülməyib | ✅ |
| II.3 çox proyekt = ayrı MR, sıra | 4 MR: (1) `api-cbar-admin` → (2) `api-cbar` → (3) `web-cbar-admin-new` → (4) `web-cbar-new`. 3 və 4 1-ə və 2-yə söykənir | ✅ |
| II.4 əlaqə yalnız HTTP + sxem | Next export api-cbar-ı HTTP ilə oxuyur. Fayl/paket paylaşılmır | ✅ |
| III.1 admin/client ayrılığı | `web-cbar-new` → yalnız `api-cbar`. `web-cbar-admin-new` → yalnız `api-cbar-admin` | ✅ |
| III.2 yeganə yazan | Yazma yalnız `api-cbar-admin`-dədir. `api-cbar` yeni cədvəli SELECT edir: migration `cbar_web_ro`-ya açıq `GRANT SELECT` verir (`0005` nümunəsi) | ✅ |
| III.3 public filtr | AZIR-də status/soft-delete/locale bayrağı yoxdur (mövcud vəziyyət, spec Clarifications Q5: dərhal public). Public filtr `rate > 0`-dır. Yeni filtrsiz məzmun növü yaranmır | ✅ (əsaslandırılıb) |
| III.4 JWT + audit | Admin endpoint-ləri JWT altında qalır. Audit `before`/`after` bütün sahələri daxil edir | ✅ |
| IV.2 start/deploy sırası | `0008` `api-cbar-admin`-də tətbiq olunur. `api-cbar` yeni cədvəli ondan sonra oxuyur, əks sıra 500 verər (quickstart §0) | ✅ |
| IV.1/IV.3 skript və portlar | Yeni port və proses yoxdur, `dev.ps1`/`dev.sh` dəyişmir | ✅ |
| V.1 `Cbar.Domain` eyni | `Statistics.cs` + `CbarDbContext.cs` hər iki kopyada eyni commit-də dəyişir, `diff -r` boş olmalıdır | ✅ |
| V.2 migration | `0008-azir-index-value-details.sql`: `CREATE TABLE IF NOT EXISTS` + daxili CHECK-lər, FK və grant `DO` bloklarında şərtlidir, `BEGIN/COMMIT` yoxdur, ad hər iki repo üzrə unikaldır. Mövcud cədvələ `ALTER` yoxdur (R1) | ✅ |
| V.3 ikidillilik | Rəqəm məlumatı dildən asılı deyil, bir dəyər saxlanır (köhnə `_az/_en` təkrarı ləğv olunur) | ✅ |
| V.4 chrome etiketləri | Bütün mətnlər `locales/{az,en}`-dədir, key-parity testi var. Editorial mətn yoxdur | ✅ |
| V.5 UTF-8 | Fayllar yalnız redaktor alətləri ilə yazılır | ✅ |
| VI admin panel template | FSD, RHF + Zod, kit `Checkbox`, mövcud `rowActions` API. Yeni dependency yoxdur | ✅ |
| VII.2 köhnə URL-lər | `/indeks/rates` (+ `?language`, `?export`, `d/m/Y`) üçün 308 xəritəsi [contracts/web-routes.md §3](./contracts/web-routes.md)-dədir | ✅ |
| VII.3 kontrakt geriyə uyğunluğu | `/azir` additivdir, `/azir/summary` yenidir. Mövcud istehlakçılar (`/statistics`, ana səhifə) qırılmır | ✅ |
| VIII icra ilə verification | quickstart §1–§7. API test mühitində, istinad dəsti ilə | ✅ |
| Yeni dependency yalnız spec ilə | Yoxdur (exceljs/SheetJS/ClosedXML rədd edildi, R6) | ✅ |

**Gate nəticəsi**: keçir, açıq şərt yoxdur. Yoldaş cədvəl qərarı (2026-10-08) sahiblik sorğusu gate-ini ləğv edir.

**Post-design re-check (Phase 1-dən sonra)**: kontraktlar və data modeli yuxarıdakı cədvələ uyğundur. Yeni pozuntu yaranmayıb.

## Project Structure

### Documentation (this feature)

```text
specs/021-azir-rates-page/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R16
├── data-model.md        # sütunlar, CHECK-lər, entity, 11 göstərici qaydası
├── quickstart.md        # validation ssenariləri + istinad test dəsti
├── contracts/
│   ├── admin-api.md     # POST/GET /api/v1/azir (admin), sahə xətaları
│   ├── public-api.md    # GET /api/v1/azir (additiv), GET /api/v1/azir/summary
│   ├── web-routes.md    # səhifə, export route, 308 xəritəsi, i18n mətnləri
│   └── xlsx.md          # fayl kontraktı
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/                       # MR 1
├── openapi/paths/statistics.yaml                  # upsert body / list item / 400 errors
├── openapi/components/schemas/statistics.yaml
├── db/migrations/0008-azir-index-value-details.sql     # yeni (yoldaş cədvəl)
├── src/Cbar.Domain/Entities/Statistics.cs         # AzirIndexValueDetail + Details naviqasiyası
├── src/Cbar.Domain/CbarDbContext.cs               # DbSet, ToTable, HasOne/WithOne, HasPrecision
├── src/Cbar.AdminApi/Errors/CbarControllerBase.cs # (ixtiyari) FieldValidationProblem
└── src/Cbar.AdminApi/Controllers/AzirController.cs

product-rest/api-cbar/                             # MR 2
├── openapi/{paths,components/schemas}/statistics.yaml, openapi.yaml, scripts/contract-check.mjs
├── src/Cbar.Domain/** (MR 1 ilə bayt-bayt eyni)
└── src/Cbar.WebApi/Controllers/StatsController.cs # /azir proyeksiya + /azir/summary

product-rest/web-cbar-admin-new/src/               # MR 3
├── features/azir/model/{schemas.ts,module.ts,prefill-context.tsx}
├── features/azir/components/{azir-upsert-card.tsx,azir-prefill-action.tsx}
├── features/azir/azir.test.tsx
├── pages/azir/index.tsx
├── locales/{az,en}/azir.json
└── shared/testing/{fixtures,handlers}/azir.ts

product-rest/web-cbar-new/src/                     # MR 4
├── app/[locale]/statistics/azir/page.tsx          # yeni
├── app/[locale]/statistics/azir/export/route.ts   # yeni (+ route.test.ts)
├── views/azir/{loader.ts,index.tsx,azir.test.tsx} # yeni
├── widgets/azir-summary/azir-summary.tsx          # yeni (11 sətirlik blok)
├── features/stats/model/{schemas.ts,series.ts,azir-range.ts,azir-rows.ts}
├── features/stats/model/azir-export.ts            # sətirlər → workbook modeli (yeni)
├── features/stats/api/stats.api.ts                # getAzir(range), getAzirSummary
├── shared/lib/xlsx/{zip.ts,workbook.ts,index.ts}  # dependency-siz yazıcı (yeni, + test)
├── entities/content/lib/numbers.ts                # formatNumber / formatSigned (yeni)
├── proxy.ts, proxy.test.ts                        # legacyRedirect
├── views/home/loader.ts, widgets/home-cards/money-market-card.tsx (+ test)
├── locales/{az,en}/{finance,home}.json
└── shared/testing/{fixtures,handlers}/stats.ts
```

**Structure Decision**: mövcud 4 proyektin öz strukturuna və FSD qatlarına tam uyğundur. Yeni qovluqlar `widgets/azir-summary`, `views/azir` və `shared/lib/xlsx`-dir.

- xlsx yazıcı `shared/lib`-dədir, çünki domendən asılı deyil.
- AZIR-ə aid sütun xəritəsi `features/stats/model/azir-export.ts`-dədir.
- Route handler ikisini birləşdirir, ona görə FSD boundary qaydası (spec 017) pozulmur.

## Implementation phases (tasks üçün çərçivə)

| Faza | MR | Məzmun | Bitmə şərti |
|---|---|---|---|
| 1 | api-cbar-admin | OpenAPI → migration → Domain → controller (validasiya, audit, proyeksiya) | pipeline yaşıl, quickstart §3 |
| 2 | api-cbar | OpenAPI → Domain kopyası → `/azir` proyeksiya → `/azir/summary` → contract-check | quickstart §4 istinad dəsti 11/11 |
| 3 | web-cbar-admin-new | schemas → MSW → kart + validasiya + fieldErrors → siyahı + prefill → i18n → testlər | `npm run verify` (22 + 24) |
| 4a | web-cbar-new | numbers, azir-range, schemas/series, MSW, loader + view + summary widget, i18n | view testləri |
| 4b | web-cbar-new | xlsx yazıcı + `azir-export` + route handler | xlsx və route testləri, quickstart §6 |
| 4c | web-cbar-new | `legacyRedirect` + ana səhifə kartı | proxy və kart testləri, `npm run verify` |
| 5 | — | `/sync-openapi`, `/sync-business-logic` (diff §1 sətir 11, §4.2, §9, §11 #4) | sənədlər yenilənib |

## Risks

| Risk | Təsir | Azaltma |
|---|---|---|
| `REFERENCES` icazəsi yoxdur → FK yaranmır | yetim detal sətri qala bilər | controller detalı açıq silir; oxu həmişə ana cədvəldən başlayır, yetim sətir görünmür (R1) |
| Paylaşılan mühitdə default privileges yeni cədvəli örtmür | `api-cbar` "permission denied" → AZIR 500 | migration-da açıq `GRANT SELECT` (`0005` nümunəsi); quickstart §3 addım 2 bunu yoxlayır |
| Summary lokal test olunmur (.NET SDK yoxdur) | göstəricilərdə səhv | istinad dəsti + gözlənilən 11 rəqəm (quickstart §4), `contract-check` |
| Dependency-siz xlsx-in uyğunluğu | Excel "faylı bərpa et" xəbərdarlığı | minimal, sənədləşmiş OOXML (contracts/xlsx.md); roundtrip testi; 3 proqramda əl ilə açılış |
| Paylaşılan rate-limit kvotası (R13) | yüklənmə vaxtı 429 | sorğu sayı 2, keş 60 s; kvota ayrıca ölçülür |
| Spec 008 four-eyes sonradan gələrsə | summary-nin USD sorğusu təsdiqlənməmiş vərəqi götürə bilər | Risk kimi qeyd olunub; spec 008 implementasiyasında summary sorğusu yenilənməlidir |
| Köhnə tarixçə import olunmayıb | cutover-də boş/yarımçıq rəqəmlər | spec: import ayrıca spec-dir və cutover şərtidir |

## Complexity Tracking

| Kənarlaşma | Niyə lazımdır | Rədd edilən sadə alternativ |
|---|---|---|
| Öz xlsx yazıcımız (~200 sətir) | `web-cbar-new`-də yeni runtime dependency qadağandır (ECharts yeganədir), vendor/offline install. .NET-də isə lokal build yoxdur | exceljs / SheetJS: dependency qaydası və audit; .NET kitabxanası: yoxlana bilmir |
| SC-004 "dərhal" → "≤ 60 s" | AZIR oxumaları mövcud qərarla 60 s keşlənir (spec 003, `cachedJson`) | AZIR üçün keşsiz oxu: yük və rate-limit riski. Tələb olunarsa `revalidateTag('stats')` ayrıca işdir |
| Göstərici 3/4/8 istinadı `lastDate`-ə görədir, `today`-ə görə yox | ayın ilk günlərində yanlış "0" dəyişmənin qarşısını alır | köhnə `last day of last month` (`today`-ə görə): ay keçidində mənasız nəticə verir |
