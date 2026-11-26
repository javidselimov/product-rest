/**
 * Galleries, videos, live streams (spec 002 data-model.md §6, spec 035).
 */
import { z } from 'zod'

import { listEnvelope } from '@/entities/content'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export const galleryListItemSchema = z
  .object({
    id: z.number(),
    title: nullableString,
    eventDate: nullableString,
    imageCount: z.number().optional().transform((v) => v ?? 0),
    coverUrl: nullableString,
  })
  .passthrough()

export const galleryListSchema = listEnvelope(galleryListItemSchema)

export const galleryDetailSchema = z
  .object({
    id: z.number(),
    // Spec 035: the API answers 404 without a translation in the locale, so a title is always there.
    title: z.string(),
    eventDate: nullableString,
    images: z.array(z.object({ mediaId: z.number(), url: z.string() }).passthrough()),
  })
  .passthrough()

export const videoItemSchema = z
  .object({ id: z.number(), title: nullableString, youtubeUrl: nullableString, publishedAt: nullableString })
  .passthrough()

export const videoListSchema = listEnvelope(videoItemSchema)

export const videoStreamSchema = z
  .object({ id: z.number(), title: nullableString, streamUrl: nullableString, startsAt: nullableString })
  .passthrough()

export type GalleryListItem = z.infer<typeof galleryListItemSchema>
export type GalleryList = z.infer<typeof galleryListSchema>
export type GalleryDetail = z.infer<typeof galleryDetailSchema>
export type VideoItem = z.infer<typeof videoItemSchema>
export type VideoList = z.infer<typeof videoListSchema>
export type VideoStream = z.infer<typeof videoStreamSchema>
