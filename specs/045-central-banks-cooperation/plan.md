# Implementation Plan: Mərkəzi banklarla əməkdaşlıq — Anlaşma Memorandumları cədvəli

**Branch**: `045-central-banks-cooperation` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/045-central-banks-cooperation/spec.md`

## Summary

"Mərkəzi banklarla əməkdaşlıq" səhifəsi (CMS səhifə 122) Figma `2210:56798`-dəki giriş mətnini və memorandumlar cədvəlini (Təşkilat | Ölkə | Tarix,
çeşidləmə seçimi ilə) alır. Sətirlər yeni məzmun növündə saxlanılır: `api-cbar-admin`-də 2 cədvəl + CRUD, `api-cbar`-da public siyahı, admin
paneldə "Memorandumlar" bölməsi, saytda cooperation bölməsi üçün yeni `memorandums` layout-u. Figma-dakı 28 sətir seed ilə gəlir, səhifənin
girişi şərti əlavə olunur. Üsul spec 044 (IFI) ilə qat-qat eynidir, alt resurs və media olmadan — ona görə daha kiçikdir.
Qərarlar: [research.md](./research.md).

## Technical Context

**Language/Version**: C# / .NET 10 (iki API); TypeScript 5 strict (iki frontend)

**Primary Dependencies**: EF Core + Npgsql (`MapEnum<ContentStatus>`, snake_case); `api-cbar-admin` `AuditService`, `RequirePermission`;
admin panel React 19 + Vite, TanStack Router/Query, RHF + Zod, `ModuleConfig`/`CrudListPage`/`CrudFormPage`; sayt Next.js 16 App Router,
`cachedJson`, `@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next. Yeni dependency yoxdur.

**Storage**: PostgreSQL (`api-cbar-admin` sahibdir, `api-cbar` `cbar_web_ro` ilə oxuyur). Media yoxdur.

**Testing**: Vitest + MSW (iki frontend, `npm run verify`, Node 24 və 22), admin `roundtrip`; API-lərdə test yığını yoxdur → `dotnet build` +
PGlite üzərində real icra.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline), brauzer: 1728 / 744 / 390.

**Project Type**: web — iki API + iki frontend, ayrı upstream repo-lar.

**Performance Goals**: Bir səhifə açılışına bir əlavə public API çağırışı (bir siyahı, ~30 sətir, səhifələmə yoxdur).

**Constraints**: Migration append-only, unikal ad, mövcud cədvələ ALTER yoxdur; `Cbar.Domain` iki kopyada bayt-bayt eyni; endpoint-lər spec-first
(hook `spec-first.mjs`); spec 032 sabitlər standartı; layout fixture guard; `dangerouslySetInnerHTML` yalnız `widgets/cms-content`; çeşidləmə
JS-siz işləməlidir (yeni `'use client'` yoxdur).

**Scale/Scope**: 28 memorandum (seed); 1 public + 5 admin endpoint; 1 yeni admin bölməsi; 1 yeni sayt layout-u və cədvəl widget-i.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 | Əvəz edilən: `product-host/visitor/controllers/PagesController.php` + `views/pages/index.php` (adi CMS səhifəsi); yeni admin bölməsinin köhnə qarşılığı yoxdur | ✔ |
| I.3 | URL-lər dəyişmir. Köhnə bank mətnləri saytda gizlənir, CMS-də qalır — spec Assumptions-da istifadəçi təsdiqi tələb olunur | ⚠ təsdiq |
| II.3 | 4 ayrı MR, deploy sırası aşağıda | ✔ |
| III.2–4 | Yazan yalnız `api-cbar-admin`; public filtr Published/deleted/ShowAz-En; JWT + `RequirePermission`; audit | ✔ |
| IV.2 | `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` / `web-cbar-new` | ✔ |
| V.1 | `Memorandum.cs` + `CbarDbContext` hər iki kopyada, `diff -rq` boş | ✔ |
| V.2 | `0027`/`0028` yeni, unikal; `IF NOT EXISTS`; yalnız yeni cədvəllər; seed `page_translations`-a yalnız privilege varsa UPDATE edir | ✔ |
| V.3 | `memorandum_translations` `(memorandum_id, locale)`; bir dil boş ola bilər | ✔ |
| V.4 | Chrome etiketləri az/en locale fayllarında, təşkilat/ölkə API-dən | ✔ |
| VI.5 | Editor extension-larına toxunulmur; yeni layout fixture `roundtrip.test.ts`-ə əlavə olunur | ✔ |
| VII.3 | Yalnız yeni endpoint-lər, mövcudlar dəyişmir | ✔ |
| VIII | Real icra: `quickstart.md` | ✔ |
| XII | Sabitlər: `MEMORANDUM_SORT`, il sərhədləri, sorğu parametri adı `QUERY_PARAM`-da | ✔ |

