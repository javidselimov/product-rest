/**
 * Pul nişanları kataloqu — contracts/public-api.md #17–#19. 10 s keşlənir (FR-015).
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import {
  moneyMarkCategorySchema,
  moneyMarkDetailSchema,
  moneyMarkListItemSchema,
  type MoneyMarkCategory,
  type MoneyMarkDetail,
  type MoneyMarkListItem,
} from '../model/schemas'

const moneyMarkListSchema = z.array(moneyMarkListItemSchema)
const moneyMarkCategoryListSchema = z.array(moneyMarkCategorySchema)

const fetchList = cachedJson(moneyMarkListSchema, { keyPrefix: 'money-mark-list', tag: 'money-marks' })
const fetchDetail = cachedJsonOrNull(moneyMarkDetailSchema, {
  keyPrefix: 'money-mark-detail',
  tag: 'money-marks',
})
const fetchCategories = cachedJson(moneyMarkCategoryListSchema, {
  keyPrefix: 'money-mark-categories',
  tag: 'money-marks',
})

export function getMoneyMarks(locale: Locale, type?: number, categoryId?: number): Promise<MoneyMarkListItem[]> {
  const params = new URLSearchParams({ locale })
  if (type != null) params.set('type', String(type))
  if (categoryId != null) params.set('categoryId', String(categoryId))
  return fetchList(`/api/v1/money-marks?${params}`)
}

export function getMoneyMark(locale: Locale, slug: string): Promise<MoneyMarkDetail | null> {
  return fetchDetail(`/api/v1/money-marks/${encodeURIComponent(slug)}?locale=${locale}`)
}

export function getMoneyMarkCategories(locale: Locale): Promise<MoneyMarkCategory[]> {
  return fetchCategories(`/api/v1/money-mark-categories?locale=${locale}`)
}
