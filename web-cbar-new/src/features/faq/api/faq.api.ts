/** FAQ (spec 051). Cached for 10 s like the other CMS content (spec 003 FR-015). */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { faqSchema, faqTopicLinkListSchema, type FaqDto, type FaqTopicLinkDto } from '../model/schemas'

const fetchFaq = cachedJson(faqSchema, { keyPrefix: 'faq', tag: 'faq' })
const fetchTopicLinks = cachedJson(faqTopicLinkListSchema, { keyPrefix: 'faq-topic-links', tag: 'faq' })

export function getFaq(locale: Locale): Promise<FaqDto> {
  return fetchFaq(`/api/v1/faq?locale=${locale}`)
}

/** Topics linked to a CMS page; the page shows a link card for each. */
export function getFaqTopicsForPage(locale: Locale, pageId: number): Promise<FaqTopicLinkDto[]> {
  return fetchTopicLinks(`/api/v1/faq/topics?pageId=${pageId}&locale=${locale}`)
}
