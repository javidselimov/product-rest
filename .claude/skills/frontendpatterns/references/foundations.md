# Frontend Foundations — condensed reference

Source: paraphrased from frontendpatterns.dev (Den Odell), fetched 2026-10-08. Not verbatim.

## Architect mindset — /frontend-architecture-patterns, /how-to-be-a-frontend-architect

- Architecture = choosing options that minimise long-run cost (perf, flexibility, a11y, security, onboarding, upkeep). Good architecture makes the next feature easier; bad makes each one harder.
- Three levels: **foundations** (the why — fixed constraints), **guides** (the which/when — decision frameworks), **patterns** (the how — named reusable solutions). Foundations bound, guides steer, patterns fill in.
- Ask the architect questions: how does this limit future options? What does removing this library cost in two years? Does it fail gracefully? Can someone else maintain it?
- Prefer tradeoffs over "best practices": pick the option that causes least pain over ~2 years for *this* team. A deliberate tradeoff beats a clever abstraction applied blindly.
- Design for lifecycle, not the feature: reuse by other teams, growth, rollout, onboarding. A feature can work while its architecture fails (single-consumer assumptions that later need a 3x-cost migration).
- Scale people: Conway's Law applies. Test each decision by "does it make collaboration easier?" — clear ownership, parallel work, low cognitive load. Unowned shared code that people route around is an architectural failure.
- Start small: name two current constraints, formalise one pattern, document one recent tradeoff. Undocumented choices drift; inherited-by-accident structure is the default failure.

## Accessibility as a foundation — /foundations/accessibility-as-a-foundation

