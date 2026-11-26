/**
 * Qanunvericilik — contracts/public-api.md #7–#9. 10 s keşlənir (spec 003 FR-015).
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import type { Locale } from '@/shared/i18n'

import { lawCategorySchema, lawDetailSchema, lawListSchema, type LawCategory, type LawDetail, type LawList } from '../model/schemas'

const lawCategoryListSchema = z.array(lawCategorySchema)

const fetchList = cachedJson(lawListSchema, { keyPrefix: 'law-list', tag: 'laws' })
const fetchDetail = cachedJsonOrNull(lawDetailSchema, { keyPrefix: 'law-detail', tag: 'laws' })
const fetchCategories = cachedJson(lawCategoryListSchema, { keyPrefix: 'law-categories', tag: 'laws' })

export function getLaws(
  locale: Locale,
  page = 1,
  categoryId?: number,
  type?: number,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<LawList> {
  const params = new URLSearchParams({ locale, page: String(page), pageSize: String(pageSize) })
  if (categoryId != null) params.set('categoryId', String(categoryId))
  if (type != null) params.set('type', String(type))
  return fetchList(`/api/v1/laws?${params}`)
}

export function getLaw(locale: Locale, slug: string): Promise<LawDetail | null> {
  return fetchDetail(`/api/v1/laws/${encodeURIComponent(slug)}?locale=${locale}`)
}

export function getLawCategories(locale: Locale): Promise<LawCategory[]> {
  return fetchCategories(`/api/v1/law-categories?locale=${locale}`)
}
