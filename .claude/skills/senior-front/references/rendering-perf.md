# Rendering strategies and performance patterns

From patterns.dev's rendering and performance chapters, updated for the App Router / RSC
era. Two halves: **where the HTML comes from**, and **what the browser has to download and
do afterwards**.

**Measure first.** No optimisation without a number: `next build` output (route sizes,
static vs dynamic), Lighthouse / PageSpeed for field-shaped lab data, the React Profiler for
render cost, `@next/bundle-analyzer` for what is actually in the bundle, and the Network tab
for waterfalls. An optimisation with no before/after number is a guess that added complexity.

---

## Part 1 — Rendering strategies

| Strategy | HTML built | Pick when | Cost |
|---|---|---|---|
| **CSR** | in the browser after JS loads | app behind a login, highly interactive, SEO irrelevant | worst LCP; blank until JS; heaviest bundle |
| **SSR** | per request on the server | content personalised or changing constantly, SEO matters | server cost per request; TTFB depends on your APIs |
| **SSG / Static** | at build time | content changes on deploy cadence (docs, marketing) | rebuild to change; not for per-user content |
| **ISR** | at build, revalidated in background | large mostly-static catalogues that change independently of deploys | stale window you must choose deliberately |
| **Streaming SSR** | server, flushed progressively with Suspense | one slow region should not hold the whole page | more boundaries to reason about; layout shift if unplanned |
| **RSC** | server components render on the server, never ship JS | default for anything non-interactive | mental model shift; serialisation boundary rules |

### React Server Components — the rules that actually bite
- **Server by default.** A component is a Server Component unless a `"use client"` file is
  in its import chain. Server Components ship **zero** JS to the browser.
- `"use client"` marks a **boundary**, not a file. Everything imported below it is client
  code. Putting it on a layout or page pulls the whole subtree into the bundle — the single
  most common cause of a bloated App Router app.
- Props crossing server → client must be serialisable. Functions, class instances and dates
  need care; pass ids and primitives, not closures.
- Interactive leaf pattern: keep the page a Server Component that fetches, and make only the
  interactive part (`<FilterBar>`, `<Chart>`) a client component receiving plain data.
- Server Components can `async`/`await` directly. Data fetching belongs there, not in an
  effect.

### Progressive / selective hydration
Streaming plus Suspense lets React hydrate regions as their HTML arrives, so a slow widget
does not block interaction elsewhere. In practice: wrap independent slow regions in
`<Suspense>` with a skeleton that reserves the right height (otherwise you trade a slow LCP
for a bad CLS).

### Choosing, in this repo
`web-cbar` is server-rendered with `cache: "no-store"` on purpose, so CMS edits appear
immediately — caching and revalidation are a later, deliberate step, not an oversight to
"fix" unprompted. `web-cbar-admin` is a Vite SPA behind a login: CSR is correct there, and
SEO/LCP concerns do not apply the same way — bundle size and interaction latency do.

---

## Part 2 — Loading and delivery patterns

### Import strategy
- **Static import** — default. Fine for anything on the critical path.
- **Dynamic import** — `next/dynamic` or `React.lazy` for heavy, rarely-used code. The
  canonical wins: chart libraries, rich-text editors, date pickers, maps, PDF viewers,
  modals, admin-only panels.
- **Import on visibility** — lazy-load below-the-fold widgets with `IntersectionObserver`.
- **Import on interaction** — load on hover/click/focus. Best for editors and dialogs: the
  user pays the cost only when they actually open the thing.
- **Route-based splitting** — automatic per route in Next.js; in the Vite SPA, use
  `React.lazy` per route element so the login screen does not ship the whole panel.
- **Bundle splitting** — separate what changes often from what does not, so cache hits survive
  deploys.
- **PRPL** — Push critical resources, Render the initial route, Pre-cache remaining routes,
  Lazy-load the rest. A checklist for the whole delivery story, not a single technique.

Concretely in this repo: TipTap + its extensions and ECharts are exactly the two candidates
for dynamic import — both are large and neither is needed on first paint.

### Resource hints
- **`preload`** — you *will* need it this navigation and it is discovered late (a font, the
  LCP image). Overuse steals bandwidth from what the parser already found.
