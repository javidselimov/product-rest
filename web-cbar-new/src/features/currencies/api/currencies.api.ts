/**
 * Məzənnələr — contracts/public-api.md #6 və tarixi XML feed keçidi (root konstitusiya VII.1).
 *
 * 10 s keşlənir (spec 003 FR-015). `previousSheet` ayrıca keşlənmir — o, `getCurrencies`-i
 * dövr içində çağırır, yəni keş onsuz da hər tarix üçün işləyir.
 */
import 'server-only'

import { shiftIsoDate, toFeedDate } from '@/entities/content'
import { cachedJsonOrNull } from '@/server/cached'
import { env } from '@/server/env'
import type { Locale } from '@/shared/i18n'

import { PREVIOUS_SHEET_DAYS } from '../model/constants'
import { currencySheetSchema, type CurrencySheet } from '../model/schemas'

const fetchSheet = cachedJsonOrNull(currencySheetSchema, {
  keyPrefix: 'currency-sheet',
  tag: 'currencies',
})

export function getCurrencies(locale: Locale, date?: string): Promise<CurrencySheet | null> {
  const dateParam = date ? `&date=${encodeURIComponent(date)}` : ''
  return fetchSheet(`/api/v1/currencies?locale=${locale}${dateParam}`)
}

/** `{API_URL}/currencies/DD.MM.YYYY.xml` — format dəyişmir (kontrakt). */
export function xmlFeedUrl(isoDate: string): string {
  const base = env.API_URL.endsWith('/') ? env.API_URL.slice(0, -1) : env.API_URL
  return `${base}/currencies/${toFeedDate(isoDate)}.xml`
}

/**
 * `latestDate`-dən əvvəlki ən yaxın vərəq (həftə sonu/bayram atlanır) — ən çox 5 gün
 * geriyə, **tarix sırası ilə** ilk tapılan (research R14, köhnə `fetchPreviousSheet`).
 *
 * Beş gün **paralel** yoxlanılır, ardıcıl deyil. Səbəb ölçülüb (spec 003 Faza 7):
 * API yavaş olanda ardıcıl döngə hər cəhd üçün bir gediş-gəliş əlavə edirdi —
 * 3 s gecikmə ilə sınaqda ana səhifənin gözləməsinin böyük hissəsi məhz bu idi.
 * Nəticə eynidir, çünki seçim yenə də sıraya görə edilir; dəyişən yalnız gözləmənin
 * paralelləşməsidir.
 *
 * Soyuq keşdə bu, 1–5 əvəzinə həmişə 5 sorğu deməkdir; hamısı `@/server/cached`-dən
 * keçdiyi üçün növbəti açılışlarda sorğu getmir (rate limit 1000/dəq — təsirsiz).
 */
export async function previousSheet(locale: Locale, latestDate: string): Promise<CurrencySheet | null> {
  const attempts = Array.from({ length: PREVIOUS_SHEET_DAYS }, (_, i) =>
    getCurrencies(locale, shiftIsoDate(latestDate, -(i + 1))).catch(() => null),
  )

  for (const sheet of await Promise.all(attempts)) {
    if (sheet && sheet.rates.length > 0) return sheet
  }
  return null
}
