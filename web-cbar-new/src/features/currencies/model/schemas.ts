/**
 * Məzənnə vərəqi (spec 002 data-model.md §5).
 */
import { z } from 'zod'

import { RATE_DECIMALS } from './constants'

export const currencyRateSchema = z
  .object({
    code: z.string(),
    nominal: z.number(),
    name: z.string().nullable().optional().transform((v) => v ?? null),
    rate: z.number(),
    showOnHomepage: z.boolean().optional().transform((v) => v ?? false),
  })
  .passthrough()

export const currencySheetSchema = z
  .object({ date: z.string(), rates: z.array(currencyRateSchema) })
  .passthrough()

export type CurrencyRate = z.infer<typeof currencyRateSchema>
export type CurrencySheet = z.infer<typeof currencySheetSchema>

export type Trend = 'up' | 'down' | 'flat'

export function rateTrend(current: number, previous: number | undefined): Trend {
  if (previous === undefined) return 'flat'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'flat'
}

/** Köhnə saytdakı kimi 4 onluq (`1.7000`). */
export function formatRate(rate: number): string {
  return rate.toFixed(RATE_DECIMALS)
}

/** Ana səhifə kartında valyuta simvolu ikonu olan valyutalar (Figma `813:25639`: 36px dairə, `#CFF3EC` fon). */
export const CURRENCY_ICON_BY_CODE: Record<string, string> = {
  USD: '/site/dollar.svg',
  EUR: '/site/euro.svg',
  RUB: '/site/rubl.svg',
  TRY: '/site/lire.svg',
}
