# Implementation Plan: Müsahibələr və çıxışlar

**Branch**: `main` (istifadəçi qərarı, ayrıca branch açılmır) | **Date**: 2026-11-04 |
**Spec**: [spec.md](spec.md)

**Input**: `specs/033-media-interviews/spec.md`

## Summary

Press-relizlərə üçüncü tip (`type = 3`) və qoşmaya dil əlavə olunur. Siyahı Xəbərlərin hazır şablonudur.
Detal yeni rejimdir: mətn + `Save as PDF`, örtük və tarix yoxdur. Dil süzməsi `api-cbar`-dadır, ona görə
mövcud xəbər və elanlar dəyişmir. 15 köhnə materialı redaktorlar əl ilə köçürür, kod skript yazmır.

## Technical Context

**Language/Version**: C# / .NET 10 (API-lər); TypeScript, React 19, Next.js 16 (sayt); Vite (panel)

**Primary Dependencies**: EF Core + Npgsql, `@cbar/lib-react-ui-kit`, Zod, TanStack Query, RHF. Yeni
dependency yoxdur.

**Storage**: PostgreSQL (yeni yoldaş cədvəl `press_release_asset_details`); MinIO dəyişmir

**Testing**: Vitest + RTL + MSW (hər iki frontend). API-lərdə test yoxdur: build + route-diff + test
mühitində icra

**Target Platform**: Kubernetes (GitLab pipeline), komponentlər ayrıca deploy olunur

**Project Type**: Web: iki API, iki frontend

**Performance Goals**: Əlavə sorğu yoxdur, süzmə mövcud EF proyeksiyasındadır

**Constraints**: `Cbar.Domain` bayt-bayt eyni; spec-first; spec 032 sabitləri; dil seçilməyən qoşmalarda
Xəbər və Elan görünüşü dəyişmir; Docker lokalda işləmir

**Scale/Scope**: 15 material, ~244 PDF səhifəsi (redaktor işi); 4 komponent, 1 miqrasiya, 1 yeni endpoint

## Constitution Check

*Phase 0-dan əvvəl və Phase 1-dən sonra yoxlanıldı: keçir, bir əsaslandırılmış istisna ilə.*

| Maddə | Status | Qeyd |
|---|---|---|
| I.2 Yii2 istinadı | ✅ | spec cədvəli |
| I.3, VII.2 Public URL | ⚠️ | `/page-59/...` redirect-i bu spec-də deyil, Complexity Tracking |
| I.4 `product-host` yalnız oxunur | ✅ | |
| I.5 Məzmun tipləri miras | ✅ | Ad dəyişir, tip köhnə bölmənin məzmunudur; istifadəçi qərarı |
| II Dörd proyekt | ✅ | 4 MR, sıra aşağıda |
| III.2 Yazan yalnız admin | ✅ | `api-cbar` yalnız oxuyur |
| III.3 Public filtr | ✅ | `Published`, embargo qalır, dil əlavə olunur |
| III.4 JWT + audit | ✅ | Yeni endpoint icazəli, audit yazılır |
| IV.2 Deploy sırası | ✅ | `api-cbar-admin` → `api-cbar` → panel → sayt |
| V.1 `Cbar.Domain` | ✅ | hər iki kopya bir iş paketində |
| V.2 Miqrasiya | ✅ | `0017-…`, append-only, unikal ad |
| V.3 İkidillilik | ✅ | qoşmanın dili bu prinsipi tamamlayır |
| V.4 Chrome etiketləri | ✅ | hər iki dil, `check:i18n` |
| V.5 UTF-8 | ✅ | Azərbaycan mətni shell ilə yazılmır |
| VI Admin stack | ✅ | yeni stack yoxdur, `check:kit` |
| VII.1 XML feed | ✅ | toxunulmur |
| VII.3 Backward compat | ✅ | public cavab forması dəyişmir |
| VIII Real icra | ⚠️ | API real baza ilə yalnız test deployunda yoxlanılır (Docker yoxdur), quickstart |

## İş paketləri (deploy sırası)

