/** `GET /api/v1/working-papers` and `GET /api/v1/working-papers/{key}`, `specs/054-publications-research/contracts/public-api.md`. */
import { z } from 'zod'

export const paperLanguageSchema = z.enum(['az', 'en', 'other']).catch('other')

export const workingPaperListItemSchema = z.object({
  id: z.number(),
  number: z.number(),
  year: z.number(),
  code: z.string(),
  key: z.string(),
  language: paperLanguageSchema,
  title: z.string(),
  authors: z.array(z.string()),
  keywords: z.array(z.string()),
})

export const workingPaperListSchema = z.object({ items: z.array(workingPaperListItemSchema) })

export const workingPaperFileSchema = z.object({
  mediaId: z.number(),
  originalName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  url: z.string(),
})

export const workingPaperDetailSchema = workingPaperListItemSchema.extend({
  abstract: z.string().nullable(),
  jelCodes: z.array(z.string()),
  file: workingPaperFileSchema.nullable(),
})

export type PaperLanguage = z.infer<typeof paperLanguageSchema>
export type WorkingPaperListItemDto = z.infer<typeof workingPaperListItemSchema>
export type WorkingPaperDetailDto = z.infer<typeof workingPaperDetailSchema>
