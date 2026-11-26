/**
 * Tarix formatlaması — yalnız `Intl` (Maddə II: date kitabxanası qadağandır).
 */
import { ISO_DATE } from '@/shared/constants/time'
import { INTL_LOCALE, type Locale } from '@/shared/i18n'

import { REFERENCE_YEAR } from './constants'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * ISO tarixi (`2026-09-14` və ya `2026-09-14T10:00:00Z`) → `14.09.2026` / `14/09/2026`.
 *
 * Yalnız-tarix dəyəri təqvim günüdür — vaxt zonasına görə sürüşməməlidir, ona görə
 * UTC kimi formatlanır; tam vaxt damğası isə prosesin zonasında (`TZ=Asia/Baku`).
 */
export function formatDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: DATE_ONLY.test(iso) ? 'UTC' : undefined,
  }).format(date)
}

/** Uzun tarix (`14 sentyabr 2026` / `14 September 2026`) — xəbər və slayder üçün. */
export function formatLongDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: DATE_ONLY.test(iso) ? 'UTC' : undefined,
  }).format(date)
}

/** Ay + il (`sentyabr 2026`) — cari inflyasiya etiketi üçün. */
export function formatMonthYear(year: number, month: number, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

/** Qısa ay adı (`sen`, `Sep`). */
export function shortMonthName(month: number, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(REFERENCE_YEAR, month - 1, 1)),
  )
}

/** Ay adı (`Yanvar`, `January`) — inflyasiya qrafiki üçün. */
export function monthName(year: number, month: number, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )
}

/** `YYYY-MM-DD` — API sorğu parametrləri üçün (yerli vaxt zonasında). */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** `YYYY-MM-DD` → `DD.MM.YYYY` — tarixi XML feed ünvanı (root konstitusiya VII.1). */
export function toFeedDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, ISO_DATE.LENGTH).split('-')
  return `${d}.${m}.${y}`
}

/** `iso` tarixindən `days` gün əvvəl — `YYYY-MM-DD`. */
export function shiftIsoDate(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.slice(0, ISO_DATE.LENGTH).split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}
