/**
 * MEAS bölməsinin Zod sxemləri (B13, contracts/admin-api.md §6). Sənəd DTO-su
 * tərcüməsizdir; qeydiyyat tarixi API-də `regDate` (DateOnly → "YYYY-MM-DD").
 * Siyahı elementi əlavə olaraq `emitentName`/`infoTypeName` daşıya bilər.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

export const measDocumentListItemSchema = z.looseObject({
  id: z.number(),
  emitentId: z.number(),
  infoTypeId: z.number(),
  regDate: z.string(),
  dqn: z.string().nullable().optional(),
  mediaId: z.number().nullable().optional(),
  status: z.string(),
  updatedAt: z.string().optional(),
  emitentName: z.string().nullable().optional(),
  infoTypeName: z.string().nullable().optional(),
})

export type MeasDocumentListItem = z.infer<typeof measDocumentListItemSchema>

export const measDocumentDetailSchema = z.looseObject({
  id: z.number(),
  emitentId: z.number(),
  infoTypeId: z.number(),
  regDate: z.string(),
  dqn: z.string().nullable().optional(),
  mediaId: z.number().nullable().optional(),
  status: z.string(),
  updatedAt: z.string().optional(),
  media: z
    .looseObject({
      id: z.number(),
      originalName: z.string(),
      mimeType: z.string().nullable().optional(),
      sizeBytes: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
})

export type MeasDocumentDetail = z.infer<typeof measDocumentDetailSchema>

/** Emitent və məlumat tipi: siyahı, detail və lookup üçün eyni forma. */
export const measLookupSchema = z.looseObject({
  id: z.number(),
  isActive: z.boolean(),
  updatedAt: z.string().optional(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
})

export type MeasLookupItem = z.infer<typeof measLookupSchema>
