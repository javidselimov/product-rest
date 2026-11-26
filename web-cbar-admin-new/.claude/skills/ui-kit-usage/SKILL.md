---
name: ui-kit-usage
description: Build UI in this project with the design-system component kit it already depends on, instead of hand-rolling elements or reaching for a second component library. Covers which component to reach for, subpath imports, the variant/colorPalette/size axes, overriding styles safely, forms, icons and dark mode. Use whenever writing or changing any React component, page, form, dialog, table or layout in this project, and whenever choosing how to style one.
---

# ui-kit-usage

This project depends on a design-system UI kit. **Use it.** A hand-written
`<button className="…">` is not a shortcut here — it is a control with no focus
ring, no disabled state, no dark mode and no relationship to the rest of the
product.

`<pkg>` below stands for the kit's package name. **Read the real one from this
project's `package.json`** — it is the dependency that exposes a `./button`
subpath. Never invent it.

If the kit has clearly not been wired up yet (no stylesheet import anywhere,
no theme class on `<html>`), stop and run **`ui-kit-setup`** first.

## The references — read them, don't guess

| File | Answers |
| --- | --- |
| `references/components.md` | what exists, at which subpath, with which axes, and whether it needs a client boundary |
| `references/props.md` | every prop the kit declares, with types and defaults |
| `references/tokens.md` | the utility names that survive rebranding and dark mode |
| `references/icons.md` | every icon name |
| `references/package.md` | subpath list, peers, the two stylesheet routes |

They are generated from the kit itself. **Open `components.md` before writing
the first component of a session** — it is the difference between using the kit
and reimplementing it. Do not read `props.md` end to end; grep it for the
component you need.

## The five rules

### 1. Import by subpath

```tsx
import { Button } from '<pkg>/button';   // ✔
import { Button } from '<pkg>';          // ✘ reaches the whole kit
```

The barrel works, but it pulls every component into the module graph. Icons and
`<pkg>/form` are not in the barrel at all.

### 2. `variant` and `colorPalette` are independent axes

`variant` is the *treatment* — how filled in the control is. `colorPalette` is
the *hue*. They compose freely:

```tsx
<Button>Save</Button>                                      {/* solid, primary */}
<Button variant="outline" colorPalette="tertiary">More</Button>
<Button variant="ghost" colorPalette="red">Remove</Button>
```

**The trap:** Button's `default`, `destructive` and `secondary` are one-word
shorthands that pin their own colour and **silently ignore `colorPalette`**.
Reach for the two-axis form whenever the two need to compose:

```tsx
<Button variant="destructive">Delete</Button>                 {/* fine on its own */}
<Button variant="destructive" colorPalette="green">…</Button>  {/* ✘ palette does nothing */}
<Button variant="solid" colorPalette="red">Delete</Button>     {/* ✔ composable */}
```

A whole region can be tinted at once by putting `palette-<name>` on a container
— every kit control inside it that has not set its own follows.

### 3. Sizes are named, and the ladders differ

`xs` · `sm` · `md` · `lg`, `md` everywhere by default; Button adds `xl` and four
square `icon-*` rungs for a lone glyph (always with an `aria-label`).

A Button and an Input at the same named size are **not** the same height from
`md` up — they are on two deliberately different ladders. If a control and a
field must line up in a row, check both rather than assuming `size="md"` matches.

### 4. `className` wins, and you rarely need it

Every component merges `className` **last** through the kit's `cn`, which
resolves Tailwind conflicts — so `className="mt-4"` or even `className="rounded-full"`
takes effect with no `!important` and no `[&>*]` selector. If a utility is not
winning, the cause is almost always one of the two exceptions below, not
specificity.

**Two exceptions**, both where the component grows a wrapper:

```tsx
{/* Input with an adornment: className sizes the WRAPPER */}
<Input
  startElement={<SearchIcon />}
  className="w-64"                      {/* the box */}
  classNames={{ input: 'text-right' }}  {/* the field itself */}
/>

{/* SelectTrigger with clearable: same shape */}
<SelectTrigger clearable className="w-64" classNames={{ trigger: '…' }} />
```

