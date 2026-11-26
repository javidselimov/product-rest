/**
 * Sayt boyu canlı yayım popup-ı üçün tək yayım (spec 006 FR-004).
 *
 * `GET /api/v1/video-streams` yalnız aktiv (`isLive`) yazıları, `startsAt`
 * azalan sırası ilə qaytarır. YouTube id-si çıxmayan link (`/@kanal/live`,
 * başqa host) atlanır — pleyer yalnız `youtube-nocookie` embed-dir (CSP
 * `frame-src`). Nəticə serializable-dır: server layout-dan client-ə prop gedir.
 */
import type { VideoStream } from './schemas'
import { youtubeEmbedUrl, youtubeId } from './youtube'

export type LiveStream = {
  id: number
  title: string | null
  embedUrl: string
}

export function toLiveStream(streams: readonly VideoStream[]): LiveStream | null {
  for (const stream of streams) {
    const id = youtubeId(stream.streamUrl)
    if (id) return { id: stream.id, title: stream.title, embedUrl: youtubeEmbedUrl(id) }
  }
  return null
}
