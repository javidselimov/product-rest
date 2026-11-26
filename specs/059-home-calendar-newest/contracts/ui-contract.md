# UI contract: "Təqvim" block (web-cbar-new, Figma `813:25284`)

Layout numbers are unchanged from spec 022/034. Only the interaction changes.

| Element | Figma | Site |
|---|---|---|
| Box | 424 × auto, padding 20, gap 16, radius 4, 1 px INSIDE stroke `#D4D4D4` | `desk:w-106`, `p-5`, `gap-4`, `rounded-xs`, `border-site-divider` |
| Row | 294 wide, gap 16, min height 107 | `flex min-h-[107px] gap-4`, **+ `relative`** |
| Date box | 74 wide, padding 8, `#F9F9F9`, radius 4; day DM Sans 800 24/28, month 500 14 | unchanged |
| Text column | 204 wide, gap 8; tags 500 12; title 600 16/28; time 400 12 + clock | unchanged |

## Interaction

- **One link per row**: the title `<a>` (inside `<h3>`) is stretched over the whole row with `after:absolute after:inset-0`. Clicking the
  date box, a tag, the title or the time opens `eventHref(event)`.
- Hover anywhere on the row: the title turns `text-primary` and underlined (`group-hover`).
- Keyboard: one tab stop per row; the focus ring is drawn on the stretched pseudo-element (`focus-visible:after:outline-2
  focus-visible:after:outline-ring focus-visible:after:-outline-offset-2`), so it outlines the row, not only the title.
- Accessible name of the row link = the event title. `<time dateTime>` and the time line stay outside the link text.
- **Heading**: `<h2>` stays `text-[32px]/11 font-semibold text-foreground`; its text is a link to `/{locale}/media/events`, underlined on
  hover. No new text, no "all events" button.
- The block is still hidden when there are no events.
