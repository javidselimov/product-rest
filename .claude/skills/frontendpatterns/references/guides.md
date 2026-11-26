# Frontend Decision Guides — condensed reference

Source: paraphrased from frontendpatterns.dev/guides (Den Odell), fetched 2026-10-08. Not verbatim.

## Accessible interaction playbook — /guides/accessible-interaction-playbook

**Question:** how to keep dynamic UI (modals, submits, animation) accessible during interaction, beyond static semantics. A practice playbook, not an option comparison.

| Practice | Apply when | Limit / rule |
|---|---|---|
| Focus management | Modals, route changes, inserted content | One logical tab order per screen; open modal contains focus |
| Skip links | Pages with heavy navigation | At top of page |
| Keyboard operation | Anything mouse-operable | Enter/Space/arrows; visible focus; never hijack screen-reader keys |
| Keyboard shortcuts | Convenience only | Never the sole path; customisable/disable-able |
| Live regions | Toasts, errors, loading, confirmations | Not every state change; check translated length/truncation |
| Reduced motion | `prefers-reduced-motion` set | Drop decorative motion first; fade or instant instead |
| ARIA states | Custom widgets | Update immediately (stale states mislead); announce shortcuts in grids |

**Default:** specify focus moves, announcements and motion fallbacks in the spec/wireframes (unspecified = unbuilt); keyboard first.
**Red flags:** focus escaping modal; mouse-only actions; visual-only feedback; announcing everything; lagging ARIA; autoplay sound.
**Checks:** full flow with no mouse; weekly VoiceOver/NVDA/JAWS/TalkBack; axe in CI; integration tests assert focus.

## Building with progressive enhancement — /guides/building-with-progressive-enhancement

**Question:** how much may the app depend on JS, and how to layer behavior so core tasks survive script failure.

| Layer | Use | Don't | Tradeoff |
|---|---|---|---|
| 1. Core HTML (SSR content, POST forms, links) | Always | Skip only for inherently JS-only apps (realtime co-editing) | Works everywhere; full reloads |
| 2. Basic interactivity (fetch submit, routed links) | JS loaded and `fetch` exists | Without fallback — on error revert to native submit | Smoother; needs error wiring |
| 3. Rich features (live suggest, AbortController, debounce) | After feature-detecting required APIs | If core task would depend on it | Best UX; fail silently |

| Choice | Prefer | Avoid |
|---|---|---|
| Capability check | Feature detection | UA sniffing |
| History | `pushState`+`popstate` or Navigation API | Broken back button |
| JS requirement | Decided per surface (marketing JS-free, admin may require JS) | One implicit rule |

**Default:** markup + server routes working first, native `<button>/<input>/<a>`; baseline works without JS in current browsers. Fallbacks: no IntersectionObserver -> load images eagerly; client nav fails -> full reload; async submit fails -> native submit.
**Red flags:** blank page + spinner; client-only navigation; link interception ignoring Cmd/Ctrl+click or external links; untested fallbacks; baseline retrofitted late.
**Checks:** JS off; throttled network; old browser triggers fallbacks; document baseline assumptions ("needs Grid, not JS").

## Choosing a CSS strategy — /guides/choosing-css-strategy

**Question:** BEM, CSS Modules, Utility-first or CSS-in-JS for this team, tooling, design-system maturity and perf budget.

| Factor | Points to |
|---|---|
| Tight design+eng team | BEM; independent teams -> Modules / stronger isolation |
| Modern bundler (Vite/Next) | Modules trivial; custom/serverless SSR -> check CSS-in-JS runtime + hydration cost |
| Mature tokens | Utility-first or CSS-in-JS; no tokens -> naming convention first |
| Tight perf | Modules / Utility (ship only used CSS); CSS-in-JS may hurt CWV |

