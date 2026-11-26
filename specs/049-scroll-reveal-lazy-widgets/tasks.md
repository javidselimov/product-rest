# Tasks: Ağır blokların ekrana gələndə yüklənməsi və scroll reveal effekti

**Input**: `specs/049-scroll-reveal-lazy-widgets/` (spec.md, plan.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md)

**Tests**: `npm run verify` birləşmə şərtidir və spec FR-019 funksional testləri tələb edir, ona görə test tapşırıqları daxildir
(istifadəçi davranışı: rol/mətn, `data-reveal` vəziyyəti; "test xatirinə" test yox).

**Qaydalar** (hər tapşırığa aiddir): yalnız `product-rest/web-cbar-new`; yeni kod şərhləri ingiliscə, dəyişilən faylda azərbaycanca şərhlər
də ingiliscəyə çevrilir; rəqəmlər `src/shared/constants/motion.ts`-də (spec 032); `prettier --write` işlədilmir; vitest PowerShell-dən.

## Phase 1: Setup

- [X] T001 Record the baseline before any code change: Lighthouse (Mobile) TBT, CLS and the number of `echarts` chunks loaded on open for `/az`, `/az/statistics`, `/az/statistics/azir` via `npm run local:testcbar` (:3002), per quickstart §0, in specs/049-scroll-reveal-lazy-widgets/measurements.md

## Phase 2: Foundational (US1 və US2-ni bloklayır)

- [X] T002 Create product-rest/web-cbar-new/src/shared/constants/motion.ts with `LAZY_ROOT_MARGIN = '100% 0px'`, `REVEAL_ROOT_MARGIN = '0px'`, `REVEAL_STAGGER_MAX_STEPS = 8`, `REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'`, each with an English doc-comment citing spec 049 and the 8 × 60 + 450 = 930 ms budget (contracts/ui-contract.md §5)
- [X] T003 [P] Create the controllable IO stub product-rest/web-cbar-new/src/shared/testing/intersection-observer.ts: `installIntersectionObserver({ initiallyVisible?: (el) => boolean })` stubs the global via `vi.stubGlobal`, fires the initial callback per target on `observe`, and returns `{ enter(el), leave(el), observerCount(), restore() }`; not added to setup.ts (research R9)
- [X] T004 Implement product-rest/web-cbar-new/src/shared/lib/viewport-observer.ts: `observeViewport(el, rootMargin, cb) → unobserve`, one `IntersectionObserver` per `rootMargin` (`threshold: 0`), `initial: true` on a target's first entry, disconnect and drop the pool entry when the last target leaves, synchronous `{ isIntersecting: true, initial: true }` when `IntersectionObserver` is undefined (contracts §1, research R1)
- [X] T005 [P] Test product-rest/web-cbar-new/src/shared/lib/viewport-observer.test.ts with the T003 stub: same margin shares one observer, different margins get two, the initial entry is flagged, last unobserve disconnects, no-IO calls back immediately
- [X] T006 Implement product-rest/web-cbar-new/src/shared/lib/use-in-view.ts: `useInView(ref, { rootMargin, once })` returns `false` on server and first render, `true` once intersecting, stays `true` and unobserves when `once` (contracts §2)
- [X] T007 [P] Test product-rest/web-cbar-new/src/shared/lib/use-in-view.test.tsx: renders a probe component; false before entering, true after `enter`, still true after `leave` with `once`, true straight away without IO

**Checkpoint**: görünürlük qatı hazırdır və testlidir.

## Phase 3: User Story 1 — ağır bloklar ekrana yaxınlaşanda yüklənir (P1) 🎯 MVP

**Goal**: ECharts kodu və `init` yalnız qrafik görünən sahəyə bir ekran qalanda başlayır; skeleton yer tutur.

**Independent Test**: IO stub ilə `Chart` render olunur — görünməyəndə skeleton var və ECharts init olunmur; `enter`-dən sonra qrafik
konteyneri hazırdır; IO yoxdursa dərhal yüklənir. Brauzerdə quickstart §2.

