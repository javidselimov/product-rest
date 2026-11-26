# Implementation Plan: Admin paneldə şəkillərin önizləməsi (preview)

**Branch**: `010-admin-image-preview` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-admin-image-preview/spec.md`

## Summary

- `api-cbar-admin`-ə bir oxuma endpoint-i əlavə olunur: `GET /api/v1/media/{id}/preview`.
  - JWT ilə qorunur.
  - Şəklin baytlarını MinIO-dan stream edir.
  - Şəkil olmayan fayl üçün baytları oxumadan 415 qaytarır.
- Sxem dəyişmir.
- Panel şəkli mövcud `apiClient` ilə blob kimi alır. Bu zaman token, refresh və 401 interceptor-lardan gəlir.
  - Şəkil `blob:` ünvanı ilə `<img>`-də göstərilir.
  - Blob TanStack Query-də id üzrə keşlənir.
- Ortaq `MediaPreview` və `MediaLightbox` komponentləri `features/media`-da yaranır.
  - `MediaIdField`-ə qoşulduğu üçün P1 bütün CRUD formalarında bir dəyişikliklə həll olunur.
  - Sonra seçici, qalereya, assets və kitabxanaya qoşulur.

## Technical Context

**Language/Version**:
- API: C# / .NET, EF Core + Npgsql.
- Panel: TypeScript strict, React 19 + Vite.

**Primary Dependencies**:
- API: mövcud `Minio` client (`MediaStorage`). `AWSSDK.S3` istifadə olunmur (root CLAUDE.md).
- Panel: `@cbar/lib-react-ui-kit` (`dialog`, `skeleton`, `icons`), TanStack Query, Axios (`apiClient`), react-i18next.
- **Yeni dependency yoxdur.**

**Storage**:
- Mövcud `media_assets` + MinIO bucket. Migration yoxdur, `Cbar.Domain` toxunulmur.
- Panel tərəfində yalnız yaddaşda query keşi var, storage-a yazılmır.

**Testing**:
- Panel: Vitest + RTL + MSW (`npm run verify`).
- API: avtomatik test yoxdur (Maddə VIII.1). `curl` ssenariləri [quickstart.md](./quickstart.md)-dədir. Lokalda .NET SDK olmadığına görə test mühitində icra olunur.

**Target Platform**:
- Linux konteynerlər (CBAR GitLab pipeline).
- Panel masaüstü brauzerlər üçündür.

**Project Type**: web — 1 API + 1 SPA.

**Performance Goals**:
- Önizləmə ≤ 1 s-də görünür (SC-002, SC-003).
- 24 kartlıq seçici ≤ 2 s-də hazır olur (SC-006).
- Görünməyən önizləmə endirilmir (R5).
- Eyni şəkil təkrar endirilmir: query keşi + `immutable` HTTP keşi (FR-017).

**Constraints**:
- Panel yalnız admin API-yə müraciət edir (Maddə III.1).
- Token URL-də olmur (template X.3).
- SVG yalnız `<img>`-də göstərilir (FR-014).
- `Content-Length` qoyulmur, çünki `size_bytes` etibarsızdır.
- Mövcud media endpoint-ləri dəyişmir.

**Scale/Scope**:
- 1 yeni endpoint, 2 yeni komponent + 1 hook.
- 5 inteqrasiya nöqtəsi.
- Təsir olunan modullar: homepage, image-popups, meas, money-marks, organization, galleries, pages/laws/press-releases əlavələri, media library.

## Constitution Check

*GATE: Phase 0-dan əvvəl yoxlanıldı, Phase 1-dən sonra təkrar yoxlanıldı. Nəticə dəyişmədi.*

**Workspace konstitusiyası** (`.specify/memory/constitution.md`):

| Maddə | Status | Qeyd |
| --- | --- | --- |
| I.2 `product-host` istinadı | ✅ | Yii2 admin-də qarşılığı yoxdur. Spec bunu açıq yazır |
| I.3 səssiz itki | ✅ | Heç nə ləğv olunmur, mövcud mətn (`#id · ad`) qalır (FR-006) |
| II.3 ayrı MR + deploy sırası | ✅ | 2 MR, sıra aşağıdadır |
| II.4 paylaşılan kod yoxdur | ✅ | `api-cbar` stream davranışı təkrar yazılır, import olunmur |
| III.1 çarpaz çağırış yoxdur | ✅ | Panel public `/media/{id}`-ə yox, admin endpoint-ə gedir (R1) |
| III.2 yeganə yazan | ✅ | Yazma yoxdur |
| III.4 JWT + audit | ✅ | `[Authorize]` controller səviyyəsindədir. Oxuma olduğu üçün audit tələb olunmur |
| IV port və sıra | ✅ | Yeni port və proyekt yoxdur. Vite proxy `/api`-ni artıq ötürür |
| V.1/V.2 Domain və migration | ✅ | Toxunulmur |
| V.4 i18n paritet | ✅ | `media.json` az/en, `check:i18n` |
| V.5 UTF-8 | ✅ | AZ JSON yalnız redaktorla yazılır |
| VI şablon yığını | ✅ | Kit `Dialog`/`Skeleton`, yeni dependency yoxdur |
| VII kontraktlar | ✅ | Yalnız yeni route. `currencies.xml` və public API toxunulmur |
| VIII verification | ✅ | `npm run verify` + quickstart. API build test mühitində yoxlanılır, bu, sənədləşdirilmiş məhdudiyyətdir |