| Option | Use when | Avoid when | Tradeoff |
|---|---|---|---|
| BEM (global) | CSS without JS; shared UI across teams; refactoring legacy global CSS | No naming governance | Verbose; predictable ownership |
| CSS Modules | Plain CSS without collisions; cross-project component libs | Bundler lacks `.module.css` | Scoping without lock-in; still guard vs. third-party globals |
| Utility-first | Many variations; avoid naming debates; tokens exist; prototyping with purge | No design tokens | Fast; class sprawl; needs lint + token governance |
| CSS-in-JS | Truly runtime-dynamic styles (themes, user prefs, data); zero-runtime extraction or accepted cost | Only for colocation; custom properties suffice; tight budgets | Runtime overhead; memoise prop styles in long lists |

Quick: legacy global CSS -> BEM; shared lib -> Modules; prototyping -> Utility; dynamic theming -> CSS-in-JS after measuring custom properties first.
**Default:** no single winner; leans hybrid — most components in Modules, CSS-in-JS only where dynamic; one token source for all.
**Red flags:** `.a__b__c__d--x--y` chains; huge breakpoint-stacked utility strings; utilities without tokens; drifting values; undocumented mixed approaches.
**Next steps:** assess, document, lint-enforce, add style-guide examples, revisit.

## Choosing a frontend framework — /guides/choosing-a-frontend-framework

**Question:** which framework fits project, team, org. Most handle most work; differences are at the margins.
**Criteria, in weight order:** (1) rendering model (CSR/SSR/islands/signals — content sites -> SSR/islands, dynamic apps -> strong client state); (2) reactivity model (VDOM, compiler/runes, signals, observables); (3) ecosystem — audit needed libs are maintained; (4) hiring + team fluency (often outweighs tech); (5) viability (funding, governance, cadence, breaking-change policy, bus factor).

| Option | Use when | Avoid when | Tradeoff |
|---|---|---|---|
| React | Large teams, complex apps, max ecosystem/hiring | Team can't agree conventions | Biggest ecosystem; boilerplate, re-render footguns, decision fatigue |
| Vue | Conventions over config; backend/Laravel devs | Need widest library choice | Official router/state, easy onboarding; smaller ecosystem |
| Svelte/SvelteKit | Bundle-size-sensitive; experienced small teams | Aggressive hiring | Small/fast; few seniors; compile-time surprises |
| Angular | Enterprise, TS-first, guardrails, batteries included | Teams wanting freedom | Scales across contributors; steeper curve, larger bundles |
| Solid | React devs wanting fine-grained reactivity | Need mature ecosystem/hiring pool | Fast, React-like; immature |
| Astro/Fresh/Qwik | Content-first (marketing, docs, blogs) | Highly interactive SPAs | Minimal JS; Qwik resumes instead of hydrating |

**Default:** none universal — "the one your team can ship with"; React is the low-risk pick but safety alone shouldn't decide. Org: one primary covering ~80–90% + written exception process.
**Red flags:** hype-driven choice; accidental diversity with no policy; no early React conventions; ecosystem gap found months in; business logic tangled into UI; no idea how you'd migrate; judging hiring from social media, not local job boards.
**Migration-proofing:** keep framework code out of business logic, adapters/ports at boundaries, framework-independent data/state layer, record decisions.
**Checklist:** what we build / who builds / hiring market / lifespan (short = speed, long = maintainability) / migration acceptable? / ecosystem verified.

## Choosing a networking style for realtime apps — /guides/choosing-a-networking-style-for-realtime-apps

**Question:** which transport fits what "realtime" really means for users, given infra and team ops capacity.
**Classify first:** periodic freshness (seconds–minutes OK) / live updates (~1–2s) / realtime collaboration (100s of ms) / offline-capable collaboration.

| Option | Use when | Avoid when | Tradeoff |
|---|---|---|---|
| Polling | Rare changes; multi-second latency OK; persistent connections hard | Co-editing; latency complaints at min interval | Wasted requests, load scales with users; simple retry |
| SSE | Mostly server->client; lower latency than polling; less infra than WS | Frequent client->server messages | Plain HTTP via proxies/CDNs; old proxies buffer; replay via last-event-id |
| WebSockets | Frequent bidirectional sub-second messages (chat, games, collab) | One-way or infrequent updates (common overuse) | Memory per connection; sticky sessions/broker; heartbeats; exp. backoff reconnect |
| CRDT/OT | True concurrent edits, auto-merge; CRDT for offline | No real concurrent editing | Very complex; OT needs central server; CRDT growth/odd merges; use Yjs/Automerge/ShareDB |

