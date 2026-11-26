# Anti-patterns

The classifier for `ui-kit-review`. Roughly highest-impact first.

Every "Find with" below is a **candidate finder, not a verdict**. Open the file
before recording anything — several of these have entirely legitimate forms, and
the last section lists them.

`<pkg>` is the kit's package name, read from this project's `package.json`.

---

## 1. A hand-rolled control the kit already ships

**Find with** — `<button`, `<input`, `<select`, `<textarea`, `role="dialog"`,
`role="tab"`, `aria-expanded` in this project's own source.

**Why it matters.** The kit's controls carry a focus-visible ring, disabled and
`aria-disabled` handling, invalid styling driven by `aria-invalid`, sized icon
slots, and dark mode. A hand-written one has none of that, and the gap is
invisible until someone navigates by keyboard or turns the lights off. Overlays
are worse: a hand-built dialog usually has no focus trap, no scroll lock, no
escape handling and no `aria-modal`.

**Fix.** Look the equivalent up in `../../ui-kit-usage/references/components.md`
and swap it. Keep the behaviour identical; if the height or radius moves, say so.

```tsx
// ✘
<button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save</button>

// ✔
import { Button } from '<pkg>/button';
<Button>Save</Button>
```

**Not a finding when** the element is a genuinely plain, unstyled `<button>`
used purely as a click target inside a larger custom widget, or an `<input>` of
a type the kit has no component for (`file`, `range` — check first, the kit has
`upload` and `range-slider`).

---

## 2. A literal colour, or a Tailwind palette colour

**Find with** — `#[0-9a-fA-F]{3,8}`, `rgb(`, `hsl(`, `oklch(`, and
`(bg|text|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]`.

**Why it matters.** These do not re-resolve when `dark` is on, and they do not
move when the design system is rebranded. Both failures land later and on
someone else — a page that looks right today is unreadable in dark mode, and a
brand change leaves a scatter of the old colour behind.

**Fix.** The nearest semantic name from
`../../ui-kit-usage/references/tokens.md`. Surface and ink move together:

```tsx
// ✘  bg-white text-gray-900 border-gray-200
// ✔  bg-background text-foreground border-border

// ✘  bg-red-50 text-red-700
// ✔  <Alert colorPalette="red" variant="subtle">   — or bg-destructive/10 text-destructive
```

**Not a finding when** it is an illustration, a brand logo, a chart series with
its own scale, syntax highlighting, or an `<svg>` whose colours are the artwork.

---

## 3. A second component or icon library

**Find with** — in `package.json`: `lucide-react`, `react-icons`, `@heroicons`,
`@mui/`, `antd`, `react-bootstrap`, `@chakra-ui`, `@headlessui`, `clsx`,
`classnames`, `class-variance-authority`, `tailwind-merge`, `cmdk`, `sonner`,
`vaul`, `date-fns`, `dayjs`, `moment`, `luxon`.

**Why it matters.** Two component libraries means two focus-ring styles, two
radius ladders and two dark-mode stories in one product. The class-composition
packages are worse than redundant — a second merger means an app `className` and
a kit `className` resolve by different rules, so overrides work in some places
and not others.

**Fix.**

| Instead of | Use |
| --- | --- |
| any icon package | `<pkg>/icons` — see `../../ui-kit-usage/references/icons.md` |
| `clsx` / `classnames` / `tailwind-merge` | `cn` from `<pkg>/lib` |
| `class-variance-authority` | `cva` from `<pkg>/lib` |
| `cmdk` | `<pkg>/command` |
| `sonner` | `<pkg>/toast` |
| `vaul` | `<pkg>/drawer` |
| a date library, for formatting a picker value | `formatDate`, `parseDate`, `addDays`, … from `<pkg>/date-picker` |
| a headless component library | the kit component of the same name |

**Not a finding when** the package is used for something outside the kit's scope
— a charting library, a rich-text editor, a date library doing real timezone or
locale arithmetic rather than formatting.

