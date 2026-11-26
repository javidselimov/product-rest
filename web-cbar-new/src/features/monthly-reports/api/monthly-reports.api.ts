/** Monthly reports of the consumer rights pages (spec 052). Cached for 10 s like every content list (spec 003 FR-015). */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { monthlyReportListSchema, type MonthlyReportSeriesDto } from '../model/schemas'

const fetchList = cachedJson(monthlyReportListSchema, { keyPrefix: 'monthly-reports', tag: 'monthly-reports' })

/** The asked series that have a report in the locale, each newest period first; the API leaves out empty ones. */
export async function getMonthlyReports(locale: Locale, keys: readonly string[]): Promise<MonthlyReportSeriesDto[]> {
  const series = encodeURIComponent(keys.join(','))
  return (await fetchList(`/api/v1/monthly-reports?locale=${locale}&series=${series}`)).series
}