Quick: minutes-stale OK -> polling; server push -> SSE; two-way low latency -> WS; co-editing -> CRDT/OT library; offline sync -> CRDT; restricted corporate networks -> polling/SSE.

| Conflict strategy | Use when | Watch |
|---|---|---|
| Last-write-wins | Low-stakes, rare conflicts, per-field (settings, status) | Silent loss — return current value on reject |
| User-resolved | Valuable effortful content (comments, docs) | Interrupts; show diffs, "keep both" |
| Locking | Long exclusive edits (form builders, wizards) | Stale locks — expiry, heartbeat, show holder, admin break |
| CRDT/OT | Expected live collaboration | Divergence; show sync status |

**Default:** start with polling; move up only on measured pain. SSE is the sweet spot for most push. Offline: design from day one or skip. Serverless lacks persistent connections. Mix per feature, but one channel per piece of data.
**Red flags:** WS for a pollable dashboard; polling a collaborative editor; hand-rolled CRDT/OT; same data on several channels. **Switch signals:** latency at min interval, cost growing while data static, overwritten work, connection debugging dominating (step down), offline becoming important.
**Checklist:** real latency need (test with delays), flow direction, concurrency handling, offline, infra support, team can operate it, networking hidden behind an interface.

## Choosing a state management approach — /guides/choosing-a-state-management-approach

**Question:** where does this piece of state live and which tool owns it? Classify the state; the tool follows. Weigh app complexity, team size, lifecycle, perf sensitivity.

| State type | Examples | Trait |
|---|---|---|
| UI | Open dropdown, active tab | Short-lived, local |
| Form | Values, errors, submit status | Validation, dirty tracking |
| Server | Cached API data | Stale-able, refetch, changed by others |
| Client | Prefs, drafts | App-owned |
| URL | Filters, page | Shareable; if losing it on refresh annoys users, put it in the URL |

| Option | Use when | Avoid when | Tradeoff |
|---|---|---|---|
| Local | One consumer; reset on unmount OK | Many consumers | Simplest; local->shared is easy, reverse is hard |
| Lifted | Siblings share; clear ancestor; drilling <= ~3 levels | Deep drilling, no ancestor | Framework-agnostic |
| DI / Context | App-wide, rarely changing (theme, locale, user) | Frequently updating (inputs, loading flags) | No drilling; React re-renders all consumers |
| Global store (Redux, Zustand, Pinia, XState…) | Many unrelated consumers, many update sources, need tracing/devtools, many devs | Modest coordination (most apps) | Concepts + code + hidden simple ops |
| Server-state lib (TanStack Query, SWR, Apollo) | API data shown in several places; caching, refetch, optimistic | Non-API client state | Dedup, background refetch; separates server/client |
| Form lib (RHF, TanStack Form…) | Many fields, async/interdependent validation, multi-step | 2–3 simple fields | Best practices baked in; API to learn |

**Default:** start local; escalate only on friction felt now, not anticipated. Typical mix: local toggles, lifted small groups, server-state lib for API data, form lib for complex forms, DI sparingly, global store only when coordination demands.
**Red flags:** heavy tooling before needs known; server data treated as client state; fast-changing state in context; props through 3+ non-using layers; duplicated drifting data; 4–5 interacting providers (use a library); multi-state coordinated updates (use reducer/library).
**Checklist:** type? consumers (1 / few related / many unrelated)? change frequency? from API? wrap access in functions/composables so the backing can change.

## Designing component APIs — /guides/designing-component-apis

**Question:** how should a component expose control — props, slots, render props, compound components, callbacks, controlled/uncontrolled? First classify: presentation, container, layout, behavior.

