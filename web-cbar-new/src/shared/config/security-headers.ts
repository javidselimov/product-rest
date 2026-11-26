/**
 * Müdafiə başlıqları — **tək mənbə** (spec 002 contracts/runtime-config.md §3, research R5).
 *
 * İki yerdən oxunur: `next.config.ts#headers()` statik başlıqları bütün yollara
 * verir (build zamanı hesablanır), `src/proxy.ts` isə səhifə sorğularında CSP-ni
 * **nonce-lu** və runtime env-dən gələn mənbələrlə variantı ilə əvəz edir.
 *
 * Public sayta məxsus genişlənmə (plan Complexity Tracking):
 *   - `img-src` / `media-src`: media faylları `api-cbar` host-undan gəlir
 *     (`{API_URL}/media/{id}`); CMS məzmununda xarici `https:` şəkillər də ola bilər.
 *   - `frame-src`: YouTube həmişə; ümumi `<iframe>` mənbələri `CSP_FRAME_SRC` ilə.
 *   `script-src` və `connect-src` dəyişmir — brauzer API-yə müraciət etmir.
 */
// Relative on purpose: `next.config.ts` imports this module and Next's config transpiler
// does not resolve the `@/` alias (spec 032).
import { NONCE_BYTES } from '../constants/limits'

export const CSP_HEADER = 'Content-Security-Policy'

/** Proxy nonce-u həm sorğu, həm cavab üçün bu adla ötürür. */
export const NONCE_HEADER = 'x-nonce'

/** CSP-dən kənar dörd başlıq — sorğudan asılı deyil. */
export const STATIC_SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
] as const

/** YouTube həmişə icazəlidir — CMS məzmununda video (spec FR-013). */
export const YOUTUBE_FRAME_SOURCES = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
] as const

export type CspOptions = {
  /** Səhifə sorğusunda proxy verir; statik fallback-da yoxdur. */
  nonce?: string
  /** `api-cbar` origin-i (`https://host`) — media faylları üçün. */
  apiOrigin?: string
  /** `frame-src`-ə əlavə mənbələr (`CSP_FRAME_SRC`). */
  frameSources?: readonly string[]
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

/**
 * CSP sətri.
 *
 * `nonce` verilməyəndə (statik fallback) `script-src 'self'` qalır — API və
 * statik cavablarda inline script onsuz da olmur.
 *
 * `style-src`-də `'unsafe-inline'` saxlanılır: Next öz inline stillərini qoyur
 * və CMS məzmunu inline `style` daşıya bilər (contracts/runtime-config.md §3).
 */
export function contentSecurityPolicy(options: CspOptions = {}): string {
  const { nonce, apiOrigin, frameSources = [] } = options

  const scriptSrc = nonce ? `'self' 'nonce-${nonce}' 'strict-dynamic'` : `'self'`
  const mediaOrigins = unique([apiOrigin ?? ''])
  const imgSrc = unique([`'self'`, 'data:', 'https:', ...mediaOrigins]).join(' ')
  const mediaSrc = unique([`'self'`, ...mediaOrigins]).join(' ')
  const frameSrc = unique([...YOUTUBE_FRAME_SOURCES, ...frameSources]).join(' ')

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${imgSrc}`,
    `media-src ${mediaSrc}`,
    `font-src 'self'`,
    // Brauzer birbaşa API-yə getmir — xarici host yoxdur (spec research R2).
    `connect-src 'self'`,
    `frame-src ${frameSrc}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
  ].join('; ')
}

/** `next.config.ts#headers()` üçün tam siyahı (nonce-suz fallback). */
export function securityHeaders(options: Omit<CspOptions, 'nonce'> = {}): {
  key: string
  value: string
}[] {
  return [
    { key: CSP_HEADER, value: contentSecurityPolicy(options) },
    ...STATIC_SECURITY_HEADERS.map((h) => ({ key: h.key, value: h.value })),
  ]
}

/** Kriptoqrafik nonce — hər sorğuda yenidir. */
export function createNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTES)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}
