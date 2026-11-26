import 'server-only'

import { cache } from 'react'

import { excerpt, formatLongDate, mediaUrl, stripHtml, type AttachmentFile } from '@/entities/content'
import { getLaw } from '@/features/laws/api/laws.api'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import type { Locale } from '@/shared/i18n'

export type LawViewData = {
  locale: Locale
  title: string
  categoryName: string | null
  dateLabel: string
  html: string
  description: string
  attachments: AttachmentFile[]
}

export const loadLaw = cache(async (locale: Locale, rawSlug: string): Promise<LawViewData | null> => {
  const law = await getLaw(locale, safeDecodeURIComponent(rawSlug))
  if (!law) return null

  const html = prepareCmsHtml(law.description)
  return {
    locale,
    title: law.title,
    categoryName: law.categoryName,
    dateLabel: formatLongDate(law.publishedAt, locale),
    html,
    description: excerpt(stripHtml(html), EXCERPT_LENGTH),
    attachments: law.assets.map((asset) => ({
      id: asset.mediaId,
      title: asset.originalName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      group: null,
      url: mediaUrl(asset.url) ?? asset.url,
    })),
  }
})
