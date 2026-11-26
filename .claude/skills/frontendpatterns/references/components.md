# Component, fundamentals, routing, styling and testing patterns

Source: condensed and paraphrased from https://frontendpatterns.dev/ (Components, Fundamentals, Routing, Styling, Testing), fetched 2026-10-08.

---

## Components

### Component Lifecycle — `/component-lifecycle`
- **Problem:** Listeners, subscriptions, timers and requests that are never torn down leak memory and fire repeatedly. An older response can land after a newer one and overwrite fresh data.
- **Solution:** Pair every setup with its teardown in the same effect. Set up on mount, undo on unmount, and when a dependency (such as `userId`) changes, release the resources tied to the old value and set up new ones. Cancel in-flight fetches with `AbortController`.
- **Wrong choice / avoid when:** Avoid effects with no cleanup, piling 5+ concerns into one component, using `useLayoutEffect` when you don't need it (it blocks paint), and async cleanup functions (they aren't supported).
- **Tradeoffs:** Leaks appear late and are hard to trace. Wrong dependency arrays cause stale closures or loops. Cleanup must be synchronous.
- **Checks:**
  - Every `useEffect` that subscribes, listens, sets an interval or fetches returns a cleanup that undoes it.
  - Fetch effects pass `signal` and ignore `AbortError`.
  - The dependency array lists every reactive value used, with no `eslint-disable` for exhaustive-deps.
  - No `async` function is passed directly to `useEffect`.

```tsx
useEffect(() => {
  const c = new AbortController();
  fetch(url, { signal: c.signal }).then(r => r.json()).then(setData)
    .catch(e => { if (e.name !== 'AbortError') setError(e); });
  return () => c.abort();
}, [url]);
```

### Message Thread — `/message-thread`
- **Problem:** Storing a chat as "last prompt + last reply" strings with global `isStreaming`/`error` flags lets one turn's spinner or error leak onto the others.
- **Solution:** Keep an ordered array of `{ id, role, content, status }`, where status is `streaming | complete | stopped | error`. "Send" appends a user turn and an empty streaming assistant turn. Tokens append to that assistant turn by `id`, and "finish" sets its status. Render inside `role="log"` with `aria-live="off"`, and announce each finished reply once through a separate status region.
- **Wrong choice / avoid when:** Don't use top-level loading or error flags, nest live regions inside the log, or flip `aria-live` when a reply finishes. Don't virtualise before you have hundreds of messages, because it fights stick-to-bottom scrolling.
- **Tradeoffs:** You need discipline to keep the array as the single source of truth. Announcements need care to avoid both missed turns and token spam. Rich content makes each bubble its own rendering problem.
- **Checks:**
  - Each message has an `id` created when the message is, and the list is keyed by it, never by index.
  - Thinking, streaming, error and retry UI are derived from `message.status`, not from component-level flags.
  - A token update changes only the message with the matching `id`, immutably.
  - The thread container is `role="log"`, and completion is announced once through a separate `role="status"` region.

```ts
case 'token':
  return msgs.map(m => m.id === a.id ? { ...m, content: m.content + a.chunk } : m);
```

### Presentational vs. Container — `/presentational-vs-container`
- **Problem:** Fetching, error handling, transformation and markup tangled in one file. Changing a style means reading the data pipeline, and the UI can't be reused with another data source.
- **Solution:** Presentational components only render props and emit callbacks. A container (or, in modern React, a custom hook such as `useUsers()`) owns fetching, state and errors and passes the results down.
- **Wrong choice / avoid when:** The component is trivial or single-use, a hook would do without a wrapper component, the split creates long prop chains, or the team prefers colocation.
- **Tradeoffs:** More files and indirection. Largely superseded by hooks. The boundary is fuzzy in places (for example, where formatting belongs).
- **Checks:**
  - Presentational components import no fetch client, query hook, store or router.
  - They can be rendered in a test or story using props alone, with no mocks or providers.
  - Data logic lives in a hook or container, not inline in JSX-heavy files.
  - The split isn't applied to one-off leaf components where it only adds a file.

