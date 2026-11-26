/**
 * Monthly reports (spec 052, `contracts/public-api.md`). By default no series has reports, so the consumer rights pages
 * keep the spec 050 path from their own text; a test serves the fixtures with `monthlyReportsHandler(...)`.
 */
import { HttpResponse, http } from 'msw'

import type { MonthlyReportSeriesDto } from '@/features/monthly-reports/model/schemas'

import { API } from '../api-base'

/** Answers like the API: the asked series (`?series=a,b`) in the locale, the ones with reports only. */
export function monthlyReportsHandler(byLocale: { az?: MonthlyReportSeriesDto[]; en?: MonthlyReportSeriesDto[] }) {
  return http.get(`${API}/api/v1/monthly-reports`, ({ request }) => {
    const url = new URL(request.url)
    const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'az'
    const keys = (url.searchParams.get('series') ?? '').split(',').filter(Boolean)
    const series = (byLocale[locale] ?? []).filter((s) => s.reports.length > 0 && (keys.length === 0 || keys.includes(s.key)))
    return HttpResponse.json({ series })
  })
}

export const monthlyReportsHandlers = [monthlyReportsHandler({})]
