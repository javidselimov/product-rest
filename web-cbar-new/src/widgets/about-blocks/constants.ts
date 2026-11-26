/**
 * "About us" block constants — history stepper and decorative rings (spec 024/026, spec 032).
 */

/** Autoplay interval (spec 026 FR-014, prototype). */
export const AUTOPLAY_MS = 5000
/** Swipe threshold (spec 026 FR-013). */
export const SWIPE_PX = 50
/** Minimal distance between two year dots on the axis (spec 026 research R10). */
export const MIN_STEP_PX = 56
/** Share of the timeline that must be visible for autoplay to run (research R7). */
export const VISIBLE_SHARE = 0.5
/** IntersectionObserver reports every 1/20 (5 %) of visibility. */
export const VISIBLE_THRESHOLD_STEPS = 20

/** Decorative rings from the `tarix.html` prototype (`.vis`, 360×360): radius and stroke opacity. */
export const HISTORY_RINGS = [
  { r: 55, opacity: 0.35 },
  { r: 84, opacity: 0.29 },
  { r: 113, opacity: 0.23 },
  { r: 142, opacity: 0.17 },
  { r: 171, opacity: 0.11 },
] as const
export const HISTORY_RINGS_SIZE = 360
export const HISTORY_RINGS_CENTER_R = 13

/**
 * Cooperation tables (memorandums, spec 045; memberships, spec 046). One look, so the classes are
 * shared. Paddings: mobile 12 (organization right 8), from tablet 24 — Figma rows `2221:2298`,
 * `2216:6022`, `2208:5885`, `2224:7225`.
 */
export const TABLE_FRAME = 'border-site-divider overflow-hidden rounded-xs border'
export const TABLE_HEAD_ROW = 'bg-site-schedule-head text-primary-foreground'
export const TABLE_BODY_ROW = 'border-site-divider border-t even:bg-(--site-table-stripe)'
export const TABLE_HEAD_CELL = 'py-3 text-xs leading-4 font-semibold tab:text-sm tab:leading-5'
export const TABLE_BODY_CELL = 'py-3 text-sm leading-5 tab:py-4 tab:text-base tab:leading-6'
export const TABLE_ORGANIZATION_CELL = 'pr-2 pl-3 text-left tab:px-6'
/** The year column: right-aligned at every width. */
export const TABLE_YEAR_CELL = 'pr-3 text-right tab:pr-6'

/**
 * Financial literacy icons (spec 047): the icon frame inside the exported Figma card — its top-left corner, size and
 * stroke width. Principle cards `2249:118793`, target groups `2249:118817`.
 */
export const LITERACY_PRINCIPLE_ICON_BOX = { origin: 37, size: 24, stroke: 1.8 } as const
export const LITERACY_CHIP_ICON_BOX = { origin: 21, size: 20, stroke: 1.33333 } as const
/** Photo row images (spec 047 ui-contract §2): desktop 312, tablet 205, mobile 280 wide. */
export const LITERACY_PHOTO_SIZES = '(min-width: 85rem) 312px, (min-width: 46.5rem) 205px, 280px'

/**
 * The document card's two Figma looks: the box (padding, gap) and whether the size line shows. Publications (spec 054
 * ui-contract §6) is the default; the consumer rights card (spec 050 `Complaint / Document` 2463:4855) is tighter and has
 * no size line.
 */
export const DOCUMENT_CARD_VARIANTS = {
  publications: { box: 'gap-4 px-5 py-4 max-tab:p-4', showSize: true },
  consumer: { box: 'gap-3 p-4 max-tab:p-4', showSize: false },
} as const satisfies Record<string, { box: string; showSize: boolean }>

export type DocumentCardVariant = keyof typeof DOCUMENT_CARD_VARIANTS
