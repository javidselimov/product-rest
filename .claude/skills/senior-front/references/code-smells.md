# Code smells, translated to React / TypeScript

Fowler's catalogue (refactoring.guru, sourcemaking) in class-era vocabulary, rewritten for
component code. Each entry: **what it looks like here → how to spot it → the refactoring
that removes it** (techniques are detailed in `refactorings.md`).

Use the names. "Large Class in `CurrencyRates.tsx`" starts a conversation; "this file is
big" starts an argument.

---

## 1. Bloaters — grown too large to hold in your head

### Long Method → the 200-line component / the do-everything hook
A component whose body mixes fetching, transformation, form state, and layout. A custom
hook that fetches, normalises, validates and exposes handlers.
**Spot it:** you scroll to understand one behaviour; the JSX starts past line 120; local
variables are only used 80 lines later.
**Fix:** Extract Component (presentational leaf), Extract Hook (stateful logic),
Extract Function (pure transforms — move them out of the component file entirely).
**Not a smell when:** the length is one flat, readable list of fields with no branching.
Line count is a symptom, never the diagnosis.

### Large Class → the god component / god context
One component owning unrelated concerns; a single `AppContext` holding auth, theme,
toasts, filters and the shopping cart.
**Spot it:** the file imports from four unrelated domains; two developers always conflict
in it; a context change re-renders half the tree.
**Fix:** Extract Component / Extract Hook; split one context into several by change
frequency (see "Divergent Change" below).

### Primitive Obsession → stringly-typed props
`status: string`, `variant: string`, `userId: number`, dates as `string` everywhere,
`role: string` compared against literals.
**Spot it:** typos compile; you need a comment to know the legal values;
`if (status === 'draft' || status === 'Draft')`.
**Fix:** Replace Data Value with Object → union types (`type Status = 'draft' | 'published'`),
branded types for ids, a small `Money`/`DateRange` value object. Model impossible states
out of existence with a discriminated union rather than three booleans:

```ts
// Before — 8 representable states, 3 legal
{ isLoading: boolean; error: Error | null; data: T | null }

// After — 3 representable states, 3 legal
type Result<T> =
  | { state: 'loading' }
  | { state: 'error'; error: Error }
  | { state: 'ready'; data: T }
```

### Long Parameter List → the 12-prop component
`<Card title subtitle icon iconColor href badge badgeColor onClick footer variant size dense />`
**Spot it:** call sites are unreadable; half the props exist only to be forwarded; adding a
feature means adding a prop.
**Fix:** Introduce Parameter Object (group cohesive props), or — usually better in React —
**composition**: accept `children` / slot props (`header`, `actions`) instead of a
configuration flag per variation.

### Data Clumps → props that always travel together
`userId`, `userName`, `userAvatar` passed side by side through four components;
`startDate` + `endDate` + `timezone` repeated in six signatures.
**Spot it:** the same 3 parameters recur in unrelated functions; changing one means
changing all.
**Fix:** Extract Class → a `User` / `DateRange` type, passed as one prop. If the clump is
only travelling *through* intermediate components, that is also Prop Drilling — consider
context or moving the consumer closer to the data.

---

## 2. Object-orientation abusers — the wrong tool applied

### Switch Statements → type-code branching in render

```tsx
switch (block.type) {
  case 'hero': return <Hero {...block} />
  case 'grid': return <Grid {...block} />
  // …14 more, and a second switch elsewhere for the icon
}
```

**Spot it:** the same `switch` on the same field appears in more than one file; adding a
case means editing several places (this is Shotgun Surgery in disguise).
**Fix:** Replace Conditional with Polymorphism → a component registry map
(`const BLOCKS = { hero: Hero, grid: Grid } satisfies Record<BlockType, ComponentType>`),
so a new type is one entry and TypeScript enforces exhaustiveness.
**Keep the switch when:** it is a single well-typed exhaustive switch used once, especially
over a discriminated union — that is idiomatic and type-safe.

