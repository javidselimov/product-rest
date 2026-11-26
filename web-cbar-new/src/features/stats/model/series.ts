/**
 * API dəyərlərindən serializable qrafik seriyaları (spec 002 research R8).
 *
 * `ChartSeries` server → client sərhədini keçir (yalnız düz obyektlər); ECharts
 * konfiqurasiyasını client tərəfdəki `Chart` özü qurur.
 */
import { monthName, toFeedDate } from '@/entities/content'
import { ISO_DATE, MONTHS_PER_YEAR } from '@/shared/constants/time'
import type { Locale } from '@/shared/i18n'

import type { AzirValue, InflationParameter, YieldCurve } from './schemas'

export type ChartPoint = number | null

export type ChartSeries = {
  name: string
  kind: 'line' | 'bar'
  data: ChartPoint[]
  /** Xətt hamar çəkilsin. */
  smooth?: boolean
  /** Nöqtə simvolu göstərilsin. */
  symbols?: boolean
  /** Sahə doldurulsun. */
  area?: boolean
}

export type ChartData = {
  categories: string[]
  series: ChartSeries[]
  /** Y oxu formatı. */
  unit?: '%' | ''
  legend?: boolean
}

/** AZIR: x = tarix, hər müddət üçün bir xətt (köhnə `azirOption`). */
export function azirSeries(values: AzirValue[]): ChartData {
  const categories = [...new Set(values.map((v) => v.valueDate))].sort()
  const terms = [...new Set(values.map((v) => v.term))].sort()
  const byKey = new Map(values.map((v) => [`${v.term}|${v.valueDate}`, v.rate]))

  return {
    categories,
    unit: '%',
    legend: true,
    series: terms.map((term) => ({
      name: term,
      kind: 'line',
      symbols: true,
      data: categories.map((date) => byKey.get(`${term}|${date}`) ?? null),
    })),
  }
}

/**
 * Gündəlik seriya (sıx xətt). Etiket ana səhifədə qısa `MM.DD`-dir; AZIR səhifəsində
 * aralıq ilin keçidini əhatə edə bildiyi üçün tam `DD.MM.YYYY` (spec 021 R10).
 */
export function azirDailySeries(
  values: AzirValue[],
  term = '1D',
  labels: 'short' | 'full' = 'short',
): ChartData {
  const points = values
    .filter((v) => v.term === term)
    .sort((a, b) => a.valueDate.localeCompare(b.valueDate))

  return {
    categories: points.map((v) =>
      labels === 'full'
        ? toFeedDate(v.valueDate)
        : v.valueDate.slice(ISO_DATE.MONTH_START).replace('-', '.'),
    ),
    unit: '%',
    series: [{ name: term, kind: 'line', data: points.map((v) => v.rate) }],
  }
}

/** Ən son tarixin dəyərləri — müddət üzrə; `reserve1D` həmin günün 1D işarəsidir. */
export function azirLatest(values: AzirValue[]): {
  date: string | null
  byTerm: Map<string, number>
  reserve1D: boolean
} {
  const date = values.reduce<string | null>(
    (max, v) => (max === null || v.valueDate > max ? v.valueDate : max),
    null,
  )
  const latest = values.filter((v) => v.valueDate === date)
  const byTerm = new Map(latest.map((v) => [v.term, v.rate]))
  const reserve1D = latest.some((v) => v.term === '1D' && v.isReservePlan)
  return { date, byTerm, reserve1D }
}

/** Statistika: x = ay adı, hər parametr kodu üçün bir sütun seriyası (köhnə `inflationOption`). */
export function inflationSeries(
  values: InflationParameter[],
  locale: Locale,
  labelFor: (code: string) => string,
): ChartData {
  const months = [...new Set(values.map((v) => v.month))].sort((a, b) => a - b)
  const codes = [...new Set(values.map((v) => v.parameterCode))].sort()
  const byKey = new Map(
    values.map((v) => [`${v.parameterCode}|${v.month}`, v.value]),
  )
  const year = values[0]?.year ?? new Date().getFullYear()

  return {
    categories: months.map((month) => monthName(year, month, locale)),
    unit: '%',
    legend: true,
    series: codes.map((code) => ({
      name: labelFor(code),
      kind: 'bar',
      data: months.map((month) => byKey.get(`${code}|${month}`) ?? null),
    })),
  }
}

export type InflationYearLine = { year: number; values: ChartPoint[] }

/** Ana səhifə: `cpi_yoy` üzrə son 2 il, 12 aylıq xətlər (köhnə `InflationCard`). */
export function inflationYearLines(
  values: InflationParameter[],
  years = 2,
): InflationYearLine[] {
  const cpi = values
    .filter((p) => p.parameterCode === 'cpi_yoy')
    .sort((a, b) => a.year - b.year || a.month - b.month)
  const allYears = [...new Set(cpi.map((p) => p.year))]
    .sort((a, b) => a - b)
    .slice(-years)

  return allYears.map((year) => ({
    year,
    values: Array.from(
      { length: MONTHS_PER_YEAR },
      (_, i) =>
        cpi.find((p) => p.year === year && p.month === i + 1)?.value ?? null,
    ),
  }))
}

/** Sonuncu `cpi_yoy` və sonuncu `target`. */
export function inflationSummary(values: InflationParameter[]): {
  current: InflationParameter | null
  target: number | null
} {
  const sorted = (code: string) =>
    values
      .filter((p) => p.parameterCode === code)
      .sort((a, b) => a.year - b.year || a.month - b.month)
  return {
    current: sorted('cpi_yoy').at(-1) ?? null,
    target: sorted('target').at(-1)?.value ?? null,
  }
}

/** Gəlirlik əyrisi: x = müddət (API sırası), nöqtəli xətt (köhnə `yieldOption`). */
export function yieldSeries(curve: YieldCurve, name: string): ChartData {
  return {
    categories: curve.yields.map((p) => p.period),
    unit: '%',
    series: [
      {
        name,
        kind: 'line',
        smooth: true,
        symbols: true,
        data: curve.yields.map((p) => p.yield),
      },
    ],
  }
}

/** Nöqtəsi olan seriya varmı — boş vəziyyət üçün. */
export function hasChartData(data: ChartData | null): data is ChartData {
  return Boolean(
    data &&
    data.categories.length > 0 &&
    data.series.some((s) => s.data.some((v) => v !== null)),
  )
}
