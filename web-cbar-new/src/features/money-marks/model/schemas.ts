/**
 * Pul nişanları və xəbərləri (spec 002 data-model.md §3, §6).
 */
import { z } from 'zod'

import { listEnvelope } from '@/entities/content'

const nullableString = z.string().nullable().optional().transform((v) => v ?? null)

export const moneyMarkNewsListItemSchema = z
  .object({ id: z.number(), title: z.string(), slug: z.string(), publishedAt: z.string() })
  .passthrough()

export const moneyMarkNewsListSchema = listEnvelope(moneyMarkNewsListItemSchema)

export const moneyMarkNewsDetailSchema = moneyMarkNewsListItemSchema
  .extend({ content: z.string().nullable() })
  .passthrough()

export const moneyMarkListItemSchema = z
  .object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    categoryName: nullableString,
    frontImageUrl: nullableString,
    rearImageUrl: nullableString,
  })
  .passthrough()

export const moneyMarkDetailSchema = moneyMarkListItemSchema
  .extend({
    description: z.string().nullable(),
    securityFeatures: z.string().nullable(),
    type: z.number(),
  })
  .passthrough()

export const moneyMarkCategorySchema = z.object({ id: z.number(), name: nullableString }).passthrough()

export type MoneyMarkNewsListItem = z.infer<typeof moneyMarkNewsListItemSchema>
export type MoneyMarkNewsList = z.infer<typeof moneyMarkNewsListSchema>
export type MoneyMarkNewsDetail = z.infer<typeof moneyMarkNewsDetailSchema>
export type MoneyMarkListItem = z.infer<typeof moneyMarkListItemSchema>
export type MoneyMarkDetail = z.infer<typeof moneyMarkDetailSchema>
export type MoneyMarkCategory = z.infer<typeof moneyMarkCategorySchema>

/** URL `type`: `1` əskinas, `2` sikkə. */
export const MONEY_MARK_TYPES = ['1', '2'] as const
export type MoneyMarkType = (typeof MONEY_MARK_TYPES)[number]

export function isBanknote(type: number): boolean {
  return type === 1
}
