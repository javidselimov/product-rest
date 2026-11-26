/**
 * The period of a monthly report (spec 052 research R3): a report covers `periodMonths` months ending with its own
 * month — one for the bank index and the infographics, twelve for the insurance index.
 */

import { MONTHS_IN_YEAR, PERIOD_SEPARATOR } from './constants'

export interface Period {
  year: number
  /** 1–12. */
  month: number
}

/** The month after `year`/`month`: the default of a new report in a series. */
export function nextPeriod(year: number, month: number): Period {
  return month >= MONTHS_IN_YEAR ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

/** The first month of a period of `periodMonths` months ending with `year`/`month`. */
export function periodStart(year: number, month: number, periodMonths: number): Period {
  const index = year * MONTHS_IN_YEAR + (month - 1) - (periodMonths - 1)
  return { year: Math.floor(index / MONTHS_IN_YEAR), month: (index % MONTHS_IN_YEAR) + 1 }
}

/** "Sentyabr 2026", or "İyun 2025 – May 2026" for twelve months; `monthName` gives a month's name in the UI language. */
export function periodLabel(
  year: number,
  month: number,
  periodMonths: number,
  monthName: (month: number) => string,
): string {
  const end = `${monthName(month)} ${year}`
  if (periodMonths <= 1) return end
  const start = periodStart(year, month, periodMonths)
  return `${monthName(start.month)} ${start.year}${PERIOD_SEPARATOR}${end}`
}
