/**
 * İnflyasiya servisi — CRUD-dan kənar endpoint-lər: `POST /inflation` upsert
 * (il + ay + parametr → yenilənir) və `GET|PUT /inflation/settings` (ana səhifə
 * xülasəsi). Siyahı/silmə `crudService` ilə gedir.
 */

import { ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  inflationSettingsSchema,
  inflationUpsertResponseSchema,
  type InflationSettingsPayload,
  type InflationUpsertPayload,
} from '../model/schemas'

function parseOr<T>(schema: ZodType<T>, raw: unknown, where: string): T {
  try {
    return schema.parse(raw)
  } catch (error) {
    if (error instanceof ZodError) throw contractError(where)
    throw error
  }
}

export const inflationService = {
  async upsert(payload: InflationUpsertPayload) {
    const raw = await apiClient.post<unknown>('/inflation', payload)
    return parseOr(inflationUpsertResponseSchema, raw, 'inflation.upsert')
  },

  async settings() {
    const raw = await apiClient.get<unknown>('/inflation/settings')
    // ASP.NET `Ok(null)` → 204 (boş gövdə).
    return parseOr(
      inflationSettingsSchema,
      raw === '' || raw === undefined ? null : raw,
      'inflation.settings',
    )
  },

  async saveSettings(payload: InflationSettingsPayload) {
    const raw = await apiClient.put<unknown>('/inflation/settings', payload)
    return parseOr(inflationSettingsSchema, raw, 'inflation.saveSettings')
  },
}
