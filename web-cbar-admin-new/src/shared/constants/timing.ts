/**
 * Timeouts, debounce delays and cache lifetimes (spec 032). Values are
 * milliseconds unless the name says otherwise.
 */

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS

/** Search and filter inputs wait this long after the last keystroke before querying. */
export const SEARCH_DEBOUNCE_MS = 400

/** Axios request timeout (`shared/api/axios.ts`). */
export const API_TIMEOUT_MS = 30 * SECOND_MS

/** Default TanStack Query `staleTime` for lists. */
export const QUERY_STALE_MS = 30 * SECOND_MS

/** `staleTime` for slowly changing lookups (select options, currency master data). */
export const DETAIL_STALE_MS = MINUTE_MS

/** `gcTime` of media preview blobs — kept while the user pages through the library. */
export const PREVIEW_GC_MS = 5 * MINUTE_MS

/** The access token is refreshed this long before `expiresAt` (spec 005). */
export const REFRESH_MARGIN_MS = 30 * SECOND_MS

/** A chunk-load reload is attempted at most once per window (spec 004). */
export const CHUNK_RELOAD_WINDOW_MS = 10 * SECOND_MS

/** Token `exp` is in seconds; JS dates want milliseconds. */
export const MS_PER_SECOND = SECOND_MS
