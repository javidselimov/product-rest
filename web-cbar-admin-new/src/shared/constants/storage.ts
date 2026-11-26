/**
 * Browser storage, lock and channel keys (spec 032). Keeping them in one place
 * stops two modules from silently sharing (or mistyping) a key.
 */

/** Zustand persist key of the UI store (`shared/model/ui-store.ts`). */
export const UI_STORE_KEY = 'nexus-ui'

/** sessionStorage key with the timestamp of the last chunk-load reload (spec 004). */
export const CHUNK_RELOAD_KEY = 'chunk-reload-at'

/** BroadcastChannel name — logout in one tab logs out the others (spec 005). */
export const AUTH_CHANNEL = 'cbar-admin-auth'

/** `navigator.locks` name serialising refresh-token rotation across tabs (spec 005). */
export const REFRESH_LOCK = 'cbar-admin-refresh'
