/**
 * Parametr sxemləri (data-model.md §6 Setting, contracts/admin-api.md §8):
 * `value` istənilən JSON-dur — `z.unknown()`; siyahı `items` envelope-dadır.
 */

import { z } from 'zod'

import { listEnvelopeSchema } from '@/shared/crud/envelope-schema'

export const settingItemSchema = z.looseObject({
  key: z.string(),
  value: z.unknown(),
  updatedAt: z.string().nullable().optional(),
})

export type SettingItem = z.infer<typeof settingItemSchema>

export const settingsListSchema = listEnvelopeSchema('items', settingItemSchema)
