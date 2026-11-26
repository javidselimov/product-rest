/**
 * AZIR service — the endpoints outside the CRUD engine: `POST /azir` upsert (same date + term →
 * updated) and `POST /azir/import` (one day of the bank's workbook, spec 058). List and delete go
 * through `crudService`.
 */

import { ZodError } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  azirImportResultSchema,
  azirUpsertResponseSchema,
  type AzirImportPayload,
  type AzirUpsertPayload,
} from '../model/schemas'

export const azirService = {
  /** The server reads and writes the file at once; 409 `date_exists` asks for `overwrite`. */
  async importFile({ file, overwrite }: AzirImportPayload) {
    const form = new FormData()
    form.append('file', file, file.name)
    if (overwrite) form.append('overwrite', 'true')
    const raw = await apiClient.post<unknown>('/azir/import', form)
    try {
      return azirImportResultSchema.parse(raw)
    } catch (error) {
      if (error instanceof ZodError) throw contractError('azir.import')
      throw error
    }
  },

  async upsert(payload: AzirUpsertPayload) {
    const raw = await apiClient.post<unknown>('/azir', payload)
    try {
      return azirUpsertResponseSchema.parse(raw)
    } catch (error) {
      if (error instanceof ZodError) throw contractError('azir.upsert')
      throw error
    }
  },
}
