/**
 * Working paper schemas (spec 054, `api-cbar-admin/openapi/components/schemas/working-papers.yaml`). The list item
 * carries the az title (else the en one) and the locales that have a title; the detail carries every locale's
 * translation, with `media` null when there is no file or it was deleted from the media library.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'
import { PAPER_LANGUAGES } from './constants'

export const workingPaperRowSchema = z.looseObject({
  id: z.number(),
  number: z.number(),
  year: z.number(),
  code: z.string(),
  title: z.string().nullable(),
  status: z.string(),
  locales: z.array(z.string()),
  updatedAt: z.string(),
})

export type WorkingPaperRow = z.infer<typeof workingPaperRowSchema>

export const workingPaperTranslationSchema = z.looseObject({
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string().nullable(),
  keywords: z.array(z.string()),
  mediaId: z.number().nullable(),
  media: z.looseObject({ id: z.number(), originalName: z.string() }).nullable(),
})

export const workingPaperDetailSchema = z.looseObject({
  id: z.number(),
  number: z.number(),
  year: z.number(),
  code: z.string(),
  paperLanguage: z.enum(PAPER_LANGUAGES),
  jelCodes: z.array(z.string()),
  legacyPageId: z.number().nullable(),
  status: z.string(),
  translations: translationsSchema(workingPaperTranslationSchema),
})

export type WorkingPaperDetail = z.infer<typeof workingPaperDetailSchema>
