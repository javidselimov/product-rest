/**
 * Pul nişanları xəbərləri — contracts/public-api.md #20, #21. 10 s keşlənir (FR-015).
 */
import 'server-only'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import type { Locale } from '@/shared/i18n'

import {
  moneyMarkNewsDetailSchema,
  moneyMarkNewsListSchema,
  type MoneyMarkNewsDetail,
  type MoneyMarkNewsList,
} from '../model/schemas'

const fetchList = cachedJson(moneyMarkNewsListSchema, {
  keyPrefix: 'money-mark-news-list',
  tag: 'money-marks',
})
const fetchDetail = cachedJsonOrNull(moneyMarkNewsDetailSchema, {
  keyPrefix: 'money-mark-news-detail',
  tag: 'money-marks',
})

export function getMoneyMarkNews(locale: Locale, page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<MoneyMarkNewsList> {
  return fetchList(`/api/v1/money-mark-news?locale=${locale}&page=${page}&pageSize=${pageSize}`)
}

export function getMoneyMarkNewsItem(locale: Locale, slug: string): Promise<MoneyMarkNewsDetail | null> {
  return fetchDetail(`/api/v1/money-mark-news/${encodeURIComponent(slug)}?locale=${locale}`)
}
