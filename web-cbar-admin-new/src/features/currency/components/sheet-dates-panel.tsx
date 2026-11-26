/**
 * Vərəq tarixləri paneli: sağdan açılan kit `Sheet`, tarix/say cədvəli və
 * səhifələmə (20). Tarixə klik → valideyn həmin vərəqi yükləyir.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@cbar/lib-react-ui-kit/sheet'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/shared/ui/empty-state'
import { COLUMN_WIDTH } from '../model/constants'
import { ErrorState } from '@/shared/ui/error-state'
import { ListPagination } from '@/shared/ui/list-pagination'
import { useSheetDates } from '../hooks/use-currency'
import { formatDay } from '../model/format-day'
import { SHEET_DATES_PAGE_SIZE, type SheetDate } from '../model/schemas'

interface SheetDatesPanelProps {
  open: boolean
  onClose: () => void
  onPick: (date: string) => void
}

export function SheetDatesPanel({
  open,
  onClose,
  onPick,
}: SheetDatesPanelProps) {
  const { t } = useTranslation('currency')
  const [page, setPage] = useState(1)
  const query = useSheetDates(page, open)
  const items = query.data?.items ?? []
  const total = query.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / SHEET_DATES_PAGE_SIZE))

  const columns: DataTableColumn<SheetDate>[] = [
    {
      key: 'date',
      title: t('dates.columns.date'),
      render: (_value, row) => (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0"
          onClick={() => onPick(row.date)}
        >
          {formatDay(row.date)}
        </Button>
      ),
    },
    {
      key: 'count',
      title: t('dates.columns.count'),
      align: 'right',
      width: COLUMN_WIDTH.SHEET_COUNT,
      render: (_value, row) => row.count,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <SheetContent
        side="right"
        className="flex flex-col gap-4 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{t('dates.title')}</SheetTitle>
          <SheetDescription>{t('dates.description')}</SheetDescription>
        </SheetHeader>

        {query.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : query.isError ? (
          <ErrorState
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState title={t('dates.empty')} />
        ) : (
          <DataTable
            aria-label={t('dates.list')}
            columns={columns}
            data={items}
            rowKey={(row) => row.date}
          />
        )}

        {total > SHEET_DATES_PAGE_SIZE ? (
          <ListPagination
            page={page}
            pageCount={pageCount}
            total={total}
            onPageChange={setPage}
            className="flex flex-col items-center gap-3"
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
