/**
 * AZIR DTO sxemləri (contracts/admin-api.md §8, data-model.md §5 AzirValue).
 * Spec 021: həcm, say, min/max dərəcə (`null` ola bilər) və ehtiyat plan işarəsi.
 */

import { z } from 'zod'

import type { SelectOption } from '@/entities/content/model/types'

/** Tenors the public site shows (spec 058 FR-019): 1D plus the homepage's 30/90/180-day boxes. */
export const AZIR_TERMS = ['1D', '30D', '90D', '180D'] as const
export type AzirTerm = (typeof AZIR_TERMS)[number]

/** Etiket dəyərin özüdür — tərcümə olunmur. */
export const AZIR_TERM_OPTIONS: SelectOption[] = AZIR_TERMS.map((term) => ({
  value: term,
  label: term,
}))

/** Spec 021 sahələri — siyahı elementində və upsert cavabında eynidir. */
const azirDetailShape = {
  dealVolume: z.number().nullable(),
  dealCount: z.number().nullable(),
  minRate: z.number().nullable(),
  maxRate: z.number().nullable(),
  isReservePlan: z.boolean(),
}

export const azirItemSchema = z.looseObject({
  id: z.number(),
  valueDate: z.string(),
  term: z.string(),
  rate: z.number(),
  ...azirDetailShape,
  updatedAt: z.string(),
})
export type AzirItem = z.infer<typeof azirItemSchema>

/** Sətir etiketi — silmə dialoqu və "Formaya yüklə" əməli eyni mətni işlədir. */
export const azirRowLabel = (row: AzirItem) => `${row.valueDate} ${row.term}`

/** `POST /azir` cavabı — `updatedAt` yoxdur. */
export const azirUpsertResponseSchema = z.looseObject({
  id: z.number(),
  valueDate: z.string(),
  term: z.string(),
  rate: z.number(),
  ...azirDetailShape,
})

/** Fields of an imported tenor and of the stored value it replaced (contracts/admin-api.md §2). */
const azirImportFieldsShape = {
  rate: z.number(),
  ...azirDetailShape,
}

export const azirImportValueSchema = z.looseObject({
  term: z.string(),
  ...azirImportFieldsShape,
  previous: z.looseObject(azirImportFieldsShape).nullable(),
})
export type AzirImportValue = z.infer<typeof azirImportValueSchema>

export const AZIR_IMPORT_SKIP_REASONS = ['tfai', 'empty'] as const

export const azirImportResultSchema = z.looseObject({
  valueDate: z.string(),
  values: z.array(azirImportValueSchema),
  skipped: z.array(
    z.looseObject({
      row: z.number(),
      name: z.string(),
      reason: z.enum(AZIR_IMPORT_SKIP_REASONS),
    }),
  ),
  volumeConverted: z.boolean(),
})
export type AzirImportResult = z.infer<typeof azirImportResultSchema>

export interface AzirImportPayload {
  file: File
  overwrite: boolean
}

/** Problem codes of `POST /azir/import` with a translated text (`import.errors.<code>`). */
export const AZIR_IMPORT_ERROR_CODES = [
  'file_required',
  'not_xlsx',
  'file_too_large',
  'date_missing',
  'date_in_future',
  'header_missing',
  'unknown_index',
  'duplicate_index',
  'missing_1d',
  'invalid_value',
  'ambiguous_volume',
] as const
export type AzirImportErrorCode = (typeof AZIR_IMPORT_ERROR_CODES)[number]

export const AZIR_IMPORT_CONFLICT_CODE = 'date_exists'

/** Tam əvəzetmə: `null` sahəni silir, işarə həmişə göndərilir. */
export interface AzirUpsertPayload {
  valueDate: string
  term: string
  rate: number
  dealVolume: number | null
  dealCount: number | null
  minRate: number | null
  maxRate: number | null
  isReservePlan: boolean
}
