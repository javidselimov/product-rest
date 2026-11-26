/**
 * Validation bounds and defensive limits (spec 032).
 */

/** Longest accepted `?q=` search string. */
export const QUERY_MAX_LENGTH = 200
/** Accepted `?year=` range. */
export const YEAR_MIN = 1990
export const YEAR_MAX = 2100
/** PostgreSQL `bigint` has 19 digits — a longer media id cannot exist. */
export const MEDIA_ID_MAX_DIGITS = 19
/** How deep `logger.redact()` walks nested objects. */
export const REDACT_MAX_DEPTH = 4
/** Random bytes behind the per-request CSP nonce. */
export const NONCE_BYTES = 16
/** Default `maximumFractionDigits` for `formatNumber`. */
export const DEFAULT_MAX_FRACTION = 4