### Prompt Input — `/prompt-input`
- **Problem:** A single-line input hides long drafts, sends on the Enter meant for a newline, sends on the Enter that confirms IME composition (CJK), and allows a second send while a reply is streaming.
- **Solution:** Use an auto-growing `<textarea>` with a height cap. Enter sends and Shift+Enter adds a newline (pick one scheme). Ignore Enter while `isComposing || keyCode === 229`. Disable Send when the trimmed text is empty, and swap Send for an always-enabled Stop button while busy. Clear the field and reset its height after sending, and wrap it in a real `<form>` as the no-JS baseline.
- **Wrong choice / avoid when:** Don't use a single-line input, a static Send button that stays enabled during generation, or inconsistent newline shortcuts. Don't rely on CSS-only `field-sizing` without a JS fallback for older browsers.
- **Tradeoffs:** IME, autocomplete and mobile Enter keys need testing on real devices. Enter-to-send needs a visible hint. JS auto-grow reflows on every keystroke. The busy flag must track the real stream.
- **Checks:**
  - The keydown handler checks `e.nativeEvent.isComposing || e.keyCode === 229` before submitting.
  - Whitespace-only input can't be sent.
  - While streaming, the submit path is blocked and Stop is `type="button"` and enabled.
  - Height is capped (with `max-height` or `Math.min(scrollHeight, cap)`) and resets after sending.

```tsx
const onKeyDown = (e: React.KeyboardEvent) => {
  const composing = e.nativeEvent.isComposing || e.keyCode === 229;
  if (e.key === 'Enter' && !e.shiftKey && !composing) { e.preventDefault(); submit(); }
};
```

### Props and Attributes — `/props-and-attributes`
- **Problem:** Without inputs, near-identical components get copied (SubmitButton, CancelButton, DeleteButton…), and hard-coded internals block test data.
- **Solution:** Configure one component from outside with typed props, sensible defaults, callbacks, `children` and slots. Pull out known props and forward the rest. In web components, use attributes (always strings) for declarative config and JS properties for rich data.
- **Wrong choice / avoid when:** The prop list is ballooning (use composition instead), data passes through many layers (use context or a store), or complex data would go through string attributes.
- **Tradeoffs:** Too many props make a clumsy API with many branches and combinations to test. Defaults can hide upstream `undefined` bugs. `{...rest}` weakens typing.
- **Checks:**
  - Props are typed with literal unions for variants (`'primary' | 'danger'`), not a loose `string`.
  - Optional props have defaults set in the destructuring.
  - A component with more than ~8–10 props, or several mutually exclusive booleans, gets flagged for composition or a `variant` union.
  - Spread `...rest` goes onto the root DOM element and is typed (for example `ComponentProps<'button'>`).

### Pure Component — `/pure-component`
- **Problem:** Reading the clock or globals, or firing analytics or fetches during render, gives different output for the same props. That makes memoization unreliable, tests flaky, and causes duplicate calls.
- **Solution:** Render should be a function of props and state only. Pass volatile values in as props, run side effects in effects or event handlers, and update immutably so reference checks work. Only then can `memo` safely skip renders.
- **Wrong choice / avoid when:** Don't `memo` everything by default (profile first), don't memoize components whose props change on nearly every render, and don't expect `memo` to detect in-place mutation.
- **Tradeoffs:** Side effects move into effects. Shallow comparison has a cost. Callbacks need `useCallback` unless React Compiler handles it. Imperative work needs refs.
- **Checks:**
  - No `Date.now()`/`new Date()`/`Math.random()`, fetch, storage access or analytics call in the render body.
  - State and props are never mutated. Updates create new objects and arrays.
  - Every `memo` component receives stable callbacks and objects, or the memo is removed.
  - Each `memo` is backed by a profiler measurement, not added "just in case".

```tsx
const Stamp = ({ prefix, time }: { prefix: string; time: string }) =>
  <span>{prefix}: {time}</span>; // the time is passed in, never read during render
```

---

## Fundamentals