---

## 4. `colorPalette` alongside a shorthand `variant`

**Find with** — `variant="default"`, `variant="destructive"` or
`variant="secondary"` on the same element as `colorPalette`.

**Why it matters.** Those three Button variants pin their own colour from the
semantic roles and ignore `colorPalette` entirely. The code reads as if it set a
hue; nothing happens, and nothing warns.

**Fix.**

```tsx
// ✘
<Button variant="destructive" colorPalette="green">Archive</Button>
// ✔
<Button variant="solid" colorPalette="green">Archive</Button>
```

---

## 5. `className` on the wrong element

**Find with** — `<Input` with `startElement` or `endElement` **and** a
`className`; `<SelectTrigger` with `clearable` **and** a `className`.

**Why it matters.** When either component takes an adornment it renders a
wrapper that carries the box, so `className` sizes the wrapper and anything
aimed at the field itself lands on the wrong element and appears to be ignored.

**Fix.** `className` for the box, `classNames.input` / `classNames.trigger` for
the control:

```tsx
<Input startElement={<SearchIcon />} className="w-64" classNames={{ input: 'text-right' }} />
```

---

## 6. Fighting the component instead of passing `className`

**Find with** — `!important`, `!bg-`, `!text-`, `[&>*]`, `[&_button]`,
`:global(`, or a stylesheet rule targeting a generated kit class name.

**Why it matters.** Every kit component already merges `className` last through
a Tailwind-aware merger, so a plain utility wins on its own. An `!important`
almost always means the override was aimed at the wrong element (see 5) — and it
then wins over states it should not, so the disabled or invalid treatment stops
working.

**Fix.** Pass the utility as `className`. For styling from a stylesheet, target
`data-slot="…"` — the kit sets one on every root and every meaningful part, and
unlike a class name it does not change between versions.

---

## 7. Barrel imports

**Find with** — `from '<pkg>'` (no subpath).

**Why it matters.** The barrel reaches every component in the kit, so a module
that wanted one Button drags the rest into the graph.

**Fix.** `from '<pkg>/button'`. Low severity — worth fixing when the file is
open anyway.

**Not a finding when** it is `<pkg>/lib`, `<pkg>/hooks` or `<pkg>/icons`; those
*are* subpaths.

---

## 8. Deprecated `third`

**Find with** — `colorPalette="third"`, `palette-third`, `'third'`.

**Why it matters.** It is the pre-rename spelling of `tertiary`, kept as an
alias and dropped in the next major.

**Fix.** `tertiary`, everywhere. Purely mechanical.

---

## 9. `''` as a `SelectItem` value

**Find with** — `<SelectItem value=""`.

**Why it matters.** The empty string is the kit's "cleared" sentinel, so an item
using it cannot be distinguished from no selection.

**Fix.** Give the item a real value and treat the empty string as "nothing
selected" in the handler.

---

## 10. A missing client boundary (Next.js App Router only)

**Find with** — a file importing an interactive kit component with no
`'use client'` at the top of it or of an ancestor.

**Why it matters.** Most of the kit is interactive and carries the directive;
importing one into a Server Component throws at build or request time.

**Fix.** Add the boundary at the smallest sensible level — usually the leaf
component, not the page. Check the **Client** column in
`../../ui-kit-usage/references/components.md`: several components are stateless
and need nothing.

---

## Legitimate things that look like findings

Do not report these:

- A literal colour in an illustration, logo, chart scale or syntax theme.
- A plain unstyled `<button>` used as a bare click target inside a custom widget.
- `className` on a kit component for **layout** — `mt-4`, `w-full`, `flex-1`.
  That is exactly what `className` is for.
- A component the kit genuinely does not have, built out of kit primitives and
  the vocabulary from `<pkg>/lib`. That is the intended way to extend it.
- A `data-slot` selector in this project's stylesheet. That is the supported
  hook.
- An override that exists because the design deliberately departs from the
  system. Ask before changing it.