- Principle: a11y is part of "working", decided at the start; it shapes components, state, routing, data loading and tests. Semantic HTML is the shared base with progressive enhancement.
- Rules: `<button>` for actions, `<a>` for navigation, landmarks for structure, labelled form controls, tables only for tabular data. Native semantics before ARIA (ARIA's first rule).
- Bake a11y into component APIs: modal = focus trap, initial/return focus, Escape, `role=dialog`, labelledby/describedby; tabs = roving tabindex, arrows/Home/End, `aria-selected`; combobox = `aria-expanded`, `aria-autocomplete`, `aria-activedescendant`.
- Centralise announcements in the state layer (polite for routine, assertive for critical); on validation failure focus the first invalid field. On client navigation: move focus to new content, announce, update `document.title`.
- Checks: keyboard-only pass, screen-reader pass for dynamic content, axe/pa11y/Lighthouse for basics — automated tools never cover focus logic or announcement quality.
- Failure modes: div+onClick widgets, ARIA patched onto wrong elements, portaled modals without focus management, visual-only spinners/errors, focus left on clicked link after routing, a11y owned by one person.
- Tradeoff: more design effort per component up front vs. retrofits that cost engineer-months (one component = minutes, fifty = weeks). Put it in definition of done and PR templates.

## Component-driven architecture — /foundations/component-driven-architecture

- Principle: build bottom-up from self-contained units (markup + behavior + style) with explicit inputs (props/slots) and outputs (UI/events). Pages are assembly points, not the unit of construction.
- Narrow contracts and minimal knowledge: pass dependencies in; context/global access only as a visible, deliberate choice.
- Vary by composition (compound components, slots) rather than prop accumulation; switch from props to composition once variants multiply (3 sizes x 4 variants x 2 icon positions = 24 cases).
- State placement: as close to use as possible, lift only to nearest common ancestor, derive instead of copying, treat server data as a cache separate from client state.
- Self-check: one-sentence purpose without "and"; usable without knowing internals; publishable as a library. Red flags: tests need half the app mocked; a style change breaks behavior. Fix = split.
- Failure modes: leaky boundaries, configuration-monster components, over-lifted root state, duplicated derived state, wrong granularity (too fine or monolithic), implicit context dependencies.
- Tradeoff: choosing boundaries is the hard design work and decides maintainability; global state is sometimes needed but every piece couples components.

## Logical separation of concerns — /foundations/logical-separation-of-concerns

- Principle: still valid, but split by feature, not by language. Goal is cohesion — code that changes together lives together; one reason to change per unit.
- Inside components: container (fetch, state, rules) vs. presentational (props in, UI out); pure render; side effects (network, storage, analytics, timers) isolated in hooks/watchers/lifecycle.
- Also separate: generic infrastructure vs. domain specifics, business vs. presentation logic, fetching vs. display, app vs. UI state, global vs. local.
- At scale, give concerns layers: stores, routing that keeps views URL-agnostic, server-state caching libs, team boundaries (workspaces, module federation).
- Diagnostics: can one thing change without touching others? One-sentence description? Testable in isolation? Can people work in parallel without coordination?
- Failure modes: shotgun surgery (one feature across three tech files), components mixing display+auth+routing, duplicated logic, painful tests, ever-growing modules — usually boundaries in the wrong place.
- Tradeoff: tech-layer split keeps PE, separate CSS/JS caching, specialist teams; feature split suits interactive apps and product teams. Context (team size, codebase age) decides.

## Performance as a foundation — /foundations/performance-as-a-foundation

- Principle: speed is a design constraint fixed early by data loading, component boundaries and bundling; metrics proxy for respecting users' time.
- Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1 (also watch FCP, TBT). Budget total and per-route JS/CSS, first-load request count, image bytes, third-party cost — calibrated to real users' devices/networks.
- Enforce: CI fails on budget overrun (bundle analyzer, Lighthouse CI), RUM dashboards with regression alerts; regressions (e.g. +500ms LCP) block release. Unenforced budgets lose to deadlines.
- Critical path: inline critical CSS, `defer` scripts, async or remove third parties, defer non-essentials past first paint. Question each dependency; split by route and dynamic import; delay analytics and below-fold widgets.
- Images: AVIF/WebP, `srcset`/`<picture>`, `loading="lazy"`, `fetchpriority`, explicit width/height or aspect-ratio, placeholders.
- Perceived speed: skeletons, determinate progress > spinner > nothing, optimistic updates with rollback, hover prefetch, instant press feedback.
- Failure modes: "optimize later" (3MB bundle needs rearchitecture), client fetch after JS boot, cross-feature imports that block splitting, global state re-rendering unrelated trees, trusting lab scores, testing only on fast laptops.
- Tradeoffs: CSR (simple hosting, slow first paint, weak SEO) vs. SSR (fast paint, needs servers) vs. SSG/ISR/streaming; lab data is reproducible, field data is the truth — use both. A budget overrun forces an explicit choice: optimize, remove, or knowingly exceed.

## Resilience by design — /foundations/resilience-by-design

- Principle: failure is the normal operating condition; ask "what happens when this fails?" and control the outcome. Levels: fault tolerance, graceful degradation, error recovery, failure transparency.
- Rules: validate at every boundary (users, APIs, own storage); timeout on every operation; fallback for every external dependency (cache, defaults, reduced function).
- Containment: error boundaries aligned with what users perceive as separate sections; keep state local so bad data doesn't spread; circuit breakers stop hammering a failing service.
- Model uncertainty in data (`{ data, isLoading, error, lastFetched }`), give components explicit failure props/fallbacks, make invalid states unrepresentable (state machines), test 500s/malformed/timeout/offline as hard as success.
- UX: say what happened specifically, offer an action (retry), reassure work is safe, give a path forward. Persist drafts/form data to storage; loading states get progress, timeout messaging and cancel.
- Failure modes: catch-log-generic-message, one timeout blanking a page, malformed data crashing unrelated components, endless spinners, lost user input (fastest trust killer), messages that are vague or show stack traces.
- Tradeoffs: too few boundaries cascade, too many fragment the UI; prioritise by likelihood x damage x ease — handle common failures thoroughly, rare severe ones with a simple fallback, accept improbable ones explicitly.

## Progressive enhancement mindset — /foundations/progressive-enhancement-mindset

- Principle: HTML delivers content and core tasks, CSS adds presentation, JS adds richer behavior; no layer depends on a higher one working. Start from "what is the essential experience?" (not graceful degradation, which treats the baseline as an afterthought).
- Reliability order: HTML most forgiving, CSS fails visually, JS most fragile (one error or partial download stops a file).
- Rules: forms keep real `action`/`method`; links keep real `href`; JS intercepts (`preventDefault` + fetch / client router) rather than replaces. Feature-detect, never sniff, with a simpler fallback for the same function.
- Architecture defaults: every route returns full server HTML; URL and server state are authoritative; fetch on server then hydrate; critical paths (browse, cart, checkout) work at HTML level.
- Checks: JS disabled in devtools (blank page = fail), keyboard-only, 3G throttling, flaky network, script timeouts. Workflow: HTML works -> add CSS -> add JS -> verify each stage.
- Failure modes guarded against: CDN outages, proxies/ad blockers, mobile timeouts, a single uncaught error; fetch-on-mount empty HTML; client-only routing; JS-only forms; div soup. ~1.1% of GOV.UK visitors missed JS, mostly with JS enabled.
- Tradeoffs: needs SSR/real endpoints and layer-first thinking; it is one build (not three) and allows plenty of JS. Modern meta-frameworks support it; MPA vs. SPA is a false dichotomy. Note: the source does not argue the case for JS-dependent apps.