### Barrel Export — `/barrel-export`
- **Problem:** Deep import paths expose folder layout, so moves break callers. `../../../../` chains are fragile, and private helpers get imported from outside.
- **Solution:** Give each module an `index.ts` that re-exports only its public API, selectively. Consumers import from the folder, so internal files can move freely.
- **Wrong choice / avoid when:** Unbundled dev servers or Jest would load the whole folder on every import, modules have side effects (which hurts tree-shaking), barrels import each other (creating cycles), or `export *` would make things public by accident.
- **Tradeoffs:** Dev and test startup slows down (Next.js `optimizePackageImports` helps). Barrels need upkeep. "Go to definition" stops at the barrel. Circular imports can leave values `undefined` at runtime.
- **Checks:**
  - Barrels use named re-exports, with `export *` avoided or justified.
  - Code inside a module imports its siblings by relative path, never through its own barrel.
  - No import cycle between barrels (check with `madge`, `eslint-plugin-import/no-cycle` or similar).
  - Outside code doesn't deep-import past a module's barrel, so private files stay private.

```ts
// features/auth/index.ts — public API only
export { LoginForm } from './ui/LoginForm';
export { useSession, type Session } from './model/session';
```

### Semantic HTML — `/semantic-html`
- **Problem:** Div-only markup reads as one unstructured blob to screen readers: there are no landmarks to jump between, and div "buttons" can't be focused or activated with Enter.
- **Solution:** Pick elements by meaning: `<button>` for actions, `<a href>` for navigation, `<header>/<nav>/<main>/<aside>/<footer>` for regions, `<article>`, a proper `h1`–`h6` order, `<table>` with `<caption>`/`scope` for data, `<label>`/`<fieldset>` in forms and `<details>` for disclosure. Add ARIA only where HTML has no element.
- **Wrong choice / avoid when:** Never avoid it. The anti-patterns are clickable divs, layout tables, headings chosen for their size and reaching for ARIA first.
- **Tradeoffs:** Many elements with quirky rules (`<address>`). Default styles need resetting. Heading levels can conflict with the design. Third-party libraries often render divs.
- **Checks:**
  - No `onClick` on `div`/`span` (use `<button>`), and nothing navigates without an `<a href>`.
  - Exactly one `<main>`, with multiple `<nav>`s distinguished by `aria-label`.
  - Heading levels don't skip (for example `h1` straight to `h4`), and the size comes from CSS, not the tag.
  - `<table>` is used only for tabular data and has headers with `scope`.

### Separation of Concerns — `/separation-of-concerns`
- **Problem:** One file mixes API calls, business rules, validation, inline styles and markup, so nothing can be reused or tested alone and every edit risks unrelated code.
- **Solution:** Layer the code: a service or API module returns clean domain data, business rules are pure functions, components render props and emit events, and styles live in their own files. A thin hook or container wires them together.
- **Wrong choice / avoid when:** The feature is simple, it's a prototype, colocation is clearer, or extra layers would bury the logic in abstraction.
- **Tradeoffs:** More files and hops. Teams must agree on the boundaries. Bugs that cross layers are harder to trace. Containers can grow into god objects.
- **Checks:**
  - API response mapping (to domain types) happens in one service layer, not in components.
  - Business rules and validation are framework-free functions that can be unit-tested without rendering.
  - Components don't build URLs or call `fetch` directly.
  - Swapping the transport (REST to GraphQL) would touch only the service layer.

### Single Responsibility — `/single-responsibility`
- **Problem:** "Kitchen sink" components that fetch, validate, format, check auth and render many sections. Small edits are risky, trivial tests need heavy setup, and merge conflicts pile up.
- **Solution:** Each unit's purpose should fit in one sentence without "and". Split it into a fetch hook, pure helpers (validate, format, permission), display components and a coordinating container.
- **Wrong choice / avoid when:** The code is trivial (no three-line function in its own file), the flow reads better in one place, or the team hasn't agreed on the boundaries.
- **Tradeoffs:** More files and names. The flow is spread out. "One responsibility" is subjective and easy to overdo. Onboarding costs more.
- **Checks:**
  - Each component or hook can be described in one sentence without "and".
  - Fetching, transforming and rendering live in separate functions.
  - A change of one kind (API shape, validation rule, styling) touches one file.
  - No file has been split so finely that a reader must open five files to follow a ~20-line flow.

