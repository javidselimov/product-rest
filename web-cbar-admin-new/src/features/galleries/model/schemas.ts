/**
 * Qalereya sxemləri (contracts/admin-api.md §6 `/galleries`, §7 images; B13).
 * Siyahı DTO-su düzdür (`title`, `imageCount`), detail `images[]` daşıyır.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

export const galleryRowSchema = z.looseObject({
  id: z.number(),
  title: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
  imageCount: z.number().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
})

export type GalleryRow = z.infer<typeof galleryRowSchema>

export const galleryImageSchema = z.looseObject({
  id: z.number(),
  mediaId: z.number(),
  originalName: z.string().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
})

export type GalleryImage = z.infer<typeof galleryImageSchema>

export const galleryDetailSchema = z.looseObject({
  id: z.number(),
  eventDate: z.string().nullable().optional(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
  translations: translationsSchema(z.looseObject({ title: z.string() })),
  images: z.array(galleryImageSchema).default([]),
})

export type GalleryDetail = z.infer<typeof galleryDetailSchema>

/** `POST /galleries/{id}/images` cavabı (200). */
export const galleryImageAddedSchema = z.looseObject({
  id: z.number(),
  mediaId: z.number(),
  sortOrder: z.number().nullable().optional(),
})
