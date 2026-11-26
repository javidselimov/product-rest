/**
 * Press releases — contracts/public-api.md #1, #2 (spec 029 adds `q`, `from`, `to`).
 * Cached for 10 s (spec 003 FR-015); each filter combination is its own cache key.
 */
import 'server-only'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import type { Locale } from '@/shared/i18n'

import {
  pressReleaseDetailSchema,
  pressReleaseListSchema,
  type PressReleaseDetail,
  type PressReleaseList,
  type PressReleaseType,
} from '../model/schemas'

const fetchList = cachedJson(pressReleaseListSchema, {
  keyPrefix: 'press-release-list',
  tag: 'press-releases',
})
const fetchDetail = cachedJsonOrNull(pressReleaseDetailSchema, {
  keyPrefix: 'press-release-detail',
  tag: 'press-releases',
})

export type PressReleaseListQuery = {
  page?: number
  pageSize?: number
  /** Omitted = both kinds. */
  type?: PressReleaseType
  /** Title search; blank is not sent. */
  q?: string
  /** `YYYY-MM-DD`, Baku day, inclusive. */
  from?: string
  to?: string
}

export function getPressReleases(locale: Locale, query: PressReleaseListQuery = {}): Promise<PressReleaseList> {
  const { page = 1, pageSize = DEFAULT_PAGE_SIZE, type, q, from, to } = query
  const params = new URLSearchParams({ locale, page: String(page), pageSize: String(pageSize) })
  for (const [key, value] of Object.entries({ type, q, from, to })) {
    if (value) params.set(key, value)
  }
  return fetchList(`/api/v1/press-releases?${params}`)
}

export function getPressRelease(locale: Locale, slug: string): Promise<PressReleaseDetail | null> {
  return fetchDetail(`/api/v1/press-releases/${encodeURIComponent(slug)}?locale=${locale}`)
}