- [X] T008 [US1] Gate the ECharts import effect on `useInView(containerRef, { rootMargin: LAZY_ROOT_MARGIN, once: true })` in product-rest/web-cbar-new/src/widgets/chart-card/chart.tsx: the effect depends on `inView`, returns early while false, keeps the skeleton and `style={{ height }}` unchanged; observe the outer `data-slot="chart"` box (always laid out) rather than the canvas div; translate the file's Azerbaijani comments to English
- [X] T009 [P] [US1] Add product-rest/web-cbar-new/src/widgets/chart-card/chart.test.tsx: mock the `echarts/*` leaf modules (`vi.mock`) with a spy `init`; with the T003 stub and the chart off-screen the skeleton (`aria-label`) is shown and `init` is not called; after `enter` `init` is called once and the skeleton is gone; after `leave` + `enter` `init` is still called once; without IO `init` is called on mount
- [X] T010 [US1] Check that existing chart consumers need no change and their tests still pass (no IO in jsdom → immediate load): product-rest/web-cbar-new/src/widgets/home-cards/statistics-panels.tsx, product-rest/web-cbar-new/src/views/statistics/index.tsx, product-rest/web-cbar-new/src/views/azir/index.tsx, product-rest/web-cbar-new/src/widgets/chart-card/chart-card.tsx — run `npx vitest run src/widgets src/views` from PowerShell

**Checkpoint**: US1 ayrıca birləşdirilə bilər (reveal olmadan).

## Phase 4: User Story 2 — məzmun blokları scroll edəndə görünür (P2)

**Goal**: ortaq `Reveal` primitivi; birinci ekran animasiyasız, aşağıdakılar bir dəfə fade + sürüşmə ilə, kartlar stagger ilə.

**Independent Test**: IO stub ilə `Reveal` vəziyyətləri (data-model.md) və tətbiq yerlərində `data-reveal` atributu; brauzerdə quickstart §3.

### Tests

- [X] T011 [P] [US2] Write product-rest/web-cbar-new/src/shared/ui/reveal.test.tsx covering the data-model state machine: initially visible → `static` and unobserved; initially hidden → `pending`, `enter` → `shown`, `leave` + `enter` → still `shown`; `matchMedia(REDUCED_MOTION_QUERY)` true → `static` and the observer is never created; no IO → `static`; `index={20}` → `--reveal-index: 8`, no `index` → `0`; `as="li"` keeps `listitem` role and forwards `data-slot`/`aria-*`

### Implementation

