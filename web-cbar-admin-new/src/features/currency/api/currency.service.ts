/**
 * Məzənnə servisi (contracts/admin-api.md §8): vərəq oxu/yaz/sil, tarix
 * siyahısı, valyuta master-i. Cavablar Zod ilə parse olunur (B13).
 */

import { ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  SHEET_DATES_PAGE_SIZE,
  currenciesSchema,
  rateImportResultSchema,
  rateSheetSchema,
  sheetDatesSchema,
  type CurrencyEdit,
  type CurrencyMaster,
  type ImportSheetPayload,
  type PutSheetPayload,
  type RateImportResult,
  type RateSheet,
  type SheetDate,
} from '../model/schemas'
import type { ListResult } from '@/shared/crud/envelope-schema'

function parseOr<T>(schema: ZodType<T>, raw: unknown, where: string): T {
  try {
    return schema.parse(raw)
  } catch (error) {
    if (error instanceof ZodError) throw contractError(where)
    throw error
  }
}

export const currencyService = {
  /** `date` verilməyəndə son vərəq gəlir. */
  async sheet(date?: string): Promise<RateSheet> {
    const raw = await apiClient.get<unknown>('/currency-rates', {
      params: date ? { date } : undefined,
    })
    return parseOr(rateSheetSchema, raw, 'currency.sheet')
  },

  putSheet(payload: PutSheetPayload) {
    return apiClient.put<void>('/currency-rates', payload)
  },

  /** Bülleten (.xlsx) importu (spec 025): server faylı oxuyub dərhal yazır. */
  async importSheet(payload: ImportSheetPayload): Promise<RateImportResult> {
    const form = new FormData()
    form.append('date', payload.date)
    form.append('file', payload.file, payload.file.name)
    if (payload.overwrite) form.append('overwrite', 'true')
    const raw = await apiClient.post<unknown>('/currency-rates/import', form)
    return parseOr(rateImportResultSchema, raw, 'currency.import')
  },

  deleteSheet(date: string) {
    return apiClient.delete<void>('/currency-rates', { params: { date } })
  },

  async dates(page: number): Promise<ListResult<SheetDate>> {
    const raw = await apiClient.get<unknown>('/currency-rates/dates', {
      params: { page, pageSize: SHEET_DATES_PAGE_SIZE },
    })
    return parseOr(sheetDatesSchema, raw, 'currency.dates')
  },

  async currencies(): Promise<CurrencyMaster[]> {
    const raw = await apiClient.get<unknown>('/currencies')
    return parseOr(currenciesSchema, raw, 'currency.master').items
  },

  putCurrency(code: string, body: CurrencyEdit) {
    return apiClient.put<void>(`/currencies/${encodeURIComponent(code)}`, body)
  },
}
