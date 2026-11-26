/**
 * Monthly report requests beyond the CRUD engine (spec 052, `contracts/admin-api.md`): the fixed series list for the
 * tabs and the select. The response is parsed (B13).
 */

import { z, ZodError } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { monthlyReportSeriesSchema, type MonthlyReportSeries } from '../model/schemas'

export const monthlyReportsService = {
  series: async (): Promise<MonthlyReportSeries[]> => {
    const data: unknown = await apiClient.get('/monthly-reports/series')
    try {
      return z.array(monthlyReportSeriesSchema).parse(data)
    } catch (error) {
      if (error instanceof ZodError) throw contractError(`monthlyReports.series: ${error.issues[0]?.path.join('.') ?? ''}`)
      throw error
    }
  },
}