### Temporary Field → state that is only sometimes meaningful
`selectedRowId` that is only valid while a modal is open; `draftValue` that lingers after
save; refs holding values relevant to one branch.
**Spot it:** every read is guarded by another flag; stale values leak between interactions.
**Fix:** Extract the field into the component that owns that mode, or fold it into a
discriminated union state (`{ mode: 'idle' } | { mode: 'editing'; rowId: number }`) so it
cannot exist when it is meaningless.

### Refused Bequest → spread props the child ignores
`<Widget {...props} />` where `Widget` reads two of eleven props; a shared `BaseTable` whose
variants override most behaviour; a wrapper accepting `HTMLAttributes` it never forwards.
**Spot it:** props typed as `any`/`Record<string, unknown>`; React warnings about unknown
DOM attributes in the console.
**Fix:** narrow the props type to what is actually used; Replace Inheritance with
Delegation — React has no component inheritance, composition is the only correct answer.

### Alternative Classes with Different Interfaces → two components, same job
`<Modal>` and `<Dialog>`; `useFetchUser` and `useUserQuery`; two date pickers with
different prop names.
**Spot it:** new code picks one at random; bugs get fixed in one and not the other.
**Fix:** Rename to align the interfaces, then delete one and update the call sites.

---

## 3. Change preventers — one change, many edits

### Divergent Change → one file changing for unrelated reasons
A component edited this week because the API shape changed, and last week because the
layout changed.
**Spot it:** its git history has two unrelated themes.
**Fix:** Extract Class → split data-fetching/transform (container, hook) from presentation
(pure component). This is the Container/Presentational split, and it is the reason that
pattern still earns its keep.

### Shotgun Surgery → one field, six files
Adding `publishedAt` means editing the type, the API mapper, the form, the table columns,
the validation, and the i18n labels.
**Spot it:** your commit touches many files and none of them deeply.
**Fix:** Move Field / Move Function to colocate by feature; better, make the shape
declarative so a field is one entry in one config (this repo's `src/modules/*.ts` does
exactly that — see `SKILL.md`).

### Parallel Inheritance Hierarchies → mirrored folder trees
Adding a feature forces a new file in `types/`, `hooks/`, `components/`, `utils/` — the
same name in four places.
**Spot it:** four folders with identical file names.
**Fix:** collapse the mirrors — colocate the feature's type, hook and component in one
folder. Organise by domain, not by file type.

---

## 4. Dispensables — code that should not exist

### Duplicate Code
The same fetch/format/validation copy-pasted; two components 90% identical.
**Fix:** Extract Function / Hook / Component — **but** only when the copies change for the
same reason. Duplication is cheaper than the wrong abstraction; wait for the third copy.

### Dead Code
Commented-out JSX, unreachable branches, props nothing passes, exports nothing imports,
feature flags permanently on.
**Fix:** delete it. Git remembers. Run the linter's unused-var rules and a
`knip`/`ts-prune`-style sweep before large refactors.

### Magic Number / Magic String
`pageSize: 10`, `setTimeout(fn, 400)`, `status === 404`, `type === 2`, `'x-locale'` written at the
call site; the same literal repeated in several files with no shared name.
**Spot it:** a number you have to read the surrounding code to understand; the same value in
two places that must change together.
**Fix:** Replace Magic Number with Symbolic Constant (`refactorings.md`). In this repo (spec 032):
cross-cutting values go to `src/shared/constants/<topic>.ts` (`DEFAULT_PAGE_SIZE`, `HTTP_STATUS`,
`DAY_MS`), slice-specific ones to that slice's `constants.ts` (`NEWS_PAGE_SIZE`, `PRESS_RELEASE_TYPE`);
`@typescript-eslint/no-magic-numbers` fails `verify` otherwise. Strings are not linted but follow
the same rule for query params, headers, storage keys and type codes.

