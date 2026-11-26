/**
 * Monthly reports module (spec 052): one month of a series — the bank or the insurance complaint index, or the
 * infographics — with a file per language. There is no title: the site builds it from the series name and the period.
 * The series come from `GET /monthly-reports/series` behind a `LookupGate`, as the FAQ topics do, so the module is
 * built from them; `monthlyReportsModuleBase` is the variant without choices for the route tree.
 */

import { createElement } from 'react'

import { STATUS_LABEL_KEYS, STATUS_PALETTE, type SelectOption } from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defineModule, type ModuleConfig } from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { MONTHLY_REPORTS_MODULE_ID } from '../api/monthly-reports.keys'
import { FilesCell, PeriodCell, SeriesCell } from '../components/report-cells'
import { MONTHLY_REPORTS_PATH, MONTHS, SERIES_PARAM, YEAR_MIN, yearMax } from './constants'
import { nextPeriod, periodLabel } from './period'
import {
  MONTHLY_REPORT_STATUS_OPTIONS,
  monthlyReportDetailSchema,
  monthlyReportRowSchema,
  type MonthlyReportRow,
  type MonthlyReportSeries,
} from './schemas'

const NS = 'monthlyReports'

/** A known series by its short label, one the panel does not know yet by the API's name. */
function seriesOption(series: MonthlyReportSeries): SelectOption {
  const labelKey = `${NS}:series.${series.key}`
  return i18n.exists(labelKey) ? { value: series.key, labelKey } : { value: series.key, label: series.name }
}

const MONTH_OPTIONS: SelectOption[] = MONTHS.map((month) => ({ value: month, labelKey: `${NS}:months.${month}` }))

const monthName = (month: number) => i18n.t(`${NS}:months.${month}`)

export function buildMonthlyReportsModule(
  series: MonthlyReportSeries[],
): ModuleConfig<MonthlyReportRow, typeof MONTHLY_REPORTS_PATH> {
  const seriesOptions = series.map(seriesOption)
  return defineModule<MonthlyReportRow, typeof MONTHLY_REPORTS_PATH>({
    id: MONTHLY_REPORTS_MODULE_ID,
    ns: NS,
    apiPath: MONTHLY_REPORTS_PATH,
    basePath: MONTHLY_REPORTS_PATH,
    titleKey: 'title',
    entityKey: 'entity',
    descriptionKey: 'description',
    listEnvelope: 'paged',
    pageSize: DEFAULT_PAGE_SIZE,
    rowSchema: monthlyReportRowSchema,
    detailSchema: monthlyReportDetailSchema,
    emptyKey: 'empty',
    filters: [
      { name: SERIES_PARAM, labelKey: 'filters.series', type: 'tabs', options: seriesOptions },
      { name: 'year', labelKey: 'filters.year', type: 'number' },
      { name: 'status', labelKey: 'filters.status', type: 'select', options: MONTHLY_REPORT_STATUS_OPTIONS },
    ],
    columns: [
      {
        key: SERIES_PARAM,
        headerKey: 'columns.series',
        render: 'custom',
        renderCell: (row) => createElement(SeriesCell, { row }),
      },
      {
        key: 'period',
        headerKey: 'columns.period',
        render: 'custom',
        renderCell: (row) => createElement(PeriodCell, { row }),
      },
      {
        key: 'locales',
        headerKey: 'columns.files',
        render: 'custom',
        renderCell: (row) => createElement(FilesCell, { row }),
      },
      {
        key: 'status',
        headerKey: 'columns.status',
        render: 'badge',
        badgePalette: STATUS_PALETTE,
        badgeLabelKey: STATUS_LABEL_KEYS,
      },
      { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'date', width: COLUMN_WIDTH.ACTIONS },
    ],
    fields: [
      { name: SERIES_PARAM, labelKey: 'fields.series', type: 'select', options: seriesOptions, required: true },
      { name: 'year', labelKey: 'fields.year', type: 'number', required: true, min: YEAR_MIN, max: yearMax() },
      { name: 'month', labelKey: 'fields.month', type: 'select', options: MONTH_OPTIONS, valueAsNumber: true, required: true },
      {
        name: 'mediaId',
        labelKey: 'fields.file',
        type: 'media',
        perLocale: true,
        required: true,
        helpKey: 'fields.fileHelp',
        mediaNameKey: 'translations.{locale}.mediaName',
      },
      { name: 'status', labelKey: 'fields.status', type: 'select', options: MONTHLY_REPORT_STATUS_OPTIONS },
    ],
    prefillFromSearch: [SERIES_PARAM, 'year', 'month'],
    // The list comes newest period first, so on a series tab the first row is that series' newest month — unless a
    // year or status filter narrows it, in which case the form is left for the editor to fill.
    newSearch: (rows, filters): Record<string, string> => {
      const newest = rows[0]
      if (!filters[SERIES_PARAM] || filters.year || filters.status || !newest) return {}
      const next = nextPeriod(newest.year, newest.month)
      return { year: String(next.year), month: String(next.month) }
    },
    rowLabel: (row) => {
      const seriesLabel = i18n.t(`${NS}:series.${row.series}`, { defaultValue: row.seriesName })
      return `${seriesLabel} · ${periodLabel(row.year, row.month, row.periodMonths, monthName)}`
    },
  })
}

export const monthlyReportsModuleBase = buildMonthlyReportsModule([])
