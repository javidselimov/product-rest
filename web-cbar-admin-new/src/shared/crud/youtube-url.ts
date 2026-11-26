/**
 * YouTube linki qaydası — canlı yayım modulu (spec 006 FR-002). İctimai sayt
 * linki `youtube-nocookie` embed-ə çevirir, ona görə yalnız YouTube host-ları
 * qəbul olunur. Videolar bölməsi qəsdən yumşaq qaydada qalır (yalnız
 * `http(s)://`, `features/videos/model/modules.ts`).
 */

import { i18n } from '@/shared/i18n'
import type { FormSchema } from './types'

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
])

/** `http(s)://` + YouTube host-u. Boş dəyəri `required` qaydası yoxlayır. */
export function isYoutubeUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      YOUTUBE_HOSTS.has(url.hostname.toLowerCase())
    )
  } catch {
    return false
  }
}

/** `/embed/<id>`, `/shorts/<id>`, `/live/<id>`, `/v/<id>`. */
const PATH_ID = /^\/(?:embed|shorts|live|v)\/([^/?]+)/
const VIDEO_ID = /^[\w-]{6,}$/

/**
 * The video id of a YouTube link, or null — the same rule as the admin API's
 * `FaqSupport.YoutubeId` (spec 051), so the form refuses what the API would.
 */
export function youtubeVideoId(value: string): string | null {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '')
  let id: string | null | undefined = null
  if (host === 'youtu.be') id = url.pathname.split('/')[1]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.pathname === '/watch' ? url.searchParams.get('v') : PATH_ID.exec(url.pathname)?.[1]
  }
  return id && VIDEO_ID.test(id) ? id : null
}

/** Form sxeminə YouTube yoxlaması əlavə edir; mesaj validasiya anında i18n-dən oxunur. */
export const withYoutubeUrlRule =
  (field: string, messageKey: string) =>
  (base: FormSchema): FormSchema =>
    base.superRefine((data, ctx) => {
      const url = data.values[field]
      if (typeof url !== 'string' || url.trim() === '') return
      if (!isYoutubeUrl(url)) {
        ctx.addIssue({
          code: 'custom',
          path: ['values', field],
          message: i18n.t(messageKey),
        })
      }
    })
