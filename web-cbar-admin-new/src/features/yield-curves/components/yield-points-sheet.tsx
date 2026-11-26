/**
 * Bir tarixin əyri nöqtələri (köhnə admin siyahısındakı date / period /
 * profitability sətirləri): siyahıda sətir əməli → sağdan açılan kit `Sheet`.
 * Nöqtələr yalnız panel açılanda yüklənir.
 */

import { DataTable, type DataTableColumn } from '@cbar/lib-react-ui-kit/data-table'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { EyeIcon } from '@cbar/lib-react-ui-kit/icons'
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
import { ErrorState } from '@/shared/ui/error-state'
import { useYieldCurvePoints } from '../hooks/use-yield-curves'
import type { YieldCurveDateRow, YieldCurvePoints } from '../model/schemas'

type Point = YieldCurvePoints['points'][number]

export function YieldPointsAction({ row }: { row: YieldCurveDateRow }) {
  const { t } = useTranslation('yieldCurves')
  const [open, setOpen] = useState(false)
  const query = useYieldCurvePoints(row.curveDate, open)
  const points = query.data?.points ?? []
  const day = row.curveDate.split('-').reverse().join('.')

  const columns: DataTableColumn<Point>[] = [
    {
      key: 'period',
      title: t('points.period'),
      render: (_value, point) => point.period,
    },
    {
      key: 'yield',
      title: t('points.yield'),
      align: 'right',
      render: (_value, point) => point.yield,
    },
  ]

  return (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        colorPalette="black"
        aria-label={t('points.open', { date: day })}
        onClick={() => setOpen(true)}
      >
        <EyeIcon />
      </IconButton>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-4 overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>{t('points.title', { date: day })}</SheetTitle>
            <SheetDescription>
              {t('points.description', { count: row.pointsCount })}
            </SheetDescription>
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
          ) : points.length === 0 ? (
            <EmptyState title={t('yields.empty')} />
          ) : (
            <DataTable
              aria-label={t('points.title', { date: day })}
              columns={columns}
              data={points}
              rowKey={(point) => point.period}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
