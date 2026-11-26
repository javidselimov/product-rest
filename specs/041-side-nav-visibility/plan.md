# Implementation Plan: "Sol menyuda göstər" — səhifəni yalnız bölmənin sol menyusundan gizlətmək

**Branch**: `041-side-nav-visibility` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/041-side-nav-visibility/spec.md`

## Summary

Səhifəyə yeni "Sol menyuda göstər" bayrağı əlavə olunur (default açıq, iki dil üçün bir dəyər). Bayraq səhifəni ağacdan
çıxarmır. İctimai ağac onu node-un sahəsi kimi qaytarır, süzgəci yalnız sol menyunu quran iki widget edir. Bənd yalnız özü və ya
alt ağacındakı səhifə açıq olanda görünür (research R1, R6). Dəyər yoldaş `page_details` cədvəlində saxlanır, çünki `pages`-ə
`ALTER TABLE` qadağandır (R2). Admin input-unda sahə nullable-dır ki, köhnə panel onu sıfırlamasın (R4). Admin kartı üst menyu və
sol menyu görünüşünü ayrıca, səbəbi ilə göstərir (R7). Dörd komponent, dörd MR, sıra: admin API → api-cbar → sayt və panel.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API). TypeScript 5, React 19 (iki frontend); Next.js 16 (sayt), Vite (panel).

**Primary Dependencies**: EF Core + Npgsql. Zod, `@cbar/lib-react-ui-kit`, react-i18next, TanStack Query (panel). Yeni paket yoxdur.

**Storage**: PostgreSQL. Yeni cədvəl `page_details` (miqrasiya `0024-page-details.sql`, `api-cbar-admin`).

**Testing**: Vitest + MSW (hər iki frontend, `npm run verify`). API-lərdə test layihəsi yoxdur: `dotnet build` + PGlite ilə real
SQL + endpoint çağırışı (`quickstart.md`).

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline). Lokal Windows, Docker-siz.

**Project Type**: web: iki API + SSR sayt + SPA panel.

**Performance Goals**: əlavə sorğu yoxdur. Ağac cavabına bir boolean sahə, `GetTree`-yə bir `LEFT JOIN` düşür (sətirlər yalnız
istisnalardır, R5).

**Constraints**: `Cbar.Domain` iki nüsxədə bayt-bayt eyni. Miqrasiya `IF NOT EXISTS`, `BEGIN/COMMIT`-siz, adı iki repoda unikal.
Spec-first OpenAPI. Magic number yoxdur (spec 032). i18n az/en bərabər.

**Scale/Scope**: ~600 CMS səhifəsi. Dəyişən fayllar: API-lərdə ~6, saytda ~6 (+ testlər), paneldə ~8 (+ testlər), 4 sənəd.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | Köhnə saytın menyu strukturu dəyişmir: default açıqdır, heç bir səhifənin menyusu öz-özünə dəyişmir (SC-005). Köhnə admin-də belə bayraq yox idi, bu, redaksiya üçün əlavə imkandır. İnformasiya arxitekturası (I.5) redaktorun qərarıdır | Keçir |
| II | Dörd komponent = dörd MR. Paylaşılan kod yoxdur. Sayt və panel qaydası sənədlə bağlıdır (`contracts/ui.md`, `menu-visibility.ts` başlığı) | Keçir |
| III | `api-cbar-admin` yeganə yazandır. `api-cbar` yalnız oxuyur (`GRANT SELECT`). Public süzgəc şərtləri dəyişmir, bayraq yalnız əlavə məlumatdır | Keçir |
| IV | Port və start sırası dəyişmir. Miqrasiya admin API-dədir, api-cbar ondan sonra start edir | Keçir |
| V | Hər iki `Cbar.Domain` eyni dəyişiklikdə, `diff -r` boş. Miqrasiya append-only, yeni fayl. Bayraq dildən asılı deyil, `_translations` lazım deyil. Panel etiketləri az/en | Keçir |
| VI | Template yığını dəyişmir. CRUD mühərriki deyil, mövcud səhifə forması. TipTap-a toxunulmur | Keçir |
| VII | Yeni marşrut yoxdur. `GET /pages/tree` cavabına sahə əlavə olunur, heç nə silinmir (VII.3 geriyə uyğun). Köhnə URL-lər dəyişmir | Keçir |
| VIII | `npm run verify` hər iki frontenddə (Node 22 ilə də). API-lər `dotnet build` + real SQL ilə yoxlanılır, iki API birlikdə (VIII.3) | Keçir |

Faza 1-dən sonra yenidən yoxlandı. R4 (nullable input) `PageFlagsInput`-un mövcud "buraxılan sahə default-a qayıdır" qaydasından
bir sahə üçün istisnadır. Bu, kontrakt pozuntusu deyil: OpenAPI-də sənədləşdirilir və köhnə klientləri qoruyur. Pozuntu yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/041-side-nav-visibility/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R10
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md           # api-cbar tree + admin PageFlags/PageFlagsInput
│   └── ui.md            # sayt qaydası, admin forma/kart/ağac, i18n, redaktor cədvəli
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
product-rest/api-cbar-admin/
├── db/migrations/0024-page-details.sql                  # yeni
├── openapi/components/schemas/pages.yaml                 # PageFlags, PageFlagsInput (əvvəl)
├── src/Cbar.Domain/Entities/Content.cs                   # PageDetail, Page.Detail
├── src/Cbar.Domain/CbarDbContext.cs                      # DbSet + konfiqurasiya
└── src/Cbar.AdminApi/Controllers/PagesController.cs      # PageFlagsDto, Tree, Get/Update Include, ApplySettings, ToDetailDto

product-rest/api-cbar/
├── openapi/components/schemas/pages.yaml                 # PageNode.showInSideNav (əvvəl)
├── src/Cbar.Domain/…                                     # admin nüsxəsi ilə bayt-bayt eyni
└── src/Cbar.WebApi/Controllers/PagesController.cs        # PageNode record + proyeksiya

product-rest/web-cbar-new/
├── src/entities/page-node/model/schemas.ts               # showInSideNav?: boolean
├── src/entities/page-node/lib/tree.ts (+ index.ts)       # isInSideNav
├── src/widgets/section-shell/model.ts (+ model.test.ts)  # süzgəc
├── src/widgets/section-sidebar/section-sidebar.tsx (+ test)
├── src/shared/testing/fixtures/about.ts | media fikstürü  # gizli node nümunəsi
└── docs/media-cms-guide.md, docs/about-cms-guide.md

product-rest/web-cbar-admin-new/
├── src/features/pages/model/schemas.ts                   # PAGE_FLAG_KEYS, DEFAULT_PAGE_FLAGS
├── src/features/pages/model/menu-visibility.ts (+ test)  # top/side, yeni səbəblər
├── src/features/pages/components/menu-visibility-card.tsx
├── src/features/pages/components/page-form.tsx           # visibility qrupu
├── src/features/pages/components/page-tree.tsx           # nişan
├── src/features/pages/pages.test.tsx                     # funksional test
├── src/shared/testing/handlers/pages.ts                  # MSW kontraktı
└── src/locales/{az,en}/pages.json

business_logic/new_business_logic.md                     # /sync-business-logic
```

