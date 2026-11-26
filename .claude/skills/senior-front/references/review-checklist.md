# Frontend review pass

A gated review, ordered by severity. Work the gates in order and **stop reporting style
issues once you have found a correctness or accessibility defect** — mixing a `key={index}`
bug with a naming preference in one list buries the bug.

Every finding needs three things: a **name**, **evidence** (`file.tsx:line`), and the
**fix**. A finding you cannot point at is a feeling, not a review.

```
<smell or defect> — file.tsx:120 — <refactoring / concrete fix> — <impact if left>
```

---

## Before you start

1. Read the diff **and** the surrounding file. A change that is fine alone can be wrong in
   context.
2. Find the call sites of anything whose signature changed.
3. Ask what the change is for. A review that ignores intent proposes the wrong redesign.
4. Note what you cannot verify (no test suite here) and say so rather than implying you ran
   something.

---

## Gate 1 — Correctness

- [ ] **List keys** stable and unique? `key={index}` on anything reorderable/filterable is a
      real bug: wrong row state, lost focus, wrong animations.
- [ ] **State derivable from props/state** stored instead of computed? (Effect-as-derivation.)
- [ ] **Effects**: honest dependency arrays, cleanup for every subscription/timer/listener,
      no suppressed `exhaustive-deps` without a justified comment.
- [ ] **Race conditions**: does a slower earlier request overwrite a newer one? Is there an
      `AbortController` or a request-id guard?
- [ ] **Loading / empty / error** all handled? An error that blanks the whole page instead of
      one widget?
- [ ] **Nullability**: are `!`, `as` and optional chains hiding a case that will occur in
      production? Bilingual content here can legitimately be filled in one locale and blank
      in the other — is the blank case handled?
- [ ] **Boundary values**: empty array, single item, very long string, `0`, negative numbers,
      missing translation, unauthenticated user.
- [ ] **Mutation**: is a prop, state object, or a `sort`/`reverse` target being mutated in place?
- [ ] **Controlled inputs**: no switch between controlled and uncontrolled across renders.
- [ ] **Types**: any new `any`, `!`, or `@ts-ignore`? Do the types actually describe the API
      response, or were they wished into existence?
- [ ] **Security**: `dangerouslySetInnerHTML` with unsanitised input, tokens in
      `localStorage` without a considered reason, secrets in client bundles, `target="_blank"`
      without `rel="noopener"`.

## Gate 2 — Accessibility

- [ ] Semantic element for the job (`<button>` for actions, `<a href>` for navigation)?
- [ ] Every interactive element reachable and operable by keyboard, in a sensible order?
- [ ] Visible focus preserved (no bare `outline: none`)?
- [ ] Every input labelled; every icon-only button named?
- [ ] Dialogs/menus: focus trapped, `Escape` closes, focus restored on close?
- [ ] Heading levels form an outline; no level skipped for styling?
- [ ] `alt` present and meaningful (or intentionally empty for decoration)?
- [ ] Async state announced, not just spun (`aria-live` / `aria-busy`)?
- [ ] Colour not the only carrier of meaning; contrast adequate?

## Gate 3 — Performance

Only report what you can point at. "This might be slow" is not a finding.

- [ ] Is `"use client"` as low in the tree as possible, or has it landed on a layout/page?
- [ ] Any heavy dependency (editor, chart, map, PDF) imported statically into a common path?
- [ ] Fetch waterfalls — sequential awaits with no data dependency?
- [ ] New dependency: what does it add to First Load JS? Does the same thing exist natively
      (`Intl`, `URLSearchParams`, `structuredClone`)?
- [ ] Long list without pagination or virtualization?
- [ ] Images with dimensions/aspect-ratio (CLS), `priority` on the LCP image only?
- [ ] Memoisation added without a measurement — or missing where a dependency array
      genuinely needs a stable identity?
- [ ] Context value changing on every render, re-rendering every consumer?

