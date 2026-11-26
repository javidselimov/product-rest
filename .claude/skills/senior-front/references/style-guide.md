# Style — Airbnb, filtered through TypeScript and React 19

The Airbnb JavaScript and React/JSX style guides are still the best-known baseline, and
parts of them are now actively wrong: they predate hooks, TypeScript's dominance, and
React 19. This file keeps what holds, marks what is superseded, and adds the modern rules
Airbnb never covered.

**Formatting is not style.** Prettier and ESLint own spacing, quotes, semicolons and commas
— never spend review comments on them. What follows is about *decisions*, not whitespace.

---

## Still correct — apply these

### References and variables
- `const` by default; `let` only where reassignment is real; **never** `var`.
- One declaration per variable. Declare where first used, not in a block at the top.
- No chained assignment (`a = b = c`), no unary increments in expressions.

### Objects, arrays, strings
- Literal syntax: `{}` / `[]`, never `new Object()` / `new Array()`.
- Shorthand properties and methods; group shorthand at the top of the literal.
- Spread to copy (`{ ...obj }`, `[...arr]`); do not mutate what you were handed. Remember
  `sort`, `reverse`, `splice` and `push` mutate — copy first.
- `Object.hasOwn(obj, key)` — not `obj.hasOwnProperty(key)`.
- `Array.from()` / `Array.prototype.map` for iterables; template literals over `+`
  concatenation; never `eval`.

### Functions
- Named function expressions or arrow functions; never `arguments` — use rest `...args`.
- Default parameters last; never mutate a parameter or reassign it.
- Arrow functions for callbacks and anything relying on lexical `this`.

### Comparison and control flow
- `===` / `!==` always. The one accepted exception is `x == null` to catch both `null` and
  `undefined` — use it deliberately or not at all.
- Do not rely on truthiness for numbers and strings where `0`/`''` are legal values
  (`if (count)` is a bug when `0` is meaningful; write `if (count > 0)`).
- Ternaries for values, `if` for control flow. Never nest ternaries.

### Modules
- ESM `import`/`export` only. No wildcard imports. One import statement per module.
- Do not export mutable bindings.
- Prefer named exports; a default export makes the name a per-importer decision. (Framework
  files that require a default — Next.js pages, layouts, route handlers — are the exception.)
- Import order: external → internal absolute → relative, with a blank line between groups.
  Let the linter enforce it.

### Naming
- `camelCase` for variables, functions, props and hooks; `PascalCase` for components and
  types; `SCREAMING_SNAKE_CASE` for module-level constants.
- Filename matches the default export: `ReservationCard.tsx` exports `ReservationCard`.
- No single-letter names except `i` in a tight loop; no `_private` prefixes.
- Booleans read as assertions: `isOpen`, `hasAccess`, `canEdit` — not `open`, `access`.
- Handlers: `handleX` for the implementation, `onX` for the prop that receives it.
- Hooks start with `use`. Say what they return: `useInvoices`, not `useData`.

