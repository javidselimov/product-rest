# Refactoring techniques → React / TypeScript

refactoring.guru groups ~70 techniques into six families. Many are class-hierarchy surgery
with no meaning in component code. This file keeps the ones that transfer, gives each its
React form, and lists the ones to **never** apply here.

Rules of the road:
- One refactoring per commit. A refactoring changes structure, never behaviour.
- No behaviour change means: same rendered output, same network calls, same states.
- Verify after each step (in this repo: build + lint + run the screen).

---

## 1. Composing methods

### Extract Function → Extract Component / Extract Hook / Extract Helper
The workhorse. Decide *which* of the three by what you are extracting:

| What you are extracting | Extract into |
|---|---|
| Markup + its local presentation logic | a component |
| State, effects, subscriptions, queries | a custom hook |
| A pure transform over data | a plain function in a `lib`/`utils` module |

```tsx
// Before — fetching, deriving and rendering in one body
function Invoices() {
  const [rows, setRows] = useState<Row[]>([])
  useEffect(() => { getInvoices().then(setRows) }, [])
  const overdue = rows.filter((r) => r.dueAt < Date.now() && !r.paidAt)
  return <table>{/* 60 lines */}</table>
}

// After — three named things, each testable and readable alone
const isOverdue = (r: Row) => r.dueAt < Date.now() && !r.paidAt   // pure helper
function useInvoices() { /* query */ }                             // stateful hook
function InvoiceTable({ rows }: { rows: Row[] }) { /* markup */ }  // presentational
```

Name the extraction after **what it means**, not what it does mechanically:
`useOverdueInvoices`, not `useData2`.

### Inline Function → Inline Component
The inverse, and just as valuable. A one-line wrapper used once is a hop for every future
reader. Inline it and delete the file. Also the fix for Middle Man and Lazy Class.

### Extract Variable
Name a subexpression instead of commenting it.
`const canPublish = user.role === 'editor' && !post.locked` reads better than the condition
inline, and shows up in the debugger.

### Replace Temp with Query → **derive during render**
The single highest-value refactoring in React. State that mirrors other state is a bug
generator: it can go stale, it doubles the renders, and it makes the legal states unclear.

```tsx
// Before — a second source of truth, one render behind
const [filtered, setFiltered] = useState<Row[]>([])
useEffect(() => { setFiltered(rows.filter((r) => r.name.includes(q))) }, [rows, q])

// After — one source of truth, always correct
const filtered = rows.filter((r) => r.name.includes(q))
```

Reach for `useMemo` only if profiling shows the computation is actually expensive.
`useEffect` is for synchronising with systems outside React — not for recalculation.

### Split Temporary Variable
One variable reused for two meanings (`let value` assigned three different things).
Give each meaning its own `const`.

### Remove Assignments to Parameters
Do not mutate props, arguments, or arrays you were handed. Copy first (`[...rows]` before
`.sort()`, which mutates). Mutating a prop object is undefined behaviour in React's model
and will survive re-renders in ways nobody expects.

### Substitute Algorithm
Replace a hand-rolled implementation with a clearer or standard one — a manual loop with
`Array.prototype` methods, a bespoke deep-equal with a library, a home-made date parser
with `Intl`.

---

## 2. Moving features between modules

### Move Function → put logic where its data lives
The fix for Feature Envy. If a function reads mostly another module's data, it belongs in
that module.

### Move Field → lift or colocate state
State should live at the **lowest** common ancestor of everything that reads it. Two
directions:
- Too high → push it down; the parent stops re-rendering on every keystroke.
- Duplicated in siblings → lift it to the parent (or derive it — see Replace Temp with Query).

### Extract Module (Extract Class) → split by reason-to-change
The fix for Divergent Change and Large Class. Split a component into a container (data) and
a presentational component (markup); split a god context into several contexts by change
frequency, so a theme toggle does not re-render the data tree.

### Inline Module (Inline Class)
Fold a module that no longer justifies its existence back into its only consumer.

### Hide Delegate
The fix for Message Chains. Instead of the view walking `data.items[0].meta.author.name`,
the data layer returns `{ authorName }`. See the Adapter pattern in `patterns.md`.

### Remove Middle Man
When a layer only forwards, delete it — unless it exists deliberately to isolate a boundary
you expect to change. Say which one it is when you decide.

### Introduce Local Extension
The fix for Incomplete Library Class: one wrapper component/hook in your codebase that adds
the missing behaviour to a third-party component, imported everywhere instead of the raw one.

---

## 3. Organising data

### Replace Data Value with Object → type the value
`status: string` → `type Status = 'draft' | 'review' | 'published'`. Ids → branded types
(`type UserId = number & { readonly __brand: 'UserId' }`) when mixing up two id kinds is a
real risk. Money → `{ amount: number; currency: Currency }`, never a float plus a hope.

### Replace Magic Number with Symbolic Constant
`if (width < 768)` → `if (width < BREAKPOINT_MD)`. Also applies to timeouts, page sizes,
z-index values, and animation durations — all of which want a single source.