## Gate 4 — Structure

Name the smell (`code-smells.md`), then the refactoring (`refactorings.md`).

- [ ] Does this component change for more than one reason (Divergent Change)?
- [ ] Did this change touch six files to add one field (Shotgun Surgery)? Would a
      declarative config have made it one?
- [ ] New abstraction with a single call site (Speculative Generality)?
- [ ] Third copy of the same logic (Duplicate Code) — or only the second, where duplication
      is still cheaper than the wrong abstraction?
- [ ] Props: minimal, typed, no leaked implementation detail, no clumps that want one object?
- [ ] Is data fetching separated from presentation where the component is large enough to
      care?
- [ ] Does it reach into another module's internals (Inappropriate Intimacy) or walk long
      chains (Message Chains)?
- [ ] Pass-through layers that add nothing (Middle Man)?
- [ ] Does it fit the patterns already in this codebase, or fork the skeleton? (In
      `web-cbar-admin`: is this a hand-written page that a `src/modules/*.ts` config could
      express?)

## Gate 5 — Style and naming

Only after the gates above are clean. Group these as one short trailing note.

- [ ] Names say what the thing is (`invoice`, not `data`; `useInvoices`, not `useFetch`).
- [ ] Booleans read as assertions; handlers are `onX` / `handleX`.
- [ ] Filename matches the export; component in `PascalCase`.
- [ ] Dead code, commented-out JSX, unused exports removed?
- [ ] Comments explain *why*; none restate the code; `TODO(compat)` / `TODO(devops)` markers
      left intact.
- [ ] Anything here that ESLint/Prettier could enforce instead? Say so once and move on.

---

## Repo-specific checks

**web-cbar**
- [ ] Was `web-cbar/AGENTS.md` respected — Next 16 conventions, not remembered ones?
      (Middleware is `src/proxy.ts` exporting `proxy()`.)
- [ ] All fetching through `src/lib/api.ts`? `getJson` where a failure should hit the error
      boundary, `getJsonOrNull` → `notFound()` where 404 is a legitimate outcome?
- [ ] Was `cache: "no-store"` changed? It is deliberate — CMS edits must appear immediately.
- [ ] Route params decoded (`decodeURIComponent`) before being sent to the API; search params
      normalised (they can arrive as `string[]`)?
- [ ] Both locales handled? Chrome labels in `src/lib/t.ts` for `az` **and** `en`; editorial
      copy from the API, never hardcoded.
- [ ] Does a failing list widget render an inline message rather than blanking the page?

**web-cbar-admin**
- [ ] Is this a routine CRUD screen that belongs in `src/modules/` as a `ModuleConfig`
      rather than a hand-written page in `src/pages/`?
- [ ] Fetches go through `src/lib/api.ts` (JWT + 401 handling), not raw `fetch`?
- [ ] TanStack Query cache invalidated on mutation, with query keys matching the module's?
- [ ] az/en tabs: are per-locale fields marked `perLocale` rather than duplicated?
- [ ] Any change to `RichTextEditor.tsx` — was an extension removed or reordered, and was
      `node roundtrip-check.mjs "Haqqımızda" "Pul siyasəti"` run? Removing an extension
      silently deletes that markup from every page an editor opens and saves.

**Both**
- [ ] Verified how? There is **no test suite in this repository** — the honest answer is
      build + lint + running the screen. Do not imply tests passed.
- [ ] If the change spans both a frontend and an API, remember these are separate upstream
      repositories: two merge requests, and `api-cbar-admin` deploys first.

---

## Reporting

1. Order findings by gate: correctness → a11y → performance → structure → style.
2. Lead with the count and the single most important one.
3. Separate **must fix** from **worth considering**. A review where everything is equally
   urgent gets ignored.
4. Say what you checked and could not verify.
5. If the code is good, say so plainly and name what it did well — that is how a convention
   spreads.