Post-design təkrar yoxlama: data-model və kontraktlar heç bir maddəni pozmur. I.3 pozuntu deyil, məzmun qərarıdır. Complexity Tracking boşdur.

## Project Structure

### Documentation (this feature)

```text
specs/045-central-banks-cooperation/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R9
├── data-model.md        # cədvəllər + 28 sətirlik seed (az/en)
├── quickstart.md
├── contracts/
│   ├── api.md           # public + admin endpoint-lər
│   └── ui-contract.md   # Figma ölçüləri
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code — iş paketləri deploy sırası ilə

```text
1. product-rest/api-cbar-admin/                      (MR 1, ilk deploy)
   db/migrations/0027-memorandums.sql, 0028-memorandums-seed.sql
   src/Cbar.Domain/Entities/Memorandum.cs, src/Cbar.Domain/CbarDbContext.cs
   src/Cbar.AdminApi/Authorization/Permissions.cs          (Memorandums + All + sayğac şərhi)
   src/Cbar.AdminApi/Controllers/MemorandumsController.cs
   openapi/openapi.yaml, paths/memorandums.yaml, components/schemas/memorandums.yaml, dist/

2. product-rest/api-cbar/                            (MR 2)
   src/Cbar.Domain/…                                       (1-ci paketlə eyni)
   src/Cbar.WebApi/Controllers/MemorandumsController.cs
   openapi/openapi.yaml, paths/memorandums.yaml, components/schemas/memorandums.yaml, dist/

3. product-rest/web-cbar-admin-new/                  (MR 3, api-cbar-admin-dən sonra)
   src/features/memorandums/api/memorandums.keys.ts
   src/features/memorandums/model/{module.ts,schemas.ts,constants.ts}
   src/features/memorandums/memorandums.test.tsx
   src/pages/memorandums/index.tsx
   src/app/routes/{index.ts,nav.ts}
   src/locales/{az,en}/{memorandums.json,nav.json}, src/shared/i18n/index.ts
   src/shared/testing/{handlers/memorandums.ts,handlers/index.ts,fixtures/memorandums.ts}
   src/features/rich-text/fixtures/layouts/memorandums.html, src/features/rich-text/roundtrip.test.ts
   CLAUDE.md

4. product-rest/web-cbar-new/                        (MR 4, api-cbar-dan sonra)
   src/features/memorandums/api/memorandums.api.ts         (server-only, cachedJson)
   src/features/memorandums/model/{schemas.ts,sort.ts,sort.test.ts,constants.ts}
   src/features/about-content/model/{types.ts,layouts.ts,parse.ts,memorandums.ts,memorandums.test.ts,layout-fixtures.test.ts}
   src/features/about-content/fixtures/memorandums.html
   src/views/cms-page/{loader.ts,index.tsx,cooperation.test.tsx}
   src/app/[locale]/[...slug]/page.tsx                     (searchParams.sort → view)
   src/widgets/about-blocks/{memorandums.tsx,memorandum-sort.tsx,memorandums.test.tsx,about-blocks.tsx,index.ts}
   src/shared/constants/query-params.ts                    (QUERY_PARAM.SORT, yoxdursa)
   src/app/globals.css                                     (çapda çeşidləmə gizli, lazım olsa)
   src/locales/{az,en}/about.json                          (memorandums.*)
   src/shared/testing/{handlers/memorandums.ts,handlers/index.ts,fixtures/memorandums.ts}
   docs/cooperation-cms-guide.md, CLAUDE.md

5. Root: CLAUDE.md (bir bənd), business_logic/ (/sync-business-logic), OpenAPI yoxlaması (/sync-openapi),
   dokumentasiyalar/ (istifadəçi təlimatı, spec 044-dəki kimi)
```

**Structure Decision**: Mövcud dörd komponentin öz FSD/controller strukturları; yeni fayllar spec 044-ün IFI fayllarının yanında eyni adlandırma
ilə. Saytda memorandumlar `about-content` layout sisteminə qoşulur (yeni `AboutLayoutKind` `'memorandums'` + `ParseContext.memorandums`); loader
yalnız bu layout-da public API-ni çağırır və xətada boş siyahıya düşür (FR-012, SC-005). Çeşidləmə loader-də deyil, route → view-da tətbiq
olunur ki, `cache()`-li `loadCmsPage(locale, segments)` imzası və `generateMetadata` ilə paylaşılan sorğu dəyişməsin (research R6).

## Complexity Tracking

Pozuntu yoxdur.