### JSX
- Double quotes for JSX attributes, single quotes for everything else (Prettier's default,
  and Airbnb's).
- Self-close childless tags: `<Foo />`. No spaces inside curly braces: `bar={baz}`.
- Wrap multi-line JSX in parentheses.
- Omit the value for `true` props: `<Modal open />`.
- `alt` on every `<img>` (empty `alt=""` for decorative images — that is the correct value,
  not a missing one).
- **Never `key={index}`** on a list that can reorder, filter, paginate or grow. Use a stable
  id. This is a correctness rule, not a style rule.
- Spread props sparingly: `{...props}` hides the contract and forwards junk to the DOM.

---

## Superseded — do NOT apply Airbnb's rule here

| Airbnb rule | Status | Do this instead |
|---|---|---|
| "If you have state or refs, prefer `class extends React.Component`" | Obsolete | Function components + hooks, always. New class components are legacy on arrival. |
| "Always define explicit `defaultProps` for non-required props" | **Removed in React 19** for function components | Default parameters: `function Card({ variant = 'solid' })`. |
| "Always use ref callbacks" / string refs | Superseded | `ref` is a normal prop in React 19 — `forwardRef` is no longer needed for new components. `useRef` for imperative handles. |
| "Bind event handlers in the constructor" | N/A | No constructors. Define handlers in the body; extract them out when they do not close over render scope. |
| "Use `.jsx` extension" | Superseded | `.tsx` for components, `.ts` for everything else. |
| PropTypes rules | Superseded | TypeScript props types. Do not add PropTypes to typed code. |
| jQuery section | Dead | — |
| `React.FC` (common folklore, not Airbnb) | Discouraged | Type the props object directly: `function Card({ title }: CardProps)`. |

---

## TypeScript rules Airbnb does not cover

- **No `any`.** Use `unknown` at boundaries and narrow. If you must escape, `@ts-expect-error`
  with a reason comment — it fails the build when the underlying issue is fixed, `@ts-ignore`
  does not.
- **No non-null `!`** to silence the compiler. Handle the null, or make it unrepresentable.
- `as` is an assertion, not a conversion — each one is a promise the compiler stops checking.
  `satisfies` gives you the check without widening, and is what you want for config objects.
- Prefer union types over enums (`type Status = 'draft' | 'published'`). Unions erase to
  nothing and narrow properly.
- `interface` for object shapes that may be extended, `type` for unions, mapped and utility
  types. Be consistent within a file; do not churn existing code to switch.
- Derive, do not restate: `type Props = ComponentProps<typeof Button>`,
  `keyof typeof CONFIG`, `Pick`/`Omit` over hand-copied field lists.
- Type API responses at the boundary once, in the fetch wrapper, and let inference flow
  outward from there. Every component re-declaring the DTO is Duplicate Code.
- `readonly` on props that must not be mutated; `as const` on literal config.

---

## React rules that matter more than any formatting rule

- **Rules of Hooks are not stylistic.** No conditional calls, no calls in loops, complete
  dependency arrays. Suppressing `react-hooks/exhaustive-deps` needs a comment explaining
  why the missing dep is genuinely stable — and it usually is not.
- **Every effect that subscribes must clean up.** Listeners, observers, timers, sockets,
  aborts. Missing cleanup leaks and double-fires under Strict Mode.
- **Do not mutate state.** Produce new objects/arrays; React compares by identity.
- **Controlled or uncontrolled, pick one** per input and do not switch across renders
  (`value={x ?? ''}`, never `value={undefined}` on a controlled field).
- **`key` on lists, and stable.** See above.
- **Never render user HTML** via `dangerouslySetInnerHTML` without sanitising. This repo
  renders CMS rich text — that content is trusted-but-editor-authored, so treat the
  sanitisation boundary as a deliberate decision, not an accident.

---

## Accessibility — non-negotiable, and mostly free

- Semantic elements first: `<button>`, `<a href>`, `<nav>`, `<main>`, `<label>`. A
  `<div onClick>` is not keyboard-reachable and is a defect.
- Buttons that do navigation should be links; links that do actions should be buttons.
- Every input has a real `<label>` (or `aria-label` when visually impossible).
- Headings are a document outline, not font sizes. One `<h1>` per page, no skipped levels.
- Visible focus. Never `outline: none` without a replacement `:focus-visible` style.
- Dialogs and menus trap focus, close on `Escape`, and restore focus on close. Use the
  library's primitive (Chakra/Radix) rather than reimplementing this.
- Colour is never the only signal; check contrast (4.5:1 for body text).
- Images: meaningful `alt`, or `alt=""` for decorative. Icons that are the only content of a
  button need an accessible name.
- Announce async state changes (`aria-live`) — a spinner alone tells a screen-reader user
  nothing.

---

## Comments

- Comment **why**, never what. The code says what.
- A comment explaining a block is a signal to extract a named function instead.
- `TODO(owner)` / `TODO(compat)` markers with a name are useful; bare `TODO` is noise. This
  repo uses `TODO(compat)` and `TODO(devops)` deliberately — never delete those in a
  refactoring; they mark contracts and unfinished infrastructure decisions.
- Keep JSDoc on exported utilities where the type alone does not convey usage.

---

## Enforcement

Anything a tool can enforce should not be a review comment. In this repo:
`npm run lint` in both frontends, `tsc -b` via `npm run build` in the admin panel, and
`eslint-config-next` in `web-cbar`. If a style rule is worth arguing about twice, add it to
the ESLint config instead.
