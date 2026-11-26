/**
 * Şəkilli popup sxemi (specs/009-image-popup/contracts/admin-api.md). Siyahı
 * detail ilə eyni formadadır; hər dilin öz şəkli, linki və alt mətni var.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

export const imagePopupRowSchema = z.looseObject({
  id: z.number(),
  title: z.string(),
  isActive: z.boolean(),
  activatedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  translations: translationsSchema(
    z.looseObject({
      mediaId: z.number().nullable().optional(),
      mediaName: z.string().nullable().optional(),
      link: z.string().nullable().optional(),
      altText: z.string().nullable().optional(),
    }),
  ),
})

export type ImagePopupRow = z.infer<typeof imagePopupRowSchema>
