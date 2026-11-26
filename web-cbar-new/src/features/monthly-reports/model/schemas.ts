/** `GET /api/v1/monthly-reports`, `specs/052-monthly-reports/contracts/public-api.md`. */
import { z } from 'zod'

export const monthlyReportSchema = z.object({
  id: z.number(),
  year: z.number(),
  month: z.number(),
  file: z.object({ id: z.number(), url: z.string(), mimeType: z.string(), sizeBytes: z.number() }),
})

export const monthlyReportSeriesSchema = z.object({
  key: z.string(),
  name: z.string(),
  periodMonths: z.number(),
  reports: z.array(monthlyReportSchema),
})

export const monthlyReportListSchema = z.object({ series: z.array(monthlyReportSeriesSchema) })

export type MonthlyReportSeriesDto = z.infer<typeof monthlyReportSeriesSchema>