| Option | Use when | Avoid when | Tradeoff |
|---|---|---|---|
| Props | Simple values, finite known config, one-way flow | > ~7–8 props or consumer must control what renders | Simplest; group/split/move to slots as it grows |
| Slots | Fixed structure, varying content | Injected content needs child internal state | Parent picks content, child picks placement |
| Render props | Child has data/state parent must render with; one logic, many visuals | Plain injection suffices | Component owns logic, consumer owns markup; complexity |
| Compound | Related parts share state, clear hierarchy, markup-like API | Parts not always used together | Ergonomic; implicit coordination is less visible |
| Callbacks | Child informs parent | — | Document payload (value/event/both); follow framework naming |
| Controlled + uncontrolled | Component sometimes owns state (inputs, disclosures) | Accidental mixing | Simple stays simple, full control possible |
| Generics | Data-driven multi-type (`Table<T>`) | — | Type safety into callbacks/render props |

**Controlled/uncontrolled recipe:** accept `value`-style prop + `default*` prop; init internal state from default; controlled iff controlled prop is defined; read controlled value else internal; always fire change callback, update internal state only when uncontrolled.
**Default:** start with props; escalate props -> slots (props restrictive) -> render props (slots need internal state) -> compound (parts coordinate implicitly); stop at the simplest that works; combining is normal. Common case easy, complex possible; sensible defaults; ship minimal API (adding is easier than removing).
**Red flags:** ~15+ props; repeated variant-prop requests (want slots); same boilerplate at every call site (wrong defaults); frequent type errors (unclear contract); proliferating thin wrappers; mixed control modes.
**Checklist:** required only if unusable without; customisation points = what varies; props/slots/render-props by content kind; state ownership decided; typed callbacks; minimal usage = minimal config.

## Managing AI response states — /guides/managing-ai-response-states

**Question:** how to represent slow, streamed, non-deterministic, stoppable, refusable model output. loading/success/error is insufficient and looks broken.

| State | UI | Avoid |
|---|---|---|
| idle | Empty state; suggested prompts only in new chat | Big empty state mid-conversation |
| submitted | Echo prompt immediately, lock submit | Waiting for first token to change screen |
| thinking | Dedicated indicator + polite live region | Generic or silent spinner |
| streaming | Incremental render; auto-scroll until user scrolls up; hold incomplete markdown; primary action = Stop | Buffering to end; re-parsing breaking fences; forced scroll |
| complete | Follow-up + regenerate | — |
| stopped | Keep partial text, offer restart | — |
| error | Retry, by failure type | — |

Regenerate re-enters at `submitted`. One state machine per generation; status per message.

| Failure | Handle | Don't |
|---|---|---|
| Mid-stream disconnect | Keep tokens, mark interrupted, continue/regenerate | Discard visible text |
| Refusal/moderation | Normal message + explanation + next step | Red error toast |
| 429/overloaded | Exp. backoff + calm "busy, retrying" | Hard failure |
| Context length exceeded | Distinct message; summarise/trim history | Retry or lump with network errors |

**Default:** model all states incl. `thinking`/`stopped`; design end states before happy path; Stop backed by real `AbortController`; keep prior answers on regenerate.
**Red flags:** loading/done only; Stop that only hides output; new prompt allowed mid-stream; Stop disabled with input; regenerate overwrites; refusals as errors.
**Tests:** controllable fake stream (timed, early stop, stall pre-first-token, mid-stream fail); every state viewable without a real model; Stop truly aborts; partial text survives error.

## Managing async UX states — /guides/managing-async-ux-states

**Question:** how to represent each async operation so the UI stays trustworthy on slow/unreliable networks.
**States to handle explicitly:** idle, pending, success, empty, partial, failed.

| Indicator | Use | Not for |
|---|---|---|
| Small spinner | Button-level actions | Large regions |
| Skeleton | Content regions on first load | Refreshing already-seen data |
| Full-page overlay | Critical operations | Routine actions (blocks UI) |
| Subtle refresh indicator | Updating visible data | First load |
| Optimistic update | Predictable outcomes | — (must keep prior state + revert) |

No timing thresholds given — only: slow feedback causes double clicks; silent long retries look frozen.

| Concern | Option |
|---|---|
| Containment | Component-level async boundary + route-level error page together; log every trigger |
| Large forms | Split requests so the failing section is identifiable (not one big request) |
| Transient failure | Exponential backoff, visible status + attempts left |
| Filter/search/navigation | Cancel stale requests so old responses can't overwrite new |

