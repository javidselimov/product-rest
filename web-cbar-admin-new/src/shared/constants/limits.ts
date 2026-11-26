/**
 * Field length and format limits mirrored from the admin API (spec 032).
 * A change here must match the backend validation (api-cbar-admin DTOs).
 */

/** `varchar(255)` columns — short text settings. */
export const SHORT_TEXT_MAX = 255

/** Length of an ISO `yyyy-MM-dd` date string. */
export const ISO_DATE_LENGTH = 10

/** Base64 (and base64url) works in 4-character groups. */
export const BASE64_GROUP = 4

/** Months per year — month selects and inflation grids. */
export const MONTHS_PER_YEAR = 12
