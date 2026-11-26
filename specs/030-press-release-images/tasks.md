---
description: "Task list — 030 Xəbər şəkilləri: sıralama, örtük və fotoqalereya (api-cbar-admin, web-cbar-admin-new, web-cbar-new ölçmə)"
---

# Tasks: Xəbər şəkilləri — sıralama, örtük və fotoqalereya (admin)

**Input**: `specs/030-press-release-images/` — [spec.md](./spec.md), [plan.md](./plan.md),
[research.md](./research.md), [data-model.md](./data-model.md),
[contracts/admin-api.md](./contracts/admin-api.md), [quickstart.md](./quickstart.md)

**Branch**: `feature/030-press-release-images`. Yollar `product-rest/`-ə nisbətəndir.

**Ümumi qaydalar (hər task üçün)**:

- Kod şərhləri **ingiliscə**; toxunulan faylda azərbaycanca şərhlər də çevrilir (locale JSON istisna).
- Testlər **funksionaldır** (research R7): istifadəçi əməli → görünən nəticə, rol/etiketlə, `userEvent`,
  MSW real kontraktla.
- Endpoint dəyişikliyi **spec-first**: əvvəl `openapi/`, lint + bundle, sonra controller.
- Commit yalnız istifadəçi istəyəndə; hər mərhələ bir commit.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Root `FIGMA-REDIZAYN-PLANI.md`-yə "030 — Xəbər şəkilləri" bölməsi: "Harada qaldım",
  qərarlar (R1–R7 qısa), mərhələ checkbox-ları, deploy sırası
- [x] T002 Spec-kit sənədləri: spec, plan, research, data-model, contracts/admin-api, quickstart, tasks

## Phase 2: api-cbar-admin — spec-first endpoint (US1)

- [x] T003 [US1] `api-cbar-admin/openapi/components/schemas/press-releases.yaml`:
  `PressReleaseAssetOrder { mediaIds: int64[] uniqueItems }` (`GalleryImageOrder` nümunəsində, izah:
  tam dəst, ilk şəkil = örtük, qalanı = qalereya)
- [x] T004 [US1] `api-cbar-admin/openapi/paths/press-releases.yaml`: `assetsOrder` — `put`,
  `operationId reorderPressReleaseAssets`, `x-permission press_releases.update`, 204/400/401/403/404
- [x] T005 [US1] `api-cbar-admin/openapi/openapi.yaml`: `/api/v1/press-releases/{id}/assets/order` →
  `paths/press-releases.yaml#/assetsOrder` (`/assets/{mediaId}`-dən əvvəl); `npm run lint && npm run bundle`
- [x] T006 [US1] `api-cbar-admin/src/Cbar.AdminApi/Controllers/PressReleasesController.cs`:
  `record PressReleaseAssetOrderDto(List<long> MediaIds)`; `[HttpPut("{id:int}/assets/order")]
  ReorderAssets` — `Include(Assets)`, dəst bərabərliyi yoxsa `BadRequestProblem(...)`, `SortOrder = i + 1`,
  `audit.Log("press_releases.reorder_assets", …, before, after)`, `NoContent()`
- [x] T007 [US1] Gate: `dotnet build src/Cbar.AdminApi` 0 xəta;
  `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin` fərqsiz

## Phase 3: web-cbar-admin-new — qoşma bölməsi (US1, US2)

- [x] T008 [US1] `web-cbar-admin-new/src/features/assets/api/assets.service.ts`: `reorder(assetsPath,
  mediaIds)` → `PUT {assetsPath}/order`; şərhlər ingiliscə
- [x] T009 [US1] `web-cbar-admin-new/src/features/assets/components/assets-section.tsx`: opsional
  `reorderable` (ArrowUp/ArrowDown `IconButton`, uclar və pending-də deaktiv, `useMutation` →
  `assetsService.reorder` → `onChanged()`, xəta `Alert`), `badgeFor` (kit `Badge`), `descriptionKey`;
  siyahı `aria-label` = başlıq; şərhlər ingiliscə
