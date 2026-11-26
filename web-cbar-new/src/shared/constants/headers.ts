/**
 * Custom HTTP header names exchanged between `src/proxy.ts` and the app (spec 032).
 * The CSP and nonce header names stay in `shared/config/security-headers.ts` with the policy.
 */

/** Set by the proxy; the root layout reads `<html lang>` from it. */
export const LOCALE_HEADER = 'x-locale'