**Template konstitusiyası** (`web-cbar-admin-new/.specify/memory/constitution.md`):

| Maddə | Status | Qeyd |
| --- | --- | --- |
| IV FSD | ✅ | Komponentlər `features/media`-dadır. `crud`/`assets`/`galleries` artıq ondan import edir |
| V state ayrımı | ✅ | Server state = Query (blob). Zustand/storage yoxdur |
| VI test | ✅ | MSW real kontrakt, `renderApp` axın testləri. `createObjectURL` polyfill-dir, assert deyil |
| VII error handling | ✅ | Önizləmə xətası UI-da yer tutucudur, toast və throw yoxdur. Forma bloklanmır |
| X.1 XSS | ✅ | `dangerouslySetInnerHTML` və inline SVG yoxdur, yalnız `<img>` |
| X.2 validasiya | ✅ | 415 body-si Zod ilə oxunur. Blob tipi `Content-Type` ilə yoxlanılır |
| X.3 sensitive data | ✅ | Token header-dədir, URL-də deyil (R2) |
| X.6 müdafiə başlıqları | ✅ | `nginx` zəiflədilmir. API cavabı `nosniff` + `sandbox` CSP verir. Panel CSP-si yoxdur, `blob:` üçün dəyişiklik tələb olunmur |

Pozuntu yoxdur, Complexity Tracking boşdur.

## İş paketləri (MR) və deploy sırası

| # | Proyekt | Dəyişiklik | Asılılıq |
| --- | --- | --- | --- |
| 1 | `api-cbar-admin` | Aşağıdakılar: | — |
| | | `Services/MediaStorage.cs`: `GetAsync(key, Func<Stream, CancellationToken, Task>, ct)` | |
| | | `Controllers/MediaController.cs`: `GET {id:long}/preview` ([contract](./contracts/admin-api.md)), `If-None-Match` → 304 | |
| 2 | `web-cbar-admin-new` | Aşağıdakılar: | MR 1 test mühitində |
| | | `features/media`: `mediaService.preview`, `mediaKeys.preview`, `useMediaPreview`, `useInView`, `MediaPreview`, `MediaLightbox` | |
| | | 5 inteqrasiya nöqtəsi ([contracts/ui.md §2](./contracts/ui.md)) | |
| | | `locales/{az,en}/media.json` | |
| | | MSW handler + fixture blob-ları + testlər | |
| | | `entities/media/model/types.ts`-də köhnəlmiş "önizləmə yoxdur" şərhinin yenilənməsi | |
| | | `CLAUDE.md`-də qısa qeyd (media önizləməsi haradadır) | |

Deploy: **1 → 2**. Sıra pozulsa, önizləmə 404 alır və yer tutucu göstərir. Forma işləyir (FR-011).

## Project Structure

### Documentation (this feature)

```text
specs/010-admin-image-preview/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R7
├── data-model.md        # sxem dəyişikliyi yoxdur; vəziyyət maşını
├── quickstart.md        # curl + əl ilə yoxlama cədvəli
├── contracts/
│   ├── admin-api.md     # GET /api/v1/media/{id}/preview
│   └── ui.md            # MediaPreview / MediaLightbox / inteqrasiya
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/src/Cbar.AdminApi/
├── Controllers/MediaController.cs        # + Preview action
└── Services/MediaStorage.cs              # + GetAsync

product-rest/web-cbar-admin-new/src/
├── entities/media/model/types.ts         # şərh yenilənir
├── features/media/
│   ├── api/media.keys.ts                 # + preview(id)
│   ├── api/media.service.ts              # + preview(id) → PreviewResult
│   ├── hooks/use-media-preview.ts        # yeni
│   ├── hooks/use-in-view.ts              # yeni (IntersectionObserver, fallback = görünür)
│   ├── components/media-preview.tsx      # yeni
│   ├── components/media-lightbox.tsx     # yeni
│   ├── components/media-id-field.tsx     # önizləmə + picked mime
│   ├── components/media-picker-dialog.tsx
│   ├── components/media-grid.tsx
│   └── media-preview.test.tsx            # yeni
├── features/galleries/components/gallery-images-section.tsx
├── features/assets/components/assets-section.tsx
├── locales/{az,en}/media.json
└── shared/testing/
    ├── handlers/media.ts                 # + GET /media/:id/preview
    └── fixtures/media.ts                 # + kiçik şəkil baytları
```

**Structure Decision**: Mövcud iki repo daxilində qalır. Yeni proyekt, qovluq qatı və ya
paylaşılan kod yoxdur. Panel tərəfində bütün yeni kod artıq ortaq olan `features/media`
slice-ındadır.

## Complexity Tracking

Pozuntu yoxdur.
