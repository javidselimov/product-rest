# Implementation Plan: "Aylıq hesabatlar" — şikayət indeksləri və infoqrafika üçün ayrıca məzmun növü

**Branch**: `052-monthly-reports` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/052-monthly-reports/spec.md`

## Summary

Spec 050-də Şikayət indeksləri (95, Sığorta tabı 96) və İnfoqrafika (93) il → ay arxivləri redaktorun əl ilə qurduğu iç-içə TipTap akkordeonlarıdır.
Bu spec onları ayrıca məzmun növünə çevirir.

**Məlumat**: Üç sabit seriya və hər ay üçün bir sətir (il, ay, status). Hər dil üçün ayrıca fayl var. Başlıq saxlanılmır: seriyanın adı və
dövrdən qurulur. Sığorta indeksi 12 aylıq dövr göstərir.

**Komponentlər**:
- **api-cbar-admin**: CRUD endpoint-ləri, migration, və mövcud HTML arxivlərini slug ilə tapıb sətirlərə köçürən dinamik SQL seed.
- **api-cbar**: bir oxuma endpoint-i.
- **Admin panel**: "Aylıq hesabatlar" bölməsi (CRUD mühərriki, seriya tabları, "Yeni"-də növbəti ay).
- **Sayt**: arxivi sətirlərdən qurur. Köhnə akkordeonları gizlədir, səhifə mətnini dəyişmir. Görünüş spec 050 ilə eynidir. Sətir yoxdursa,
  spec 050 HTML yolu qalır.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API); TypeScript 5 strict. Sayt Next.js 16 + React 19, admin React 19 + Vite.

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next, Zod; admin: TanStack Router/Query, RHF.
Yeni runtime dependency **yoxdur**.

**Storage**: PostgreSQL.
- Yeni cədvəllər: `monthly_report_series`, `monthly_report_series_translations`, `monthly_reports`, `monthly_report_translations` (`0034`).
- Köçürmə `0035`-dir. O, `page_translations`-ı və `media_assets`-i yalnız oxuyur.
- Mövcud cədvəllərə toxunulmur.

**Testing**:
- Frontendlər: Vitest + RTL + MSW (`npm run verify` ×2), Node 22 ilə də.
- API-lərdə test layihəsi yoxdur. Yoxlama: `dotnet build`, PGlite ilə endpoint icrası, route-diff (Maddə VIII).

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline); sayt SSR Node, admin nginx.

**Project Type**: web, 4 upstream komponent.

**Performance Goals**:
- Şikayət səhifəsi: +1 yüngül sorğu (~45 sətir, ~10 KB), yoldaş səhifə sorğusu ilə paralel.
- Statistika səhifəsi: +1 sorğu, yoldaş səhifə sorğusu isə düşür.
- Client JS dəyişmir.

**Constraints**:
- `ALTER TABLE` yoxdur. Migration append-only və unikal adlıdır.
- `Cbar.Domain` iki nüsxədə eynidir. OpenAPI spec-first-dir.
- Magic number yoxdur (spec 032). UI mətni i18n az/en-dədir.
- Saytın görünüşü dəyişmir. Səhifə mətnləri dəyişmir.
- Seed mühitdən asılı deyil: id-lər mühitlər arasında fərqlidir.

**Scale/Scope**:
- 3 seriya, 142 sətir (32 + 45 + 65), az 142 + en 73 fayl. Artım ildə ~36 sətirdir.
- Admin: 1 bölmə, 1 mühərrik genişlənməsi.
- Sayt: 1 model faylı, 2 parser dəyişikliyi, loader.

## Constitution Check

*GATE: Phase 0-dan əvvəl keçdi. Phase 1 dizaynından sonra yenidən yoxlandı, pozuntu yoxdur.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | Əvəz edilən: köhnə saytda ümumi CMS səhifə şablonu (`visitor/views/pages/index.php`) və admin-in səhifə redaktoru (95, 96, 93-ün akkordeon arxivləri). Köhnə saytda bu bölmənin xüsusi kodu yoxdur (spec 050). Paritet cədvəli aşağıdadır. URL dəyişmir. | ✅ |
| II — Dörd müstəqil proyekt | 4 MR, deploy sırası: api-cbar-admin → api-cbar → admin panel → sayt. Paylaşılan kod yoxdur. Köçürmə SQL-dir, komponent onu import etmir. | ✅ |
| III — Admin/client ayrılığı | Sayt yalnız `api-cbar`-ı, admin yalnız `api-cbar-admin`-i çağırır. Public sorğu `published`, `deleted_at`, dildə fayl və silinməmiş media şərtləri ilə süzülür. `ShowAz/ShowEn` yerinə dildə faylın olması işləyir (research R2). Admin endpoint-ləri JWT, `monthly_reports.*` icazələri və audit ilə qorunur. | ✅ (R2 əsaslandırılıb) |
| IV — Start sırası | Dəyişmir. Yeni port və servis yoxdur. | ✅ |
| V — Sxem, migration, ikidillilik | Yeni cədvəllər `IF NOT EXISTS` ilə yaranır. `0034`/`0035` unikaldır, içində BEGIN/COMMIT yoxdur. `*_translations (entity_id, locale)` cədvəli var. `MonthlyReport.cs` iki nüsxədə eynidir. Bir dilin boş qalması xəta deyil. Chrome etiketləri az/en-dədir, seriyanın adı (redaksiya mətni) API-dən gəlir. | ✅ |
| VI — Admin template stack | Kit, TanStack, RHF/Zod, i18n; `ModuleConfig`. Mühərrikə bir opsional genişlənmə əlavə olunur (`newSearch`). Rich-text redaktoruna toxunulmur. Token yalnız yaddaşdadır. | ✅ |
| VII — Xarici kontraktlar | Mövcud endpoint-lər dəyişmir, yalnız yeni route-lar var. `/currencies/*.xml`-ə toxunulmur. Sayt URL-ləri və yönləndirmələr dəyişmir. | ✅ |
| VIII — Verification | `dotnet build` ×2, PGlite ilə köçürmə və endpoint icrası, route-diff, `npm run verify` ×2, səhifə icrası və ölçmə (quickstart). | ✅ |

**Paritet cədvəli (Maddə I.3)**

| `product-host` / spec 050 | Yeni qarşılıq | Status |
|---|---|---|
| 95, 96, 93-ün il → ay akkordeonları (redaktor HTML-i) | "Aylıq hesabatlar" bölməsi; HTML fallback kimi qalır | əvəz |
| Fayl linkinin əl ilə yazılmış mətni | seriyanın adı + dövr (avtomatik) | əvəz (spec defolt 6) |
| Sığorta en-də 2 xarici `uploads.cbar.az` linki (sayt bugün də göstərmir) | — | köçürülmür. Redaktor istəsə faylı yükləyib əlavə edir |
| Səhifə URL-ləri, `?tab=insurance`, `#infoqrafika`, 96/93 yönləndirmələri | dəyişmir | eyni |
| Metodologiya, giriş mətni (redaktor HTML-i) | dəyişmir | eyni |

## Frontend Skills Gate

Yüklənib:
- `senior-front`, `frontendpatterns`;
- `frontend-standards` və `ui-kit-usage` (`web-cbar-admin-new`);
- `web-cbar-new/.claude/skills/frontend-standards` (bölmələrinə baxılıb).

Sayt tərəfində yeni UI komponenti yoxdur, ona görə `ui-kit-usage` (sayt) implement mərhələsində saytın fazasından əvvəl yüklənir.

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Arxiv / "Son məlumat" / İnfoqrafika (sayt) | dəyişmir: mövcud `DocumentCard`, `LatestCard` (spec 050) | Graceful degradation: API xətası olanda HTML fallback; Separation of Concerns: DTO → model loader-də | ikinci parser və ya `complaint-index-v2` layout-u (Duplicate Code); render-də API sırasına güvənmək (model invariantı özü sıralayır) |
| Başlıq / dövr qurulması (sayt) | — | Pure function (`reportTitle`, `archiveFromReports`), table-driven test | Primitive Obsession: dövr hesabı komponentə səpələnmir, bir modeldədir; magic `12`/`' – '` yerinə sabitlər |
| Admin siyahısı | `CrudListPage`, kit `Badge` (`LocaleBadges`, "Fayl silinib" `colorPalette="red"`), tabs süzgəci | Explicit loading/empty/error (`LookupGate`, mühərrik), URL-as-state (süzgəclər search param-da) | əl ilə yazılmış CRUD ekranı (Duplicate Code); `features → features` importu (`LocaleBadges` → `entities/content/ui`) |
| Admin forması | `CrudFormPage`: `select`, `number`, per-locale `media` sahəsi (image-popups) | Form validation (RHF + Zod; server `problem+json` 409/400 mesajı), unsaved-changes guard (mövcud) | Speculative Generality: başlıq/şablon sahəsi əlavə etmək; `useEffect` ilə "növbəti ay" hesablamaq (URL prefill-dir, render-də törəmə) |
| "Yeni" → növbəti ay | `Button` (mövcud) | Derive, don't store: siyahının ilk sətrindən törənir | async `createDefaults` ilə mühərrikə yükləmə vəziyyəti əlavə etmək (research R7) |
| Səhifə formunda keçid kartı | mövcud `ManagedSectionCard` | Wayfinding (redaktor köhnə yerdən yeni yerə yönləndirilir) | kartın kopyası (mövcud kart `search` ilə genişlənir) |

Review: tasks.md-də hər frontend fazası `ui-kit-review` + senior-front review checklist tapşırığı ilə bitir, sonra `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/052-monthly-reports/
├── spec.md
├── plan.md                    # bu fayl
├── research.md                # R1–R15
├── data-model.md              # cədvəllər, validasiya, köçürmə alqoritmi
├── quickstart.md
├── contracts/
│   ├── public-api.md          # GET /monthly-reports
│   ├── admin-api.md           # CRUD + /series
│   ├── admin-ux.md            # panel bölməsi, newSearch, managed-sections
│   └── site-integration.md    # ReportSeries, archiveFromReports, parser və loader dəyişikliyi
├── checklists/requirements.md
└── tasks.md                   # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/                     # MR 1 (birinci deploy)
├── openapi/paths/monthly-reports.yaml, components/schemas/monthly-reports.yaml, openapi.yaml   # spec-first
├── db/migrations/0034-monthly-reports.sql, 0035-monthly-reports-seed.sql
├── src/Cbar.Domain/Entities/MonthlyReport.cs, CbarDbContext.cs          # == api-cbar nüsxəsi
├── src/Cbar.AdminApi/Authorization/Permissions.cs (MonthlyReports.*)
└── src/Cbar.AdminApi/Controllers/MonthlyReportsController.cs

product-rest/api-cbar/                           # MR 2
├── openapi/paths/monthly-reports.yaml, components/schemas/monthly-reports.yaml, openapi.yaml
├── src/Cbar.Domain/Entities/MonthlyReport.cs, CbarDbContext.cs          # == api-cbar-admin nüsxəsi
└── src/Cbar.WebApi/Controllers/MonthlyReportsController.cs

product-rest/web-cbar-admin-new/                 # MR 3
├── src/shared/crud/types.ts                      # ModuleConfig.newSearch
├── src/features/crud/components/crud-list-page.tsx (+ test)
├── src/entities/content/ui/locale-badges.tsx     # features/faq-dan köçür (shared entities-dən import edə bilmir)
├── src/features/monthly-reports/{api,model}/     # service, keys, schemas, constants, period (+ test), module
├── src/pages/monthly-reports/index.tsx           # LookupGate
├── src/app/routes/{index.ts,nav.ts}              # route-lar, NavGroup `consumer`
├── src/features/pages/model/managed-sections.ts  # 3 slug, link.search
├── src/locales/{az,en}/monthly-reports.json, nav.json, pages.json
└── src/shared/testing/handlers/monthly-reports.ts

product-rest/web-cbar-new/                       # MR 4 (sonuncu deploy)
├── src/features/monthly-reports/{api/monthly-reports.api.ts, model/schemas.ts}
├── src/features/about-content/model/{types.ts, constants.ts, report-archive.ts (+ test), complaint-index.ts, appeal-statistics.ts, parse.ts}
├── src/views/cms-page/loader.ts                  # seriyaların yüklənməsi, yoldaşın şərti yüklənməsi
├── src/shared/testing/{handlers,fixtures}/monthly-reports.ts
└── docs/consumer-rights-cms-guide.md

Root: CLAUDE.md, product-rest/web-cbar-admin-new/CLAUDE.md, business_logic/{new_business_logic,diff_report_logic}.md,
dokumentasiyalar/istehlakci-huquqlari-guide.md, specs/046-international-memberships/contracts/admin-nav.md (yeni qrup)
```

**Structure Decision**: Dörd komponent, dörd MR, deploy sırası API-admin → API → admin panel → sayt. Sayt köhnə API ilə də işləyir: endpoint
yoxdursa xəta verir, xəta isə HTML fallback-a aparır. Ona görə sıranın pozulması saytı sındırmır.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — (pozuntu yoxdur) | | |

Qeydlər:
- `ModuleConfig.newSearch` generik və opsional mühərrik genişlənməsidir, mövcud modullar dəyişmir.
- `ShowAz/ShowEn` əvəzinə dildə faylın olması research R2-də əsaslandırılıb.
- Seriya cədvəli üç sabit sətirlə əsaslandırılıb (R1): redaksiya mətni API-dən gəlməlidir.