---

## Routing

### Client-Side Routing — `/client-side-routing`
- **Problem:** A full page reload on every link flashes white and resets scroll, form input, media and expanded UI.
- **Solution:** Intercept internal links, `pushState` the new URL and render the matching view, and re-render on `popstate`. Let a router map URL patterns to components and handle guards and programmatic navigation. Handle scroll (top or restore) and focus yourself.
- **Wrong choice / avoid when:** The site must work without JS, the server can't serve the app shell for deep links (fall back to hash routing), or SEO matters and there's no SSR or prerendering.
- **Tradeoffs:** Depends on JS. The server needs a fallback configuration. Crawlers may not run JS. You manage scroll, focus and listener cleanup. Confusing `pushState` with `replaceState` breaks Back.
- **Checks:**
  - Internal navigation uses the router's `<Link>`/`navigate`, so there are no raw `<a>` full reloads and no `window.location =` for in-app routes.
  - Redirects and filter tweaks use `replace`, while user-visible steps use `push`.
  - A route change scrolls to the top or restores the saved position, and moves focus to the new heading.
  - A catch-all 404 route exists, and deep links work on a hard refresh.

---

## Styling

### CSS Modules & Scoped Styles — `/css-modules-and-scoped-styles`
- **Problem:** Global class names (`.header`, `.button`) from different teams or libraries collide, and BEM discipline erodes.
- **Solution:** The build rewrites class names to unique hashed ones (`Button_button__a1b2c3`) and you import them as `styles.x`. Share styles with `composes`, opt out with `:global()`, and use CSS custom properties for themes and runtime values. Vue `scoped` and Svelte `<style>` work the same way.
- **Wrong choice / avoid when:** There's no configurable build, styles depend heavily on runtime values, the stack centres on a global framework (constant `:global()` overrides), or it uses a CSS-in-JS component library whose theming or `sx` API should be used instead.
- **Tradeoffs:** Hashed names are hard to read in DevTools. Styles are static. Combining classes is verbose without `clsx`. TypeScript needs `.d.ts` declarations.
- **Checks:**
  - Component styles live in a colocated `*.module.css`. No new global classes outside reset or theme files.
  - `:global()` is limited to third-party or legacy hooks and is commented.
  - Dynamic values go through CSS variables (`style={{ '--w': w }}`), not by generating class names.
  - Conditional classes use `clsx`/`classnames`, not string concatenation.

```tsx
import s from './Button.module.css';
<button className={clsx(s.button, variant === 'primary' && s.primary)} />
```

---

## Testing

### Component Testing — `/component-testing`
- **Problem:** A one-off manual check misses empty, error, loading and edge states, so refactoring a shared component is a gamble.
- **Solution:** Render the component, interact the way a user would (by role, label or text), and assert on what the user can see. Mock the network so tests are fast and deterministic, and cover the happy, loading, error and empty paths plus accessibility (axe).
- **Wrong choice / avoid when:** Don't assert on internal state or CSS classes, trust unrealistic mocks, rubber-stamp snapshots, chase coverage numbers or keep outdated tests.
- **Tradeoffs:** Costs time up front. Implementation-coupled tests break on refactors. Mocks can drift from the real API. `waitFor`/`act` timing can make tests flaky. Slow suites go unrun.
- **Checks:**
  - Queries use `getByRole`/`getByLabelText` first. `getByTestId` is the exception, and container `querySelector` is not used.
  - Interactions use `userEvent`, and async results use `findBy*`/`waitFor` rather than arbitrary sleeps.
  - Loading, error and empty states each have a test, not just the happy path.
  - No test reads component internals (state, instance, class names), and snapshots are small and reviewed.

```tsx
render(<Counter initial={0} />);
await userEvent.click(screen.getByRole('button', { name: /increment/i }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```
