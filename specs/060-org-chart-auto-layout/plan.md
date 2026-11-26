# Implementation Plan: Struktur sxemi — koordinatsız düzülüş və blokların açılan departament siyahısı

**Branch**: `060-org-chart-auto-layout` | **Date**: 2026-11-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/060-org-chart-auto-layout/spec.md`

## Summary

Desktop sxemi (≥1360) artıq canvas koordinatları ilə qurulmur. Ağacdan avtomatik düzülür, Figma `2007:86378` qaydaları ilə.

- **Sayt.**
  - Saf `buildChartLayout` ağacı tipli görünüş modelinə çevirir. Server Component onu CSS grid/flex axını ilə render edir.
  - Xətlər kartlara bağlı CSS seqmentləridir.
  - Departamentləri olan blok native `<details>`-dir. Açılanda yalnız öz sütununu uzadır, JS lazım deyil.
- **Panel.**
  - Canvas redaktoru silinir.
  - Qardaşlar arası sıra mövcud `ReorderDialog` + yeni `PUT /organization/chart/order` ilə dəyişir.
  - Blok və qrup formunda "Departamentlər: Açılan siyahı / Həmişə açıq" seçimi olur, səhifədə "Saytda bax" keçidi.
- **API.** "Həmişə açıq" yoldaş cədvəl `org_chart_node_details`-də saxlanır (migration `0045`). Public API onu `departmentsOpen` kimi
  göndərir. Köhnə koordinatlar bazada qalır, OpenAPI-də `deprecated` olur.

Qərarlar: [research.md](research.md), qaydalar: [contracts/layout-rules.md](contracts/layout-rules.md).

## Technical Context

**Language/Version**:

- .NET 10 / C# (iki API);
- TypeScript 5, React 19, Next.js 16 (sayt);
- Vite (panel).

**Primary Dependencies**:

- EF Core + Npgsql;
- `@cbar/lib-react-ui-kit`, Tailwind 4, Zod, react-i18next;
- TanStack Router/Query (panel).

**Storage**: PostgreSQL. Yeni yoldaş cədvəl `org_chart_node_details`. `org_chart_nodes` dəyişmir.

**Testing**:

- xUnit (`Cbar.AdminApi.Tests`, saf validasiya);
- Vitest + MSW (iki frontend);
- PGlite ilə real SQL;
- Edge CDP ilə Figma ±1 px ölçmə.

**Target Platform**: Linux konteynerlər (GitLab CI, Helm), brauzerlər. Desktop həddi 1360 px, sxem konteyneri 984 px.

**Project Type**: dörd komponentli web (2 API + SSR sayt + SPA panel).

**Performance Goals**:

- sxem tam SSR-dır, client JS-i 0 baytdır (canvas kimi);
- `/organization/chart`-a bir sorğu əlavə olunur: `LEFT JOIN` yoldaş cədvəl.

**Constraints**:

- JS-siz işləyir (SC-005);
- `ALTER TABLE` yoxdur;
- `Cbar.Domain` bayt-bayt eynidir;
- spec-first OpenAPI;
- magic number yoxdur (spec 032).

**Scale/Scope**:

- ≈ 50 kart;
- 1 yeni endpoint, 2 genişlənən cavab;
- sayt widget-i yenidən yazılır;
- panelin canvas redaktoru (409 sətir) və iki geometry faylı silinir.

NEEDS CLARIFICATION yoxdur. Açıq halın iki rəqəmi (R6) defoltla qəbul olunub, implementasiyada ölçülür.

## Constitution Check

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I `product-host` referansdır | Köhnə saytda sxem CMS şəkli idi (spec 027). Yeni funksiya itirmir, `product-host`-a toxunulmur | ✅ |
| II Dörd müstəqil proyekt | Dörd ayrı MR, deploy sırası yazılıb (R16). Paylaşılan kod yoxdur. `buildTree` saytda qalır, panel öz `tree.ts`-ini işlədir | ✅ |
| III Admin/client ayrılığı | Yazmanı yalnız admin edir. `api-cbar` `cbar_web_ro` ilə oxuyur (GRANT `0045`-də). Public filtrlər dəyişmir. Yeni yazmalar audit olunur | ✅ |
| IV Start/deploy sırası | `api-cbar-admin` → `api-cbar` → frontendlər. `dev.ps1`/`dev.sh` köhnədir (CLAUDE.md), bu spec onlara toxunmur | ✅ |
| V Sxem/migration/ikidillilik | `0045`: append-only, `IF NOT EXISTS`, ad unikal, ALTER yoxdur. Entity hər iki `Cbar.Domain`-da. Yeni chrome etiketləri az+en | ✅ |
| VII Xarici kontraktlar | `currencies/*.xml`-ə toxunulmur. Public API-yə yalnız sahə əlavə olunur, `layout`/`connector` qalır | ✅ |
| VIII Real yoxlama | quickstart: `dotnet test`, PGlite, iki `verify`, Node 22, brauzerdə ölçmə | ✅ |

Dizayndan sonra yenidən yoxlanıb: pozuntu yoxdur.

## Frontend Skills Gate

Yüklənib: `senior-front`, `frontendpatterns`, hər iki komponentin `frontend-standards` və `ui-kit-usage` skill-i (2026-11-26).

| UI piece | Kit components (`ui-kit-usage`) | Patterns (`frontendpatterns`) | Smells avoided (`senior-front`) |
|----------|----------------------------------|-------------------------------|----------------------------------|
| Sayt: desktop sxemi (`widgets/org-chart/org-chart-chart.tsx`) | kit tokenləri (`site-org-*`), `next/link`. Yeni kit komponenti yoxdur | Server Component, progressive enhancement, semantic HTML (`<ul>`/`<li>` sətirlər) | Client state for server data, `'use client'` page shell, magic numbers (`CHART` sabitləri) |
| Sayt: açılan blok | native `<details>`/`<summary>`, `CaretDownIcon` (`/icons` subpath, `aria-hidden`) | Disclosure (platform first, ARIA last) | `<div onClick>`, summary içində keçid (iç-içə interaktiv element) |
| Sayt: düzülüş modeli (`entities/org-chart/model/layout.ts`) | — | Pure function, separation of concerns | Switch Statements in JSX, Derived state stored |
| Sayt: enli sxem wrapper-i | — | Keyboard-scrollable region (`tabIndex=0`, `role="region"`, `aria-label`) | Horizontal page scroll |
| Panel: "Sıranı dəyiş" | `IconButton` (`aria-label`), mövcud `ReorderDialog` + `SortableList` | Optimistic update with rollback, polite live region (mövcud) | Duplicate Code (yeni sıra komponenti yazmamaq) |
| Panel: "Departamentlər" seçimi | `RadioGroup` (`/radio-group`, `menu-visibility-card` kimi) | Form field labelling, conditional field by kind | Boolean props that combine into impossible states (yalnız növ 4/6) |
| Panel: "Saytda bax" | `Button` `asChild` + `<a target="_blank" rel="noopener">` | External link affordance | Hardcoded host (`VITE_SITE_URL`) |
| Panel: "Siyahı \| Sxem" (US4, 2026-11-26) | `Tabs` (`/tabs`), dil üçün `RadioGroup` və ya `Tabs`; kart `<button>` (fokus halqası), açılan blok native `<details>` | URL state (`validateSearch`), derive-don't-store (süzgəc saf funksiyadır), keyboard-scrollable region | Duplicate Code — düzülüş kodu kopyadır, amma bayt-bayt eyni və `check:chart-layout` ilə qorunur (paylaşılan paket yoxdur, `Cbar.Domain` kimi) |

Review: tasks.md-də hər frontend fazası `ui-kit-review` + senior-front review checklist ilə bitir, sonra `npm run verify`.

## Project Structure

### Documentation (this feature)

```text
specs/060-org-chart-auto-layout/
├── spec.md, checklists/requirements.md
├── research-notes.md     # 2026-11-25 Figma və test mühiti faktları (research.md-nin mənbəyi)
├── plan.md               # bu fayl
├── research.md           # R1–R16
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── layout-rules.md   # L1–L11, Figma ölçüləri, R5 fərqləri
│   ├── admin-api.md
│   └── public-api.md
└── tasks.md              # /speckit-tasks
```

### Source Code — iş paketləri deploy sırası ilə

```text
product-rest/api-cbar-admin/                       # MR 1
├── openapi/paths/organization.yaml                # əvvəl: PUT /chart/order, departmentsOpen, deprecated
├── openapi/components/schemas/organization.yaml
├── db/migrations/0045-org-chart-node-details.sql
├── src/Cbar.Domain/Entities/Organization.cs       # OrgChartNodeDetails + OrgChartNode.Details
├── src/Cbar.Domain/CbarDbContext.cs
├── src/Cbar.AdminApi/Controllers/OrgChartController.cs   # Reorder, departmentsOpen, delete details
└── tests/Cbar.AdminApi.Tests/                     # ValidateDepartmentsOpen

product-rest/api-cbar/                             # MR 2
├── openapi/ (departmentsOpen, deprecated)
├── src/Cbar.Domain/ (MR 1 ilə bayt-bayt eyni)
└── src/Cbar.WebApi/Controllers/OrganizationController.cs # GetChart: departmentsOpen

product-rest/web-cbar-admin-new/                   # MR 3
├── .env.development, .env.dev, .env.test, .env.production   # VITE_SITE_URL
├── src/pages/org-chart/index.tsx                  # canvas çıxır, "Saytda bax", kök sırası
├── src/features/org-chart/components/canvas-editor.tsx      # silinir
├── src/features/org-chart/components/node-list.tsx          # "Sıranı dəyiş", notPlaced nişanı çıxır
├── src/features/org-chart/components/node-form-dialog.tsx   # sortOrder sahəsi çıxır, Departamentlər radio
├── src/features/org-chart/api/org-chart.service.ts          # reorder, layout çıxır
├── src/features/org-chart/model/{geometry,geometry.test,layout}.ts   # silinir
├── src/features/org-chart/model/{schemas,constants}.ts
├── src/locales/{az,en}/organization.json
└── src/shared/testing/{fixtures,handlers}/org-chart.ts

product-rest/web-cbar-new/                         # MR 4
├── src/entities/org-chart/model/layout.ts (+ .test.ts)      # buildChartLayout, buildTree
├── src/entities/org-chart/model/geometry.ts (+ test)        # silinir
├── src/widgets/org-chart/org-chart-chart.tsx                # yeni desktop widget (canvas əvəzi)
├── src/widgets/org-chart/org-chart-canvas.tsx               # silinir
├── src/widgets/org-chart/{constants,model,index}.ts
├── src/features/organization/model/schemas.ts               # departmentsOpen, layout/connector çıxır
├── src/views/organization/index.tsx
└── src/shared/testing/{fixtures/organization,handlers/organization}.ts

dokumentasiyalar/struktur-sxemi-guide.md           # canvas bölməsi → sıra və "Departamentlər" seçimi
dokumentasiyalar/README.md                         # canvas qeydi
business_logic/                                    # /sync-business-logic ilə
```

**Structure Decision**: Dörd mövcud komponent, yeni layihə yoxdur. Sayt FSD qatları:

- model `entities`-dədir;
- render `widgets`-dədir;
- view yalnız widget-i dəyişir.

Panelin bölməsi xüsusi səhifə olaraq qalır (`pages/org-chart`). Bu, CRUD modulu deyil, çünki ağac siyahısı və valideyn məntiqi var.

## Complexity Tracking

Pozuntu yoxdur.