**Structure Decision**: mövcud dörd komponent strukturu. Yeni qovluq yoxdur. Sol menyu qaydası saytda `entities/page-node`-dadır,
çünki iki widget (`section-shell`, `section-sidebar`) onu bölüşür və FSD-də widget-lər bir-birindən import etmir.

## İcra fazaları (tasks.md üçün əsas)

1. **Kontrakt** (bloklayır): iki OpenAPI dəyişikliyi, lint + bundle, istifadəçi təsdiqi (`/api-endpoint` axını).
2. **api-cbar-admin**: miqrasiya, Domain (sonra api-cbar-a köçürülür), DTO/controller, PGlite yoxlaması.
3. **api-cbar**: Domain nüsxəsi, `PageNode`, proyeksiya, `cbar_web_ro` ilə oxuma yoxlaması.
4. **web-cbar-new** (US1, US2): sxem, `isInSideNav`, iki widget, testlər (`contracts/ui.md` 1–6).
5. **web-cbar-admin-new** (US3): flags, forma, kart, ağac nişanı, i18n, MSW, testlər.
6. **Sənədlər** (US4): redaktor təlimatları, `menu-visibility.ts` başlığı, `/sync-openapi`, `/sync-business-logic`, root
   `CLAUDE.md`-də qısa qeyd (About/Media bölməsi).

Faza 4 və 5 faza 1-dən sonra API-ni gözləmədən paralel gedə bilər, çünki MSW kontraktı `contracts/api.md`-dəndir.

## Complexity Tracking

Konstitusiya pozuntusu yoxdur.
