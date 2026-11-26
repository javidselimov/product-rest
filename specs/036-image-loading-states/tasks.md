# Tasks: Şəkil və məlumat yüklənməsində boş yer

**Input**: `specs/036-image-loading-states/` (spec, plan, research, contracts/ui-contract, quickstart)

Yollar `product-rest/web-cbar-new/`-ə nisbətəndir. `SiteImage` testi plana daxildir, çünki `verify` merge şərtidir.

## Phase 1: Setup

Yoxdur. Yeni asılılıq lazım deyil.

## Phase 2: Foundational

**Blokedir**: US2, US3 `SiteImage`-dən asılıdır.

- [X] T001 `src/shared/ui/site-image.tsx` yarat: `next/image` örtüyü, `skeleton` prop-u, `{ src, state }` vəziyyəti (`contracts/ui-contract.md` §1, research R3, R4)
- [X] T002 `src/app/globals.css`-ə `site-image` keçid, `scripting` gizlətmə, 8 s reveal və `error` qaydalarını əlavə et (research R2, R5); sabit dəyərlər CSS-də qalır
- [X] T003 `src/shared/ui/site-image.test.tsx` yaz: yüklənir → skeleton, `load` → yox olur, `error` → skeleton yox, `src` dəyişir → sıfırlanır, `fill` olmayan rejimdə skeleton yoxdur, `skeleton={false}`

## Phase 3: US1 — Şəkillər tez gəlir (P1)

**Goal**: hazırlanmış şəkil keşdən gəlir. **Independent Test**: quickstart «Test deploy-dan sonra».

- [X] T004 [US1] `Dockerfile` runtime mərhələsində son `COPY`-dən sonra, `USER node`-dan əvvəl `.next/cache` yarat və `node`-a ver, səbəbi şərhdə yaz (research R1)

## Phase 4: US2 — Şəkil yeri səliqəli dolur (P1)

**Goal**: bütün kontent şəkilləri shimmer + fade ilə açılır. **Independent Test**: quickstart 1, 5, 6, 7, 8, 9.

- [X] T005 [P] [US2] `src/widgets/news-grid/news-grid.tsx` `SiteImage`-ə keçir
- [X] T006 [P] [US2] `src/widgets/home-cards/news-tabs.tsx`, `links-grid.tsx`, `strategy-docs.tsx` `SiteImage`-ə keçir; `news-tabs` hover-i qalır
- [X] T007 [P] [US2] `src/widgets/hero-slider/hero-slider.tsx` `SiteImage skeleton={false}`-a keçir
- [X] T008 [P] [US2] `src/widgets/photo-gallery/photo-gallery.tsx` böyük şəkil və miniatürləri keçir
- [X] T009 [P] [US2] `src/widgets/about-blocks/staff-cards.tsx`, `staff-photos.tsx`, `office-cards.tsx` keçir
- [X] T010 [P] [US2] `src/views/money-marks/index.tsx`, `src/views/money-mark/index.tsx`, `src/views/press-release/index.tsx` keçir
- [X] T011 [P] [US2] `src/widgets/content-list/content-list.tsx`, `src/widgets/attachments/attachments.tsx` (yalnız fade) keçir
- [X] T012 [P] [US2] `src/widgets/video-player/video-player.tsx` və `src/widgets/about-blocks/history-photos.tsx` xam `<img>`-i `SiteImage fill unoptimized`-ə keçir, `eslint-disable`-ləri sil, yuvaya `relative` əlavə et (research R9)
- [X] T013 [US2] Köçürülmüş widget testlərini yenilə, `npx vitest run` və `npm run lint` keçsin

## Phase 5: US3 — Görünən şəkillər əvvəl yüklənir (P2)

**Goal**: ilk sıra və qonşu şəkillər gözlətmir. **Independent Test**: quickstart 1, 3, 4.

- [X] T014 [US3] `src/shared/constants/layout.ts`-ə `EAGER_CARD_COUNT = 3` əlavə et; `src/widgets/news-grid/news-grid.tsx` və `src/widgets/content-list/content-list.tsx`-də ilk kartlara `loading="eager"` ver
- [X] T015 [US3] `src/widgets/hero-slider/hero-slider.tsx`-də `(index + 1) % count` slaydına `loading="eager"` ver
- [X] T016 [US3] `src/widgets/photo-gallery/photo-gallery.tsx`-də ±1 qonşu şəkli gizli və eager render et, testi yenilə (research R8)

## Phase 6: US4 — Səhifə forması əvvəlcədən görünür (P2)

**Goal**: spinner əvəzinə forma. **Independent Test**: quickstart 2, 10.

- [X] T017 [US4] `src/widgets/news-grid/news-grid.tsx`-də grid class-ını sabitə çıxar, `src/widgets/news-grid/news-grid-skeleton.tsx` yarat, `index.ts`-dən export et
- [X] T018 [US4] `src/widgets/section-shell/section-shell.tsx`-də xarici class-ları paylaş, `src/widgets/section-shell/section-shell-skeleton.tsx` yarat, export et; `route-skeleton` gecikmə qaydasını `src/app/globals.css`-ə əlavə et (research R6, R7)
- [X] T019 [P] [US4] `src/app/[locale]/(content)/media/galleries/loading.tsx` və `media/videos/loading.tsx` yarat (tab, filtr, 9 kart)
- [X] T020 [P] [US4] `src/app/[locale]/(content)/press-releases/loading.tsx` və `media/events/loading.tsx` yarat
- [X] T021 [P] [US4] `src/app/[locale]/(content)/media/galleries/[id]/loading.tsx`, `media/videos/[id]/loading.tsx`, `press-releases/[slug]/loading.tsx`, `media/events/[slug]/loading.tsx` yarat

## Phase 7: Polish

- [X] T022 `npm run verify`-ı Node 24 və Node 22 ilə işlət (`product-rest/web-cbar-new`)
- [X] T023 quickstart brauzer cədvəlini Edge CDP + `local:testcbar` ilə yoxla, ölçüləri `specs/036-image-loading-states/quickstart.md`-ə yaz
- [X] T024 [P] `product-rest/web-cbar-new/CLAUDE.md`-ə `SiteImage` qaydasını əlavə et: kontent şəkli `next/image` ilə birbaşa yox, `SiteImage` ilə
- [ ] T025 Test deploy-dan sonra `X-Nextjs-Cache: HIT` təsdiqi (quickstart). İstifadəçinin GitLab push-undan asılıdır, bu sessiyada edilmir

## Dependencies

- T001–T003 → US2, US3. US1 (T004) müstəqildir.
- T007 → T015, T008 → T016, T005 → T014, T017.
- T017, T018 → T019–T021.
- US3 və US4 bir-birindən asılı deyil.

## Parallel

- US2: T005–T012 fərqli fayllardadır.
- US4: T019–T021 T017, T018-dən sonra.

## Implementation Strategy

MVP: T001–T013, yəni keş fix-i və `SiteImage`. Bunlar şikayəti birbaşa həll edir. US3 və US4 sonrakı artımlardır, hər biri
ayrıca yoxlanılır.
