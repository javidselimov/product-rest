/**
 * AZIR səhifəsi (spec 021 contracts/web-routes.md §1): 1D sətirləri (qrafik + cədvəl,
 * eyni sorğu) və statistika bloku müstəqildir — biri yıxılsa digəri göstərilir (FR-017).
 */
import 'server-only'

import { toIsoDate } from '@/entities/content'
import { getAzir, getAzirSummary } from '@/features/stats/api/stats.api'
import { parseAzirRange, type AzirRange } from '@/features/stats/model/azir-range'
import {
  AZIR_TABLE_TERM,
  hasReservePlan,
  isAzirTableValue,
  toAzirTableRows,
  type AzirTableRow,
} from '@/features/stats/model/azir-rows'
import type { AzirSummary } from '@/features/stats/model/schemas'
import { azirDailySeries, type ChartData } from '@/features/stats/model/series'
import { buildHref, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'

export type AzirPageData = {
  locale: Locale
  range: AzirRange
  rows: { data: AzirTableRow[] | null; error: boolean }
  chart: { data: ChartData | null; error: boolean }
  summary: { data: AzirSummary | null; error: boolean }
  hasReservePlan: boolean
  exportHref: string
}

/** Route faylı `features`-ə birbaşa getmir (nazik route qaydası) — aralıq buradan oxunur. */
export function azirRangeFromSearchParams(searchParams: RawSearchParams): AzirRange {
  return parseAzirRange(searchParams, toIsoDate(new Date()))
}

export async function loadAzirPage(locale: Locale, range: AzirRange): Promise<AzirPageData> {
  const [values, summary] = await Promise.allSettled([
    getAzir({ from: range.from, to: range.to, term: AZIR_TABLE_TERM }),
    getAzirSummary(),
  ])

  const rows = values.status === 'fulfilled' ? toAzirTableRows(values.value) : null
  const chart =
    values.status === 'fulfilled'
      ? azirDailySeries(values.value.filter(isAzirTableValue), AZIR_TABLE_TERM, 'full')
      : null

  return {
    locale,
    range,
    rows: { data: rows, error: values.status === 'rejected' },
    chart: { data: chart, error: values.status === 'rejected' },
    summary: {
      data: summary.status === 'fulfilled' ? summary.value : null,
      error: summary.status === 'rejected',
    },
    hasReservePlan: rows ? hasReservePlan(rows) : false,
    exportHref: buildHref(`/${locale}/statistics/azir/export`, { dateFrom: range.from, dateTo: range.to }),
  }
}
