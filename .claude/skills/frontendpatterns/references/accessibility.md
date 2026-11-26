# Accessibility patterns

Source: condensed and paraphrased from https://frontendpatterns.dev/ (Accessibility category), fetched 2026-10-08.

General rule across all six: native HTML first, ARIA second, and verify with a real screen reader (NVDA / JAWS / VoiceOver). Automated scanners catch markup errors, not flow.

---

### Accessible Forms — `/accessible-forms`
- **Problem:** Unlabelled inputs, colour-only errors and broken tab order leave screen-reader and keyboard users unable to complete or correct a form.
- **Solution:** Tie every input to a `<label>`, mark failed fields with `aria-invalid` and point `aria-describedby` at hint and error text. Group related controls in `<fieldset>`/`<legend>` and keep DOM order equal to visual order.
- **Wrong choice / avoid when:** Never skip it. Avoid placeholder-as-label, errors shown only in red, CSS reordering that breaks tab order, and announcing on every keystroke.
- **Tradeoffs:** More IDs and references to maintain. A dangling `aria-describedby` ID or a framework-generated ID that changes silently breaks the link. `required` + `aria-required` can double-announce.
- **Checks:**
  - Every `input`/`select`/`textarea` has an associated label (`htmlFor`/`id` or wrapping `<label>`). A placeholder alone fails.
  - An invalid field has `aria-invalid="true"` and `aria-describedby` pointing at an error element that exists in the DOM.
  - The visual asterisk is `aria-hidden`, and the field also has `required` (plus `noValidate` on the form if errors are custom).
  - Radio and checkbox groups sit inside `<fieldset>` with a `<legend>`.

```tsx
<label htmlFor={id}>Email <span aria-hidden="true">*</span></label>
<input id={id} type="email" required
  aria-invalid={!!error} aria-describedby={error ? `${id}-err` : `${id}-hint`} />
{error && <p id={`${id}-err`} role="alert">{error}</p>}
```

---

### ARIA Roles and Attributes — `/aria-roles-and-attributes`
- **Problem:** Div-built widgets look interactive but tell assistive tech nothing about what they are or what state they're in.
- **Solution:** Use ARIA as a last resort, for widgets HTML has no element for. A role names the widget type, states (`aria-expanded`/`-selected`/`-checked`/`-pressed`) report its current condition and must be updated by script, and properties (`aria-label`, `aria-controls`, `aria-describedby`) name it and link it to other elements.
- **Wrong choice / avoid when:** The element is native (`<button>`, `<nav>`, `<dialog>`, `<select>`) or a landmark element exists. Don't put `role="menu"` on a plain list of links (use a disclosure button instead), and don't add a role without the keyboard behaviour it promises.
- **Tradeoffs:** Wrong ARIA is worse than none. Parent/child rules are strict. ARIA adds no behaviour. `aria-hidden` hides the whole subtree.
- **Checks:**
  - No redundant roles on native elements and no `role="button"` on a `div` where `<button>` would work.
  - Every state attribute is bound to component state (for example `aria-expanded={open}`), not hard-coded.
  - Required ownership holds: `menuitem` sits inside `menu`, `tab` inside `tablist`, `option` inside `listbox`.
  - `aria-hidden="true"` is used only on decorative content or icons and never on an ancestor of focusable or meaningful content.

---

### Focus Management — `/focus-management`
- **Problem:** After a modal opens, a route changes or an item is deleted, focus stays behind or drops to `<body>`, and keyboard users lose their place.
- **Solution:** Move focus programmatically to where the next action logically happens. Into a dialog when it opens, back to the trigger when it closes, to the new page's `<h1>` after a route change, and to the next (or previous) item after a delete. Non-interactive targets get `tabIndex={-1}`.
- **Wrong choice / avoid when:** The change is minor, it is the initial page load, or it is a back/forward navigation where the content hasn't meaningfully changed. Moving focus unexpectedly is more disorienting than not moving it.
- **Tradeoffs:** Picking the right target takes thought. The target may not be in the DOM yet (wait for render). Screen readers announce focus moves differently.
- **Checks:**
  - Opening an overlay saves `document.activeElement`, and closing it restores focus to that element.
  - A route change focuses the main heading or `<main tabIndex={-1}>`, but not on the first render.
  - Deleting the focused row focuses `items[i+1] ?? items[i-1]` (or the list container), never leaving focus on `<body>`.
  - `:focus-visible` styles exist, with no bare `outline: none` without a replacement.