Without an adornment, `Input`'s `className` lands on the `<input>` as usual.

For styling from a stylesheet rather than a prop, target `data-slot="…"` — every
component sets one on its root and on each meaningful part. It is stable; class
names are not.

### 5. Colours come from the semantic layer

Use the names in `references/tokens.md` — `bg-background`, `text-muted-foreground`,
`border-border`, `bg-primary text-primary-foreground`. Never a literal (`#0af`,
`rgb(...)`, `oklch(...)`) and never a Tailwind palette colour (`bg-blue-600`,
`text-slate-500`) on or around a kit component.

This is not style policing. A literal does not re-resolve when `dark` is on and
does not move when the design system is rebranded, so it is a bug that shows up
later, in the dark, in someone else's branch.

Keep `-foreground` with its own surface: `bg-primary text-primary-foreground`,
never a foreground from one pair on a background from another.

## Reaching for the right thing

Before writing any interactive element, check `components.md`. The kit already
has all of these, and each is the one most often re-invented:

- forms → `field` (label, description, error) + `input` / `textarea` / `select`
  / `checkbox` / `radio-group` / `switch`; `form` only when this project uses
  `react-hook-form`
- overlays → `dialog`, `sheet`, `drawer`, `popover`, `dropdown-menu`, `tooltip`
- feedback → `toast`, `alert`, `progress`, `skeleton`, `spinner`
- data → `data-table`, `pagination`, `tree`, `virtual-list`, `badge`
- pickers → `date-picker`, `combobox`, `tree-select`, `input-number`,
  `range-slider`, `command`

Utilities worth knowing before writing your own:

```ts
import { cn } from '<pkg>/lib';                  // the same class merger the kit uses
import { useMediaQuery, useIsMobile } from '<pkg>/hooks';
import { formatDate, addDays } from '<pkg>/date-picker';   // no date library needed
```

Building a control the kit genuinely does not have? Take the vocabulary from
`<pkg>/lib` — `colorPalettes`, `controlVariants`, `controlHeights`,
`fieldHeights` and their types — so it wears the same axes instead of a parallel
set of names.

## Icons

```tsx
import { HomeIcon } from '<pkg>/icons';

<HomeIcon />                                  {/* 24px, outline */}
<HomeIcon variant="solid" size={16} />
<HomeIcon className="text-muted-foreground" />  {/* colour follows currentColor */}
```

`references/icons.md` lists every name. **Do not install an icon package** —
that ships a second icon language into a product that already has one. Inside a
Button an icon needs no sizing; the button sizes it.

## Things that bite

- **`''` is reserved by `Select`** as the "cleared" value. A `SelectItem` must
  have a real value.
- **`third` is the deprecated spelling of `tertiary`** — it still works and is
  dropped in the next major. Write `tertiary`.
- **Portalled components escape a scoped `dark` wrapper.** Dialog, dropdown,
  tooltip and toast mount on `document.body`, so the class belongs on `<html>`.
- **Never give a portalled panel a `z-index` of your own.** Overlays draw from
  the kit's named rungs — modal content on `--ui-z-modal`, every panel a control
  opens (select list, menu, popover) on `--ui-z-popover` above it, then toast
  and tooltip. That ordering is what makes a `Select` or `DropdownMenu` inside a
  Dialog, Sheet or Drawer land on top of the panel it was opened from. A
  hand-written `z-50` on a wrapper, or a stacking context created around one
  (`transform`, `filter`, `will-change`, `isolation` on an ancestor), is what
  breaks it. If a menu renders behind a dialog, look for that — and if a layer
  genuinely needs a rung, take it from `--ui-z-*` rather than inventing a
  number. Those are among the few primitives a consumer may reference directly.
- **Icon-only buttons need `aria-label`.** The kit gives you the box, not the
  name.
- **A tooltip is not reachable on touch.** Never put essential or interactive
  content in one.

## Finish

After writing UI, re-read it once against rule 5 — a literal colour is the
single most common thing to slip through, and it is invisible until dark mode.
If this project's code already diverges from the kit in ways beyond what you
just wrote, say so and offer **`ui-kit-review`** rather than fixing it silently
in an unrelated change.
