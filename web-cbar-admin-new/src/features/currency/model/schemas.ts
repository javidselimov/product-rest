/**
 * Məzənnə və valyuta DTO sxemləri (contracts/admin-api.md §8, data-model.md §5,
 * B13). Hər API cavabı bu sxemlərlə parse olunur — uyğunsuzluq `CONTRACT` xətasıdır.
 */

import { z } from 'zod'

import { listEnvelopeSchema } from '@/shared/crud/envelope-schema'

/** Vərəqdəki bir sətir: kod + master-dən gələn ad/nominal + məzənnə. */
export const sheetRateSchema = z.looseObject({
  currencyCode: z.string(),
  nominal: z.number().nullable(),
  nameAz: z.string().nullable(),
  rate: z.number(),
})
export type SheetRate = z.infer<typeof sheetRateSchema>

/** `GET /currency-rates[?date]` — boş bazada `date: null, rates: []`. */
export const rateSheetSchema = z.looseObject({
  date: z.string().nullable(),
  rates: z.array(sheetRateSchema),
})
export type RateSheet = z.infer<typeof rateSheetSchema>

export const sheetDateSchema = z.looseObject({
  date: z.string(),
  count: z.number(),
})
export type SheetDate = z.infer<typeof sheetDateSchema>

export const sheetDatesSchema = listEnvelopeSchema('paged', sheetDateSchema)

export const currencyMasterSchema = z.looseObject({
  code: z.string(),
  nominal: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  showOnHomepage: z.boolean(),
  nameAz: z.string().nullable(),
  nameEn: z.string().nullable(),
})
export type CurrencyMaster = z.infer<typeof currencyMasterSchema>

export const currenciesSchema = listEnvelopeSchema(
  'items',
  currencyMasterSchema,
)

/** `PUT /currencies/{code}` gövdəsi — üç sahənin hamısı göndərilir. */
export interface CurrencyEdit {
  showOnHomepage: boolean
  sortOrder: number
  isActive: boolean
}

/** `PUT /currency-rates` gövdəsi — göndərilməyən kodlar serverdə silinmir. */
export interface PutSheetPayload {
  date: string
  rates: { currencyCode: string; rate: number }[]
}

export const SHEET_DATES_PAGE_SIZE = 20

/** `POST /currency-rates/import` cavabı (spec 025, contracts/admin-api-import.md). */
export const rateImportResultSchema = z.looseObject({
  date: z.string(),
  imported: z.number().int().nonnegative(),
  /** Master-də olmayan kodlar — fayldakı sıra ilə. */
  skipped: z.array(z.string()),
  rates: z.array(z.looseObject({ currencyCode: z.string(), rate: z.number() })),
})
export type RateImportResult = z.infer<typeof rateImportResultSchema>

/** Import sorğusu — `overwrite` yalnız 409 `sheet_exists` təsdiqindən sonra. */
export interface ImportSheetPayload {
  date: string
  file: File
  overwrite?: boolean
}

/** Import xətalarının `code`-ları; hər birinin `import.errors.<code>` mətni var. */
export const IMPORT_ERROR_CODES = [
  'date_required',
  'file_required',
  'not_xlsx',
  'file_too_large',
  'no_rates',
  'invalid_rate',
  'duplicate_code',
] as const
