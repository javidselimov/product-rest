/**
 * Məlumat sətirlərinin Zod sxemləri (contracts/admin-api.md §6, B13).
 * Siyahı QRUPLUDUR: `items: [{ alias, lines: InfoLine[] }]` — `rowSchema` xam
 * elementi (qrupu) yoxlayır, `transformItems` qrupları sətirlərə açır;
 * `GET/POST/PUT /{id}` tək sətirlə işləyir (`detailSchema`).
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

const optionalText = z.string().nullable().optional()

export const infoLineSchema = z.looseObject({
  id: z.number(),
  alias: z.string(),
  year: z.number().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
  updatedAt: z.string().optional(),
  translations: translationsSchema(
    z.looseObject({ title: optionalText, value: optionalText }),
  ).optional(),
})
export type InfoLineRow = z.infer<typeof infoLineSchema>

export const infoLineGroupSchema = z.looseObject({
  alias: z.string(),
  lines: z.array(infoLineSchema),
})
export type InfoLineGroup = z.infer<typeof infoLineGroupSchema>
