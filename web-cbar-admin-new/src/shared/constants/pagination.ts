/**
 * List page sizes (spec 032, constitution Article XI). Every CRUD module and MSW
 * handler reads these instead of repeating `20`/`50` (contracts/admin-api.md).
 */

/** Default page size of paged endpoints (`/press-releases`, `/users`, `/media` …). */
export const DEFAULT_PAGE_SIZE = 20

/** Larger page used by dense data lists (AZIR, info lines). */
export const LARGE_PAGE_SIZE = 50
