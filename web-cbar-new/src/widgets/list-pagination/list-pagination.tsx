/**
 * Siyahı səhifələməsi — kit `Pagination` (spec 002 FR-018, research R4).
 *
 * Server komponentidir: kitin keçidləri adi `<a>`-dır (tam səhifə keçidi), JS-siz
 * işləyir — siyahı səhifələri onsuz da hər sorğuda serverdən gəlir. Mövcud sorğu
 * parametrləri `buildHref` ilə qorunur; tək səhifədə heç nə render olunmur.
 * Etiketlər (`aria-label`) kitin `UIMessagesProvider` kataloqundan gəlir.
 */
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@cbar/lib-react-ui-kit/pagination'

import { totalPages as computeTotalPages } from '@/entities/content'
import { buildHref } from '@/shared/lib/search-params'

import { PAGE_WINDOW_BASE } from './constants'

type ListPaginationProps = {
  basePath: string
  /** Cari sorğu parametrləri (filtrlər) — keçidlərdə qorunur. */
  params: Record<string, string | number | undefined>
  page: number
  total: number
  pageSize: number
  /** Cari səhifənin ətrafında neçə nömrə görünsün. */
  siblings?: number
  className?: string
}

/** `1 … 4 5 6 … 20` formasında görünən nömrələr; `null` üç nöqtədir. */
export function pageWindow(page: number, totalPages: number, siblings = 1): (number | null)[] {
  if (totalPages <= PAGE_WINDOW_BASE + siblings * 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const start = Math.max(2, page - siblings)
  const end = Math.min(totalPages - 1, page + siblings)
  const items: (number | null)[] = [1]

  if (start > 2) items.push(null)
  for (let i = start; i <= end; i += 1) items.push(i)
  if (end < totalPages - 1) items.push(null)
  items.push(totalPages)

  return items
}

export function ListPagination({
  basePath,
  params,
  page,
  total,
  pageSize,
  siblings = 1,
  className,
}: ListPaginationProps) {
  const totalPages = computeTotalPages(total, pageSize)
  if (totalPages <= 1) return null

  const current = Math.min(Math.max(page, 1), totalPages)
  const href = (target: number) => buildHref(basePath, params, { page: target })

  return (
    <Pagination data-slot="list-pagination" className={className}>
      <PaginationContent>
        {current > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={href(current - 1)} rel="prev" />
          </PaginationItem>
        ) : null}

        {pageWindow(current, totalPages, siblings).map((item, index) =>
          item === null ? (
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={href(item)}
                isActive={item === current}
                aria-current={item === current ? 'page' : undefined}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        {current < totalPages ? (
          <PaginationItem>
            <PaginationNext href={href(current + 1)} rel="next" />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  )
}