**Default:** define all six states with design before coding; skeleton first load, subtle refresh after; optimistic with rollback; disable conflicting actions / label "saving" while in flight.
**Red flags:** only loading+success; generic errors; no immediate feedback; wiping UI on refresh; immediate/silent retries; no cancellation; rising in-flight count in prod; testing only on fast local.
**Checks:** logs carry endpoint, duration, code, retry outcome; integration tests for slow + 5xx; specific actionable copy.

## Securing frontend data flows — /guides/securing-frontend-data-flows

**Question:** how to stack client defenses so one failing layer is caught by another (not pick one). Step 0: map entry points (forms, URL params, CMS content, third-party scripts; extra scrutiny for money/admin), where session data lives, rendering mode, every `innerHTML`/`dangerouslySetInnerHTML`/direct DOM write.

| Layer | Use | Limit | Tradeoff |
|---|---|---|---|
| CSP | First line: restrict script sources | Won't catch everything | Start strict, relax selectively; report monitoring |
| SRI | CDN/third-party scripts | Integrity only, not behavior | Maintain hashes |
| Input sanitization | On arrival; all input untrusted | Still need output encoding | Test the sanitizer |
| Output encoding | At render, last checkpoint | — | Content shows as text |
| Trusted Types | Enforce safe DOM sinks app-wide | — | Need helpers producing `TrustedHTML` |
| CSRF token + SameSite | Every state-changing request | Complementary, not substitutes | Attach per call, expire with session |
| Token storage | Per threat model | — | `HttpOnly`+`Secure` cookies keep tokens from JS |
| PII redaction | Before logs/analytics/error trackers | — | Less exposure |

| Goal | Patterns | Stops |
|---|---|---|
| Restrict scripts | CSP, SRI | Injected/tampered scripts |
| Clean/escape | Sanitize, encode | Stored/reflected XSS |
| Safe sinks | Trusted Types | Accidental unsafe render |
| Validate requests | CSRF, SameSite | Forged writes |
| Protect data | Token storage, PII redaction | Token theft, leaks |

**Default:** CSP `default-src 'self'` + reporting; HttpOnly Secure cookie tokens; one sanctioned HTML-render path; CI fails on known-vulnerable deps.
**Red flags:** single-layer reliance; unreviewed `innerHTML`/`eval` (lint them); tokenless submit succeeding; security relying on memory; fixing one instance not the root cause; CSP violation spikes; no sanitizer tests.
**Maintain:** audit deps every build; verify CSP headers in CI; track violations per route; update sanitizer/encoder/CSP/TT together on a fix.

## Testing confidence ladder — /guides/testing-confidence-ladder

**Question:** how to layer tests for trust without a slow, brittle suite (not all-UI, not nothing).

| Rung | Catches | Cost | When |
|---|---|---|---|
| Logic (state, reducers, hooks) | Pure logic bugs, no DOM | Fastest | Every commit |
| Component | Render, clicks, validation of one piece | Fast (suite in seconds) | Every commit |
| Integration | Routing, fetching, shared state, analytics across components | Slower, flake risk | Critical journeys only; on PRs |
| Visual regression | Unintended UI/CSS change | Slower | Design-system components + key pages, themes x sizes; on PRs |
| Accessibility | Automated: ARIA, contrast, keyboard; manual: screen reader | Auto cheap, manual costly | Full audit before release |

**Default:** pyramid; ~one integration test per critical journey (login, checkout, onboarding); mock network with MSW but keep routing/state/components real; automated + manual a11y. "The best suite is one your team actually runs."
**Red flags:** everything at UI level; giant pasted JSON fixtures; over-mocking; asserting implementation details; component suite taking minutes; too many integration tests; tolerated flaky tests (worse than none); coverage % as goal; silently broken analytics.
**Practices:** zero-config builders with overrides (`buildUser({ role: 'admin' })`) colocated with models; test what users see/do; track per-critical-flow coverage across component/integration/visual/a11y — a missing layer is a gap; fix or delete flakes same day.
