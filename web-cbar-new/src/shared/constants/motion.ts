/**
 * Viewport-driven loading and scroll reveal (spec 049, contracts/ui-contract.md §5).
 *
 * The reveal animation itself (duration 450 ms, shift 16 px, stagger 60 ms) lives in `app/globals.css`
 * as `--reveal-*` custom properties, so CSS is its only source; TypeScript only caps the stagger.
 */

/** Heavy widgets (charts) start loading one screen height before they reach the viewport. */
export const LAZY_ROOT_MARGIN = '100% 0px'

/** A reveal starts as soon as one pixel of the element enters the viewport. */
export const REVEAL_ROOT_MARGIN = '0px'

/**
 * Highest stagger step in a card group: 8 × 60 ms + 450 ms = 930 ms, so even the last card of a long
 * list is fully shown within one second (spec FR-011, SC-005).
 */
export const REVEAL_STAGGER_MAX_STEPS = 8

/** The visitor asked the system to reduce motion. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
