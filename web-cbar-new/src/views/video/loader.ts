/**
 * Video detail (spec 035): `/media/videos/{id}`. `null` → 404 — a bad id, or a video that is
 * inactive or has no translation in the locale. Wrapped in `cache()` so `generateMetadata`
 * and the page share one request.
 */
import 'server-only'

import { cache } from 'react'

import { getVideo } from '@/features/media/api/media.api'
import { youtubeEmbedUrl, youtubeId, youtubeThumbnail } from '@/features/media/model/youtube'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import type { Locale } from '@/shared/i18n'
import { videosHref } from '@/views/media-gallery-list/loader'
import { parseStaffId as parsePositiveId } from '@/views/staff-member/loader'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type VideoViewData = {
  locale: Locale
  title: string
  /** `null` when the stored link is not a YouTube video — only the link is shown then. */
  player: { embedUrl: string; thumbnailUrl: string } | null
  youtubeUrl: string | null
  /** Breadcrumb "… › Video gallery › {title}", the list item active in the menu. */
  shell: SectionShellData
}

export const loadVideo = cache(async (locale: Locale, rawId: string): Promise<VideoViewData | null> => {
  const id = parsePositiveId(rawId)
  if (id === null) return null

  const [video, tree] = await Promise.all([getVideo(locale, id), getPagesTree(locale).catch(() => [])])
  if (!video) return null

  const title = video.title ?? ''
  const href = videosHref(locale)
  const youtube = youtubeId(video.youtubeUrl)

  return {
    locale,
    title,
    player: youtube ? { embedUrl: youtubeEmbedUrl(youtube), thumbnailUrl: youtubeThumbnail(youtube) } : null,
    youtubeUrl: video.youtubeUrl,
    shell: buildSectionShell({
      section: 'media',
      tree,
      locale,
      current: { href },
      pageUrl: await absolutePageUrl(`${href}/${id}`),
      pageTitle: title,
      trail: title,
    }),
  }
})
