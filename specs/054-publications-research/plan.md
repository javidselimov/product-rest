# Implementation Plan: "Nəşrlər və tədqiqatlar" bölməsi — Figma dizaynı, işçi məqalələri və ümumi arxiv qaydaları

**Branch**: `054-publications-research` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/054-publications-research/spec.md`

## Summary

Köhnə saytda "Nəşrlər və tədqiqatlar" bölməsi bir kökdən və 14 düz uşaqdan ibarət adi CMS səhifələri idi. Hər səhifə iki formadan birində yazılmışdı:
il akkordionları + fayl linkləri, və ya bir fayl linki. İşçi məqalələri ayrıca köhnə səhifələr idi və siyahıya əl ilə link əlavə olunurdu.

Yeni sistemdə dörd iş var:

1. **İşçi məqalələri ayrıca məzmun növü olur** (FAQ/FinCERT kimi).
   - Tipli cədvəllərdə saxlanılır (`text[]` siyahılarla).
   - Admin paneldə öz CRUD bölməsi olur.
   - Public siyahı və detal endpoint-i yaranır.
   - Saytda siyahı CMS səhifəsinin ünvanında açılır: axtarış Azərbaycan hərflərini qatlayır, il menyusu və səhifələmə var, hamısı JS-siz.
   - Hər məqalənin detal səhifəsi `…/isci-meqaleler-silsilesi/02-2025` ünvanındadır.
2. **Bölmə şablonu.**
   - `SectionKey 'publications'` yaranır.
   - Layout slug ilə yox, HTML-in formasına görə seçilir: `file-archive` (il menyusu + fayl kartları) və ya `document-list` (giriş + sənəd kartları).
   - Redaktor bugünkü kimi səhifə redaktorunda yazır. Yeni səhifə kodsuz doğru görünür.
3. **Naviqasiya.**
   - Seed ağacı üç səviyyəyə gətirir: iki qrup səhifəsi yaranır, səhifələr Figma sırası ilə düzülür, iki səhifə istehlakçı bölməsindən köçür.
   - Figma-da olmayan 6 səhifə menyudan çıxır.
   - Yeni bayraq `showInDropdownNav` "Ödəniş xidmətləri"ni yalnız açılan menyularda göstərir.
   - Yeni menyu qrupu etiketi data kimi saxlanılır, onu spec 055 göstərəcək.
4. **Köhnə faylların saxta ölçüsü düzəldilir.** Birdəfəlik `MediaSizeBackfillService` real ölçünü MinIO-dan oxuyur.

Son faza (təxirə salına bilər): ~78 köhnə məqalə canlı saytdan köçürülür, köhnə ünvanlar 308 ilə yönləndirilir.

Plan zamanı istifadəçi qərarları (2026-11-20, `research.md` başlığı):
- gizli Figma qatları qurulmur ("Maraqlı ola bilər", mega menyu alt başlıqları, çiplər);
- "Ödəniş xidmətləri" yalnız açılan menyulardadır;
- ölçülər MinIO-dan düzəldilir;
- 6 səhifə menyudan çıxır;
- yeni mega menyu dizaynı spec 055-dir.

`spec.md` bu qərarlarla yenilənib.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API). TypeScript 5 strict: Next.js 16 + React 19 (sayt), React 19 + Vite (admin).

**Primary Dependencies**: EF Core + Npgsql (`text[]` ↔ `List<string>`), `Minio` .NET client (`StatObject`). Sayt: `@cbar/lib-react-ui-kit`, Tailwind 4,
react-i18next, Zod. Admin: TanStack Router/Query, Zustand, RHF, TipTap 3. Yeni runtime dependency **yoxdur**.

**Storage**: PostgreSQL. Yeni cədvəllər:
- `working_papers`, `working_paper_translations` (`0038`);
- `page_nav_details`, `page_translation_details` (`0039`);
- `media_asset_details` (`0040`).

Seed-lər: ağac `0041`, məqalələr `0042` (son faza). Mövcud cədvəllərdə yalnız DML var: `pages`/`page_translations` UPDATE (seed), `page_details`
UPSERT, `media_assets.size_bytes` UPDATE. `ALTER` yoxdur.

**Testing**: Vitest + RTL + MSW (iki frontend, `npm run verify`). API-lərdə test layihəsi yoxdur: `dotnet build` + PGlite ilə endpoint icrası + `route-diff.mjs`
(Konstitusiya VIII).

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline). Sayt SSR Node-da, admin nginx-də işləyir.

**Project Type**: web — 4 upstream komponent (`api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`).

**Performance Goals**:
- Siyahı səhifəsi: bir CMS sorğusu + bir `GET /working-papers` (paralel, ~30 KB).
- Detal: bir sorğu, `cache()` ilə metadata ilə paylaşılır.
- Root layout-a yeni sorğu əlavə olunmur ("Maraqlı ola bilər" qurulmur).
- Yeni client JS yoxdur.
- Backfill bir dəfə ~1800 `StatObject` çağırışıdır, arxa planda.

**Constraints**:
- JS-siz işləmə (FR-014).
- Migration: append-only, unikal ad, `IF NOT EXISTS`.
- `Cbar.Domain` iki nüsxədə eynidir.
- Spec-first OpenAPI.
- `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-dədir.
- Magic number yoxdur (spec 032).
- Chrome mətni i18n az/en.
- Admin-də token yalnız yaddaşda.
- Layout guard (fixture + `EXPECTED_BLOCKS` + roundtrip).