### Speculative Generality
A generic `<DataTable<T>>` with one call site; a `renderItem` prop nobody overrides; a
plugin registry with one plugin; `options` objects for options nobody sets.
**Spot it:** abstractions whose only second consumer is a demo.
**Fix:** Inline it back to the concrete case. Generalise on the third real requirement.

### Lazy Class → the pass-through component
`export const PageTitle = ({ children }) => <h1>{children}</h1>` used once.
**Fix:** Inline Component. Every indirection is a hop the next reader must make.

### Data Class → the anaemic type with logic scattered around it
A `User` type whose formatting, validation and derivation live in five components.
**Fix:** colocate the behaviour with the type — `formatUserName(user)`, `canEdit(user)` —
in the module that owns the type. Not everything needs a class; a module of pure functions
over a type is the frontend equivalent.

### Comments (as a smell)
Comments restating the code, headers explaining a block that should be a function,
commented-out alternatives.
**Fix:** Extract Function with a name that says it; Rename to remove the need.
**Keep comments that explain *why*** — a workaround, a spec quirk, a compatibility
constraint (this repo's `TODO(compat)` markers are exactly that). Refactoring must never
delete those.

---

## 5. Couplers — things that know too much about each other

### Feature Envy → a component obsessed with another module's data
A component that imports another feature's raw DTO and reimplements its formatting.
**Fix:** Move Function — put the logic next to the data it uses, export the result.

### Inappropriate Intimacy → reaching into internals
Importing from `otherFeature/internal/utils`, manipulating another component's DOM node,
mutating store state directly, deep-importing a library's private path.
**Fix:** define and use a public surface (an `index.ts` barrel for the feature); Hide
Delegate. Enforce with lint boundaries if it recurs.

### Message Chains → `data.items[0].meta.author.name`
**Spot it:** long dotted paths, or `?.` five levels deep hiding a missing null strategy.
**Fix:** Hide Delegate — have the data layer return the shape the view needs (an Adapter
mapping DTO → view model), so the component asks one question.

### Middle Man → the component that only forwards
`<UserCardContainer>` that renders `<UserCard {...props} />` and nothing else; a hook that
only calls another hook; an `api/users.ts` that re-exports `api.get`.
**Fix:** Remove Middle Man — inline it.
**Not a smell when:** the layer exists to isolate a boundary you expect to change (a single
fetch wrapper, a third-party adapter). Say which it is.

### Incomplete Library Class → the component library that almost fits
A Chakra/MUI/Radix component missing one behaviour, worked around inline at 12 call sites.
**Fix:** Introduce Local Extension — one wrapper in your own components folder that adds
the behaviour; everyone imports that. Wrap once, not per call site.

---

## Frontend-specific smells not in the classic catalogue

- **Effect-as-derivation** — `useEffect` + `setState` to compute a value from props.
  Fix: compute during render (Replace Temp with Query). The most common React defect there is.
- **Prop drilling** — the same prop threaded through four layers that ignore it. Fix:
  composition (pass the element, not the data), or context at the right level.
- **Unstable keys** — `key={index}` on a reorderable, filterable or paginated list. Fix:
  stable id. Causes wrong-row state, lost focus, wrong animations. This is a **correctness**
  bug, not a lint nit.
- **Unstable identities** — object/array/function literals in props or dependency arrays,
  refiring effects and making memoisation a no-op every render.
- **Client-component creep** — `"use client"` on a layout or page, dragging the whole
  subtree into the client bundle. Fix: push it down to the interactive leaf.
- **Fetch waterfalls** — sequential awaits with no data dependency between them. Fix:
  fetch in parallel, or a Suspense boundary per independent region.
- **Missing states** — no loading, empty or error branch; the happy path only.
- **Div soup** — `<div onClick>`, headings chosen for font size, inputs without labels, no
  focus management. Accessibility defects; treat as correctness.
- **`any` / `!` / `as` creep** — assertions that silence the compiler instead of modelling
  the shape. Each one is a runtime error waiting for production data.
