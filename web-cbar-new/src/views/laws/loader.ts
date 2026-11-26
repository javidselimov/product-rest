/**
 * Qanunvericilik siyahısı (contracts/routes.md #4): `categoryId`, `type` 1|2, `page`.
 */
import 'server-only'

import { formatLongDate } from '@/entities/content'
import { getLawCategories, getLaws } from '@/features/laws/api/laws.api'
import { LAW_TYPES, type LawCategory, type LawType } from '@/features/laws/model/schemas'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { enumParam, optionalIdSchema, pageSchema, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'
import type { ContentListItem } from '@/widgets/content-list/content-list'

export type LawsViewData = {
  locale: Locale
  categoryId: number | undefined
  type: LawType | undefined
  page: number
  categories: LawCategory[]
  items: ContentListItem[] | null
  total: number
  pageSize: number
  error: boolean
}

const typeParam = enumParam(LAW_TYPES)

export async function loadLaws(locale: Locale, searchParams: RawSearchParams): Promise<LawsViewData> {
  const categoryId = optionalIdSchema.parse(searchParams.categoryId)
  const type = typeParam.parse(searchParams.type)
  const page = pageSchema.parse(searchParams.page)

  const [listResult, categoriesResult] = await Promise.allSettled([
    getLaws(locale, page, categoryId, type ? Number(type) : undefined),
    getLawCategories(locale),
  ])
  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []

  if (listResult.status !== 'fulfilled') {
    return { locale, categoryId, type, page, categories, items: null, total: 0, pageSize: DEFAULT_PAGE_SIZE, error: true }
  }

  const list = listResult.value
  return {
    locale,
    categoryId,
    type,
    page,
    categories,
    total: list.total,
    pageSize: list.pageSize,
    error: false,
    items: list.items.map((item) => ({
      key: String(item.id),
      title: item.title,
      href: `/${locale}/laws/${item.slug}`,
      dateLabel: formatLongDate(item.publishedAt, locale),
      badge: item.categoryName,
    })),
  }
}
