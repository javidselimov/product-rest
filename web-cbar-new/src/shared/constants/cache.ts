/**
 * Server cache lifetimes and `Cache-Control` values (spec 032).
 *
 * Content used to live 60 s and the page tree 300 s (spec 003 FR-015/016). Editors saw a
 * reordered menu up to five minutes late, so on 2026-10-14 both were cut to 10 s (chosen
 * instead of spec 023). The cache is stale-while-revalidate: after expiry the first request
 * still gets the old answer and the fresh one is fetched in the background. It cannot be
 * switched off: `api-client` does not forward the visitor IP, so api-cbar's 1000/min limit
 * would be shared by the whole site.
 */

/** Lifetime, in seconds, of every cached api-cbar response. */
export const CONTENT_REVALIDATE_SECONDS = 10

/** Media proxy fallback when the upstream sends no `Cache-Control` (files are content-addressed). */
export const MEDIA_FALLBACK_CACHE_CONTROL = 'public, max-age=3600'

/** `.xlsx` export: private, one minute — the sheet is rebuilt from the same cache anyway. */
export const EXPORT_CACHE_CONTROL = 'private, max-age=60'