1. **`api-cbar-admin`**: OpenAPI → `0017` → `Cbar.Domain` → `IsValidType` → yeni endpoint → `ToDetailDto`.
2. **`api-cbar`**: OpenAPI → `Cbar.Domain` (bayt-bayt) → iki proyeksiyada dil süzməsi.
3. **`web-cbar-admin-new`**: sabitlər, i18n, sxem, `AssetsSection.localeControl`, nişanlar, handler, testlər.
4. **`web-cbar-new`**: `PRESS_RELEASE_TYPE`, `typeSchema`, etiketlər, `splitPressReleaseAssets` rejimləri,
   detal view, `Save as PDF`, testlər, `visual-diff.md`.
5. **Sənədlər və məzmun**: `media-cms-guide.md`, `CLAUDE.md`, business logic; `content-inventory.md`
   redaktora; prod-da inventar yoxlaması; node `80` adı və `navUrl`.

Paket 3 və 4 MSW ilə 1 və 2-dən asılı olmadan yazıla bilər, amma deploy sırası dəyişmir.

## Project Structure

### Documentation

```text
specs/033-media-interviews/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── content-inventory.md     # redaktora təhvil
├── contracts/
│   ├── api.md
│   └── ui-contract.md
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/
├── openapi/{paths/press-releases.yaml,components/schemas/press-releases.yaml,openapi.yaml}
├── db/migrations/0017-press-release-asset-details.sql
├── src/Cbar.Domain/{Entities/Content.cs,CbarDbContext.cs}
└── src/Cbar.AdminApi/Controllers/PressReleasesController.cs

product-rest/api-cbar/
├── openapi/{paths/press-releases.yaml,components/schemas/}
├── src/Cbar.Domain/{Entities/Content.cs,CbarDbContext.cs}
└── src/Cbar.WebApi/Controllers/PressReleasesController.cs

product-rest/web-cbar-admin-new/src/
├── entities/media/model/types.ts
├── features/assets/{api/assets.service.ts,components/assets-section.tsx}
├── features/press-releases/{model/constants.ts,model/schemas.ts,components/press-release-attachments-section.tsx,press-releases.test.tsx}
├── locales/{az,en}/{pressReleases,media}.json
└── shared/testing/{handlers,fixtures}/press-releases.ts

product-rest/web-cbar-new/src/
├── features/press-releases/model/{schemas.ts,constants.ts,split-assets.ts,split-assets.test.ts,pdf-file-name.ts,pdf-file-name.test.ts}
├── views/press-releases/{index.tsx,loader.ts,constants.ts,press-releases.test.tsx}
├── views/press-release/{index.tsx,loader.ts,press-release.test.tsx}
├── locales/{az,en}/content.json
└── shared/testing/{handlers,fixtures}/press-releases.ts
```

**Structure Decision**: Yeni route və entity yoxdur. Sayt `/press-releases` route-unu, panel press-reliz
modulunu genişləndirir.

## Complexity Tracking

| Pozuntu | Niyə lazımdır | Sadə alternativ niyə rədd edildi |
|---|---|---|
| `/page-59/...` üçün redirect yoxdur (I.3, VII.2) | Köhnə `/page-{id}` URL-ləri bütün sayt üzrə (~6000 link) redirect-sizdir, ayrıca iş tələb edir | Yalnız `59` üçün redirect tutarsız olardı. Slug ünvanı qalır, heç bir məzmun itmir |
| API yalnız test deployunda real baza ilə yoxlanılır (VIII) | Bu maşında Docker işləmir | `dotnet build` + route-diff lokalda; test mühiti tam quickstart ilə |

## Açıq risklər

- **Prod inventarı ölçülməyib.** Id-lər və 404-lər yalnız test mühitindədir.
- **Global Finance EN PDF-i** köhnə saytdan alınmalıdır, Figma-dakı mətn məhz bu materialdandır.
- **Fayl adı** bəzi brauzerlərdə hash qala bilər (R6); quickstart-da yoxlanılır.
- **Bölmə köçürmə bitənə qədər boşdur**: menyu `navUrl`-i materiallar dərc olunandan sonra verilməlidir.
