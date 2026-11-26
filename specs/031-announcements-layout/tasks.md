---
description: "Task list — 031 Elanlar: Figma-dakı şəkilsiz kart və detal (web-cbar-new, web-cbar-admin-new)"
---

# Tasks: Elanlar — Figma-dakı şəkilsiz kart və detal

**Input**: `specs/031-announcements-layout/` — [spec.md](./spec.md), [plan.md](./plan.md),
[contracts/ui-contract.md](./contracts/ui-contract.md)

**Branch**: `feature/031-announcements-layout`. Yollar `product-rest/`-ə nisbətəndir.

**Ümumi qaydalar**: kod şərhləri ingiliscə; testlər funksional (rol/etiket, MSW real kontrakt); API
və sxem toxunulmur; commit yalnız istifadəçi istəyəndə.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Spec-kit sənədləri: spec, plan, tasks, contracts/ui-contract
- [x] T002 `specs/029-media-news/spec.md` Clarifications: "Elanlar eyni şablonu alır → 031 ilə dəyişdirildi"
- [x] T003 Root `FIGMA-REDIZAYN-PLANI.md`: "Harada qaldım (031)", qərarlar, mərhələlər

## Phase 2: web-cbar-new (US1, US2)

- [x] T004 [US1] `web-cbar-new/src/widgets/news-grid/news-grid.tsx`: `variant?: 'photo' | 'text'`
  (defolt `photo`); `text` → şəkil qutusu yoxdur, `flex flex-col gap-4`, `p-4 rounded-xs desk:p-0`;
  `data-variant`; doc-comment `1048:23221`; `index.ts` `NewsGridVariant`
- [x] T005 [US1] `web-cbar-new/src/views/press-releases/index.tsx`: `variant={data.type === '2' ? 'text' : 'photo'}`
- [x] T006 [US2] `web-cbar-new/src/features/press-releases/model/split-assets.ts`:
  `splitPressReleaseAssets(assets, { photos = true })`; `photos:false` → `cover null, gallery [], attachments = assets`
- [x] T007 [US2] `web-cbar-new/src/views/press-release/loader.ts`: `{ photos: release.type !== '2' }`
- [x] T008 [US2] `web-cbar-new/src/widgets/attachments/attachments.tsx`: `imagesAsFiles` prop-u (şəkillər
  fayl sətri kimi, miniatür zolağı yox); `views/press-release/index.tsx` elanda ötürür
- [x] T009 [P] Fikstürlər `shared/testing/fixtures/press-releases.ts`: elan 1 `imageUrl`; elan detalı
  şəkil + PDF; `singlePhotoDetailFixture` (xəbər, tək şəkil); handler `details`-ə əlavə
- [x] T010 [US1] `views/press-releases/press-releases.test.tsx`: type=2 kartlarda `img` yoxdur, link + tarix,
  `data-variant="text"`; type=1 `photo` dəyişmir
- [x] T011 [US2] `views/press-release/press-release.test.tsx`: elan detalında örtük/qalereya yoxdur, şəkil +
  PDF qoşma linkləri API sırası ilə; tək şəkilli xəbər yalnız örtük
- [x] T012 [US2] `features/press-releases/model/split-assets.test.ts`: `{ photos: false }` və defolt
- [x] T013 `web-cbar-new/CLAUDE.md` §3 Media bəndi: Elanlar mətn kartı (031)
- [x] T014 Gate: `npm run verify` (Node 24); `npx vitest run src/views/press-releases src/views/press-release
  src/features/press-releases src/widgets/attachments` Node 22-də

## Phase 3: web-cbar-admin-new (US3)

- [x] T015 [US3] `web-cbar-admin-new/src/features/press-releases/components/press-release-attachments-section.tsx`:
  `detail.type === 2` → `badgeFor` yox, `descriptionKey` `attachments.descriptionAnnouncement`; sıralama qalır
- [x] T016 [P] [US3] `locales/{az,en}/pressReleases.json` `attachments.descriptionAnnouncement`; `check:i18n`
- [x] T017 [P] [US3] Fikstür `shared/testing/fixtures/press-releases.ts`: yazı 4 → xəbər (030 nişan testləri
  üçün), yazı 3 → elan + şəkil + PDF
- [x] T018 [US3] `features/press-releases/press-releases.test.tsx`: elan redaktəsində nişan yoxdur, elan izahı,
  "yuxarı" düyməsi aktiv; siyahı testlərində növ iddiaları yeni fikstürə görə; xəbər 030 testləri dəyişmir
- [x] T019 Gate: `npm run verify`

## Phase 4: Ölçmə (US1, US2)

- [x] T020 `local:testcbar` (:3002) `/az/press-releases?type=2` 1728/744/390: kart 312×~96, tarix → başlıq 16,
  sütun arası 24; 744/390 kart padding 16 — `getBoundingClientRect`; elan detalı (şəkilli elan varsa örtük
  yoxdur, fayl qoşmada); xəbər detalı dəyişməyib → `specs/031-announcements-layout/visual-diff.md`
- [x] T021 Fərq > 2px → bura düzəliş task-ı (fərq yoxdur; kart hündürlüyü məzmundan asılıdır — visual-diff §1)

## Phase 5: Yekun

- [ ] T022 Commit-lər (plan "Mərhələlər"), 2 MR; deploy sırası asılılığı yoxdur
- [ ] T023 Commit-dən sonra `/sync-business-logic press-releases`
- [ ] T024 Tracker "031" bölməsi yenilənir

## Dependencies

- T004 → T005; T006 → T007; T008 → T011; T009 → T010–T011; T014 sonuncu (Phase 2).
- T015–T017 paralel → T018 → T019.
- Phase 4 lokal `local:testcbar` ilə (deploy tələb etmir — API dəyişmir).
