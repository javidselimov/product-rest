---
name: frontendpatterns
description: >-
  Frontend architecture pattern catalog distilled from frontendpatterns.dev — foundations
  (accessibility, performance, resilience, progressive enhancement, separation of concerns),
  decision guides (state management, CSS strategy, component APIs, async/AI response states,
  realtime networking, securing data flows, testing ladder) and 41 atomic patterns across
  accessibility, components, performance, resilience, routing, security, styling and testing.
  Use when choosing which pattern fits a UI problem, designing a component API, handling
  loading/error/retry/streaming states, hardening a frontend (XSS, CSRF, CSP, tokens), or when
  a review needs the name of the missing pattern. Complements `senior-front` (smells/refactors).
---

# Frontend Patterns

A pattern is a named, atomic, non-opinionated technique: a **problem**, a **solution**, the
**wrong choice** (when not to use it) and its **tradeoffs**. Use this skill to pick the pattern
that fits, not to apply every pattern. Source: <https://frontendpatterns.dev> (Den Odell);
the references below are paraphrased summaries — open the page for full examples.

## Operating stance

- **Foundations before patterns.** Accessibility, performance and resilience are properties
  of the whole system, not features added at the end. Patterns are how you deliver them.
- **Start from the problem, not the pattern.** State the symptom first ("search fires one
  request per keystroke"), then name the pattern ("Debounce, 150–300 ms").
- **Always read "The Wrong Choice".** Every pattern has a context where it hurts — e.g.
  throttle beats debounce for scroll-spy; memoization without a measurement is noise.
- **Platform first.** Semantic HTML, native form validation, `<dialog>`, `<details>`, links
  that work without JS — then enhance. Progressive enhancement is the default mindset.
- **State every tradeoff in one line** when you apply a pattern.

## The loop

1. **Symptom** — what the user or the reviewer actually sees / measures.
2. **Category** — find it in the router below; for an open decision, read the guide first.
3. **Pattern** — read only that entry: problem, solution, wrong choice, checks.
4. **Fit to this repo** — use the existing slot (see "This repository") before adding one.
5. **Verify** — the entry's *Checks* list + the project's `npm run verify`.

## Decision rules

- **Async UI has four states**: idle, loading, success, error — plus *empty*. Model them as
  a discriminated union; never `isLoading && !error && data` boolean soup.
- **Boundaries contain failure.** An error boundary per independent widget, an async
  boundary (Suspense) per independent data dependency. One failing block ≠ blank page.
- **Retry only idempotent, transient failures** (network, 5xx, 429) with exponential backoff
  + jitter + a cap + `AbortController`. Never retry 4xx validation errors.
- **Debounce input, throttle continuous streams**, always clear timers on unmount.
- **Split by route first**, then by heavy, below-the-fold or interaction-only widgets.
  Lazy-load images/iframes with explicit dimensions so layout does not shift.
- **Memoize after profiling**, and only pure computations with stable inputs.
- **Focus is state.** Moving to a new view, opening/closing a dialog, or deleting an item
  must put focus somewhere deliberate. Modals trap focus and restore it on close.
- **Announce what sighted users see change**: async results, errors, toasts → live regions
  (`polite` by default, `assertive` only for urgent errors).
- **ARIA last.** First rule of ARIA: a native element beats a role. No ARIA is better than
  wrong ARIA.
- **Encode on output, sanitize untrusted HTML, never trust the client.** Validation in the
  browser is UX; the server is the security boundary.
- **Tokens never in `localStorage`.** Access token in memory, refresh in an `HttpOnly;
  Secure; SameSite` cookie; state-changing requests need CSRF protection when cookies auth.
- **Component APIs**: few props, sensible defaults, composition (children/slots) over
  configuration flags; boolean props that combine into impossible states → a variant union.

## Reference router

Read the one file you need; do not preload them all.

| Question in front of you | Read |
|---|---|
| Architecture mindset, the six foundations | `references/foundations.md` |
| "Which approach should I pick?" (state, CSS, framework, realtime, component API, async/AI states, security flows, testing) | `references/guides.md` |
| Forms, ARIA, focus, focus trap, keyboard, live regions | `references/accessibility.md` |
| Component design, purity, container/presentational, barrels, semantic HTML, SRP, routing, scoped CSS, component tests | `references/components.md` |
| Code splitting, debounce, lazy loading, memoization; error/async boundaries, loading, retry; streaming, stop, regenerate, thinking indicator | `references/performance-resilience.md` |
| CSP, CSRF, sanitization, output encoding, PII redaction, SameSite, token storage, SRI, Trusted Types | `references/security.md` |

## Output contract

**When choosing:** the pattern name + URL, why it fits this symptom (one line), the wrong
choice you rejected, and the tradeoff accepted.

**When reviewing:** `<missing/misused pattern> — file.tsx:120 — <fix> — <impact if left>`,
ordered security → accessibility → resilience → performance → structure.

## This repository

Frontends live in `product-rest/` (both FSD: `app → views/pages → widgets → features →
entities → shared`, `@cbar/lib-react-ui-kit`, Vitest + MSW). Read each project's
`CLAUDE.md` first; gate every change with `npm run verify`.

- **web-cbar-new** (Next.js 16 SSR public site) — CSP with a nonce is built in `src/proxy.ts`
  / `src/shared/config/security-headers.ts`; `src/widgets/cms-content/cms-content.tsx` is the
  **only** `dangerouslySetInnerHTML` (CMS HTML via `src/shared/lib/cms-html.ts`). Error
  boundary: `src/providers/error-boundary.tsx`, route states: `src/shared/ui/route-states.tsx`.
- **web-cbar-admin-new** (Vite + TanStack Router CMS panel) — Secure Token Storage is
  already done: access token only in memory (`features/auth/model/auth-store.ts`), session
  restored via `HttpOnly` refresh cookie. Untrusted HTML preview goes through
  `shared/lib/sanitize-html.ts`. Chunk-load failures recover in `shared/lib/chunk-reload.ts`.
- Do not add a second HTML sink, a second fetch wrapper or token persistence — extend the
  existing slot. The legacy `web-cbar` / `web-cbar-admin` are frozen until cutover.
