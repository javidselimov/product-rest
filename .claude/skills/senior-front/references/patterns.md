# Patterns — what to reach for, and what to leave in the book

Two catalogues matter here: the React component patterns from patterns.dev, and the GoF
patterns from refactoring.guru / sourcemaking. The senior skill is knowing which ones React
has already absorbed — hooks and composition subsume most of the GoF catalogue, and
importing class ceremony into a component tree makes code worse, not more professional.

**Default position: plain components, plain props, plain hooks.** Reach for a named pattern
only when a concrete problem demands it, and say which problem in one line.

---

## Part 1 — React component patterns (patterns.dev)

### Container / Presentational — *situational, still useful*
Split "how it works" (fetch, state, transform) from "how it looks" (props in, markup out).
**Use when:** a component suffers Divergent Change — edited for both data and layout
reasons — or when the same markup must be driven by two different data sources.
**Do not** apply it mechanically to every component: hooks already provide the split, and a
container per leaf is Middle Man at scale.

```tsx
function InvoiceListPage() {                  // container: knows the API
  const { data, error, isLoading } = useInvoices()
  if (isLoading) return <Spinner />
  if (error) return <ErrorState error={error} />
  return <InvoiceTable rows={data} />         // presentational: knows nothing
}
```

### Hooks — *the default*
Any reusable stateful logic. A hook is the modern answer to HOC and render props both.
Rules that keep them honest:
- One responsibility per hook. `useInvoiceFilters` and `useInvoices`, not `useInvoicePage`.
- Return a stable, named shape (`{ rows, isLoading, refetch }`), not a positional tuple
  past two elements.
- No conditional calls, and dependency arrays must be honest — silencing the exhaustive-deps
  lint is how stale closures ship.

### Compound Components — *the right answer for widgets*
Related components sharing implicit state through context: `<Tabs>` + `<Tabs.List>` +
`<Tabs.Panel>`, `<Select>` + `<Select.Option>`.
**Use when:** consumers need control over structure and ordering, and a flat prop API would
become a Long Parameter List (`tabs={[...]} renderTab={...} activeTabColor={...}`).
**Cost:** implicit coupling — a `<Tabs.Panel>` outside `<Tabs>` must fail with a clear error.
This is how Chakra UI 3 and Radix are built; follow their shape when extending them.

### Higher-Order Components — *mostly superseded*
`withAuth(Component)`. Hooks do this better in nearly every case.
**Still legitimate for:** cross-cutting concerns that must wrap the element itself and
cannot be expressed as a hook — error boundaries, some analytics/instrumentation wrappers,
third-party integrations that hand you an HOC.
**Costs when misused:** prop-name collisions, lost display names in DevTools, wrapper-hell
stack traces, and types that erode as HOCs compose.

### Render Props — *narrow but alive*
`<Chart>{(size) => <Bars size={size} />}</Chart>`. Superseded by hooks for logic sharing,
but still the cleanest way to hand a child something only the parent can measure or own —
a measured size, a virtualised row index, a drag handle.
Modern equivalent: a **slot prop** taking a `ReactNode`, when no argument is needed.

### Provider / Context — *for genuinely global, rarely-changing values*
Auth, theme, locale, a query client.
**Not** a state manager: every consumer re-renders when the value changes, so split contexts
by change frequency and memoise the value object. If the value changes on every keystroke,
it does not belong in context.

### Presentational primitives vs. one-off components
A component used once, in one place, with no props, is often just a section of its parent
(Lazy Class). Extract for reuse or for readability of a genuinely long body — not by reflex.

---

## Part 2 — GoF patterns that pay rent in frontend

