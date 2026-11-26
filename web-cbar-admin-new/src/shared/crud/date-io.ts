/**
 * Tarix giriş/çıxış köməkçiləri (research R7). Kit `date-picker` yalnız `Date`
 * ilə işləyir; form state-də tarix `yyyy-MM-dd` string, tarix-vaxt isə
 * `<input type="datetime-local">` formatında saxlanılır (köhnə panel ilə eyni).
 */

import {
  formatDate as kitFormatDate,
  parseDate,
} from '@cbar/lib-react-ui-kit/date-picker'

import { ISO_DATE_LENGTH } from '@/shared/constants/limits'

const intlLocale = (language: string) =>
  language.startsWith('en') ? 'en-GB' : 'az-AZ'

/**
 * Tarix-only string (`yyyy-MM-dd`, API `DateOnly`) LOKAL gün kimi oxunur —
 * `new Date('2026-01-14')` UTC gecə yarısıdır və qərb saat qurşaqlarında bir gün
 * geri sürüşür. ISO timestamp-lər olduğu kimi.
 */
const toDate = (value: string): Date | null => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return dateStringToDate(value)
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDate(value: unknown, language = 'az'): string {
  if (typeof value !== 'string' || !value) return '—'
  const d = toDate(value)
  if (!d) return '—'
  return new Intl.DateTimeFormat(intlLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function formatDateTime(value: unknown, language = 'az'): string {
  if (typeof value !== 'string' || !value) return '—'
  const d = toDate(value)
  if (!d) return '—'
  return new Intl.DateTimeFormat(intlLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO timestamp → `<input type="datetime-local">` dəyəri (lokal vaxt). */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** `<input type="datetime-local">` dəyəri → ISO timestamp (və ya null). */
export function localInputToIso(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export const DATE_STRING_FORMAT = 'yyyy-MM-dd'

/** `yyyy-MM-dd` → Date (lokal gün başlanğıcı); boş/yanlış → null. */
export function dateStringToDate(
  value: string | null | undefined,
): Date | null {
  if (!value) return null
  return parseDate(value.slice(0, ISO_DATE_LENGTH), DATE_STRING_FORMAT)
}

/** Date → `yyyy-MM-dd`; null → ''. */
export function dateToDateString(date: Date | null): string {
  return date ? kitFormatDate(date, DATE_STRING_FORMAT) : ''
}

export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dateStringToDate(value) !== null
}

export function isLocalDateTime(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) &&
    localInputToIso(value) !== null
  )
}
