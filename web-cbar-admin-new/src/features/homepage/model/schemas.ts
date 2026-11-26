/**
 * Ana səhifə bloklarının Zod sxemləri (contracts/admin-api.md §6, B13).
 * Bütün resurslar `items` envelope ilə tam DTO qaytarır — siyahı elementi və
 * detail eyni formadadır. `looseObject`: backend əlavə sahə göndərəndə panel qırılmır.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

const optionalText = z.string().nullable().optional()

/** Ortaq sahələr: id, sıra, aktivlik, yenilənmə vaxtı. */
const baseRow = {
  id: z.number(),
  sortOrder: z.number().nullable().optional(),
  isActive: z.boolean(),
  updatedAt: z.string().optional(),
}

export const bannerRowSchema = z.looseObject({
  ...baseRow,
  mediaId: z.number().nullable().optional(),
  startsAt: optionalText,
  endsAt: optionalText,
  translations: translationsSchema(
    z.looseObject({ title: optionalText, link: optionalText }),
  ).optional(),
})
export type BannerRow = z.infer<typeof bannerRowSchema>

export const newsSlideRowSchema = z.looseObject({
  ...baseRow,
  newsDate: z.string(),
  mediaId: z.number().nullable().optional(),
  translations: translationsSchema(
    z.looseObject({
      title: optionalText,
      description: optionalText,
      link: optionalText,
    }),
  ).optional(),
})
export type NewsSlideRow = z.infer<typeof newsSlideRowSchema>

export const runningLineRowSchema = z.looseObject({
  id: z.number(),
  isActive: z.boolean(),
  updatedAt: z.string().optional(),
  startsAt: optionalText,
  endsAt: optionalText,
  translations: translationsSchema(
    z.looseObject({ text: optionalText }),
  ).optional(),
})
export type RunningLineRow = z.infer<typeof runningLineRowSchema>

export const homepageLinkRowSchema = z.looseObject({
  ...baseRow,
  translations: translationsSchema(
    z.looseObject({ title: optionalText, url: optionalText }),
  ).optional(),
})
export type HomepageLinkRow = z.infer<typeof homepageLinkRowSchema>

export const publicationRowSchema = z.looseObject({
  ...baseRow,
  mediaId: z.number().nullable().optional(),
  publishedAt: optionalText,
  translations: translationsSchema(
    z.looseObject({ title: optionalText, url: optionalText }),
  ).optional(),
})
export type PublicationRow = z.infer<typeof publicationRowSchema>
