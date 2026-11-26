/**
 * Paging defaults shared by every list request (spec 032, constitution Article XII).
 * Slice-specific sizes (e.g. the 9-card news grid) live in that slice's `constants.ts`.
 */

/** Page size api-cbar list endpoints default to; sent explicitly so the contract is visible. */
export const DEFAULT_PAGE_SIZE = 10
