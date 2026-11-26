# Implementation Plan: Ağır blokların ekrana gələndə yüklənməsi və scroll reveal effekti

**Branch**: `049-scroll-reveal-lazy-widgets` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/049-scroll-reveal-lazy-widgets/spec.md`

## Summary

İki davranış bir görünürlük qatına söykənir: `shared/lib/viewport-observer.ts` (`rootMargin` üzrə paylaşılan `IntersectionObserver`
hovuzu, IO yoxdursa dərhal "görünür") və onun hook-u `useInView` (R1).

- **Lazy yükləmə**: `widgets/chart-card/chart.tsx`-in ECharts import effekti `useInView(…, { rootMargin: '100% 0px', once: true })` `true`
  olana qədər başlamır. Mövcud sabit hündürlüklü skeleton placeholder-dir, ona görə CLS dəyişmir. Bu, bütün qrafikləri (ana səhifə
  statistika panelləri, `/statistics`, `/statistics/azir`) əhatə edir. Video, canlı yayım və qalereya artıq tələb üzrə yüklənir, dəyişmir (R2, R3).
- **Reveal**: `shared/ui/reveal.tsx` client komponenti. Vəziyyət React state-dir (`data-reveal="static|pending|shown"`), server və hydration
  həmişə `static` (görünən) verir. Observer-in ilkin callback-i birinci ekranı (`static`, animasiyasız) aşağıdakılardan (`pending`) ayırır,
  sonrakı daxilolma `shown` edir. Animasiya, stagger, reduced motion, çap və `:focus-within` CSS-dədir (R4–R7). Tətbiq yerləri:
  `AboutBlocks`-un hər bloku, `NewsGrid`/`ContentList`/`NewsTabs` kartları (stagger), ana səhifənin hero-dan aşağı bölmələri; iç-içə yox (R8).

API, admin, DB, miqrasiya, yeni paket yoxdur.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 App Router (`web-cbar-new`).

**Primary Dependencies**: mövcud olanlar (`echarts` leaf modulları, `@cbar/lib-react-ui-kit`, Tailwind 4). Yeni runtime dependency yoxdur
(R1, R4: `react-intersection-observer` və animasiya kitabxanası rədd edildi).

**Storage**: yoxdur.

**Testing**: Vitest + Testing Library + MSW, jsdom. IO stub-ı yalnız lazım olan testdə (`shared/testing/intersection-observer.ts`), global
setup dəyişmir (R9). `npm run verify`; `test:run` Node 22 ilə də.

**Target Platform**: SSR sayt, müasir brauzerlər; IO olmayan mühitdə köhnə davranış.

**Project Type**: web — yalnız `product-rest/web-cbar-new`.

**Performance Goals**: açılışda yalnız birinci ekrandakı qrafiklər yüklənir (SC-001); CLS artmır (SC-003); placeholder adi scroll-da
≤ 300 ms görünür (SC-004); reveal 1 s-dən tez bitir (SC-005). Səhifə başına bir-iki observer.

**Constraints**: FSD (`shared` ← `widgets` ← `views`). Nonce CSP: inline `<script>` yoxdur; yalnız React `style` prop-u ilə CSS dəyişəni
(`style-src 'unsafe-inline'` artıq var). Spec 032: dəyərlər `shared/constants/motion.ts` və `:root` CSS dəyişənlərində. `prettier --write`
işlədilmir. Yeni kod şərhləri ingiliscə; dəyişilən faylda azərbaycanca şərhlər də ingiliscəyə çevrilir.

**Scale/Scope**: yeni 4 fayl (+ testləri), dəyişən ~8 fayl, `globals.css`; sənədlər: `web-cbar-new/CLAUDE.md`, root `CLAUDE.md` (bir bənd),
`business_logic/new_business_logic.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | `product-host`-da qarşılığı yoxdur, yeni UX davranışıdır; URL, menyu və məzmun dəyişmir, heç nə ləğv edilmir (spec "Əhatə") | Keçir |
| II | Bir komponent, bir MR; deploy sırasına təsir yoxdur | Keçir |
| III | Sayt API-yə əvvəlki kimi yalnız server-dən müraciət edir; brauzer heç nə çağırmır | Keçir |
| IV | Port və start sırası dəyişmir | Keçir |
| V | Sxem, `Cbar.Domain`, tərcümələr dəyişmir; yeni chrome etiketi yoxdur | Keçir |
| VI | Admin panelə toxunulmur | Keçir |
| VII | Public URL-lər, `/currencies/*.xml` dəyişmir; server HTML-in mətn məzmunu eynidir (SC-007) | Keçir |
| VIII | `npm run verify` + quickstart-da brauzerdə əl ilə yoxlama və Lighthouse baza/sonra ölçməsi | Keçir |
| Texnologiya yığını: "yeni runtime dependency yalnız spec ilə" | Yeni dependency yoxdur | Keçir |
| spec 032 | Rəqəmlər `motion.ts`-də və CSS dəyişənlərində | Keçir |

Faza 1-dən sonra yenidən yoxlandı: pozuntu yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/049-scroll-reveal-lazy-widgets/
├── spec.md
├── plan.md                 # bu fayl
├── research.md             # R1–R9
├── data-model.md           # Reveal və Chart vəziyyətləri
├── quickstart.md           # baza ölçməsi + yoxlama
├── contracts/ui-contract.md
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code

```text
product-rest/web-cbar-new/src/
├── shared/
│   ├── constants/motion.ts                 # NEW: LAZY_ROOT_MARGIN, REVEAL_ROOT_MARGIN, REVEAL_STAGGER_MAX_STEPS, REDUCED_MOTION_QUERY
│   ├── lib/viewport-observer.ts (+ .test)  # NEW: shared IO pool, no-IO fallback
│   ├── lib/use-in-view.ts (+ .test)        # NEW: useInView(ref, { rootMargin, once })
│   ├── ui/reveal.tsx (+ .test)             # NEW: <Reveal as index>
│   └── testing/intersection-observer.ts    # NEW: controllable IO stub for tests
├── app/globals.css                         # :root reveal vars, [data-reveal] rules, reduced-motion, print
├── widgets/
│   ├── chart-card/chart.tsx (+ test)       # import effect gated by useInView
│   ├── about-blocks/about-blocks.tsx       # each block in <Reveal>
│   ├── news-grid/news-grid.tsx             # <li> → <Reveal as="li" index>
│   ├── content-list/content-list.tsx       # <li> → <Reveal as="li" index>
│   └── home-cards/news-tabs.tsx            # feed card <li> → <Reveal as="li" index>
└── views/home/index.tsx                    # sections below the hero row in <Reveal as="section|div">
```

**Structure Decision**: yalnız `web-cbar-new`. Görünürlük və reveal `shared`-dədir, çünki bir neçə widget və view işlədir; `Chart` öz
widget-indədir. `section-shell` dəyişmir (R8).

## Complexity Tracking

Pozuntu yoxdur.