- **`prefetch`** — you will *probably* need it next navigation, at idle priority. Next.js
  prefetches links in the viewport already; do not hand-roll a second layer.
- **`preconnect`** — for a third-party origin you will definitely hit, to pay DNS/TLS early.

### Bundle hygiene
- **Tree shaking** works only on ESM with no side effects. Deep-import or named-import from
  libraries that support it; check the package's `sideEffects` field before blaming the bundler.
- Audit before adding a dependency: is it 60 kB to do what 15 lines would? Check the install
  size and whether it ships ESM.
- Prefer `Intl` over date/number formatting libraries — it is already in the browser.
- Drop polyfills for browsers you do not support; check the build's browserslist target.
- Look at the `next build` route table after any dependency change; a jump in First Load JS
  is the signal.

### Images, fonts, third parties
- `next/image` for anything non-trivial: correct sizing, modern formats, lazy by default.
  Set `priority` on the LCP image **only** — marking everything priority means nothing is.
- Always give images intrinsic dimensions or an aspect-ratio box. Missing dimensions are the
  top cause of CLS.
- Self-host fonts (`next/font`), subset them, and use `font-display: swap` with a metrics-
  matched fallback so the swap does not shift layout.
- Third-party scripts (analytics, tag managers, chat widgets) are usually the largest single
  regression in an otherwise fast site. Load them with the lowest workable strategy
  (`next/script` `afterInteractive` / `lazyOnload`), and audit what they inject.

### Long lists
Virtualize (`@tanstack/react-virtual`) past a few hundred rows — this is Flyweight: render
the visible window, recycle the rest. Before that threshold, virtualization costs more in
complexity, focus and accessibility bugs than it saves. Prefer server-side pagination when
the API already supports it (this repo's admin list endpoints do).

---

## Part 3 — Runtime rendering cost

### Diagnosing re-renders
1. React DevTools Profiler → record the interaction → find the component with the highest
   self time and the largest commit.
2. Enable "Highlight updates" to see what re-renders that should not.
3. Only then change code.

### The usual causes, in order of frequency
- **Unstable props** — a new object/array/function literal every render. Fix by hoisting the
  constant out, or `useCallback`/`useMemo` where the identity genuinely must be stable.
- **Context too broad** — one context holding fast-changing and slow-changing values. Split it.
- **State too high** — a controlled input's state at page level re-renders the page per
  keystroke. Push it down into the field, or make the form uncontrolled and read on submit.
- **Derived state in effects** — an extra render pass every time (see `refactorings.md`).
- **Expensive render bodies** — heavy sorting/formatting per row. Precompute, or memoise the
  row component with a proper comparison.

### Memoisation, honestly
`useMemo`, `useCallback` and `React.memo` are not free: allocation, dependency comparison,
and a reader wondering why they are there. Use them when (a) the profiler shows real cost,
or (b) the identity must be stable for a dependency array or a memoised child to work at all.
`React.memo` on a component whose props change every render is pure overhead.

### Interaction latency (INP)
- Keep event handlers short; move heavy work off the critical path (`startTransition`,
  `useDeferredValue`, or a web worker for genuinely heavy computation).
- Debounce network-backed search inputs; keep the visible input itself instant.
- Never block the main thread with synchronous parsing of a large payload — page the API.

---

## Core Web Vitals → what actually moves each

| Metric | Dominant causes | First things to try |
|---|---|---|
| **LCP** | slow TTFB, render-blocking CSS/JS, unoptimised hero image, late-discovered font | server-render the hero, `priority` on the LCP image, preload the font, cut blocking JS |
| **INP** | long tasks, huge hydration, heavy handlers, oversized lists | split bundles, shrink client components, defer/transition heavy updates, virtualize |
| **CLS** | images without dimensions, injected banners, font swap, late-loading widgets | set dimensions/aspect-ratio, reserve space in skeletons, metrics-matched font fallback |

Watch after shipping: First Load JS per route from `next build`, LCP/INP/CLS from field data,
and error-boundary hit rate. Report the metric you expect to move **before** you make the
change — an optimisation you cannot measure is a refactoring at best.
