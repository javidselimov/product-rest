/**
 * Parametr servisi (contracts/admin-api.md §8): `GET /settings` → items,
 * `PUT /settings/{key} { value }` → 200 `{key, value, updatedAt}` (upsert;
 * `value` yoxdursa 400 `{message}`). Cavablar Zod ilə (B13).
 */

import { ZodError } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  settingItemSchema,
  settingsListSchema,
  type SettingItem,
} from '../model/schemas'

const guard = <T>(fn: () => T, where: string): T => {
  try {
    return fn()
  } catch (error) {
    if (error instanceof ZodError) throw contractError(where)
    throw error
  }
}

export const settingsService = {
  async list(): Promise<SettingItem[]> {
    const raw = await apiClient.get<unknown>('/settings')
    return guard(() => settingsListSchema.parse(raw), 'settings.list').items
  },

  async put(key: string, body: { value: unknown }): Promise<SettingItem> {
    const raw = await apiClient.put<unknown>(
      `/settings/${encodeURIComponent(key)}`,
      body,
    )
    return guard(() => settingItemSchema.parse(raw), 'settings.put')
  },
}
