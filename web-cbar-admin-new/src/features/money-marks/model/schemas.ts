/**
 * Pul nişanları bölməsinin Zod sxemləri (B13, contracts/admin-api.md §3, §6).
 * `paged` resurslarda siyahı elementi düz formadadır (`title` az → ilk mövcud),
 * detail isə `translations` daşıyır; kateqoriyalar `array` — sətir = detail.
 */

import { z } from 'zod'

import { translationsSchema } from '@/entities/content/model/types'

/** Siyahı DTO-su: `GET /money-marks` (düz, `title` seçilmiş dildə). */
export const moneyMarkListItemSchema = z.looseObject({
  id: z.number(),
  categoryId: z.number(),
  type: z.number(),
  sortOrder: z.number(),
  status: z.string(),
  title: z.string().nullable(),
})

export type MoneyMarkRow = z.infer<typeof moneyMarkListItemSchema>

const moneyMarkTranslationSchema = z.looseObject({
  title: z.string(),
  description: z.string().nullable().optional(),
  securityFeatures: z.string().nullable().optional(),
})

export const moneyMarkDetailSchema = z.looseObject({
  id: z.number(),
  categoryId: z.number(),
  type: z.number(),
  frontMediaId: z.number().nullable().optional(),
  rearMediaId: z.number().nullable().optional(),
  sortOrder: z.number(),
  status: z.string(),
  translations: translationsSchema(moneyMarkTranslationSchema),
})

const categoryTranslationSchema = z.looseObject({ name: z.string() })

/** Kateqoriya: siyahı, detail və lookup üçün eyni sxem (`array` envelope). */
export const moneyMarkCategorySchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  translations: translationsSchema(categoryTranslationSchema),
})

export type MoneyMarkCategoryRow = z.infer<typeof moneyMarkCategorySchema>

/** Siyahı DTO-su: `GET /money-mark-news` (düz). */
export const moneyMarkNewsListItemSchema = z.looseObject({
  id: z.number(),
  status: z.string(),
  publishedAt: z.string().nullable(),
  title: z.string().nullable(),
})

export type MoneyMarkNewsRow = z.infer<typeof moneyMarkNewsListItemSchema>

const newsTranslationSchema = z.looseObject({
  title: z.string(),
  content: z.string().nullable().optional(),
})

export const moneyMarkNewsDetailSchema = z.looseObject({
  id: z.number(),
  status: z.string(),
  publishedAt: z.string().nullable().optional(),
  translations: translationsSchema(newsTranslationSchema),
})
