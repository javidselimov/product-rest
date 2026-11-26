/** AZIR module constants (spec 032): validation bounds and list column widths. */

/** Rates are percentages: `0 ≤ rate < 10 000`, at most 4 decimals. */
export const RATE_MAX_EXCLUSIVE = 10_000
export const RATE_MAX_DECIMALS = 4

/** Deal volume upper bound (manat), exclusive. */
export const DEAL_VOLUME_MAX_EXCLUSIVE = 1e10

/** Shown for an empty value in the import summary, as in the list cells. */
export const EMPTY_CELL = '—'

export const COLUMN_WIDTH = {
  VALUE_DATE: 140,
  RATE: 140,
} as const
