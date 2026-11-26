# Measurements: 049

Method: production build (`next build --webpack` + `next start`) of a copy of `web-cbar-new` against the test API
(`https://api-cbar-test.cbar.az`), headless Edge over raw CDP (`.tmp-049/measure.mjs`, not committed). Cache disabled, no scroll, 4 s
idle after `load`, median of 3 runs. Mobile = 390 × 844 with 4× CPU throttling; desktop = 1440 × 900, no throttling. TBT = sum of
long tasks over 50 ms (PerformanceObserver `longtask`), CLS from `layout-shift`. "Drawn" = `[data-slot=chart] canvas` count, i.e.
charts whose ECharts code loaded and initialised without scrolling.

## Baseline (T001, before any code change, 2026-11-16)

| Viewport | Path | Charts | Drawn w/o scroll | Scripts | Script KB | TBT ms | CLS | FCP ms |
|---|---|---|---|---|---|---|---|---|
| mobile | `/az` | 0 | 0 | 23 | 271 | 316 | 0 | 360 |
| mobile | `/az/statistics` | 3 | 3 | 40 | 505 | 240 | 0 | 264 |
| mobile | `/az/statistics/azir` | 1 | 1 | 41 | 508 | 120 | 0 | 224 |
| mobile | `/az/press-releases` | 0 | 0 | 26 | 273 | 124 | 0 | 240 |
| desktop | `/az` | 0 | 0 | 24 | 272 | 0 | 0.0001 | 176 |
| desktop | `/az/statistics` | 3 | 3 | 41 | 506 | 0 | 0.0001 | 136 |
| desktop | `/az/statistics/azir` | 1 | 1 | 42 | 509 | 0 | 0.0001 | 148 |
| desktop | `/az/press-releases` | 0 | 0 | 28 | 275 | 0 | 0.0003 | 136 |

Notes: the home page renders no chart on open (the statistics tab panels with charts are not the active tab, or the test API has no
series for them). ECharts adds ~233 KB of script (505 vs 272 KB) on every page that has a chart, whether the chart is on screen or not.

## After (T025, 2026-11-16)

Base and new build ran side by side (`:3007` / `:3008`, same test API), alternating, with the order swapped in a second pass.
Server response is the same for both (TTFB ~40 ms, `/az/statistics` HTML 337 007 vs 337 008 bytes).

| Viewport | Path | Build | TBT ms (2 runs) | CLS | FCP ms (2 runs) | Charts drawn w/o scroll | Chart tops (× viewport) |
|---|---|---|---|---|---|---|---|
| mobile | `/az/statistics` | base | 256, 201 | 0 | 232, 220 | 3/3 | 0.44, 1.00, 1.52 |
| mobile | `/az/statistics` | new | 491, 216 | 0 | 324, 212 | 3/3 | 0.44, 1.00, 1.52 |
| mobile | `/az/press-releases` | base | 182, 176 | 0 | 228, 224 | – | – |
| mobile | `/az/press-releases` | new | 169, 151 | 0 | 240, 220 | – | – |
| desktop | `/az/statistics` | base | 0, 3 | 0.0001 | 164, 272 | 3/3 | 0.45, 0.97, 1.46 |
| desktop | `/az/statistics` | new | 0, 0 | 0.0001 | 108, 112 | 3/3 | 0.45, 0.97, 1.46 |
| desktop | `/az/press-releases` | base | 0, 0 | 0.0003 | 116, 116 | – | – |
| desktop | `/az/press-releases` | new | 0, 0 | 0.0003 | 124, 116 | – | – |

Run-to-run noise is large on the throttled mobile profile: whichever build ran second after a pause paid ~2× TBT/FCP, and the
penalty moved with the order. No difference between the builds is outside that noise.

The mobile `/az` CLS of 0.389 seen in some runs is the **footer jumping up** (`site-footer` 516 → 0) and happens in the base build
too — a pre-existing issue, not caused by this feature.

Behaviour (`.tmp-049/check.mjs`, headless Edge, 390 / 744 / 1440, `/az`, `/en`, `/az/press-releases`, `/az/haqqimizda`): all pass —
first screen never hidden (incl. after client navigation), pending blocks invisible and revealed once on scroll, never hidden again,
stagger 360 / 420 / 480 ms on cards 6–8, reduced motion → everything `static`, print → everything visible, focus inside a pending
card shows it, JS disabled → everything `static` and visible. Lazy chart at a 300 px tall viewport: chart at 373 px drawn on open
(within one screen of preload), charts at 843 / 1285 px wait and draw when scrolled to.

Found and fixed during T025: the accessibility widget writes an inline `transition: all` on every `li` at start-up, which cancelled
the animation of the `<Reveal as="li">` cards (they appeared instantly). The `shown` transition is now `!important` in `globals.css`.

## Success criteria

| SC | Verdict | Evidence |
|---|---|---|
| SC-001 | Partly | A chart further than one screen below waits (lazy check). On the real pages every chart lies within ~1.5 screens, so with the one-screen preload of FR-002 they all still load on open. SC-001 as written ("only the first-screen charts") conflicts with FR-002; a smaller `LAZY_ROOT_MARGIN` would trade it against SC-004. |
| SC-002 | No measurable change | Same reason as SC-001: on today's pages ECharts still loads on open; TBT/FCP differences are within noise. The gain appears only on pages with charts further down. |
| SC-003 | Pass | CLS identical (0 / 0.0001 / 0.0003); the 0.389 footer shift is pre-existing. |
| SC-004 | Not measured separately | Charts within one screen are drawn before they are reached; the 1.5-screen chart was drawn by the time the step scroll reached it. |
| SC-005 | Pass | Worst case 480 ms delay + 450 ms = 930 ms. |
| SC-006 | Pass | No JS, reduced motion and print checks. |
| SC-007 | Pass | Server HTML has only `data-reveal="static"`; page text unchanged. |