```tsx
useEffect(() => {
  if (open) { prev.current = document.activeElement as HTMLElement; dialogRef.current?.focus(); }
  else prev.current?.focus();
}, [open]);
```

---

### Focus Trap — `/focus-trap`
- **Problem:** A dimmed overlay stops the mouse but not the keyboard, so Tab walks into hidden page controls and screen readers read the background.
- **Solution:** While the overlay is open, wrap Tab/Shift+Tab between the first and last focusable elements and make the background `inert`. Set `aria-modal="true"`, always provide Escape plus a visible close button, and restore focus to the trigger on close.
- **Wrong choice / avoid when:** You use native `<dialog>.showModal()`, which already makes the rest of the page inert, so a hand-rolled trap is redundant. Also avoid it on non-blocking UI (popovers, toasts) and never build a trap with no exit.
- **Tradeoffs:** The focusable list has to be recomputed when content changes and must skip disabled or hidden elements. Nested modals need coordination. Virtual cursors may still escape. A library adds bundle size, while custom code means handling the edge cases yourself.
- **Checks:**
  - Escape closes the overlay and a close button is reachable by keyboard.
  - Background is `inert` (the portal renders outside the inert root), or native `showModal()` is used.
  - Tab from the last element goes to the first, and Shift+Tab from the first goes to the last.
  - Focus returns to the opener on close, and only the innermost trap is active when modals are nested.

---

### Keyboard Navigation — `/keyboard-navigation`
- **Problem:** Custom widgets can't be focused, ignore Enter, let arrows scroll the page, have no Escape, or hide content behind hover.
- **Solution:** Prefer native controls. For custom widgets follow the WAI-ARIA APG conventions: Tab moves between widgets, arrows move within one (roving `tabIndex`), Enter/Space activate, Escape closes, and Home/End jump to the ends. Keep `:focus-visible` outlines and offer a keyboard alternative to drag-and-drop.
- **Wrong choice / avoid when:** A native element already does the job, or you would be inventing a new key scheme or hijacking keys users expect (arrows to scroll, Ctrl+S to save the page).
- **Tradeoffs:** Full APG patterns (type-ahead, paging, multi-select) are a lot of work. Roving tabindex breaks easily in lists that change. Shortcuts can't be discovered without hints and can clash with the browser or with non-QWERTY layouts.
- **Checks:**
  - Every mouse-operable control is reachable with Tab and operable with Enter/Space.
  - Composite widgets (tabs, listbox, menu) have exactly one `tabIndex={0}` item, the rest are `-1`, and arrows move focus as well as selection.
  - Shortcut handlers check `ctrlKey || metaKey`, normalise `e.key.toLowerCase()`, and call `preventDefault()` only on keys they handle.
  - A skip link to `#main` exists, and nothing reveals content only on `:hover`.

```tsx
<button role="tab" aria-selected={i === active} tabIndex={i === active ? 0 : -1}
  onKeyDown={e => e.key === 'ArrowRight' && focusTab((i + 1) % n)} />
```

---

### Live Regions — `/live-regions`
- **Problem:** Toasts, inline errors, "Saved" badges and result counts update silently for screen-reader users, so they repeat actions or give up.
- **Solution:** Render an empty `aria-live` container at mount and put text into it later. Use `role="status"` (polite) by default and `role="alert"` (assertive) only for blocking errors. `aria-atomic="true"` re-reads the whole region. Hide it visually with `.sr-only` if needed.
- **Wrong choice / avoid when:** The source is a high-frequency stream (tickers, chat tokens, per-second timers, every upload percent), unless you throttle it or announce only milestones. Don't use `assertive` for routine updates.
- **Tradeoffs:** Overuse makes the app unusable. Timing differs across screen readers. Messages must stay long enough to be read. Whether an announcement makes sense can only be checked by hand.
- **Checks:**
  - The live container is in the DOM before its content changes (not mounted together with the message).
  - Polite is the default, and each `role="alert"` is justified by urgency.
  - Rapid updates are debounced or reduced to milestones (25/50/75/100%, "Searching…" then "N results").
  - The message isn't cleared within the first few seconds.

```tsx
// mounted once in the layout; set `msg` later
<div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{msg}</div>
```
