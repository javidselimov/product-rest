/**
 * Figma layout numbers shared by more than one slice (spec 032). One-off sizes stay in the
 * component next to their Figma node reference; Tailwind tokens for the same values are in
 * `globals.css` (`@theme`).
 */

/** `tab:` breakpoint — tablet frame width. */
export const TAB_BREAKPOINT_PX = 744
/** `desk:` breakpoint — desktop frame width. */
export const DESK_BREAKPOINT_PX = 1360
/** Content column on desktop (section pages, org chart, galleries). */
export const CONTENT_COLUMN_PX = 984

/** Intrinsic size of the CBAR logo SVGs (header and footer). */
export const LOGO_SIZE = { width: 228, height: 56 } as const

/** Cards loaded at once in a list: the first row on desktop (spec 036). */
export const EAGER_CARD_COUNT = 3

/** `next/image` `sizes` strings reused across list grids. */
export const IMAGE_SIZES = {
  /** Three-column card grid: thirds on desktop, halves on tablet, full on mobile. */
  GRID_THIRD: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  /** Two-column grid: halves from tablet up. */
  HALF: '(min-width: 640px) 50vw, 100vw',
  /** Image spanning the desktop content column. */
  CONTENT_COLUMN: `(min-width: 85rem) ${CONTENT_COLUMN_PX}px, 100vw`,
} as const
