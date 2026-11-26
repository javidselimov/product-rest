/**
 * Video sxemləri (contracts/admin-api.md §6 `/videos` paged; B13). Siyahı
 * düzdür (`title`), detail `translations` ilə gəlir. Canlı yayım sxemi:
 * `features/live-streams/model/schemas.ts` (spec 006).
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

export const videoRowSchema = z.looseObject({
  id: z.number(),
  title: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
})

export type VideoRow = z.infer<typeof videoRowSchema>

export const videoDetailSchema = z.looseObject({
  id: z.number(),
  youtubeUrl: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
  translations: translationsSchema(z.looseObject({ title: z.string() })),
})
