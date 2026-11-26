/**
 * Ədəd formatlaması — yalnız `Intl` (spec 021 research R11): az vergül, en nöqtə.
 * Dəyər yoxdursa `—` qaytarılır, ekran hissəsi boş qalmır.
 */
import { DEFAULT_MAX_FRACTION } from '@/shared/constants/limits'
import { INTL_LOCALE, type Locale } from '@/shared/i18n'

export const NO_VALUE = '—'

export type FractionOptions = { minFraction?: number; maxFraction?: number }

export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
  { minFraction = 0, maxFraction = Math.max(minFraction, DEFAULT_MAX_FRACTION) }: FractionOptions = {},
): string {
  if (value == null || !Number.isFinite(value)) return NO_VALUE
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  }).format(value)
}

/** Dəyişmə: `+0,25` / `−0,10`; yuvarlaqlaşdırılmış sıfır işarəsizdir. */
export function formatSigned(
  value: number | null | undefined,
  locale: Locale,
  options: FractionOptions = {},
): string {
  if (value == null || !Number.isFinite(value)) return NO_VALUE
  const magnitude = formatNumber(Math.abs(value), locale, options)
  if (magnitude === formatNumber(0, locale, options)) return magnitude
  return `${value > 0 ? '+' : '−'}${magnitude}`
}
