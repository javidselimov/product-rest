/**
 * Press releases (spec 002 data-model.md §3, spec 029 contracts/public-api.md).
 */
import { z } from 'zod'

import { listEnvelope, mediaAssetSchema } from '@/entities/content'

import { PRESS_RELEASE_TYPE } from './constants'

/** URL `type` parameter: `1` news, `2` announcement, `3` interview or speech. */
export const PRESS_RELEASE_TYPES = [PRESS_RELEASE_TYPE.NEWS, PRESS_RELEASE_TYPE.ANNOUNCEMENT, PRESS_RELEASE_TYPE.INTERVIEW] as const
export type PressReleaseType = (typeof PRESS_RELEASE_TYPES)[number]

/**
 * API sends `type` as a number. An API deployed before spec 029 does not send it at all, and
 * a value the site does not know is treated as news, so it always has a template to open.
 */
const typeSchema = z
  .number()
  .int()
  .optional()
  .transform((v): PressReleaseType => PRESS_RELEASE_TYPES.find((type) => type === String(v)) ?? PRESS_RELEASE_TYPE.NEWS)

export const pressReleaseListItemSchema = z
  .object({
    id: z.number(),
    type: typeSchema,
    title: z.string(),
    slug: z.string(),
    publishedAt: z.string(),
    imageUrl: z.string().nullable().optional().transform((v) => v ?? null),
  })
  .passthrough()

export const pressReleaseListSchema = listEnvelope(pressReleaseListItemSchema)

export const pressReleaseDetailSchema = pressReleaseListItemSchema
  .extend({
    content: z.string().nullable(),
    assets: z.array(mediaAssetSchema).optional().transform((v) => v ?? []),
  })
  .passthrough()

export type PressReleaseListItem = z.infer<typeof pressReleaseListItemSchema>
export type PressReleaseList = z.infer<typeof pressReleaseListSchema>
export type PressReleaseDetail = z.infer<typeof pressReleaseDetailSchema>
