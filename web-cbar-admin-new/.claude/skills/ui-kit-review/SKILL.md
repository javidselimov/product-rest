---
name: ui-kit-review
description: Audit this project's UI code against the design-system kit it depends on and bring it back into line — hand-rolled controls that duplicate a kit component, literal colours that break dark mode and rebranding, barrel imports, style overrides fighting the wrong element, and duplicate libraries the kit already replaces. Reports findings with file and line before changing anything. Use when the user asks to review, audit, clean up, align or migrate the UI, asks whether the kit is being used correctly, or after a stretch of UI work written without it.
---

# ui-kit-review

Finds where this project drifted from the UI kit it depends on, and — once the
user agrees — fixes it.

`<pkg>` below stands for the kit's package name. **Read the real one from this
project's `package.json`** before searching for anything.

`references/antipatterns.md` is the classifier: one row per finding type, with
the search that locates it, why it is wrong, and the fix. The facts about what
the kit actually offers are in the sibling skill:
`.claude/skills/ui-kit-usage/references/`.

## Order of work

**Report first, fix second.** A UI sweep touches a lot of files, and most
findings have more than one reasonable fix. Never start editing on the strength
of a "review the UI" request alone.

### 1. Establish the ground truth

- Find the kit dependency in `package.json`. If there is none, stop — there is
  nothing to review against, and say so.
- Read `.claude/skills/ui-kit-usage/references/components.md` for what exists
  and `tokens.md` for the legal utility names. Everything you flag is measured
  against these two files, not against memory.
- Note whether the project uses Tailwind, and which stylesheet route it took —
  it changes what a stray class name means.

### 2. Scope the sweep

Default scope is this project's own UI source — the component, page and feature
directories. **Exclude** `node_modules`, build output, generated files, and any
vendored third-party code. If the working tree has uncommitted UI changes, offer
to review just those first; a whole-project sweep on a dirty tree buries the
thing the user was actually asking about.

State the scope and the file count before you start.

### 3. Classify

Work through `references/antipatterns.md` in order — it is roughly
highest-impact first. For each hit:

- **Verify it.** A regex hit is a candidate, not a finding. Open the file. A
  `bg-blue-600` on a marketing illustration is not the same as one on a Button,
  and `<button>` inside the project's own low-level primitive may be deliberate.
- **Record** file, line, which row of the table it matches, and the concrete
  replacement.
- **Do not report what you have not opened.**

### 4. Report

Group by finding type, not by file — the user wants to know "we have 14 literal
colours", not fourteen separate paragraphs. For each group: what it is, why it
matters in one sentence, the count, the files, and the fix.

Separate them honestly into:

- **Wrong** — will break under dark mode or a rebrand, or reimplements an
  accessible control badly. These are worth fixing.
- **Divergent but working** — a barrel import, an unnecessary `className`. Worth
  fixing when the file is open anyway.
- **Deliberate** — anything the project clearly chose. Say so and move on; do
  not press.

Then ask what to fix. Offer the split (all / the "wrong" group only / one type
across the project / one directory).

### 5. Fix

- **One finding type at a time**, and say which you are doing.
- **A replacement must be behaviour-preserving.** Swapping a hand-rolled button
  for `<Button>` changes its markup, its focus ring and possibly its height —
  that is the point, but call it out rather than presenting it as a no-op.
- **Do not restyle while replacing.** If a hand-rolled control was 44px and the
  kit's `md` is 40px, use the size that matches or say plainly that it moves.
- After each group, run whatever the project has — typecheck, lint, tests — and
  report the real result. A UI sweep that leaves the build broken is worse than
  the drift it removed.

## Guardrails

- **Never touch anything under `node_modules`.** The kit is not editable from
  here; a fix that "works" because a file in there was patched disappears on the
  next install.
- **Never modify the kit's own tokens or class definitions.** If the project
  genuinely needs a colour the kit does not have, that is a request to the kit's
  owner. Say so and, if it is urgent, put the override in the project's own
  stylesheet where it is visible, not scattered across components.
- **A literal colour is not always wrong.** Illustrations, brand logos, charts
  with their own scale, and syntax highlighting are all legitimate. Judgement is
  the point of this skill; a grep alone would be noise.
- **Do not convert a working `react-hook-form` setup** to `<pkg>/form` (or the
  reverse) as part of a review. That is a migration, not an alignment.
- **Report real numbers.** "Found 14, fixed 9, skipped 5 because …" beats
  "cleaned up the UI".
