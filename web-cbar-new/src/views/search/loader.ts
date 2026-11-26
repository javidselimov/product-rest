/**
 * Axtarış (contracts/routes.md #17): `q` boş → sorğu göndərilmir.
 */
import 'server-only'

import { searchSite } from '@/features/search/api/search.api'
import { groupByType, type KnownResultType, type SearchResult } from '@/features/search/model/schemas'
import { queryParam, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'

export type SearchGroup = { type: KnownResultType | 'other'; items: SearchResult[] }

export type SearchViewData = {
  locale: Locale
  query: string
  groups: SearchGroup[] | null
  total: number
  error: boolean
}

export async function loadSearch(locale: Locale, searchParams: RawSearchParams): Promise<SearchViewData> {
  const query = queryParam.parse(searchParams.q)
  if (!query) return { locale, query, groups: [], total: 0, error: false }

  try {
    const { results } = await searchSite(locale, query)
    return { locale, query, groups: groupByType(results), total: results.length, error: false }
  } catch {
    return { locale, query, groups: null, total: 0, error: true }
  }
}
