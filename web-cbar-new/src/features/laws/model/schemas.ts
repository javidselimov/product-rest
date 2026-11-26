/**
 * Qanunvericilik (spec 002 data-model.md §3).
 *
 * `type` URL parametri köhnə saytdakı kimi rəqəmdir: `1` qanun, `2` normativ akt.
 */
import { z } from 'zod'

import { listEnvelope, mediaAssetSchema } from '@/entities/content'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export const lawListItemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    publishedAt: z.string(),
    categoryName: nullableString,
  })
  .passthrough()

export const lawListSchema = listEnvelope(lawListItemSchema)

export const lawDetailSchema = lawListItemSchema
  .extend({
    description: z.string().nullable(),
    assets: z.array(mediaAssetSchema).optional().transform((v) => v ?? []),
  })
  .passthrough()

export const lawCategorySchema = z.object({ id: z.number(), name: nullableString }).passthrough()

export type LawListItem = z.infer<typeof lawListItemSchema>
export type LawList = z.infer<typeof lawListSchema>
export type LawDetail = z.infer<typeof lawDetailSchema>
export type LawCategory = z.infer<typeof lawCategorySchema>

export const LAW_TYPES = ['1', '2'] as const
export type LawType = (typeof LAW_TYPES)[number]

export const LAW_TYPE_KEY: Record<LawType, 'law' | 'regulation'> = { '1': 'law', '2': 'regulation' }