### Replace Type Code with Polymorphism / State
See "Replace Conditional with Polymorphism" below — in React the polymorphism is a map from
type code to component.

### Encapsulate Field / Encapsulate Collection
Do not export a mutable store object or a raw array. Export read accessors and explicit
actions, so mutation happens in one place and can be logged, validated or batched.

### Not applicable here
Change Value to Reference, Change Reference to Value, Duplicate Observed Data, Change
Unidirectional Association to Bidirectional (and back) — these solve identity-and-pointer
problems from OO object graphs. React's data flow is one-directional by design; if you find
yourself wanting bidirectional associations, you want a normalised store instead.

---

## 4. Simplifying conditionals

### Replace Nested Conditional with Guard Clauses → early returns for the three states
The idiomatic shape for any component that loads data:

```tsx
// Before — the happy path buried three levels deep
return isLoading ? <Spinner /> : error ? <Error /> : rows.length ? <Table rows={rows} /> : <Empty />

// After — flat, each state obvious, easy to add a fourth
if (isLoading) return <Spinner />
if (error) return <ErrorState error={error} retry={refetch} />
if (rows.length === 0) return <EmptyState />
return <Table rows={rows} />
```

### Decompose Conditional
Extract the condition and each branch into named things:
`if (isEligibleForDiscount(user, cart))` beats a four-clause boolean expression.

### Consolidate Conditional Expression
Several conditions with the same outcome → one named predicate.

### Replace Conditional with Polymorphism → the component registry
The fix for Switch Statements:

```tsx
const BLOCKS = {
  hero: HeroBlock,
  grid: GridBlock,
  quote: QuoteBlock,
} satisfies Record<BlockType, ComponentType<BlockProps>>

const Block = BLOCKS[block.type]
return <Block {...block} />
```

Adding a block type is one entry, and `satisfies Record<BlockType, …>` makes the compiler
refuse an incomplete map.

### Introduce Null Object → the empty state as a value
Return `[]` and `EMPTY_USER`-style defaults instead of `null`, so consumers do not each
re-implement the null check. In UI terms, this is a dedicated `<EmptyState>` component
rather than `null &&` chains.

### Remove Control Flag
`let shouldRender = true` mutated through a function body → early returns instead.

---

## 5. Simplifying calls (component interfaces)

### Rename — the cheapest high-value refactoring
Props and hooks are your public API. `data`, `item`, `handleClick`, `value2` cost every
reader. `invoice`, `onSelectRow`, `draftTitle` cost nobody.

### Introduce Parameter Object → group cohesive props
When several props always arrive together (Data Clumps), pass one typed object. Do **not**
do this to props that vary independently — you would just be hiding the count.

### Preserve Whole Object
Pass `user` rather than `userId`, `userName`, `userAvatar` — unless the narrow props are
deliberate, to keep a presentational component decoupled from the DTO shape. That decision
is worth a comment.

### Replace Parameter with Explicit Function
`<Button variant="primary" | "danger">` is fine; `doThing(a, b, mode)` where `mode` picks
between two unrelated behaviours should be two functions.

### Separate Query from Modifier
A hook or function should either compute or cause an effect, not both. `useUser()` that
also silently creates a user is a trap.

### Remove Setting Method
Do not expose a setter for something the component should own. Expose an intent
(`onSubmit`, `onDismiss`), not `setInternalState`.

---

## 6. Generalisation — mostly not applicable

React has **no component inheritance**. Every technique in refactoring.guru's
"Dealing with Generalization" family that moves members up or down a class hierarchy —
Pull Up Field/Method/Constructor Body, Push Down Field/Method, Extract Subclass, Extract
Superclass, Collapse Hierarchy, Form Template Method, Replace Delegation with Inheritance —
**does not apply to component code**. Do not cargo-cult it into JSX.

Two survive in translated form:

- **Extract Interface** → extract a shared props type / a shared hook contract, so two
  implementations are interchangeable (this is Strategy — see `patterns.md`).
- **Replace Inheritance with Delegation** → composition. This is not a refactoring you
  choose in React; it is the only option, and it is why React scales better than class
  hierarchies did.

The one place the "template method" idea does reappear legitimately: a generic renderer
driven by a config object (a form/table renderer that reads a field descriptor list). The
skeleton is fixed, the config supplies the varying parts. That is Template Method +
Strategy without inheritance — see `patterns.md` and this repo's `src/crud/`.

---

## Refactoring safely without a test suite

This repository has no automated tests, so lean on the tools that remain:

1. **Types first** — tighten the types before moving code; the compiler becomes the test.
2. **Small steps** — extract, build, run, then continue. Never batch five refactorings.
3. **Compare rendered output** — same screen before and after, same data.
4. **Check the network tab** — a refactoring must not change the requests made.
5. **`npm run lint` and `npm run build`** on the affected project every step.
6. For `RichTextEditor.tsx`, run `node roundtrip-check.mjs "Haqqımızda" "Pul siyasəti"` —
   it is the only automated guard in the repo and it exists because TipTap silently drops
   markup no extension claims.
