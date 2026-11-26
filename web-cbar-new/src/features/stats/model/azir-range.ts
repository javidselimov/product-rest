/**
 * AZIR səhifəsinin tarix aralığı (spec 021 contracts/web-routes.md §1, research R9).
 *
 * `shared/lib/search-params.ts`-dəki `dateParam` səhv dəyəri səssiz atır; burada isə
 * xəta göstərilməlidir, ona görə parser ayrıcadır. Xətada default aralıq qaytarılır
 * (yönləndirmə yoxdur, FR-012).
 */
import { shiftIsoDate } from '@/entities/content'
import { DAY_MS } from '@/shared/constants/time'
import { first, type RawSearchParams } from '@/shared/lib/search-params'

import { AZIR_DEFAULT_DAYS, AZIR_MAX_RANGE_DAYS } from './constants'

export type AzirRangeError = 'format' | 'order' | 'tooLong'

export type AzirRange = {
  from: string
  to: string
  error: AzirRangeError | null
  isDefault: boolean
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const LEGACY_DATE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

function utcDay(year: number, month: number, day: number): number | null {
  const time = Date.UTC(year, month - 1, day)
  const date = new Date(time)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? time
    : null
}

function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value)
  return match !== null && utcDay(Number(match[1]), Number(match[2]), Number(match[3])) !== null
}

function daysBetween(from: string, to: string): number {
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS
}

export function defaultAzirRange(today: string): AzirRange {
  return { from: shiftIsoDate(today, -AZIR_DEFAULT_DAYS), to: today, error: null, isDefault: true }
}

/**
 * `dateFrom` / `dateTo` (`YYYY-MM-DD`). Yalnız `dateFrom` verilibsə `dateTo` bu gündür;
 * gələcək `dateTo` bu günə endirilir.
 */
export function parseAzirRange(searchParams: RawSearchParams, today: string): AzirRange {
  const rawFrom = first(searchParams.dateFrom)
  const rawTo = first(searchParams.dateTo)
  const fallback = defaultAzirRange(today)

  if (rawFrom === undefined && rawTo === undefined) return fallback
  if ((rawFrom !== undefined && !isIsoDate(rawFrom)) || (rawTo !== undefined && !isIsoDate(rawTo))) {
    return { ...fallback, error: 'format' }
  }

  const to = rawTo === undefined || rawTo > today ? today : rawTo
  const from = rawFrom ?? shiftIsoDate(to, -AZIR_DEFAULT_DAYS)

  if (from > to) return { ...fallback, error: 'order' }
  if (daysBetween(from, to) > AZIR_MAX_RANGE_DAYS) return { ...fallback, error: 'tooLong' }
  return { from, to, error: null, isDefault: false }
}

/** Köhnə `/indeks/rates` linkləri: `d/m/Y` → `YYYY-MM-DD`; səhv dəyər → `null`. */
export function legacyDateToIso(value: string | null | undefined): string | null {
  const match = value ? LEGACY_DATE.exec(value.trim()) : null
  if (!match) return null
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if (utcDay(year, month, day) === null) return null
  return `${match[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