- [X] T012 [US2] Implement product-rest/web-cbar-new/src/shared/ui/reveal.tsx (`'use client'`): props per contracts §3, state starts `static` (server and hydration match), effect returns early on reduced motion, else `observeViewport(ref, REVEAL_ROOT_MARGIN, …)` — initial visible → stay `static` + unobserve, initial hidden → `pending`, later intersecting → `shown` + unobserve; renders `data-reveal` and `style={{ '--reveal-index': Math.min(index ?? 0, REVEAL_STAGGER_MAX_STEPS) }}`
- [X] T013 [US2] Add the reveal CSS to product-rest/web-cbar-new/src/app/globals.css: `:root` vars `--reveal-duration: 450ms`, `--reveal-shift: 16px`, `--reveal-stagger: 60ms`; `[data-reveal='pending']` hidden state; `[data-reveal='shown']` transition with `calc(var(--reveal-index, 0) * var(--reveal-stagger))` delay (contracts §4; the guards are T018)
- [X] T014 [P] [US2] Wrap each block in `<Reveal>` in `AboutBlocks` in product-rest/web-cbar-new/src/widgets/about-blocks/about-blocks.tsx (no `index`, the `key` moves to `Reveal`); make sure no block kind renders its own Reveal inside (no nesting, research R8)
- [X] T015 [P] [US2] Replace each card `<li>` with `<Reveal as="li" index={index}>` in product-rest/web-cbar-new/src/widgets/news-grid/news-grid.tsx and product-rest/web-cbar-new/src/widgets/content-list/content-list.tsx, keeping `key` and existing classes
- [X] T016 [P] [US2] Replace each feed card `<li>` with `<Reveal as="li" index={index}>` in product-rest/web-cbar-new/src/widgets/home-cards/news-tabs.tsx (add the `map` index)
- [X] T017 [US2] In product-rest/web-cbar-new/src/views/home/index.tsx wrap the statistics tabs, promo banner, strategy docs + calendar and the hidden blocks (publications, useful links) in `<Reveal>` (move the container's classes or wrap the `SiteContainer`); leave the hero row and the media `<section>` unwrapped (its cards reveal themselves); translate the file's Azerbaijani comments to English

**Checkpoint**: reveal işləyir, amma US3 qoruyucuları (T018) olmadan birləşdirilmir.

## Phase 5: User Story 3 — JS-siz, çap, əlçatanlıq (P1, US2 ilə eyni MR-də)

**Goal**: gizli vəziyyət heç vaxt server HTML-ində, çapda, reduced motion-da və fokusda məzmunu gizlətmir.

**Independent Test**: `renderToString`-də `pending` yoxdur; brauzerdə quickstart §4.

- [X] T018 [US3] Add the guards to product-rest/web-cbar-new/src/app/globals.css: `[data-reveal='pending']:focus-within` visible; `@media (prefers-reduced-motion: reduce)` `[data-reveal]` `opacity: 1; transform: none; transition: none`; in the existing print block `[data-reveal] { opacity: 1 !important; transform: none !important }` (research R6)
- [X] T019 [P] [US3] Add a server-render test in product-rest/web-cbar-new/src/shared/ui/reveal.test.tsx: `renderToString` of `<Reveal>` and of `NewsGrid` with items contains `data-reveal="static"` and never `pending`, and the card text is present (SC-007)
- [X] T020 [P] [US3] Add a focus test in product-rest/web-cbar-new/src/shared/ui/reveal.test.tsx: a `pending` Reveal containing a link stays in the accessibility tree (`getByRole('link')` works) and `userEvent.tab()` focuses it

## Phase 6: Polish & sənədlər

- [X] T021 [P] Switch the duplicated reduced-motion queries to `REDUCED_MOTION_QUERY` in product-rest/web-cbar-new/src/widgets/hero-slider/hero-slider.tsx and product-rest/web-cbar-new/src/widgets/about-blocks/history-stepper.tsx (behaviour unchanged, their tests pass) — done in hero-slider only; history-stepper left as is, because the rule to translate a changed file's comments would turn a one-line change into 29 lines of comment rewrites
- [X] T022 [P] Document the two behaviours in product-rest/web-cbar-new/CLAUDE.md: `useInView`/`observeViewport` for heavy widgets, `Reveal` usage rules (no nesting, not on header/nav/footer/hero/dialogs, `index` for card lists), IO stub for tests
- [X] T023 [P] Add a one-line spec 049 bullet to the web-cbar-new section of CLAUDE.md (root) and a short section to business_logic/new_business_logic.md (charts load near the viewport; scroll reveal; no content or URL change)
- [X] T024 Run `npm run verify` in product-rest/web-cbar-new and `npx vitest run` under Node 22 (PowerShell); fix failures, including `no-magic-numbers`
- [X] T025 Run quickstart §2–§5 in the browser (390 / 744 / 1728, `/az` and `/en`), repeat the T001 measurements and append the before/after table and SC-001…SC-007 verdicts to specs/049-scroll-reveal-lazy-widgets/measurements.md; if SC-004 fails, tune only `LAZY_ROOT_MARGIN`

## Dependencies & Execution Order

- **Phase 1 (T001)** hər kod dəyişikliyindən əvvəl — sonra baza ölçmək mümkün deyil.
- **Phase 2** (T002 → T004 → T006; T003, T005, T007 paralel) US1 və US2-ni bloklayır.
- **US1 (Phase 3)** yalnız Phase 2-dən asılıdır; US2-dən müstəqildir və ayrıca birləşə bilər.
- **US2 (Phase 4)**: T012 → T013 → T014–T017. T014, T015, T016 fərqli fayllardır, paralel.
- **US3 (Phase 5)** US2-dən asılıdır və **onunla eyni MR-də** gedir: T018 olmadan `pending` çapda və reduced motion-da məzmunu gizlədə bilər.
- **Phase 6** sonda; T024 → T025.

## Parallel Example

```text
Phase 2: T003 (IO stub) ‖ T002 (constants); sonra T004 → T005 ‖ T006 → T007
US2:     T011 (testlər) ‖ T012; sonra T014 ‖ T015 ‖ T016, ardınca T017
US3:     T019 ‖ T020 (eyni fayl — ardıcıl yazılsa da olar), T018 ayrıca
Polish:  T021 ‖ T022 ‖ T023
```

## Implementation Strategy

1. **MVP = Phase 1 + 2 + US1**: performans qazancı, vizual dəyişiklik yoxdur, risk ən aşağıdır. Ayrıca MR kimi birləşə bilər.
2. **Sonra US2 + US3 birlikdə**: reveal və onun qoruyucuları bir MR-də.
3. **Polish**: sənədlər, verify, brauzerdə ölçmə və SC hökmləri.
