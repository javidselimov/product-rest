/**
 * CSR project schemas (spec 038, `contracts/api.md`). The list DTO is flat; the detail adds the
 * translations, the photos and the display data of the cover.
 */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'
import { attachedAssetSchema } from '@/entities/media/model/types'

/** The API refuses `scheduled`: a project has no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const CSR_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUS_OPTIONS.filter(
  (option) => option.value !== SCHEDULED,
)

export const csrProjectRowSchema = z.looseObject({
  id: z.number(),
  status: z.string(),
  sortOrder: z.number(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  title: z.string().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  imageCount: z.number(),
})

export type CsrProjectRow = z.infer<typeof csrProjectRowSchema>

export const csrProjectDetailSchema = z.looseObject({
  id: z.number(),
  categoryId: z.number(),
  coverMediaId: z.number().nullable().optional(),
  cover: attachedAssetSchema.nullable().optional(),
  sortOrder: z.number(),
  status: z.string(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  translations: translationsSchema(
    z.looseObject({
      cardTitle: z.string(),
      summary: z.string(),
      title: z.string(),
      content: z.string().nullable().optional(),
    }),
  ),
  assets: z.array(attachedAssetSchema),
})

export const csrCategoryRowSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  name: z.string().nullable().optional(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})

export type CsrCategoryRow = z.infer<typeof csrCategoryRowSchema>

export const csrCategoryDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})
