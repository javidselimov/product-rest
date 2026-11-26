/**
 * Site chrome constants — header navigation and footer (spec 002, spec 032).
 */

/** How many CMS sections sit directly in the bar from `desk` (1360) up; the rest go to the overflow menu (Figma `I813:25657;9:29`, spec 056). */
export const VISIBLE_SECTIONS = 9
/** How many of them fit in the bar from `lg` (1024) to `desk`: nine are ~1117px wide, the bar there ~992 (spec 056 research R2). */
export const VISIBLE_SECTIONS_NARROW = 8
/**
 * Columns of the wide-screen hamburger panel (`lg:columns-4`, Figma `1088:26873`). From `desk` up the first sections
 * open a column each and the rest stack in the last one, as in Figma (spec 056 research R4).
 */
export const OVERFLOW_PANEL_COLUMNS = 4
/** Section → column → flyout: 3 levels, like the old cbar.az. */
export const MAX_DEPTH = 3
/** Footer falls back to the first top-level sections when none of the known titles match. */
export const FOOTER_SECTIONS = 6
/** Delay before a hover-opened panel closes after the pointer leaves, ms — allows a diagonal move. */
export const LEAVE_DELAY = 200
