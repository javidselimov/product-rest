# Implementation Plan: Xəbər şəkilləri — sıralama, örtük və fotoqalereya (admin)

**Branch**: `feature/030-press-release-images` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/030-press-release-images/spec.md`

## Summary

Spec 029-un saytdakı "örtük + fotoqalereya + qoşmalar" bölgüsünü redaktor üçün idarə olunan edir:
admin API-yə `PUT /press-releases/{id}/assets/order` (qalereya `images/order`-in qoşma variantı,
gövdə `mediaIds`), admin paneldə ortaq `AssetsSection`-a opsional sıralama düymələri və
"Örtük"/"Qalereya" nişanları, bölmənin adı "Şəkillər və sənədlər". Sayt və public API dəyişmir;
real çoxşəkilli xəbər yaranandan sonra fotoqalereya Figma `1652:36210` ilə ölçülüb 029-un
`visual-diff.md`-sinə yazılır. Sxem dəyişmir.

Əsas texniki qərarlar ([research.md](./research.md)):

- **Gövdə `mediaIds`** — qoşmanın öz id-si API-də yoxdur (R1).
- **Ortaq komponentə opsional prop-lar**, kopya yox; qanunlar dəyişmir (R2).
- **Nişan = şəkillər arasında birinci**, mövqe yox — saytla eyni qayda (R3); kit `Badge` (R4).
- **Controller `GalleriesController.ReorderImages` nümunəsində** (R5).
- **Ölçmə deploy-dan sonra** test mühitində (R6); testlər funksional (R7).

## Technical Context

**Language/Version**: C# / .NET 10 (`api-cbar-admin`); TypeScript 5 strict — React 19 + Vite
(`web-cbar-admin-new`)

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit` (`badge`, `icon-button`,
`icons`, `alert`, `card`), TanStack Query, react-i18next, Zod. **Yeni dependency yoxdur.**

**Storage**: PostgreSQL `press_release_assets.sort_order` — dəyişmir.

**Testing**: Vitest + Testing Library + `userEvent` + MSW (`onUnhandledRequest: 'error'`), `npm run
verify`, Node 22 ilə də. API-də test layihəsi yoxdur: `dotnet build`, OpenAPI lint/bundle,
`route-diff.mjs`, deploy-dan sonra `curl` (quickstart §1).

**Target Platform**: nginx-də SPA (admin), Kubernetes-də .NET API

**Project Type**: web application — 2 komponent, 2 MR (+ 029 `visual-diff.md` sənəd yeniləməsi)

**Constraints**: endpoint spec-first (hook `spec-first.mjs`); ortaq `AssetsSection`-ın defolt
davranışı dəyişmir; kod şərhləri ingiliscə; kit subpath import, semantik rənglər.

## Constitution Check

- **I.2 `product-host` istinadı** — spec-də cədvəl (köhnə formada şəkil = qoşma, sıra yox).
- **II Hər komponent öz MR-ı** — 2 MR, deploy sırası `api-cbar-admin` → `web-cbar-admin-new`.
- **VII.3 Geriyə uyğunluq** — yalnız yeni endpoint; mövcud route/cavab dəyişmir.
- **Spec-first** — OpenAPI əvvəl, lint + bundle, sonra controller, `route-diff` fərqsiz.
- **Panel: Zod, token yaddaşda, FSD** — yeni API çağırışı `features/assets/api`-də, cavab `void`
  (204); FSD istiqaməti pozulmur (press-releases → assets → media/entities).

## Project Structure

### Documentation (this feature)

```text
specs/030-press-release-images/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/admin-api.md
└── tasks.md
```

### Source Code

```text
product-rest/api-cbar-admin/
├── openapi/components/schemas/press-releases.yaml   # + PressReleaseAssetOrder
├── openapi/paths/press-releases.yaml                # + assetsOrder
├── openapi/openapi.yaml                             # + /api/v1/press-releases/{id}/assets/order
└── src/Cbar.AdminApi/Controllers/PressReleasesController.cs   # + ReorderAssets, PressReleaseAssetOrderDto

product-rest/web-cbar-admin-new/src/
├── features/assets/api/assets.service.ts            # + reorder
├── features/assets/components/assets-section.tsx    # + reorderable / badgeFor / descriptionKey
├── features/press-releases/components/press-release-attachments-section.tsx   # açır
├── features/press-releases/press-releases.test.tsx  # + 4 funksional test
├── features/laws/laws.test.tsx                      # + reqressiya iddiası
├── locales/{az,en}/media.json, pressReleases.json   # + açarlar
└── shared/testing/{handlers,fixtures}/press-releases.ts   # + PUT order, çoxşəkilli fikstür

specs/029-media-news/visual-diff.md                  # qalereya ölçməsi (deploy-dan sonra)
FIGMA-REDIZAYN-PLANI.md                              # 030 bölməsi
```

## Mərhələlər (commit-lər)

1. **Spec sənədləri + tracker** (`docs(specs): 030 …`).
2. **api-cbar-admin**: OpenAPI + controller (`feat(api-cbar-admin): 030 press release asset order`) —
   gate: lint/bundle, `dotnet build` 0, route-diff fərqsiz.
3. **web-cbar-admin-new**: service, bölmə, sarğı, i18n, MSW, testlər (`feat(web-cbar-admin-new): 030
   …`) — gate: `npm run verify` (+ Node 22).
4. **Ölçmə** (deploy-dan sonra): `visual-diff.md` + tracker (`docs(web-cbar-new): 030 gallery
   measurement`).

Commit yalnız istifadəçi istəyəndə.

## Complexity Tracking

Yoxdur — konstitusiya pozuntusu və əlavə abstraksiya yoxdur.
