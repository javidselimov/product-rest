/**
 * Valyuta master-i (data-model.md §5 Currency): server sətirlərinin üstündə seyrək
 * `dirty` xəritəsi — dəyişiklik server datası ilə müqayisədən hesablanır,
 * effektə ehtiyac yoxdur. Saxla → ardıcıl PUT; uğursuz kodlar dirty qalır.
 */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import { SaveIcon } from '@cbar/lib-react-ui-kit/icons'
import { InputNumber } from '@cbar/lib-react-ui-kit/input-number'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { Switch } from '@cbar/lib-react-ui-kit/switch'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@/shared/ui/empty-state'
import { COLUMN_WIDTH } from '../model/constants'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionTabs } from '@/shared/ui/section-tabs'
import { useCurrencies, useSaveCurrencies } from '../hooks/use-currency'
import { CURRENCY_SECTION_TABS } from '../model/section-tabs'
import type { CurrencyEdit, CurrencyMaster } from '../model/schemas'

type DirtyMap = Map<string, Partial<CurrencyEdit>>

export function CurrencyMasterGrid() {
  const { t } = useTranslation('currency')
  const query = useCurrencies()
  const save = useSaveCurrencies()
  const [dirty, setDirty] = useState<DirtyMap>(() => new Map())

  const rows = query.data ?? []
  const effective = (row: CurrencyMaster): CurrencyEdit => {
    const patch = dirty.get(row.code)
    return {
      showOnHomepage: patch?.showOnHomepage ?? row.showOnHomepage,
      isActive: patch?.isActive ?? row.isActive,
      sortOrder: patch?.sortOrder ?? row.sortOrder,
    }
  }
  const isDirty = (row: CurrencyMaster): boolean => {
    const e = effective(row)
    return (
      e.showOnHomepage !== row.showOnHomepage ||
      e.isActive !== row.isActive ||
      e.sortOrder !== row.sortOrder
    )
  }
  const dirtyRows = rows.filter(isDirty)
  const homepageCount = rows.filter(
    (row) => effective(row).showOnHomepage,
  ).length

  const setEdit = (code: string, patch: Partial<CurrencyEdit>) =>
    setDirty((prev) => {
      const next = new Map(prev)
      next.set(code, { ...prev.get(code), ...patch })
      return next
    })

  const handleSave = () =>
    save.mutate(
      dirtyRows.map((row) => ({ code: row.code, body: effective(row) })),
      {
        onSuccess: ({ saved, failed }) => {
          setDirty((prev) => {
            const next = new Map(prev)
            for (const code of saved) next.delete(code)
            return next
          })
          for (const failure of failed) {
            toast.error(t('currencies.saveFailed', failure))
          }
          if (failed.length === 0) toast.success(t('currencies.saved'))
        },
      },
    )

  const columns: DataTableColumn<CurrencyMaster>[] = [
    {
      key: 'code',
      title: t('currencies.columns.code'),
      width: COLUMN_WIDTH.CODE,
      render: (_value, row) => <span className="font-medium">{row.code}</span>,
    },
    {
      key: 'nameAz',
      title: t('currencies.columns.nameAz'),
      render: (_value, row) => row.nameAz ?? '—',
    },
    {
      key: 'nameEn',
      title: t('currencies.columns.nameEn'),
      render: (_value, row) => row.nameEn ?? '—',
    },
    {
      key: 'nominal',
      title: t('currencies.columns.nominal'),
      width: COLUMN_WIDTH.NOMINAL,
      align: 'right',
      render: (_value, row) => row.nominal,
    },
    {
      key: 'sortOrder',
      title: t('currencies.columns.sortOrder'),
      width: COLUMN_WIDTH.SORT_ORDER,
      render: (_value, row) => (
        <InputNumber
          value={effective(row).sortOrder}
          min={0}
          onChange={(value) => setEdit(row.code, { sortOrder: value ?? 0 })}
          aria-label={t('currencies.sortOrderFor', { code: row.code })}
          className="w-28"
        />
      ),
    },
    {
      key: 'isActive',
      title: t('currencies.columns.isActive'),
      width: COLUMN_WIDTH.IS_ACTIVE,
      render: (_value, row) => (
        <Switch
          checked={effective(row).isActive}
          onCheckedChange={(checked) =>
            setEdit(row.code, { isActive: checked })
          }
          aria-label={t('currencies.isActiveFor', { code: row.code })}
          colorPalette="green"
        />
      ),
    },
    {
      key: 'showOnHomepage',
      title: t('currencies.columns.showOnHomepage'),
      width: COLUMN_WIDTH.SHOW_ON_HOMEPAGE,
      render: (_value, row) => {
        const on = effective(row).showOnHomepage
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={on}
              onCheckedChange={(checked) =>
                setEdit(row.code, { showOnHomepage: checked })
              }
              aria-label={t('currencies.showOnHomepageFor', { code: row.code })}
              colorPalette="green"
            />
            {on ? (
              <Badge size="sm" variant="subtle" colorPalette="green">
                {t('currencies.homepageBadge')}
              </Badge>
            ) : null}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <PageHeader
        title={t('currencies.title')}
        description={`${t('currencies.description')} ${t('homepageCount', { n: homepageCount })}`}
        trail={[{ label: t('title'), path: '/currency-rates' }]}
        actions={
          <Button
            onClick={handleSave}
            disabled={dirtyRows.length === 0 || save.isPending}
          >
            {save.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <SaveIcon size={16} />
            )}
            {dirtyRows.length > 0
              ? t('currencies.saveCount', { n: dirtyRows.length })
              : t('currencies.save')}
          </Button>
        }
      />

      <SectionTabs tabs={CURRENCY_SECTION_TABS} />

      {query.isPending ? (
        <Skeleton className="h-80 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title={t('currencies.empty')} />
      ) : (
        <DataTable
          aria-label={t('currencies.title')}
          columns={columns}
          data={rows}
          rowKey={(row) => row.code}
          rowClassName={(row) => (isDirty(row) ? 'bg-warning/10' : '')}
          scroll={{ x: true }}
        />
      )}
    </>
  )
}
