# Implementation Plan: Ana səhifənin "Strategiya və sənədlər" bloku — admin paneldən idarə

**Branch**: `057-homepage-strategy-docs` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/057-homepage-strategy-docs/spec.md`

## Summary

Ana səhifənin "Strategiya və sənədlər" bloku bugün kodda saxlanılan üç sənədi göstərir (`web-cbar-new/src/views/home/mock.ts`, `TODO(api)`).
Redaktor onu dəyişə bilmir. Plan bloku ayrıca məzmun növünə çevirir:

- **Sxem**: `homepage_strategy_docs` + `_translations` (`0043`). FinCERT üzvlükləri nümunəsidir: status, soft delete, sıra, hər dil üçün başlıq,
  qısa mətn, üz qabığı və ünvan. Ortaq sahə bağlı CMS səhifəsidir. Köçürmə `0044` üç sənədi səhifələrinə az slug ilə bağlayır.
- **Admin API**: `/api/v1/homepage-strategy-docs` CRUD + `PUT /order`, dörd yeni icazə.
- **Public API**: yeni endpoint yoxdur, `GET /api/v1/homepage` cavabına `strategyDocs` əlavə olunur. Keçid (`url` → səhifə slug-u) və üz qabığının dil
  fallback-i serverdə həll olunur, işləməyən keçidli sənəd cavaba düşmür.
- **Admin paneli**: "Ana səhifə blokları"-nda yeni tab. Standart `ModuleConfig` + mövcud hissələr: `perLocale` şəkil, searchable səhifə seçimi
  `LookupGate` ilə, "Sıranı dəyiş" dialoqu.
- **Sayt**: widget və görünüş dəyişmir. Loader mock əvəzinə `/homepage`-in `strategyDocs`-unu oxuyur, ilk 3-ü götürür, xarici ünvanı yeni vərəqdə
  açır. `mock.ts` və iki statik üz qabığı saytdan çıxır.
- **Kartların hədəf səhifələri (US4)**: köhnə `/pages/strategy` (portret, müraciət, imza, PDF) CMS səhifəsi 104-ün az/en mətni olur.
  - 104 kök bölmə kimi yerində qalır (spec 056 header-i), mətni indi 105-in surətidir.
  - Portret və iki PDF (33–37 MB) `tools/media-backfill/import-strategy-page.mjs` ilə köhnə saytdan media kitabxanasına yazılır, eyni alət mətni qurur
    (spec 054 idxalı kimi).
  - Mətn redaktorun saxladığı formadadır, roundtrip fikstürü ilə kilidlənir.
  - Köhnə ünvanlar (`/pages/strategy`, `page-872/*` → 66, `page-878/*` → 76, iki PDF) 308 ilə yönlənir: `proxy.ts` `LEGACY_PAGES` +
    `next.config.ts` `redirects()`.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API). TypeScript 5 strict: Next.js 16 + React 19 (sayt), React 19 + Vite (admin).

**Primary Dependencies**: EF Core + Npgsql. `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next, Zod. Admin-də TanStack Router/Query, Zustand,
RHF. Yeni runtime dependency **yoxdur**.

**Storage**: PostgreSQL. İki yeni cədvəl (`0043`), məzmun seed-i (`0044`), `permissions`/`role_permissions`-a sətirlər. Mövcud cədvəllərə `ALTER`
yoxdur. Media MinIO-dadır, dəyişmir.

**Testing**: xUnit (`Cbar.AdminApi.Tests` `StrategyDocRulesTests`, `Cbar.WebApi.Tests` `StrategyDocLinksTests`, DB-siz). Vitest + RTL + MSW (iki
frontend, `npm run verify`). Endpoint-lər PGlite ilə real SQL-ə qarşı işlədilir, `route-diff.mjs` (Konstitusiya VIII).

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline). Sayt SSR Node-dur, admin nginx.

**Project Type**: web — 4 upstream komponent (`api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`).

**Performance Goals**: ana səhifəyə yeni sorğu yoxdur (`/homepage`-in içində). `strategyDocs` sorğusu bir indeksli `ORDER BY` + iki `LEFT JOIN`-dir
(sənədlər onlarladır). Yeni client JS yoxdur.

**Constraints**:
- `Cbar.Domain` iki kopyada bayt-bayt eynidir.
- Miqrasiya adları iki repo üzrə unikaldır (`0043`/`0044` boşdur).
- `api-cbar` yalnız SELECT edir. Endpoint-lər spec-first-dir.
- Magic number yoxdur (spec 032).
- Saytın görünüşü SC-004 üzrə 2 px daxilində qalır.

**Scale/Scope**: 3–10 sənəd, 2 dil. Bir admin tabı, bir sayt bloku.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I.2–I.3 `product-host` referansı, paritet | Köhnə ana səhifədə blok yoxdur (`visitor/views/home/index.php`). `PagesController::actionStrategy` 104-ün mətni olur, 872 və 878 → 66 və 76. Paritet cədvəli spec-dədir, lightbox açıq şəkildə "ləğv edilir" | ✅ |
| I.4 `product-host` yalnız oxunur | Müraciət mətni `strategy.php`-dən **məlumat** kimi götürülür (kod köçürülmür). Fayllar köhnə saytın public ünvanından endirilir | ✅ |
| II.1, II.3 dörd müstəqil proyekt | İş dörd MR-dır, deploy sırası: api-cbar-admin → api-cbar → frontendlər. Root-da paylaşılan kod yoxdur | ✅ |
| II.2 root-da yalnız orkestrasiya | İdxal aləti mövcud `tools/media-backfill`-ə əlavə olunur: birdəfəlik əməliyyat alətidir (spec 054 presedenti), komponentlərin import etdiyi kod deyil | ✅ (əsaslandırılıb) |
| II.4 yeganə əlaqə: HTTP + sxem | Admin paneli yalnız admin API-ni, sayt yalnız `api-cbar`-ı çağırır | ✅ |
| III.2 `api-cbar-admin` yeganə yazandır | Cədvəllər və seed admin miqrasiyalarındadır. `api-cbar` `cbar_web_ro` ilə oxuyur (grant `0043`-də) | ✅ |
| III.3 public filtr | `status = published`, `deleted_at IS NULL`, dil tərcüməsi. Səhifə üçün `Published` + `Active` + `ShowAz/ShowEn` (data-model) | ✅ |
| III.4 JWT + audit | Bütün yeni admin endpoint-ləri `RequirePermission` ilədir. Create, update, delete və reorder `AuditService`-ə yazılır | ✅ |
| IV.2 start/deploy sırası | Dəyişmir. Yeni cədvəllər `api-cbar`-dan əvvəl yaranır. Sayt sahəsiz API ilə də işləyir (`default([])`) | ✅ |
| IV.1, IV.3 skriptlər, portlar | Yeni port və servis yoxdur. `dev.ps1`/`dev.sh` köhnəlib (kök `CLAUDE.md`), bu spec onlara toxunmur | ✅ (N/A) |
| V.1 `Cbar.Domain` eyniliyi | Entity və `DbContext` dəyişikliyi iki kopyaya eyni commit-də düşür, `diff` sıfırdır | ✅ |
| V.2 miqrasiya qaydaları | Append-only, `BEGIN/COMMIT` yoxdur, `IF NOT EXISTS`, şərti FK, unikal ad | ✅ |
| V.3 ikidillilik | `_translations (doc_id, locale)`. Bir dil boş ola bilər, xəta deyil | ✅ |
| V.4 chrome vs editorial | Blok başlığı və "Daha ətraflı" `locales`-dədir. Sənəd mətnləri API-dən gəlir. Koddakı editorial mətn (mock) silinir | ✅ |
| VI admin template qaydaları | Kit, FSD, `ModuleConfig`, MSW real kontrakt, token yalnız yaddaşda. Rich-text toxunulmur, roundtrip tələb olunmur | ✅ |
| VII.1–VII.3 xarici kontraktlar | `/homepage`-ə yalnız sahə əlavə olunur. XML feed və köhnə URL-lərə toxunulmur | ✅ |
| VIII verification | xUnit + Vitest + PGlite ilə real SQL + `route-diff`. Ekranlar əl ilə yoxlanılır (quickstart) | ✅ |

Pozuntu yoxdur, Complexity Tracking boşdur.

**Post-design re-check** (Phase 1-dən sonra): kontraktlar yuxarıdakı cədvəli dəyişmir. `/homepage`-in genişlənməsi (R3) VII.3-ə uyğundur. Link
qaydasının `ContentSupport`-a çıxması (R7) davranışı dəyişməyən refaktordur. ✅

## Frontend Skills Gate

Yüklənib: `senior-front`, `frontendpatterns`, `web-cbar-new` və `web-cbar-admin-new` `frontend-standards` və `ui-kit-usage`.

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Sayt: `StrategyDocs` kartları (görünüş dəyişmir) | mövcud `Button asChild` (`/button`), `ArrowRightIcon` (`/icons`), `SiteImage`, semantik tokenlər | Server Component, progressive enhancement (adi linklər, JS-siz işləyir), Boundaries contain failure (`/homepage` xətası yalnız bloku gizlədir) | Speculative Generality (yeni widget yazılmır), Duplicate Code (`SmartLink`/`localizeHref` yenidən yazılmır), Magic Number (`STRATEGY_DOCS_MAX`) |
| Sayt: loader xəritələməsi `toStrategyDoc` | — | Output encoding (mətn JSX-də, HTML sink yoxdur), Validate at the boundary (Zod `homepageSchema`) | Derive, don't store (href və cover serverdə həll olunur, saytda state yoxdur), Dead Code (mock və statik PNG-lər silinir) |
| Admin: "Strategiya və sənədlər" siyahısı | `CrudListPage` (kit `data-table`, `Badge`), `LocaleBadges`, status nişanı | Loading/empty/error states (mühərrik), Live region (sıralama dialoqu), Focus management (dialoq) | Duplicate Code (hand-rolled siyahı yox, `ModuleConfig`), Shotgun Surgery (tab, hub və route bir slice-da) |
| Admin: sənəd forması | `CrudFormPage` → `field`, `input`, `textarea`, `Combobox` (searchable select), media seçicisi `mediaAccept: 'image'` | Form validation (Zod `superRefine` + server `errors` həmin sahədə), Unsaved-changes guard (`useBlocker`), Never trust the client (API eyni qaydaları yoxlayır) | Primitive Obsession (link qaydası `isAllowedLink`, limitlər `STRATEGY_DOC_LIMITS`), Boolean soup (status union, `isActive` + `deleted` yox) |
| Admin: "Sıranı dəyiş" | mövcud `features/crud/components/reorder-dialog.tsx` (`dialog`, `sortable-list`) | Keyboard path (yuxarı/aşağı düymələri), Optimistic UI + rollback (mövcud dialoq) | Duplicate Code (beşinci istifadə, yeni dialoq yazılmır) |
| Sayt: strategiya səhifəsi (104) | yeni UI yoxdur: mövcud `CmsContent` + `SectionSidebar` | Platform first (adi HTML məzmun, JS-siz), Sanitize untrusted HTML (`prepareCmsHtml`, tək sink) | Speculative Generality (bir səhifə üçün layout/komponent yazılmır) |
| Sayt: köhnə ünvanlar | — | Routing: permanent redirect bir yerdə (`LEGACY_PAGES`), matcher-in buraxdığı fayl ünvanları `next.config` | Duplicate Code (yeni yönləndirmə mexanizmi yox), Magic String (slug-lar `entities/page-node` sabitləri) |
| Admin: strategiya mətni redaktorda | roundtrip fikstürü (`fixtures/strategy-letter.html`) | Resilience: content round-trip guard | Silent data loss (TipTap tanımadığı atributu atır) |

Review: tasks.md-də hər frontend mərhələsi `npm run verify`-dan əvvəl `ui-kit-review` + senior-front review checklist ilə bitir.

## Project Structure

### Documentation (this feature)

```text
specs/057-homepage-strategy-docs/
├── spec.md
├── plan.md              # this file
├── research.md          # R1–R15
├── data-model.md        # tables, EF, visibility, validation, seed
├── quickstart.md        # validation run
├── contracts/
│   ├── public-api.md    # GET /homepage → strategyDocs
│   ├── admin-api.md     # /homepage-strategy-docs CRUD + order
│   ├── admin-ux.md      # tab, list, form, i18n, MSW
│   ├── ui-contract.md   # site data flow, unchanged widget
│   └── strategy-page.md # US4: page 104 markup, import tool CLI, legacy redirects
├── assets/              # the two exported covers, for editors (moved from web-cbar-new/public/site/home)
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/                       # MR 1 — deploy first
├── db/migrations/0043-homepage-strategy-docs.sql        # tables, conditional FKs, trigger, grant, permissions
├── db/migrations/0044-homepage-strategy-docs-seed.sql   # three documents by az slug, only into an empty table
├── openapi/paths/homepage.yaml, components/schemas/homepage.yaml, openapi.yaml   # spec-first
├── src/Cbar.Domain/Entities/Homepage.cs, CbarDbContext.cs                        # == api-cbar copy
├── src/Cbar.AdminApi/Authorization/Permissions.cs       # HomepageStrategyDocs + All list
├── src/Cbar.AdminApi/Controllers/HomepageStrategyDocsController.cs
├── src/Cbar.AdminApi/Validation/StrategyDocRules.cs     # internal static, pure
├── src/Cbar.AdminApi/Services/ContentSupport.cs         # IsAllowedLink (moved from two controllers)
├── src/Cbar.AdminApi/Controllers/ImagePopupsController.cs, ReleaseScheduleItemsController.cs   # use ContentSupport.IsAllowedLink
└── tests/Cbar.AdminApi.Tests/StrategyDocRulesTests.cs

product-rest/api-cbar/                             # MR 2
├── openapi/paths/homepage.yaml, components/schemas/homepage.yaml
├── src/Cbar.Domain/…                                    # byte-for-byte copy of MR 1
├── src/Cbar.WebApi/Controllers/HomepageController.cs    # + strategyDocs
├── src/Cbar.WebApi/Controllers/StrategyDocLinks.cs      # internal static: href + cover selection
└── tests/Cbar.WebApi.Tests/StrategyDocLinksTests.cs

product-rest/web-cbar-admin-new/                   # MR 3
├── src/features/homepage/model/strategy-docs.ts         # ModuleConfig, Zod row/detail/form schemas, superRefine
├── src/features/homepage/model/constants.ts             # STRATEGY_DOC_LIMITS
├── src/features/homepage/model/section.ts               # + tab
├── src/features/homepage/api/strategy-docs.service.ts   # order(ids); CRUD via engine
├── src/features/homepage/components/strategy-docs-reorder-dialog.tsx   # wraps crud/reorder-dialog
├── src/pages/homepage-blocks/strategy-docs.tsx          # LookupGate (page tree) + CrudListPage / CrudFormPage
├── src/pages/homepage-blocks/index.tsx                  # + hub card
├── src/app/routes/index.ts                              # createCrudRoutes(..., { list, form }) as events
├── src/locales/{az,en}/homepage.json
├── src/shared/testing/handlers/homepage.ts              # + strategy docs store, /order
├── src/features/homepage/strategy-docs.test.tsx
├── src/features/rich-text/fixtures/strategy-letter.html # US4: page 104 text as the editor saves it
└── src/features/rich-text/roundtrip.test.ts             # + strategy letter round trip

product-rest/web-cbar-new/                         # MR 4
├── src/features/homepage/model/schemas.ts               # homepageStrategyDocSchema, homepageSchema.strategyDocs default []
├── src/views/home/loader.ts                             # toStrategyDoc, slice(STRATEGY_DOCS_MAX); mock import removed
├── src/views/home/constants.ts                          # STRATEGY_DOCS_MAX
├── src/views/home/mock.ts                               # deleted
├── src/widgets/home-cards/strategy-docs.tsx             # SmartLink for title/button links; comment updated
├── public/site/home/{risk-based-supervision,microfinance}.png   # moved to specs/057/assets
├── src/shared/testing/handlers/homepage.ts, fixtures    # strategyDocs
├── src/views/home/{loader,index}.test.ts(x)
├── src/entities/page-node/…                             # US4: STRATEGY_SLUG, RISK_SUPERVISION_SLUG, MICROFINANCE_SLUG
├── src/proxy.ts, src/proxy.test.ts                      # US4: LEGACY_PAGES + pages/strategy, page-872, page-878
└── next.config.ts                                       # US4: redirects() for the two legacy PDF paths

tools/media-backfill/                              # workspace tool, run after the deploys (test, then prod)
├── import-strategy-page.mjs                             # US4: portrait + two PDFs → MinIO/media_assets, page 104 az/en text
├── strategy-letter.{az,en}.html                         # templates, {PORTRAIT_ID}/{PDF_ID} placeholders (same form as the admin fixture)
└── README.md                                            # + section for this tool

dokumentasiyalar/ana-sehife-bloklari-guide.md, CLAUDE.md (root + two components), business_logic/*   # docs in the same change
```

**Structure Decision**: dörd mövcud komponent, hər biri öz MR-ı ilə. Yeni slice yoxdur: admin `features/homepage`-i, sayt `features/homepage` +
`views/home`-u genişləndirir.

## Complexity Tracking

Pozuntu yoxdur.
