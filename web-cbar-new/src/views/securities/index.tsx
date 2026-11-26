import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { DataTable, type Column } from '@/widgets/data-table/data-table'
import { FilterForm } from '@/widgets/filter-form/filter-form'
import { SelectField } from '@/widgets/filter-form/select-field'
import { ListPagination } from '@/widgets/list-pagination/list-pagination'
import { PageTitle } from '@/widgets/page-title/page-title'

import type { SecuritiesRow, SecuritiesViewData } from './loader'

export function SecuritiesView({ data }: { data: SecuritiesViewData }) {
  const { locale } = data
  const t = getT(locale, ['finance', 'content'])
  const basePath = `/${locale}/securities`

  const columns: Column<SecuritiesRow>[] = [
    { key: 'date', header: t('finance:regDate'), className: 'whitespace-nowrap', cell: (r) => r.dateLabel },
    { key: 'dqn', header: t('finance:dqn'), className: 'whitespace-nowrap', cell: (r) => r.dqn },
    { key: 'emitent', header: t('finance:emitent'), cell: (r) => r.emitentName },
    { key: 'type', header: t('finance:infoType'), cell: (r) => r.infoTypeName },
    {
      key: 'file',
      header: t('finance:file'),
      cell: (r) =>
        r.fileUrl ? (
          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
            {t('finance:download')}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <section data-slot="securities" className="mx-auto max-w-5xl">
      <PageTitle title={t('finance:securities')} description={t('finance:securitiesDescription')} />

      <FilterForm action={basePath} submitLabel={t('content:apply')} label={t('content:filter')}>
        <SelectField
          id="meas-emitent"
          name="emitentId"
          label={t('finance:emitent')}
          allLabel={t('content:all')}
          value={data.emitentId?.toString()}
          options={data.emitents.map((e) => ({ value: String(e.id), label: e.name ?? String(e.id) }))}
        />
        <SelectField
          id="meas-info-type"
          name="infoTypeId"
          label={t('finance:infoType')}
          allLabel={t('content:all')}
          value={data.infoTypeId?.toString()}
          options={data.infoTypes.map((e) => ({ value: String(e.id), label: e.name ?? String(e.id) }))}
        />
      </FilterForm>

      {data.error || data.rows === null ? (
        <ErrorState kind="server" className="mt-6" />
      ) : data.rows.length === 0 ? (
        <EmptyState title={t('content:noItems')} className="mt-6" />
      ) : (
        <DataTable className="mt-6" columns={columns} rows={data.rows} rowKey={(r) => r.id} caption={t('finance:securities')} />
      )}

      <ListPagination
        basePath={basePath}
        params={{ emitentId: data.emitentId, infoTypeId: data.infoTypeId }}
        page={data.page}
        total={data.total}
        pageSize={data.pageSize}
        className="mt-8"
      />
    </section>
  )
}
