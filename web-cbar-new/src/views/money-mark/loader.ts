import 'server-only'

import { cache } from 'react'

import { excerpt, mediaUrl, stripHtml } from '@/entities/content'
import { getMoneyMark } from '@/features/money-marks/api/money-marks.api'
import { isBanknote } from '@/features/money-marks/model/schemas'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import type { Locale } from '@/shared/i18n'

export type MoneyMarkViewData = {
  locale: Locale
  title: string
  type: number
  isCoin: boolean
  frontImageUrl: string | null
  rearImageUrl: string | null
  descriptionHtml: string
  securityHtml: string
  description: string
}

export const loadMoneyMark = cache(async (locale: Locale, rawSlug: string): Promise<MoneyMarkViewData | null> => {
  const mark = await getMoneyMark(locale, safeDecodeURIComponent(rawSlug))
  if (!mark) return null

  const descriptionHtml = prepareCmsHtml(mark.description)
  return {
    locale,
    title: mark.title,
    type: mark.type,
    isCoin: !isBanknote(mark.type),
    frontImageUrl: mediaUrl(mark.frontImageUrl),
    rearImageUrl: mediaUrl(mark.rearImageUrl),
    descriptionHtml,
    securityHtml: prepareCmsHtml(mark.securityFeatures),
    description: excerpt(stripHtml(descriptionHtml), EXCERPT_LENGTH),
  }
})
