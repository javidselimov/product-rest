---
description: "Task list — 035 Media → Qalereya: api-cbar filtrləri və video detalı, web-cbar-new siyahı və detallar"
---

# Tasks: Media → Qalereya

**Input**: [spec.md](./spec.md), [plan.md](./plan.md). Yollar `product-rest/`-ə nisbətəndir.

**MR xəritəsi** (deploy sırası ilə): A `api-cbar` → B `web-cbar-new`.

## Phase 1 — API (MR A)

- [x] T001 `api-cbar/openapi/`: `q/from/to`, `GET /videos/{id}`, `GET /galleries/{id}` 404; lint + bundle (spec təsdiqi)
- [x] T002 `MediaContentController`: helper-lər, `GetGalleries`/`GetVideos` filtrləri, `GetGallery` tərcümə şərti, `GetVideo`
- [x] T003 `dotnet build`; `route-diff.mjs api-cbar` 0 fərq
- [x] T004 PGlite ilə real SQL: `q` (`%`, `_` literal, 201 simvol → 400), `from/to` (Bakı günü sərhədi), `/videos/{id}` 200/404, tərcüməsiz qalereya 404
- [x] T005 `openapi.yaml` `# Sync:` sətri

## Phase 2 — Sayt (MR B)

- [x] T006 [US2] `media.api.ts` filtr obyekti + `getVideo`; sxem; ana səhifə çağırışları
- [x] T007 [US2] `widgets/list-filter` (Xəbərlərdən), press-releases `type`-ı `children` ilə ötürür
- [x] T008 [US1] `NewsGrid`: tarixsiz kart, `imageExternal`
- [x] T009 [US1] `views/media-gallery-list` + iki route; köhnə view-lar və `cards.ts` silinir
- [x] T010 [US3] `views/gallery` → `PhotoGallery`; `views/video` + `widgets/video-player` + `/media/videos/[id]`
- [x] T011 i18n `media.json` (az/en); D-2 token-ları
- [x] T012 Testlər: filtr formu, tablar, pagination filtrləri saxlayır, video play → iframe, 404, MSW `q/from/to` və `/videos/:id`
- [x] T013 `npm run verify` Node 24; testlər Node 22
- [x] T014 Figma ölçməsi 1728/744/390 (mobil aralıqlar 24 düzəldildi; qalan sapmalar spec.md-də)
- [x] T015 `web-cbar-new/CLAUDE.md`, `/sync-business-logic media`

## Phase 3 — Deploy-dan sonra

- [ ] T016 Test mühitində `/media/galleries?q=…`, `/media/videos/{id}` real API ilə
- [ ] T017 Redaktor: `fotoqalereya`/`videoqalereya` `navUrl` → `/media/galleries`, `/media/videos` (menyuda aktiv bənd)
