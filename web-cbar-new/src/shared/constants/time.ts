/**
 * Time units and ISO-8601 date string positions (spec 032).
 * Durations with a product meaning (timeouts, cache lifetimes) are in `timing.ts`.
 */

export const SECOND_MS = 1000
export const MINUTE_MS = 60 * SECOND_MS
export const HOUR_MS = 60 * MINUTE_MS
export const DAY_MS = 24 * HOUR_MS

export const MONTHS_PER_YEAR = 12

/** Character offsets inside a `YYYY-MM-DD[THH:mm…]` string. */
export const ISO_DATE = {
  YEAR_END: 4,
  MONTH_START: 5,
  MONTH_END: 7,
  /** Length of the date-only part. */
  LENGTH: 10,
} as const
