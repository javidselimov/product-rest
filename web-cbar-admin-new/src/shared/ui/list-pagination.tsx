/**
 * Səhifələmə control-u (research R6): kit `DataTable` səhifələmə vermir,
 * `pagination` primitivləri idarə olunmayan `<nav>`-dır — səhifə siyahısı burada
 * qurulur. Kit `PaginationPrevious/Next` görünən mətni ingiliscədir (spec D3);
 * `aria-label` i18n ilə verilir.
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
import { useTranslation } from 'react-i18next'

import { PAGINATION_WINDOW } from '@/shared/constants/ui'

interface ListPaginationProps {
  page: number
  pageCount: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

/** 1 … (p-1) p (p+1) … N — ən çox 7 element. */
function pageWindow(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= PAGINATION_WINDOW) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('gap')
    result.push(sorted[i])
  }
  return result
}

export function ListPagination({
  page,
  pageCount,
  total,
  onPageChange,
  className,
}: ListPaginationProps) {
  const { t } = useTranslation('crud')
  const go = (target: number) => {
    const next = Math.min(Math.max(target, 1), pageCount)
    if (next !== page) onPageChange(next)
  }

  return (
    <div
      className={
        className ??
        'flex flex-col items-center justify-between gap-3 md:flex-row'
      }
    >
      <p
        className="text-muted-foreground text-sm"
        data-slot="pagination-summary"
      >
        {t('pagination', { total, page, pageCount })}
      </p>
      <Pagination aria-label={t('paginationAria')}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-label={t('previousPage')}
              aria-disabled={page <= 1}
              onClick={(e) => {
                e.preventDefault()
                go(page - 1)
              }}
            />
          </PaginationItem>
          {pageWindow(page, pageCount).map((item, index) =>
            item === 'gap' ? (
              <PaginationItem key={`gap-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  aria-label={t('goToPage', { page: item })}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item)
                  }}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-label={t('nextPage')}
              aria-disabled={page >= pageCount}
              onClick={(e) => {
                e.preventDefault()
                go(page + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
