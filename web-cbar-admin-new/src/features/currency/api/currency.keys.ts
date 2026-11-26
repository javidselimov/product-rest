/**
 * Məzənnə query açarları. `rates` kökü vərəq + tarix siyahısını birlikdə
 * invalidasiya edir; valyuta master-i ayrı kökdədir (`['currencies','master']`).
 */

export const currencyKeys = {
  rates: ['currency-rates'] as const,
  /** `''` = son vərəq (`?date` göndərilmir). */
  sheet: (date: string) => ['currency-rates', 'sheet', date] as const,
  dates: (page: number) => ['currency-rates', 'dates', page] as const,
  master: ['currencies', 'master'] as const,
}
