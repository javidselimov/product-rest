---
name: ui-kit-setup
description: Wire this project up to the UI kit it depends on — the stylesheet, dark mode, the TypeScript-only dev dependency without which every component's props type collapses, the root providers that tooltips and toasts need, and the bundler settings. Use when the kit has just been installed, when components render unstyled or with no colour, when dark mode does nothing, when TypeScript reports TS2559 on a component's own children, or when the user asks how to set up, configure or install the UI kit.
---

# ui-kit-setup

One-time wiring. Run it once per project; after that `ui-kit-usage` is the skill
that matters.

`<pkg>` below stands for the kit's package name. **Read the real one from this
project's `package.json`** — it is the dependency that exposes a `./button`
subpath. Do not guess it, and do not copy a name out of an example.

`references/` for this kit lives in the sibling skill:
`.claude/skills/ui-kit-usage/references/` — `package.md` has the peer versions
and the full subpath list.

## Diagnose first

Most of the time you are here because something already looks wrong. Match the
symptom before changing anything:

| Symptom | Step below |
| --- | --- |
| Components render with no styling at all | 1 — no stylesheet |
| Styling is there but colours are wrong or flat | 1 — both routes taken at once, or the `@source` line missing |
| Borders look heavy or black — table rules, card edges, separators | 1 — route B without the `@layer base` border rule |
| Dialogs and menus appear with no animation | 1 — route B without `tw-animate-css` |
| `class="dark"` changes nothing | 3 |
| The dark toggle works, but a few surfaces stay on the OS setting | 1 — route B without `@custom-variant dark` |
| `TS2559: … has no properties in common with …` on a component's own children | 4 |
| A tooltip never appears | 5 |
| `toast(...)` returns without anything showing | 5 |
| `Invalid hook call` | 6 |
| Styles vanish after a kit update, until a hard restart | 7 |
| `You're importing a component that needs useState` (Next.js) | 8 |

## 1. The stylesheet — exactly one of two routes

**Route A — this project does not use Tailwind.** Import the compiled sheet
once, at the entry module (`main.tsx`, `app/layout.tsx`, `_app.tsx`):

```ts
import '<pkg>/styles.css';
```

Self-contained. Nothing else to configure.

**Route B — this project already runs Tailwind v4.** Take the tokens and let
this project's own build produce the utilities:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import '<pkg>/tokens.css';
@import '<pkg>/theme.css';

@source '../node_modules/<pkg>/dist';

@custom-variant dark (&:is(.dark *));

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

The `@source` line is load-bearing, and its path is relative to the CSS file
declaring it — check it resolves. Without it Tailwind never scans the kit's
compiled output, generates none of the classes the components ask for, and
everything renders unstyled in a way that looks exactly like route A being
missing.

**The other three lines are not optional either**, and each one fails quietly —
nothing errors, the page just looks subtly wrong. Route A gets all of them
inside the compiled stylesheet; route B has to declare them:

| Line | Missing it means |
| --- | --- |
| `@layer base { * { … border-border … } }` | Tailwind v4 defaults `border-color` to `currentColor`, and the kit draws its rules with a bare `border` / `border-b`. Every table rule, card edge and separator is then painted in the **text** colour — heavy in light mode, wrong in dark. |
| `@custom-variant dark (&:is(.dark *))` | The kit's dark mode is class-driven, but Tailwind's own `dark:` variant defaults to `prefers-color-scheme`. Every `dark:` utility *inside the kit* then follows the OS instead of the class the app toggles, so a manual switch half works. |
| `@import 'tw-animate-css'` | The overlays ask for `animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-top-2`. Without the package those class names match no rule and dialogs, menus and tooltips appear with no motion. It is a CSS-only dev dependency: `npm i -D tw-animate-css`. |

`outline-ring/50` in the same base rule is what gives every focus ring its
colour; keep it with the border line.

**Never take both routes.** Two copies of the same layer is wasted bytes and a
specificity fight.

## 2. Peer dependencies

`react` and `react-dom` are required — the project already has them.
`react-hook-form` is **optional**: install it only if the project imports
`<pkg>/form`. Nothing else is needed at runtime; the kit ships zero runtime
dependencies, so installing it adds nothing to the lock file.

## 3. Dark mode

Class-driven, not media-driven. Put `dark` on `<html>`:

```html
<html class="dark">
```

or let `next-themes` (or any equivalent) toggle it. If the project wants to
follow the OS setting, it has to read `prefers-color-scheme` itself and set the
class — the kit deliberately does not do that for you, so an app can offer a
manual switch.

Scoping `dark` to a wrapper `<div>` rather than `<html>` works for inline
content but not for anything that portals out (dialog, dropdown, tooltip,
toast) — those mount on `document.body` and land outside the wrapper. Put the
class on `<html>` unless there is a reason not to, and if there is, pass
`theme` explicitly to `Toaster`.

## 4. Root providers

Two components need something mounted once, high up:

```tsx
import { TooltipProvider } from '<pkg>/tooltip';
import { Toaster } from '<pkg>/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}
```

- **`TooltipProvider`** — `Tooltip` does *not* wrap itself in one. Without a
  provider above it, a tooltip silently never opens.
- **`Toaster`** — `toast(...)` pushes onto a queue; `Toaster` is what renders
  it. No `Toaster`, no toast, and no error either.

In a Next.js App Router project this file needs `'use client'` at the top and
gets rendered inside `app/layout.tsx`.

## 5. Never symlink the kit

If the kit is being consumed from a local checkout rather than a registry, it
must be **copied** into `node_modules`, not linked. A symlink makes Node resolve
`react` from the kit's own tree before this project's, giving two React copies —
and then every hook throws `Invalid hook call`. `npm link` / `pnpm link` /
`file:` protocol all have this problem.

## 6. Bundler notes

**Vite** — add the kit to `optimizeDeps.exclude`:

```ts
export default defineConfig({
  optimizeDeps: { exclude: ['<pkg>'] },
});
```

Without it Vite pre-bundles the kit once and keeps serving that copy, so a kit
update appears to have done nothing until `vite --force`.

**Next.js** — nothing to configure. The kit is dual-format with correct
`exports` conditions.

## 7. Server and client components (Next.js App Router)

Most of the kit is interactive and carries `'use client'`. A handful are
stateless and render in a Server Component untouched — `components.md` marks
which in its **Client** column; read it rather than guessing.

The directive marks where hydration begins, not where rendering begins, so a
client component is still server-rendered on the first request. What that means
in practice: importing an interactive kit component into a Server Component
needs a `'use client'` boundary at or above the importing file.

## Finish

State which route you took for the stylesheet and why, and list what you added.
If a step was already done correctly, say so rather than redoing it. Then check
it actually renders — a `<Button>` with a `colorPalette` on it is the fastest
proof that both the JS and the CSS arrived.
