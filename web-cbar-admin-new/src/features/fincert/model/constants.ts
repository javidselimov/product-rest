/** FinCERT panel constants (spec 053). */

/** The section's root route ("Ümumi"); the directions and memberships tabs hang under it. */
export const FINCERT_PATH = '/fincert'
export const FINCERT_DIRECTIONS_PATH = '/fincert/directions'
export const FINCERT_MEMBERSHIPS_PATH = '/fincert/memberships'

/** The API's page-size cap (`PagingQuery.MaxPageSize`): one request lists every direction or membership for ordering. */
export const FINCERT_FULL_LIST_SIZE = 100

/** The statuses the FinCERT forms name in code (the API refuses `scheduled`). */
export const CONTENT_STATUS = { PUBLISHED: 'published' } as const

/** Logo preview in the memberships list. */
export const LOGO_THUMB_WIDTH_PX = 96

/** Field limits of the API (`FincertSupport`), checked in the form before the request. */
export const FINCERT_LIMITS = {
  EMAIL: 255,
  PHONE: 64,
  URL: 500,
  PORTAL_TITLE: 255,
  DESCRIPTION: 1000,
  TITLE: 500,
  NAME: 255,
  BADGE: 120,
} as const
