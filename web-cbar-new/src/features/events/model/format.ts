/**
 * Date text of an event (spec 034, contracts/ui-contract.md §3–§4). Dates are calendar days from
 * the API, so they are split as text and never shifted by a time zone.
 */
import { formatLongDate, formatMonthYear } from '@/entities/content'
import { ISO_DATE } from '@/shared/constants/time'
import type { Locale } from '@/shared/i18n'

type Dated = { startsOn: string; endsOn: string | null }

const RANGE_DASH = '–'

function parts(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.slice(0, ISO_DATE.LENGTH).split('-').map(Number)
  return { year, month, day }
}

/** A last day equal to the first is one day, not a range. */
const lastDay = ({ startsOn, endsOn }: Dated) => (endsOn && endsOn !== startsOn ? endsOn : null)

/** The date box: `29` + month 10, or `4–5` for a range; the month is the first day's. */
export function dateBox(event: Dated): { day: string; month: number; isRange: boolean } {
  const start = parts(event.startsOn)
  const end = lastDay(event)
  return {
    day: end ? `${start.day}${RANGE_DASH}${parts(end).day}` : String(start.day),
    month: start.month,
    isRange: end !== null,
  }
}

/** `4 noyabr 2026`, `4–5 iyun 2026`, or both dates in full when a range crosses a month. */
export function dateLabel(event: Dated, locale: Locale): string {
  const end = lastDay(event)
  if (!end) return formatLongDate(event.startsOn, locale)

  const start = parts(event.startsOn)
  const finish = parts(end)
  return start.year === finish.year && start.month === finish.month
    ? `${start.day}${RANGE_DASH}${formatLongDate(end, locale)}`
    : `${formatLongDate(event.startsOn, locale)} ${RANGE_DASH} ${formatLongDate(end, locale)}`
}

export type MonthGroup<T> = { key: string; title: string; items: T[] }

const capitalize = (text: string, locale: Locale) => text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)

/** Groups a sorted list by the month an event starts in, keeping the list's order. */
export function groupByMonth<T>(items: T[], startsOn: (item: T) => string, locale: Locale): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = []
  for (const item of items) {
    const { year, month } = parts(startsOn(item))
    const key = `${year}-${month}`
    const last = groups.at(-1)
    if (last?.key === key) last.items.push(item)
    else groups.push({ key, title: capitalize(formatMonthYear(year, month, locale), locale), items: [item] })
  }
  return groups
}
