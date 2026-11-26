/**
 * `GET /media/{id}` — media faylının same-origin proxy-si (spec 003 FR-006…FR-008).
 *
 * Nazik marşrut faylı (Maddə IV.2): id yoxlaması, başlıq süzgəcləri və upstream
 * ünvanı `@/server/media-proxy`-dədir. Burada yalnız sorğu → cavab bağlanması var.
 *
 * Gövdə **stream** olunur (`upstream.body` olduğu kimi ötürülür) — 600 KB-lıq
 * qalereya örtükləri Node yaddaşında buferlənmir.
 *
 * ⚠️ `src/proxy.ts` matcher-i `media`-nı kənarda saxlayır. Əks halda locale
 * yönləndirməsi `/media/12`-ni `/az/media/12`-yə atar və bu marşrut heç vaxt
 * çağırılmaz.
 */
import { type NextRequest } from 'next/server'

import {
  mediaUpstreamUrl,
  parseMediaId,
  proxyResponseHeaders,
  upstreamRequestHeaders,
} from '@/server/media-proxy'
import { HTTP_STATUS } from '@/shared/constants/http'
import { logger } from '@/shared/lib/logger'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: raw } = await context.params
  const id = parseMediaId(raw)

  if (id === null) return new Response(null, { status: HTTP_STATUS.NOT_FOUND })

  let upstream: Response
  try {
    upstream = await fetch(mediaUpstreamUrl(id), {
      headers: upstreamRequestHeaders(request.headers),
      // Fayl baytlarını Next-in data keşinə yazmırıq — brauzer keşi `Cache-Control`
      // ilə idarə olunur, `next/image` isə öz variantlarını ayrıca keşləyir.
      cache: 'no-store',
    })
  } catch (error) {
    // Şəbəkə/timeout: texniki mətn istifadəçiyə çatmır (Maddə VII.3), log-a düşür.
    logger.error('media proxy: upstream-ə çatmaq olmadı', { id, error })
    return new Response(null, { status: HTTP_STATUS.BAD_GATEWAY })
  }

  if (upstream.status === HTTP_STATUS.NOT_MODIFIED) {
    return new Response(null, { status: HTTP_STATUS.NOT_MODIFIED, headers: proxyResponseHeaders(upstream.headers) })
  }

  if (!upstream.ok || upstream.body === null) {
    // 404 və digər upstream xətaları eyni cür görünür: mövcud olmayan fayl.
    return new Response(null, { status: HTTP_STATUS.NOT_FOUND })
  }

  return new Response(upstream.body, {
    status: HTTP_STATUS.OK,
    headers: proxyResponseHeaders(upstream.headers),
  })
}