**Scale/Scope**:
- Məzmun: ~78 məqalə × 2 dil, 17 bölmə səhifəsi, 1819 media sətri.
- Admin: 1 CRUD modulu, səhifə formasında 2 sahə.
- Sayt: 2 view (siyahı, detal), 2 yeni layout, 1 ortaq kart, 1 il menyusu, nav qaydası, 1 köhnə yönləndirmə xəritəsi.

## Constitution Check

*GATE: Phase 0-dan əvvəl keçdi. Phase 1 dizaynından sonra yenidən yoxlandı, pozuntu yoxdur.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I — `product-host` referansdır | Əvəz edilən hissələr: `visitor/controllers/PagesController` + `views/pages/index.php` (bölmənin `page-46/*` səhifələri və hər məqalə `page-NNN/*`), admin-in səhifə redaktoru (məqalə = yeni səhifə + əl ilə link). Paritet cədvəli spec-dədir və aşağıda yenilənib. `product-host` dəyişmir. Köhnə məqalə ünvanları 308 ilə yönləndirilir (son faza). | ✅ |
| II — Dörd müstəqil proyekt | 4 iş paketi / MR, deploy sırası aşağıdadır. Seed generatorları `specs/` altında tooling-dir. Generator `legacy-working-papers.ts` faylını saytın repo-suna **çıxış faylı** kimi yazır, sayt heç nəyi import etmir. | ✅ |
| III — Admin/client ayrılığı | Sayt yalnız `api-cbar`-ı, admin yalnız `api-cbar-admin`-i çağırır. Public sorğular `published`, `deleted_at` və dildə başlıq filtri ilə gedir. Admin endpoint-ləri JWT + `working_papers.*` + audit ilə qorunur. Backfill admin API daxilindədir, `api-cbar` yazmır. | ✅ |
| IV — Start sırası | Dəyişmir. Backfill admin API-nin migration-larından sonra arxa planda işləyir, startu bloklamır. Yeni port və servis yoxdur. | ✅ |
| V — Sxem, migration, ikidillilik | Yeni cədvəllər, `0038…0042` unikaldır, BEGIN/COMMIT yoxdur, `*_translations (entity_id, locale)`. `WorkingPaper.cs` və yeni detail entity-lər iki nüsxədə eynidir. Bir dilin boş qalması xəta deyil. Chrome etiketləri az/en-dir, editorial mətn API-dən gəlir (seed Figma mətnlərini DB-yə yazır). | ✅ |
| VI — Admin template stack | Kit + TanStack + RHF/Zod + i18n istifadə olunur. Siyahı `ModuleConfig` şablonundadır. Redaktora extension əlavə/silinmir, roundtrip iki yeni fixture ilə işlədilir. Token yalnız yaddaşda saxlanılır. | ✅ |
| VII — Xarici kontraktlar | Mövcud endpoint-lərə yalnız nullable sahə əlavə olunur (`PageNode`, səhifə input-u). Köhnə URL-lər eyni qalır (slug dəyişmir), məqalələr üçün 308 xəritəsi yazılır. | ✅ |
| VIII — Verification | `dotnet build` ×2, PGlite ilə endpoint və seed icrası, route-diff, `npm run verify` ×2, roundtrip, Figma ↔ DOM ölçmə (quickstart). | ✅ |

