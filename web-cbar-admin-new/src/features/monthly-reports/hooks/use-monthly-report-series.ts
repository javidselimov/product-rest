/** The monthly report series (spec 052): a fixed list the section's tabs, select and period labels need. */

import { useQuery } from '@tanstack/react-query'

import { DETAIL_STALE_MS } from '@/shared/constants/timing'
import { monthlyReportsLookupKeys } from '../api/monthly-reports.keys'
import { monthlyReportsService } from '../api/monthly-reports.service'

export function useMonthlyReportSeries() {
  return useQuery({
    queryKey: monthlyReportsLookupKeys.series(),
    queryFn: monthlyReportsService.series,
    staleTime: DETAIL_STALE_MS,
  })
}
