/**
 * FinCERT requests beyond the CRUD engine (spec 053, `contracts/admin-api.md`): the settings record, full lists for
 * ordering and the two reorder endpoints. Every response is parsed (B13).
 */

import { ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { FINCERT_FULL_LIST_SIZE } from '../model/constants'
import {
  fincertDirectionRowSchema,
  fincertMembershipRowSchema,
  fincertSettingsSchema,
  pageListSchema,
  type FincertDirectionRow,
  type FincertMembershipRow,
  type FincertSettings,
  type FincertSettingsUpdate,
} from '../model/schemas'

function parse<T>(schema: ZodType<T>, data: unknown, context: string): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) throw contractError(`${context}: ${error.issues[0]?.path.join('.') ?? ''}`)
    throw error
  }
}

const full = { pageSize: FINCERT_FULL_LIST_SIZE }

export const fincertService = {
  settings: async (): Promise<FincertSettings> =>
    parse(fincertSettingsSchema, await apiClient.get('/fincert/settings'), 'fincert.settings'),

  saveSettings: async (body: FincertSettingsUpdate): Promise<FincertSettings> =>
    parse(fincertSettingsSchema, await apiClient.put('/fincert/settings', body), 'fincert.saveSettings'),

  directions: async (): Promise<FincertDirectionRow[]> =>
    parse(pageListSchema(fincertDirectionRowSchema), await apiClient.get('/fincert/directions', { params: full }), 'fincert.directions')
      .items,

  memberships: async (): Promise<FincertMembershipRow[]> =>
    parse(pageListSchema(fincertMembershipRowSchema), await apiClient.get('/fincert/memberships', { params: full }), 'fincert.memberships')
      .items,

  reorderDirections: (ids: number[]) => apiClient.put<void>('/fincert/directions/order', { ids }),
  reorderMemberships: (ids: number[]) => apiClient.put<void>('/fincert/memberships/order', { ids }),
}
