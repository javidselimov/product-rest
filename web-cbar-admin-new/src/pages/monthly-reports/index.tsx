/**
 * "Aylıq hesabatlar" pages (spec 052). The list's tabs and the form's select are the series from a lookup behind
 * `LookupGate`, as the FAQ questions pick their topics.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { monthlyReportsLookupKeys } from '@/features/monthly-reports/api/monthly-reports.keys'
import { useMonthlyReportSeries } from '@/features/monthly-reports/hooks/use-monthly-report-series'
import { buildMonthlyReportsModule } from '@/features/monthly-reports/model/module'

function useMonthlyReportsModule() {
  const queryClient = useQueryClient()
  const series = useMonthlyReportSeries()
  const config = useMemo(() => buildMonthlyReportsModule(series.data ?? []), [series.data])
  return {
    config,
    isLoading: series.isLoading,
    error: series.isError ? series.error : undefined,
    retry: () => void queryClient.invalidateQueries({ queryKey: monthlyReportsLookupKeys.series() }),
  }
}

export function MonthlyReportsPage() {
  const { config, isLoading, error, retry } = useMonthlyReportsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function MonthlyReportsFormPage() {
  const { config, isLoading, error, retry } = useMonthlyReportsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
