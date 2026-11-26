import 'server-only'

import { formatLongDate } from '@/entities/content'
import { getMoneyMarkNews } from '@/features/money-marks/api/money-mark-news.api'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { pageSchema, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'
import type { ContentListItem } from '@/widgets/content-list/content-list'

export type MoneyMarkNewsViewData = {
  locale: Locale
  page: number
  items: ContentListItem[] | null
  total: number
  pageSize: number
  error: boolean
}

export async function loadMoneyMarkNews(locale: Locale, searchParams: RawSearchParams): Promise<MoneyMarkNewsViewData> {
  const page = pageSchema.parse(searchParams.page)

  try {
    const list = await getMoneyMarkNews(locale, page)
    return {
      locale,
      page,
      total: list.total,
      pageSize: list.pageSize,
      error: false,
      items: list.items.map((item) => ({
        key: String(item.id),
        title: item.title,
        href: `/${locale}/national-currency/news/${item.slug}`,
        dateLabel: formatLongDate(item.publishedAt, locale),
      })),
    }
  } catch {
    return { locale, page, items: null, total: 0, pageSize: DEFAULT_PAGE_SIZE, error: true }
  }
}
