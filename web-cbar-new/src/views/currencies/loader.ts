/**
 * Məzənnə vərəqi (contracts/routes.md #7): `date` YYYY-MM-DD; XML keçidi kontraktdır (root VII.1).
 */
import 'server-only'

import { formatLongDate } from '@/entities/content'
import { getCurrencies, xmlFeedUrl } from '@/features/currencies/api/currencies.api'
import type { CurrencyRate } from '@/features/currencies/model/schemas'
import { dateParam, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'

export type CurrenciesViewData = {
  locale: Locale
  requestedDate: string | undefined
  sheet: { date: string; dateLabel: string; xmlUrl: string; rates: CurrencyRate[] } | null
  error: boolean
}

export async function loadCurrencies(locale: Locale, searchParams: RawSearchParams): Promise<CurrenciesViewData> {
  const requestedDate = dateParam.parse(searchParams.date)

  try {
    const sheet = await getCurrencies(locale, requestedDate)
    return {
      locale,
      requestedDate,
      error: false,
      sheet:
        sheet && sheet.rates.length > 0
          ? { date: sheet.date, dateLabel: formatLongDate(sheet.date, locale), xmlUrl: xmlFeedUrl(sheet.date), rates: sheet.rates }
          : null,
    }
  } catch {
    return { locale, requestedDate, sheet: null, error: true }
  }
}
