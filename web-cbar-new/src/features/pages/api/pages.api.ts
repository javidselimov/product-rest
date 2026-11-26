/**
 * Səhifə ağacı və CMS səhifəsi — contracts/public-api.md #3, #4.
 *
 * Ağac və səhifə detalı adi məzmun ömrü ilə keşlənir. Ağac əvvəl 300 saniyə idi,
 * amma naviqasiya dəyişikliyi public saytda 5 dəqiqə gecikirdi (`@/server/cached`).
 */
import 'server-only'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { pageDetailSchema, pageTreeSchema, type PageDetail, type PageNode } from '../model/schemas'

const fetchTree = cachedJson(pageTreeSchema, { keyPrefix: 'pages-tree', tag: 'pages' })
const fetchPage = cachedJsonOrNull(pageDetailSchema, { keyPrefix: 'page-detail', tag: 'pages' })

export function getPagesTree(locale: Locale): Promise<PageNode[]> {
  return fetchTree(`/api/v1/pages/tree?locale=${locale}`)
}

export function getPage(locale: Locale, slug: string): Promise<PageDetail | null> {
  return fetchPage(`/api/v1/pages/${encodeURIComponent(slug)}?locale=${locale}`)
}
