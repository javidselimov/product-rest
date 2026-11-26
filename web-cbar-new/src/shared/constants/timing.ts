/**
 * Timeouts and client-side cache lifetimes (spec 032).
 */
import { MINUTE_MS, SECOND_MS } from './time'

/** Server-side axios timeout towards api-cbar. */
export const API_TIMEOUT_MS = 20 * SECOND_MS

/** TanStack Query defaults for the few client-side queries. */
export const QUERY_STALE_MS = 30 * SECOND_MS
export const QUERY_GC_MS = 5 * MINUTE_MS