**Paritet cədvəli (Maddə I.3, spec-dəki cədvəlin plan yeniləməsi)**

| `product-host` | Yeni qarşılıq | Status |
|---|---|---|
| Bölmə kökü və 14 düz alt səhifə | Kök → 2 qrup → səhifələr, ünvanlar eyni | qalır, yenidən qruplaşır |
| "İşçi məqalələr silsiləsi" (il akkordionlarında ~78 link) | Axtarışlı, filtrli, səhifələnən siyahı | əvəz + yaxşılaşma |
| Hər məqalə `page-NNN/<slug>` (az/en) | `/{locale}/{wp-slug}/NN-YYYY`, köhnə ünvan 308 | köçür (son faza) |
| Yeni məqalə = yeni səhifə + əl ilə link | Admin "İşçi məqalələri" | əvəz |
| İl akkordionları + fayl linkləri | İl menyusu + fayl kartları (ölçü ilə) | əvəz |
| Tək fayllı səhifələr | Giriş + sənəd kartı | əvəz |
| "Ödəniş xidmətləri", "Rəqəmsal fırıldaqçılıq statistikası" istehlakçı bölməsində | Bu bölmədə; Ödəniş yalnız açılan menyularda | köçür |
| Figma-da olmayan 6 səhifə | Menyularda yoxdur, ünvanla açılır | menyudan çıxır |
| Köhnə saytda fayl ölçüsü ("1.91 MB") | Real ölçü (backfill) | bərpa |
| — | Mega menyu yeni dizaynı, "Maraqlı ola bilər" | spec 055 |

## Frontend Skills Gate

Yüklənib: `senior-front`, `frontendpatterns`, `frontend-standards` və `ui-kit-usage` (web-cbar-new; admin variantı eyni kitdir, dil qaydaları
fərqlənir, implement mərhələsində admin işindən əvvəl yüklənir).

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Məqalə axtarışı (sayt) | `<form method="get">`, kit `Input` (`startElement` böyüdücü ikon), kit `Button` (`type="submit"`), `sr-only` label | Progressive Enhancement, URL as state, Accessible form labels | client state-də filtr; `<div onClick>` düymə; görünməyən label-sız input |
| İl menyusu (siyahı + il arxivi) | native `<details>`/`<summary>` + `<a>` linklər, kit token-ları, `CaretDownIcon` `<pkg>/icons` | Disclosure, Progressive Enhancement, `aria-current` | kit `Select` (client, JS-siz işləmir); iki ayrı menyu komponenti (Duplicate Code) — bir `YearMenu` widget-i |
| Siyahı sətri | bütün sətir bir `<a>` (kart-link), `Reveal` capped stagger | Card-as-link, Semantic HTML (`<ol>`), visible focus ring | iç-içə interaktiv elementlər; hex rəng; sətrə `onClick` router.push |
| Səhifələmə | mövcud `ListPagination` (kit `Pagination` üzərində, adi linklər) | Pagination via links, clamp out-of-range | yeni səhifələmə komponenti; client-side səhifələmə |
| Boş vəziyyət | mövcud boş vəziyyət üslubu + "Filtrləri təmizlə" linki | Explicit empty state, Live region yox (server render) | yalnız happy path |
| Detal meta qutusu, bölmələr | `<dl>` (Müəllif(lər)/Nömrə/Dil/Tarix), `<section aria-labelledby>` | Semantic HTML, Derive don't store (`code` hesablanır) | boş başlıqlı bölmə; `code`-u DB-də saxlamaq |
| Sənəd kartı (ortaq) | bir `<a>`, mövcud fayl çipi ("Fayl · PDF"), `formatFileSize`, ikon `<pkg>/icons` | Card-as-link, External link safety (`noopener`) | ikinci kart komponenti (`consumer-parts` `DocumentCard` genişlənir); `size 0` göstərmək |
| İl arxivi və sənəd siyahısı blokları | `widgets/cms-content` (tək HTML sink), `prepareCmsHtml`, `AboutBlocks` switch | Sanitize Untrusted HTML, Graceful degradation (tanınmayan forma → `plain`) | ikinci `dangerouslySetInnerHTML`; slug cədvəli (Shotgun Surgery hər yeni səhifədə) |
| Bölmə çərçivəsi və sol menyu | mövcud `section-shell` (`trail` detal üçün), native `<details>` qruplar | Single source of truth (CMS ağacı), Location semantics | detal üçün ayrı shell; menyunu əl ilə qurmaq |
| Nav bayrağı (sayt) | `entities/page-node` `isInDropdownNav` / `isInSideNav` | Derive, don't store; Null object (`null` = izlə) | bayrağı komponentlərdə təkrar hesablamaq (Feature Envy) |
| Admin CRUD modulu | `ModuleConfig` → `CrudListPage`/`CrudFormPage`, `Badge`, media picker `mediaAccept`, `Tabs` az/en | Container/Presentational, Form validation (RHF+Zod + server `problem+json`), Unsaved-changes guard | əl ilə yazılmış CRUD ekranı (Duplicate Code); yeni "chips" sahə tipi (üçüncü istifadəçi yoxdur) |
| Admin menyu seçimi | kit `radio-group` + `Field`, kömək mətni | Impossible states out (radio → bayraq cütü), Accessible fieldset/legend | iki müstəqil checkbox (qadağan cüt yaradır) |

