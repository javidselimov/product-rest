/**
 * The year → month archive of a monthly report series (spec 052, `contracts/site-integration.md`): the same
 * `YearArchive` the spec 050 parser reads from the page text, built from the API's reports instead. A report has no
 * title of its own; it is titled with the series name and its period — one month, or the twelve months ending with it
 * for the insurance index (research R3).
 */
import type { Locale } from '@/shared/i18n'

import { MONTHS_AZ, MONTHS_EN, MONTHS_IN_YEAR, REPORT_PERIOD_SEPARATOR } from './constants'
import type { ArchiveMonth, ArchiveYear, ReportSeries, YearArchive } from './types'

/** "İyun", "June": the month's name in the visitor language, capital first. */
function monthName(month: number, locale: Locale): string {
  const name = (locale === 'en' ? MONTHS_EN : MONTHS_AZ)[month - 1] ?? ''
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1)
}

/** "{name} (May 2026)", or "{name} (İyun 2025 – May 2026)" for a twelve-month period. */
export function reportTitle(series: Pick<ReportSeries, 'name' | 'periodMonths'>, year: number, month: number, locale: Locale): string {
  const end = `${monthName(month, locale)} ${year}`
  if (series.periodMonths <= 1) return `${series.name} (${end})`
  const first = year * MONTHS_IN_YEAR + (month - 1) - (series.periodMonths - 1)
  const start = `${monthName((first % MONTHS_IN_YEAR) + 1, locale)} ${Math.floor(first / MONTHS_IN_YEAR)}`
  return `${series.name} (${start}${REPORT_PERIOD_SEPARATOR}${end})`
}

/** Years and months newest first, whatever order the reports come in; `latest` is the newest month. */
export function archiveFromReports(series: ReportSeries, locale: Locale): YearArchive {
  const byYear = new Map<number, ArchiveMonth[]>()
  for (const report of series.reports) {
    const month: ArchiveMonth = {
      label: monthName(report.month, locale),
      month: report.month,
      file: { ...report.file, title: reportTitle(series, report.year, report.month, locale) },
    }
    byYear.set(report.year, [...(byYear.get(report.year) ?? []), month])
  }

  const years: ArchiveYear[] = [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, months]) => ({ year, months: months.sort((a, b) => (b.month ?? 0) - (a.month ?? 0)) }))
  const newest = years[0]
  const latestMonth = newest?.months[0]
  return { years, latest: newest && latestMonth ? { year: newest.year, month: latestMonth } : null }
}
