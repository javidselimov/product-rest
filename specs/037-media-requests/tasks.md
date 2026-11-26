# Tasks: Media sorğuları

**Input**: `specs/037-media-requests/`

Testlər spec-də tələb olunur (FR-010, SC-005) və layihənin `verify` gate-inin hissəsidir. Yollar `product-rest/`-dən nisbidir.

## Phase 1: Foundational

- [x] T001 `ContactCard` tipini və `media-requests` blokunu əlavə et, `AboutLayoutKind`-i genişləndir: web-cbar-new/src/features/about-content/model/types.ts
- [x] T002 `MAX_CONTACT_CARDS` və `MEDIA_REQUESTS_MIN_CELLS` kimi sabitləri əlavə et: web-cbar-new/src/features/about-content/model/constants.ts
- [x] T003 `mediaLayoutFor(slug)` reyestrini əlavə et: web-cbar-new/src/features/about-content/model/layouts.ts

## Phase 2: User Story 1 — Jurnalist əlaqə kanalını tapır (P1)

**Goal**: Səhifə Figma görünüşündə az və en dilində açılır.

**Independent Test**: Hazır məzmunla səhifə üç enlikdə `contracts/ui-contract.md`-yə uyğundur.

- [x] T004 [US1] `parseMediaRequests` qaydalarını kontrakta görə yaz, `parseAbout`-a qoş: web-cbar-new/src/features/about-content/model/media-requests.ts, table-rows.ts, parse.ts
- [x] T005 [P] [US1] Kart komponenti: web-cbar-new/src/widgets/about-blocks/contact-cards.tsx
- [x] T006 [US1] Blok komponenti, `AboutBlocks`-a qoşmaq: web-cbar-new/src/widgets/about-blocks/media-requests.tsx, about-blocks.tsx
- [x] T007 [P] [US1] `media-requests` variantı: web-cbar-new/src/widgets/cms-content/cms-content.tsx, web-cbar-new/src/app/cms-content.css
- [x] T008 [US1] Loader Media bölməsində `mediaLayoutFor` çağırsın, view blokları göstərsin: web-cbar-new/src/views/cms-page/loader.ts, index.tsx
- [x] T009 [P] [US1] Parser və layout testləri: web-cbar-new/src/features/about-content/model/media-requests.test.ts
- [x] T010 [P] [US1] Render testi (rol, keçid, fallback): web-cbar-new/src/widgets/about-blocks/media-requests.test.tsx
- [x] T011 [US1] Loader testi: digər Media səhifəsi `plain` qalır: web-cbar-new/src/views/cms-page/media-requests.test.tsx

## Phase 3: User Story 2 — Redaktor məzmunu admin paneldən dəyişir (P1)

**Goal**: Yapışdırılmış və sonradan redaktə olunmuş məzmun itmir.

**Independent Test**: Roundtrip testi və admin paneldə xana dəyişikliyi.

- [x] T012 [US2] Roundtrip testinə hazır HTML nümunəsini əlavə et: web-cbar-admin-new/src/features/rich-text/roundtrip.test.ts
- [x] T013 [US2] TipTap-ın yadda saxladığı forma (`colgroup`, `colspan`) parser testində: web-cbar-new/src/features/about-content/model/media-requests.test.ts

## Phase 4: User Story 3 — Hazır məzmunun yerləşdirilməsi (P2)

**Goal**: Hazır HTML qaydaya uyğundur.

- [x] T014 [US3] `media-sorgulari-html/*.html` fayllarını real səhifədə yoxla, testdə nümunə daxildir (komponentlər upstream-də ayrı repodur, test root fayla bağlanmır): web-cbar-new/src/features/about-content/model/media-requests.test.ts

## Phase 5: Polish

- [x] T015 [P] Redaktor təlimatı: web-cbar-new/docs/media-cms-guide.md, ../dokumentasiyalar/media-sorgulari-guide.md, ../dokumentasiyalar/README.md
- [x] T016 [P] Agent konteksti: web-cbar-new/CLAUDE.md
- [x] T017 `npm run verify` və roundtrip, Node 24 və Node 22 ilə
- [x] T018 Brauzerdə 1728, 744, 390 enində ölçü: `quickstart.md`

## Dependencies

Phase 1 → US1 → US2, US3 → Polish. US2 və US3 kod baxımından US1-in parser-indən asılıdır.

## Implementation Strategy

US1 tamamlananda səhifə artıq Figma görünüşündədir, MVP budur. US2 və US3 bunu testlə qoruyur.
