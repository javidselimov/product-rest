# Implementation Plan: Beynəlxalq maliyyə təşkilatları — admin paneldən idarə olunan məzmun növü

**Branch**: `044-ifi-cooperation` | **Date**: 2026-11-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/044-ifi-cooperation/spec.md`

## Summary

"Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq" səhifəsi (CMS səhifə 121) Figma `2189:3133`-dəki accordion kartları alır. Kartların məlumatı
(loqo, ad, üzvlük ili, missiya, üzvlük tarixləri, mətn, sayt) yeni məzmun növündə saxlanılır: `api-cbar-admin`-də 4 cədvəl + CRUD, `api-cbar`-da
public siyahı, admin paneldə yeni bölmə, saytda cooperation bölməsi üçün yeni `ifi-organizations` layout-u. Figma məzmunu seed ilə gəlir,
səhifənin başlığı və girişi şərti yenilənir. Üsul spec 038 (KSM layihələri) ilə qat-qat eynidir. Qərarlar: [research.md](./research.md).

## Technical Context

**Language/Version**: C# / .NET 10 (iki API); TypeScript 5 strict (iki frontend)

**Primary Dependencies**: EF Core + Npgsql (`MapEnum<ContentStatus>`, snake_case); `api-cbar-admin` `AuditService`, `RequirePermission`;
admin panel React 19 + Vite, TanStack Router/Query, RHF + Zod, `ModuleConfig`/`CrudFormPage`, TipTap; sayt Next.js 16 App Router, `cachedJson`,
`@cbar/lib-react-ui-kit`, Tailwind 4, react-i18next. Yeni dependency yoxdur.

**Storage**: PostgreSQL (`api-cbar-admin` sahibdir, `api-cbar` `cbar_web_ro` ilə oxuyur); loqolar mövcud media kitabxanası (MinIO).

**Testing**: Vitest + MSW (iki frontend, `npm run verify`), admin `roundtrip`; API-lərdə test yığını yoxdur → `dotnet build` + PGlite üzərində real icra.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline), brauzer: 1728 / 744 / 390.

**Project Type**: web — iki API + iki frontend, ayrı upstream repo-lar.

**Performance Goals**: Bir səhifə açılışına bir əlavə public API çağırışı (siyahı ≤ ~10 təşkilat, səhifələmə yoxdur).

**Constraints**: Migration append-only, unikal ad, mövcud cədvələ ALTER yoxdur; `Cbar.Domain` iki kopyada bayt-bayt eyni; endpoint-lər spec-first;
spec 032 sabitlər standartı; layout fixture guard; `dangerouslySetInnerHTML` yalnız `widgets/cms-content`.

**Scale/Scope**: 4 təşkilat, 5 üzvlük tarixi (seed); 1 public + 9 admin endpoint; 1 yeni admin bölməsi; 1 yeni sayt layout-u.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Status |
|---|---|---|
| I.2 | Əvəz edilən: `product-host/visitor/controllers/PagesController.php` + `views/pages/index.php` (adi CMS səhifəsi); yeni admin bölməsinin köhnə qarşılığı yoxdur (köhnədə səhifə mətni idi) | ✔ |
| I.3 | URL-lər dəyişmir, heç nə ləğv edilmir | ✔ |
| II.3 | 4 ayrı MR, deploy sırası aşağıda | ✔ |
| III.2–4 | Yazan yalnız `api-cbar-admin`; public filtr Published/deleted/ShowAz-En; JWT + `RequirePermission`; audit | ✔ |
| IV.2 | `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` / `web-cbar-new` | ✔ |
| V.1 | `IfiOrganization.cs` + `CbarDbContext` hər iki kopyada, `diff -rq` boş | ✔ |
| V.2 | `0025`/`0026` yeni, unikal; `IF NOT EXISTS`; yalnız yeni cədvəllər; seed `page_translations`-a yalnız privilege varsa UPDATE edir | ✔ |
| V.3 | `*_translations` `(entity_id, locale)`; bir dil boş ola bilər | ✔ |
| V.4 | Chrome etiketləri az/en locale fayllarında, redaksiya mətni API-dən | ✔ |
| VI.5 | Editor extension-larına toxunulmur; yeni layout fixture `roundtrip.test.ts`-ə əlavə olunur | ✔ |
| VII.3 | Yalnız yeni endpoint-lər, mövcudlar dəyişmir | ✔ |
| VIII | Real icra: `quickstart.md` | ✔ |

Post-design təkrar yoxlama: data-model və kontraktlar heç bir maddəni pozmur. Pozuntu yoxdur → Complexity Tracking boşdur.

## Project Structure

### Documentation (this feature)

```text
specs/044-ifi-cooperation/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R9
├── data-model.md
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
   db/migrations/0025-ifi-organizations.sql, 0026-ifi-organizations-seed.sql
   src/Cbar.Domain/Entities/IfiOrganization.cs, src/Cbar.Domain/CbarDbContext.cs
   src/Cbar.AdminApi/Authorization/Permissions.cs          (Ifi + All)
   src/Cbar.AdminApi/Controllers/IfiOrganizationsController.cs
   src/Cbar.AdminApi/Controllers/MediaController.cs        (usage EXISTS)
   openapi/openapi.yaml, paths/ifi-organizations.yaml, components/schemas/ifi-organizations.yaml, dist/