- [x] T010 [US1] [US2] `web-cbar-admin-new/src/features/press-releases/components/press-release-attachments-section.tsx`:
  `reorderable`, `titleKey/descriptionKey` `pressReleases:attachments.*`, `badgeFor` (şəkillər arasında
  birinci → "Örtük", digər şəkil → "Qalereya", qalanı `null`); şərhlər ingiliscə
- [x] T011 [P] [US1] [US2] i18n: `locales/{az,en}/media.json` `assets.moveUpAria/moveDownAria/reordered/
  reorderFailed`; `locales/{az,en}/pressReleases.json` `attachments.title/description/cover/gallery`;
  `npm run check:i18n`
- [x] T012 [P] [US1] MSW `shared/testing/handlers/press-releases.ts`: `PUT :id/assets/order` — dəst
  yoxlaması → 400 `message`, `assets` yenidən sıralanır → 204; `typeGuard` regex `/assets/order`-i
  buraxır (mövcud)
- [x] T013 [P] [US1] Fikstür `shared/testing/fixtures/press-releases.ts`: yazı 4-ə 3 şəkil + 1 PDF
- [x] T014 [US1] Funksional testlər `features/press-releases/press-releases.test.tsx`: (a) nişanlar
  1-ci "Örtük", 2–3 "Qalereya", PDF nişansız; (b) 2-ci şəklin "yuxarı" → PUT gövdəsi `[2,1,7,3]`,
  refetch-dən sonra "Örtük" köçür, siyahı sırası; (c) uc düymələr deaktiv; (d) 400 `message` `Alert`-də,
  siyahı dəyişmir. `features/laws/laws.test.tsx`: sıralama düyməsi yoxdur (reqressiya)
- [x] T015 [US1] Gate: `npm run verify` yaşıl; Node 22 (`~/.nodevm/versions/22.23.2`) ilə `vitest run`

## Phase 4: web-cbar-new — ölçmə (US3, deploy-dan sonra)

- [ ] T016 [US3] Test mühitində (admin API deploy olunandan sonra) `local:testcbar` (:5175) ilə bir
  xəbərə 4–5 şəkil + PDF bağla, sıranı dəyiş; `curl …/api/v1/press-releases/{slug}` `assets` sırası
  admin ilə eyni (SC-003)
- [ ] T017 [US3] `web-cbar-new` `local:testcbar` (:3002): `/az/press-releases/{slug}` 1728/744/390 —
  fotoqalereya `getBoundingClientRect` ilə Figma `1652:36210` (984×601, miniatür 180×124, gap 24, oxlar
  44, şəkil→zolaq 48, mətn→qalereya 36); nəticə `specs/029-media-news/visual-diff.md`-də "ölçülməyib"
  abzasını cədvəllə əvəz edir
- [ ] T018 [US3] Fərq > 2px olarsa: bura düzəliş task-ı (`web-cbar-new/src/widgets/photo-gallery`),
  029 spec-i dəyişmir

## Phase 5: Yekun

- [ ] T019 Commit-lər (plan "Mərhələlər"), 2 MR; deploy sırası `api-cbar-admin` → `web-cbar-admin-new`
- [ ] T020 Commit-dən sonra `/sync-openapi api-cbar-admin` (`# Sync:` sətri) və `/sync-business-logic
  press-releases`
- [ ] T021 Tracker `FIGMA-REDIZAYN-PLANI.md` "030" bölməsi yenilənir (ölçmə, deploy, SC-lər)

## Dependencies

- T003–T005 → T006 (spec-first hook); T006 → T007.
- T008 → T009 → T010; T011–T013 paralel; T014 T010–T013-dən sonra; T015 sonuncu.
- Phase 4 admin API **deploy**undan asılıdır (test mühiti).
