/**
 * SERVER-ONLY — media faylları üçün same-origin proxy (spec 003 D1, FR-006…FR-008).
 *
 * Niyə proxy var:
 *
 *   1. **`next/image` üçün.** `images.remotePatterns` build zamanı
 *      `required-server-files.json`-a serialize olunur, `API_URL` isə runtime
 *      dəyişənidir (Maddə VIII, FR-026: eyni image üç mühitə promote olunur).
 *      İkisi bir araya gəlmir. Same-origin yol (`/media/12`) `next/image`-in
 *      defolt `localPatterns`-i ilə heç bir konfiqurasiya olmadan işləyir.
 *   2. **Maddə XI / research R2 üçün.** "Brauzer API-yə birbaşa müraciət etmir"
 *      qaydası hazırda **yalnız şəkillərdə** pozulurdu: `<img src>` birbaşa
 *      `{API_URL}/media/{id}`-ə gedirdi. Bu modul həmin deşiyi bağlayır.
 *   3. **CSP-yə toxunmamaq üçün.** `img-src 'self'` onsuz da var.
 *
 * Marşrut faylı (`src/app/media/[id]/route.ts`) nazik qalır: bütün məntiq və
 * başlıq süzgəcləri burada, saf funksiyalarda testlənir (Maddə IV.2).
 */
import 'server-only'

import { MEDIA_FALLBACK_CACHE_CONTROL } from '@/shared/constants/cache'
import { MEDIA_ID_MAX_DIGITS } from '@/shared/constants/limits'

import { env } from './env'

/** Brauzerə ötürülən başlıqlar. Qalanı (server versiyası, cookie və s.) kəsilir. */
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'content-disposition',
  'etag',
  'last-modified',
] as const

/**
 * Marşrut seqmentini media id-sinə çevirir; uyğun gəlməyəndə `null`.
 *
 * Yalnız rəqəm qəbul edilir (FR-007) — bu, proxy-nin ixtiyari upstream yola
 * yönəldilməsinin (SSRF) qapısıdır. Yuxarı hədd `MediaAsset.Id`-nin `long`
 * tipinə uyğundur: 19 rəqəmdən çoxu onsuz da etibarlı id ola bilməz.
 */
export function parseMediaId(raw: string | undefined): string | null {
  if (!raw || raw.length > MEDIA_ID_MAX_DIGITS || !/^\d+$/.test(raw)) return null
  // Baş sıfırlar (`007`) fərqli URL-lər yaradıb keşi parçalayardı.
  if (raw.length > 1 && raw.startsWith('0')) return null
  return raw
}

/** Upstream ünvanı. `env.API_URL` sondaki `/` ilə də gələ bilər. */
export function mediaUpstreamUrl(id: string, apiUrl: string = env.API_URL): string {
  return `${apiUrl.replace(/\/+$/, '')}/media/${id}`
}

/**
 * Əməkdaşın mətbuat fotolarının ZIP-i (`/media/staff-photos/{staffId}` →
 * `api-cbar` `GET /api/v1/organization/staff/{id}/photos.zip`). Eyni proxy qaydası:
 * brauzer API-yə getmir, id yalnız rəqəmdir (`parseMediaId`).
 */
export function staffPhotosZipUpstreamUrl(staffId: string, apiUrl: string = env.API_URL): string {
  return `${apiUrl.replace(/\/+$/, '')}/api/v1/organization/staff/${staffId}/photos.zip`
}

/**
 * Upstream-ə ötürülən sorğu başlıqları.
 *
 * `If-None-Match` ötürülür ki, revalidasiya upstream-də həll olunsun və 304
 * cavabı gövdəsiz qaytarılsın. Başqa heç nə ötürülmür: sorğuda gələn cookie,
 * `Authorization` və ya `X-Forwarded-*` başlıqlarının anonim media endpoint-ində
 * yeri yoxdur (Maddə X).
 */
export function upstreamRequestHeaders(incoming: Headers): HeadersInit {
  const headers: Record<string, string> = { Accept: '*/*' }

  const ifNoneMatch = incoming.get('if-none-match')
  if (ifNoneMatch) headers['If-None-Match'] = ifNoneMatch

  return headers
}

/**
 * Brauzerə qaytarılan başlıqlar: upstream-dən seçilmiş dəst + keş siyasəti.
 *
 * Upstream `Cache-Control` verirsə ona güvənilir (o, faylın content-addressed
 * olduğunu bilir); vermirsə ehtiyat dəyər qoyulur.
 */
export function proxyResponseHeaders(upstream: Headers): Headers {
  const headers = new Headers()

  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.get(name)
    if (value) headers.set(name, value)
  }

  headers.set('Cache-Control', upstream.get('cache-control') ?? MEDIA_FALLBACK_CACHE_CONTROL)

  return headers
}
