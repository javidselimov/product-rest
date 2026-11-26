/**
 * Monthly report schemas (spec 052, `contracts/admin-api.md`). A series is addressed by its key; the detail carries
 * the file of each locale, with a null name when the file was deleted from the media library.
 */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'

/** The API refuses `scheduled`: a report has no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const MONTHLY_REPORT_STATUS_OPTIONS: SelectOption[] =
  CONTENT_STATUS_OPTIONS.filter((option) => option.value !== SCHEDULED)

export const monthlyReportSeriesSchema = z.looseObject({
  key: z.string(),
  name: z.string(),
  nameEn: z.string().nullable(),
  periodMonths: z.number(),
})

export type MonthlyReportSeries = z.infer<typeof monthlyReportSeriesSchema>

export const monthlyReportRowSchema = z.looseObject({
  id: z.number(),
  series: z.string(),
  seriesName: z.string(),
  periodMonths: z.number(),
  year: z.number(),
  month: z.number(),
  status: z.string(),
  locales: z.array(z.string()),
  missingFile: z.boolean(),
  updatedAt: z.string(),
})

export type MonthlyReportRow = z.infer<typeof monthlyReportRowSchema>

export const monthlyReportDetailSchema = z.looseObject({
  id: z.number(),
  series: z.string(),
  year: z.number(),
  month: z.number(),
  status: z.string(),
  translations: translationsSchema(
    z.looseObject({ mediaId: z.number(), mediaName: z.string().nullable() }),
  ),
})