Review: tasks.md-də hər frontend fazası `ui-kit-review` + senior-front review checklist tapşırığı ilə bitir, sonra `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/054-publications-research/
├── spec.md                 # plan qərarları ilə yenilənib
├── plan.md                 # bu fayl
├── research.md             # R1–R18
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-api.md       # GET /working-papers, /{key}, PageNode sahələri
│   ├── admin-api.md        # /working-papers CRUD, səhifə sahələri, backfill
│   ├── admin-ux.md         # admin modulu, menyu seçimi, menyu qrupu
│   ├── publication-markup.md  # formaya görə layout, guard fixture-ları
│   └── ui-contract.md      # Figma ölçüləri (desktop, tablet, mobil)
├── seed/                   # extract-tree.mjs, build-tree-seed.mjs, figma-texts.json; son faza: extract-papers.mjs, upload-media.mjs, build-papers-seed.mjs
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/                     # MR 1 (birinci deploy)
├── openapi/paths/working-papers.yaml, components/schemas/working-papers.yaml, pages.yaml, openapi.yaml   # spec-first
├── db/migrations/0038-working-papers.sql, 0039-page-nav-details.sql, 0040-media-asset-details.sql, 0041-publications-tree-seed.sql
├── db/migrations/0042-working-papers-seed.sql   # son faza
├── src/Cbar.Domain/Entities/WorkingPaper.cs, Content.cs (PageNavDetail, PageTranslationDetail, MediaAssetDetail), CbarDbContext.cs   # == api-cbar
├── src/Cbar.AdminApi/Authorization/Permissions.cs (WorkingPapers.*)
├── src/Cbar.AdminApi/Controllers/WorkingPapersController.cs, PagesController.cs (showInDropdownNav, menuGroup)
├── src/Cbar.AdminApi/Services/MediaRules.cs (FincertSupport-dan köçür), MediaSizeBackfillService.cs, MediaStorage.cs (details sətri)
└── Program.cs                                    # AddHostedService

product-rest/api-cbar/                           # MR 2
├── openapi/paths/working-papers.yaml, components/schemas/{working-papers,pages}.yaml, openapi.yaml
├── src/Cbar.Domain/…                             # == api-cbar-admin nüsxəsi
└── src/Cbar.WebApi/Controllers/WorkingPapersController.cs, PagesController.cs (PageNode + 2 sahə)

product-rest/web-cbar-admin-new/                 # MR 3
├── src/features/working-papers/{api,model,components}/, working-papers.test.tsx
├── src/pages/working-papers/index.tsx
├── src/app/routes/{index.ts,nav.ts}              # publications qrupu, workingPapers bəndi
├── src/features/pages/model/{managed-sections.ts,menu-visibility.ts,schemas.ts}, components/{menu-visibility-card,page-form}.tsx
├── src/features/rich-text/fixtures/layouts/{file-archive,document-list}.html, roundtrip.test.ts
├── src/locales/{az,en}/{workingPapers,nav,pages}.json, src/shared/i18n/index.ts
└── src/shared/testing/{handlers,fixtures}/{working-papers,pages}.ts

product-rest/web-cbar-new/                       # MR 4 (sonuncu deploy)
├── src/entities/page-node/{lib/tree.ts,model/schemas.ts}   # 'publications', WORKING_PAPERS_SLUG, isInDropdownNav, sahələr
├── src/features/working-papers/{api/working-papers.api.ts, model/{schemas,select,constants}.ts}
├── src/features/about-content/model/{types,layouts,parse,file-archive,document-list}.ts, layout-fixtures.test.ts
├── src/features/about-content/fixtures/{file-archive,document-list}.html
├── src/widgets/about-blocks/{file-archive,document-list,document-card,about-blocks}.tsx
├── src/widgets/year-menu/year-menu.tsx           # YearSortMenu ilə ortaq forma
├── src/widgets/working-papers/{paper-filter,paper-row,paper-meta}.tsx
├── src/views/working-papers/{loader.ts,index.tsx}, src/views/working-paper/{loader.ts,index.tsx}
├── src/views/cms-page/{loader.ts,index.tsx}       # publicationsLayoutFor, BLOCKS_WITH_FILES
├── src/app/[locale]/(content)/[...slug]/page.tsx # siyahı + detal dispatch, metadata
├── src/shell/nav.ts                              # isInDropdownNav yeni qayda
├── src/proxy.ts, src/shared/config/legacy-working-papers.ts   # son faza
├── src/locales/{az,en}/{workingPapers,about}.json
├── src/shared/testing/{handlers,fixtures}/{working-papers,pages}.ts
└── docs/publications-cms-guide.md

Root: CLAUDE.md, business_logic/, dokumentasiyalar/nesrler-ve-tedqiqatlar-guide.md (+ README sətri),
specs/046-international-memberships/contracts/admin-nav.md, web-cbar-new/docs/consumer-rights-cms-guide.md
```

