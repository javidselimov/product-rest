/**
 * Canlı yayım sxemi (contracts/admin-api.md §6 `/video-streams` items; spec 006).
 * Siyahı detail ilə eyni formadadır (`translations`). `createdAt` API-yə spec
 * 006-da əlavə olunub — köhnə deploy-da gəlməyə bilər, ona görə optional.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

export const liveStreamRowSchema = z.looseObject({
  id: z.number(),
  streamUrl: z.string().nullable().optional(),
  isLive: z.boolean(),
  startsAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  translations: translationsSchema(z.looseObject({ title: z.string() })),
})

export type LiveStreamRow = z.infer<typeof liveStreamRowSchema>