2. product-rest/api-cbar/                            (MR 2)
   src/Cbar.Domain/…                                       (1-ci paketlə eyni)
   src/Cbar.WebApi/Controllers/IfiOrganizationsController.cs
   openapi/openapi.yaml, paths/ifi-organizations.yaml, components/schemas/ifi-organizations.yaml, dist/

3. product-rest/web-cbar-admin-new/                  (MR 3, api-cbar-admin-dən sonra)
   src/features/ifi-organizations/api/ifi-organizations.keys.ts
   src/features/ifi-organizations/model/{module.ts,schemas.ts}
   src/features/ifi-organizations/components/ifi-memberships-section.tsx
   src/features/ifi-organizations/ifi-organizations.test.tsx
   src/pages/ifi-organizations/index.tsx
   src/app/routes/{index.ts,nav.ts}
   src/locales/{az,en}/{ifiOrganizations.json,nav.json}, src/shared/i18n/index.ts
   src/shared/testing/{handlers/ifi-organizations.ts,handlers/index.ts,fixtures/ifi-organizations.ts}
   src/features/rich-text/fixtures/layouts/ifi-organizations.html, src/features/rich-text/roundtrip.test.ts
   CLAUDE.md

4. product-rest/web-cbar-new/                        (MR 4, api-cbar-dan sonra)
   src/features/ifi-organizations/api/ifi-organizations.api.ts   (server-only, cachedJson)
   src/features/ifi-organizations/model/schemas.ts
   src/features/about-content/model/{types.ts,layouts.ts,parse.ts,ifi-organizations.ts,constants.ts}
   src/features/about-content/model/{ifi-organizations.test.ts,layout-fixtures.test.ts}
   src/features/about-content/fixtures/ifi-organizations.html
   src/views/cms-page/{loader.ts,cooperation.test.tsx}
   src/widgets/about-blocks/{ifi-organizations.tsx,ifi-organization-card.tsx,about-blocks.tsx,ifi-organizations.test.tsx}
   src/app/cms-content.css və ya widget Tailwind sinifləri; src/app/globals.css (çap)
   src/locales/{az,en}/about.json                         (sectionTitle, membership, mission)
   src/shared/testing/{handlers/ifi-organizations.ts,handlers/index.ts,fixtures/ifi-organizations.ts}
   docs/cooperation-cms-guide.md, CLAUDE.md

5. Root: CLAUDE.md (bir bənd), business_logic/ (/sync-business-logic), OpenAPI yoxlaması (/sync-openapi)
```

**Structure Decision**: Mövcud dörd komponentin öz FSD/controller strukturları; yeni fayllar spec 038-in KSM fayllarının yanında eyni adlandırma ilə.
Sayt tərəfində təşkilatlar `about-content` layout sisteminə qoşulur (yeni `AboutLayoutKind` + `ParseContext.organizations`), loader
CSR-dəki kimi yalnız bu layout-da public API-ni çağırır və xətada boş siyahıya düşür (FR-013, SC-005).

## Complexity Tracking

Pozuntu yoxdur.
