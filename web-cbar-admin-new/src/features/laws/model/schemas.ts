/**
 * Qanunlar bölməsinin Zod sxemləri (B13, contracts/admin-api.md §3, §6).
 * Siyahı DTO-su düzdür (`title` az → ilk mövcud), detail `translations` +
 * `assets[]` daşıyır. `looseObject` — backend əlavə sahə göndərəndə panel qırılmır.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'
import { attachedAssetSchema } from '@/entities/media/model/types'

export const lawListItemSchema = z.looseObject({
  id: z.number(),
  categoryId: z.number(),
  type: z.number(),
  status: z.string(),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  title: z.string().nullable().optional(),
})

export type LawListItem = z.infer<typeof lawListItemSchema>

export const lawTranslationSchema = z.looseObject({
  title: z.string(),
  slug: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const lawDetailSchema = z.looseObject({
  id: z.number(),
  categoryId: z.number(),
  type: z.number(),
  status: z.string(),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
  translations: translationsSchema(lawTranslationSchema),
  assets: z.array(attachedAssetSchema).default([]),
})

export type LawDetail = z.infer<typeof lawDetailSchema>

/** Kateqoriya: siyahı, detail və lookup üçün eyni forma (array envelope). */
export const lawCategorySchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})

export type LawCategory = z.infer<typeof lawCategorySchema>