| Pattern | Frontend incarnation | Reach for it when |
|---|---|---|
| **Facade** | one `api.ts` wrapper over `fetch`: base URL, auth header, error mapping | every component is repeating request boilerplate |
| **Adapter** | mapper from API DTO → view model (`toInvoiceView(dto)`) | the API shape leaks into components; Message Chains everywhere |
| **Strategy** | a config object choosing behaviour: field descriptors, column definitions, validators | the same skeleton must render many variations |
| **Factory** | `createStore()`, `makeQueryKey()`, component factories in a registry | construction needs defaults or wiring the caller should not know |
| **Observer** | any store subscription (Zustand/Redux/signals), `EventTarget`, `IntersectionObserver` | many independent consumers react to one changing value |
| **Singleton** | a module-scope instance: query client, i18n instance, analytics client | exactly one instance must exist per app |
| **Decorator** | HOC, middleware, a fetch wrapper adding retries/logging | behaviour must be added without touching the wrapped thing |
| **Composite** | the component tree itself; a recursive `<TreeNode>` for a page tree | uniform treatment of leaves and containers |
| **Command** | reducer actions, undo/redo stacks, a queued mutation list | operations must be serialisable, replayable or undoable |
| **State** | a discriminated union or state machine driving UI | boolean flags have multiplied and illegal combinations exist |
| **Proxy** | a caching/deduping layer in front of fetch; `Proxy`-based reactive stores | access must be intercepted (cache, lazy-load, guard) |
| **Flyweight** | list virtualization — render 20 rows, not 20 000 | huge lists where most rows are off-screen |
| **Mediator** | middleware pipeline; a coordinator hook two sibling widgets talk through | siblings would otherwise know about each other |
| **Template Method** | a generic list/form renderer whose skeleton is fixed and whose parts come from config | many screens share one flow with different fields |
| **Builder** | fluent query/URL builders (`qs` construction, TanStack query key builders) | assembling a complex object step by step |

### The two that go wrong most often
- **Singleton** — module-scope state is a singleton whether you name it or not. In SSR it is
  shared across requests: never put per-user data in one. Anything request-scoped belongs in
  a provider created per request.
- **Observer** — easy to subscribe, easy to leak. Every subscription needs its unsubscribe in
  the same effect's cleanup, including `IntersectionObserver`, `ResizeObserver`, sockets and
  `addEventListener`.

### GoF patterns that rarely earn their place here
Abstract Factory, Bridge, Prototype, Memento, Visitor, Chain of Responsibility, Iterator.
They solve problems that JavaScript solves natively (iterators, structured clone, closures,
first-class functions) or that only exist in deep class hierarchies. If one seems necessary,
write the plain version first — it is usually shorter and clearer.

### Anti-guidance: how "patterns knowledge" makes frontend code worse
- Wrapping every module in a class because a pattern diagram had one.
- An interface + factory + registry for two implementations that will never be three.
- A "pattern" name in a filename (`UserFacadeAdapterService.ts`) that describes the shape
  instead of the purpose.
- Abstractions with a single call site — that is Speculative Generality wearing a badge.
- Prematurely introducing a state machine for a single boolean.

Patterns are **diagnostic vocabulary first, code templates second**. Their main job is
letting you say *why* a structure fits — not giving you a shape to fill in.

---

## Part 3 — this repository's patterns, named

Recognising these keeps changes consistent with what is already here.

- `web-cbar-admin/src/crud/CrudListPage.tsx` + `CrudFormPage.tsx` — **Template Method**:
  the skeleton (list, az/en tabs, payload building, cache invalidation) is fixed.
- `web-cbar-admin/src/crud/types.ts` `ModuleConfig` — **Strategy**: `columns`, `fields`,
  `apiPath` and renderers supply everything that varies.
- `web-cbar-admin/src/modules/*.ts` — the concrete strategies. `videos.ts` is the clean
  reference. **Adding a routine CRUD screen means adding a config here, not a page.**
- `web-cbar-admin/src/lib/api.ts` and `web-cbar/src/lib/api.ts` — **Facade** over `fetch`
  (JWT attach + 401 redirect on the admin side; `getJson` / `getJsonOrNull` on the public
  side). A second fetch path anywhere is a regression.
- `web-cbar/src/app/[locale]/[...slug]` — a catch-all **Composite** over the CMS page tree.
- `web-cbar-admin/src/components/RichTextEditor.tsx` — TipTap extensions are **Decorators**
  over the editor schema. Removing one silently drops that markup from every saved document;
  guard with `roundtrip-check.mjs`.

When you extend any of these, extend the config or add an extension — do not fork the
skeleton. Forking the skeleton is how the Duplicate Code smell enters this codebase.
