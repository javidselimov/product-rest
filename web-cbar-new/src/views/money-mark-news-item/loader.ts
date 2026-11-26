import 'server-only'

import { cache } from 'react'

import { excerpt, formatLongDate, stripHtml } from '@/entities/content'
import { getMoneyMarkNewsItem } from '@/features/money-marks/api/money-mark-news.api'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import type { Locale } from '@/shared/i18n'

export type MoneyMarkNewsItemViewData = {
  locale: Locale
  title: string
  dateLabel: string
  html: string
  description: string
}

export const loadMoneyMarkNewsItem = cache(
  async (locale: Locale, rawSlug: string): Promise<MoneyMarkNewsItemViewData | null> => {
    const item = await getMoneyMarkNewsItem(locale, safeDecodeURIComponent(rawSlug))
    if (!item) return null

    const html = prepareCmsHtml(item.content)
    return {
      locale,
      title: item.title,
      dateLabel: formatLongDate(item.publishedAt, locale),
      html,
      description: excerpt(stripHtml(html), EXCERPT_LENGTH),
    }
  },
)
