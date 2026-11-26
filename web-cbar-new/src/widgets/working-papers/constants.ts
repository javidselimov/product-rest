/** Working paper widgets (spec 054 ui-contract §3, §4). Tailwind `[Npx]` values are outside the magic number rule. */

/** Year menu box of the filter row: 312 on desktop, the full width below (Figma `2825:22947`, `2828:23647`). */
export const FILTER_FIELD_CLASS = 'w-full desk:w-78'

/** The paper row frame: one link, 1px border, 4 radius, hover border (Figma `2825:23800`, hover `2710:8147`). */
export const PAPER_ROW_CLASS =
  'border-site-file-border bg-background hover:border-site-row-hover focus-visible:outline-ring flex gap-6 rounded-xs border p-5 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 max-tab:flex-col max-tab:gap-2 max-tab:p-4'
