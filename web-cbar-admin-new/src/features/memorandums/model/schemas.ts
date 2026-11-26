/**
 * Memorandum schemas (spec 045, `contracts/api.md`). The list DTO is flat; the detail carries the
 * organization and the country per language.
 */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'

/** The API refuses `scheduled`: a memorandum has no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const MEMORANDUM_STATUS_OPTIONS: SelectOption[] =
  CONTENT_STATUS_OPTIONS.filter((option) => option.value !== SCHEDULED)

export const memorandumRowSchema = z.looseObject({
  id: z.number(),
  status: z.string(),
  sortOrder: z.number(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  organization: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  signedYear: z.number(),
})

export type MemorandumRow = z.infer<typeof memorandumRowSchema>

export const memorandumDetailSchema = z.looseObject({
  id: z.number(),
  signedYear: z.number(),
  sortOrder: z.number(),
  status: z.string(),
  showAz: z.boolean(),
  showEn: z.boolean(),
  translations: translationsSchema(
    z.looseObject({ organization: z.string(), country: z.string() }),
  ),
})
