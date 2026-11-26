# Implementation Plan: KSM layihələri — admin paneldən idarə olunan məzmun növü

**Branch**: `038-media-csr` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: `specs/038-media-csr/spec.md`, təsdiqlənmiş plan 2026-11-06

## Summary

KSM layihələri bir CMS səhifəsinin markup-ından çıxıb admin paneldə ayrıca məzmun növü olur: Tədbirlər nümunəsində cədvəllər, CRUD, kateqoriya siyahısı. Saytda görünüş dəyişmir: ilk iterasiyanın kart və modalı qalır, məlumatı yeni public endpoint verir. Dörd mövcud layihə miqrasiya ilə köçür.

## Technical Context

**Language/Version**: C# / .NET 10; TypeScript strict, React 19, Next.js 16, Vite

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit`, TanStack Router + Query, RHF + Zod, TipTap; Next App Router

**Storage**: PostgreSQL, MinIO üzərində mövcud `media_assets`

**Testing**: API-lərdə test yoxdur (`dotnet build` + əl ilə); frontendlərdə Vitest + MSW, `npm run verify`

**Target Platform**: Linux konteynerlər, CBAR GitLab pipeline

**Project Type**: Web, 4 müstəqil komponent

**Performance Goals**: Admindəki dəyişiklik saytda 1 dəqiqədən az vaxtda; mövcud `cachedJson` TTL 10 s

**Constraints**: Mövcud cədvəllərə `ALTER TABLE` yoxdur; `Cbar.Domain` bayt-bayt eyni; miqrasiya adları unikal; brauzer API çağırmır; endpoint-lər spec-first

**Scale/Scope**: 4–12 layihə, layihədə 0–15 foto, 2 dil

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | Əvəz edilən Yii2 hissəsi: xüsusi controller yoxdur, köhnə saytda KSM adi səhifədir. Ünvan eyni qalır, səssiz itki yoxdur | Keçir |
| II | Dörd komponent = dörd MR, sıra plandadır, paylaşılan kod yoxdur | Keçir |
| III | Yazan yalnız `api-cbar-admin`; public filtr tam; JWT + audit; frontendlər yalnız öz cütlərini çağırır | Keçir |
| IV | Portlar və start sırası dəyişmir | Keçir |
| V | `Cbar.Domain` hər iki nüsxədə; miqrasiyalar append-only, `0020`, `0021`, `BEGIN` yox; `_translations` cədvəlləri; slug yoxdur, çünki ünvan yoxdur | Keçir |
| VI | Admin kit + FSD + `ModuleConfig`; TipTap dəyişmir | Keçir |
| VII | Yeni route, mövcudlar geriyə uyğun; KSM səhifəsinin ünvanı eyni | Keçir |
| VIII | Build + real icra + `quickstart.md`, iki API birlikdə | Keçir |

Faza 1-dən sonra yenidən yoxlandı: dəyişiklik yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/038-media-csr/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   ├── cms-markup.md
│   └── ui-contract.md
├── checklists/
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/
├── db/migrations/0020-csr-projects.sql, 0021-csr-projects-seed.sql
├── openapi/paths/csr-projects.yaml
└── src/
    ├── Cbar.Domain/Entities/CsrProject.cs, CbarDbContext.cs
    └── Cbar.AdminApi/
        ├── Authorization/Permissions.cs
        └── Controllers/CsrProjectsController.cs, CsrCategoriesController.cs, MediaController.cs

product-rest/api-cbar/
├── openapi/paths/csr-projects.yaml
└── src/
    ├── Cbar.Domain/            # eyni
    └── Cbar.WebApi/Controllers/CsrProjectsController.cs, SearchController.cs

product-rest/web-cbar-admin-new/src/
├── shared/crud/types.ts, features/crud/components/field-control.tsx   # textarea
├── features/csr-projects/      # api, model/module.ts, schemas
├── pages/csr-projects/
├── app/routes/index.ts, nav.ts
└── features/rich-text/fixtures/layouts/csr-projects.html

product-rest/web-cbar-new/src/
├── features/csr-projects/      # api, schema
├── features/about-content/model/csr-projects.ts, types.ts, fixtures/csr-projects.html
├── views/cms-page/loader.ts
├── widgets/about-blocks/csr-projects.tsx
├── features/search/model/schemas.ts
└── locales/{az,en}/media.json, search.json
```

**Structure Decision**: Mövcud dörd komponent, yeni layihə yoxdur.

## Deploy sırası

Hamısı bir yayımda, startup sırası ilə: `api-cbar-admin` (`0020`, `0021`, CRUD) → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`.

Köhnə sayt səhifəni olduğu kimi göstərir. Yeni sayt API cavab verənə qədər də köhnə mətni göstərir, layihələr gələndə kartlara keçir. Heç bir ara vəziyyətdə mətn itmir.