**Structure Decision**: Dörd komponent, dörd MR. Deploy sırası API-admin → API → admin panel → sayt. Sayt yeni `PageNode` sahələrini `optional` qəbul
edir, köhnə API ilə də işləyir.

Fazalar (tasks.md üçün):
1. Sxem, backfill və ağac seed-i.
2. Public API.
3. Admin modulu və səhifə sahələri.
4. Saytın bölmə şablonu, il arxivi, sənəd kartı və nav bayrağı.
5. Saytın işçi məqalələri siyahısı və detalı.
6. Sənədlər.
7. **Son faza**: köhnə məqalələrin köçürülməsi və 308 xəritəsi (istifadəçi təxirə sala bilər).

Faza 4 məqalə endpoint-indən asılı deyil və tək deploy oluna bilər.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — (pozuntu yoxdur) | | |

Qeydlər:
- Üç kiçik yoldaş cədvəl yaranır (`page_nav_details`, `page_translation_details`, `media_asset_details`). Mövcud cədvəllərə `ALTER` qadağandır, hər biri bir
  məqsədə xidmət edir (research R10–R12).
- `text[]` layihədə ilk dəfə işlədilir. Npgsql bunu yerli olaraq dəstəkləyir, uşaq cədvəllər üç dəfə çox kod olardı (R1).
- Arxa plan servisi (`MediaSizeBackfillService`) admin API-də ilk hosted iş deyil (`MigrationRunner` startda işləyir). Advisory lock ilə tək instansda
  işləyir (R10).
