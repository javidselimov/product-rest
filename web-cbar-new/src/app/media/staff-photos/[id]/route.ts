/**
 * `GET /media/staff-photos/{staffId}` — əməkdaşın mətbuat fotolarının ZIP-i, `api-cbar`
 * `GET /api/v1/organization/staff/{id}/photos.zip`-in same-origin proxy-si (bio səhifəsindəki
 * "Hamısını yüklə" düyməsi). `/media/[id]` ilə eyni qaydalar: id yalnız rəqəm, gövdə stream
 * olunur, upstream `Content-Disposition: attachment` və `Cache-Control: no-store` olduğu kimi
 * ötürülür. `src/proxy.ts` matcher-i `media`-nı kənarda saxladığı üçün locale yönləndirməsinə
 * düşmür.
 */
import { type NextRequest } from 'next/server'

import { parseMediaId, proxyResponseHeaders, staffPhotosZipUpstreamUrl } from '@/server/media-proxy'
import { HTTP_STATUS } from '@/shared/constants/http'
import { logger } from '@/shared/lib/logger'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: raw } = await context.params
  const id = parseMediaId(raw)

  if (id === null) return new Response(null, { status: HTTP_STATUS.NOT_FOUND })

  let upstream: Response
  try {
    upstream = await fetch(staffPhotosZipUpstreamUrl(id), { headers: { Accept: 'application/zip' }, cache: 'no-store' })
  } catch (error) {
    logger.error('staff photos zip proxy: upstream-ə çatmaq olmadı', { id, error })
    return new Response(null, { status: HTTP_STATUS.BAD_GATEWAY })
  }

  if (!upstream.ok || upstream.body === null) {
    // 404 (üzv yoxdur / foto yoxdur) və digər upstream xətaları eyni cür görünür.
    return new Response(null, { status: HTTP_STATUS.NOT_FOUND })
  }

  return new Response(upstream.body, { status: HTTP_STATUS.OK, headers: proxyResponseHeaders(upstream.headers) })
}
