/**
 * Pul nişanları kataloqu (contracts/routes.md #9): `type` 1 (default) | 2, `categoryId`.
 * Köhnə sayt `type`-ı həmişə göndərir; başlıq seçilmiş kateqoriyanın adıdır.
 */
import 'server-only'

import { mediaUrl } from '@/entities/content'
import { getMoneyMarkCategories, getMoneyMarks } from '@/features/money-marks/api/money-marks.api'
import type { MoneyMarkCategory } from '@/features/money-marks/model/schemas'
import { optionalIdSchema, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'
import { first } from '@/shared/lib/search-params'

export type MoneyMarkCard = { id: number; title: string; href: string; imageUrl: string | null }

export type MoneyMarksViewData = {
  locale: Locale
  type: 1 | 2
  categoryId: number | undefined
  categories: MoneyMarkCategory[]
  title: string | null
  items: MoneyMarkCard[] | null
  error: boolean
}

export async function loadMoneyMarks(locale: Locale, searchParams: RawSearchParams): Promise<MoneyMarksViewData> {
  const type: 1 | 2 = first(searchParams.type) === '2' ? 2 : 1
  const categoryId = optionalIdSchema.parse(searchParams.categoryId)

  const [marks, categoriesResult] = await Promise.allSettled([
    getMoneyMarks(locale, type, categoryId),
    getMoneyMarkCategories(locale),
  ])
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
  const active = categories.find((c) => c.id === categoryId) ?? null

  return {
    locale,
    type,
    categoryId,
    categories,
    title: active?.name ?? null,
    error: marks.status === 'rejected',
    items:
      marks.status === 'fulfilled'
        ? marks.value.map((mark) => ({
            id: mark.id,
            title: mark.title,
            href: `/${locale}/national-currency/${mark.slug}`,
            imageUrl: mediaUrl(mark.frontImageUrl),
          }))
        : null,
  }
}
