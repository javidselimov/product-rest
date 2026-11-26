import { Button } from '@cbar/lib-react-ui-kit/button'
import { DownloadIcon } from '@cbar/lib-react-ui-kit/icons'

import { formatRate, type CurrencyRate } from '@/features/currencies/model/schemas'
import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { DataTable, type Column } from '@/widgets/data-table/data-table'
import { DateField } from '@/widgets/filter-form/date-field'
import { FilterForm } from '@/widgets/filter-form/filter-form'
import { PageTitle } from '@/widgets/page-title/page-title'

import type { CurrenciesViewData } from './loader'

export function CurrenciesView({ data }: { data: CurrenciesViewData }) {
  const { locale } = data
  const t = getT(locale, 'finance')

  const columns: Column<CurrencyRate>[] = [
    { key: 'code', header: t('code'), cell: (r) => <span className="font-medium">{r.code}</span> },
    { key: 'name', header: t('currency'), cell: (r) => r.name },
    { key: 'nominal', header: t('nominal'), align: 'right', cell: (r) => r.nominal },
    { key: 'rate', header: t('rate'), align: 'right', cell: (r) => <span className="font-medium">{formatRate(r.rate)}</span> },
  ]

  return (
    <section data-slot="currencies" className="mx-auto max-w-4xl">
      <PageTitle title={t('officialRates')} />

      <FilterForm action={`/${locale}/currencies`} submitLabel={t('show')} label={t('chooseDate')}>
        <DateField id="rates-date" name="date" label={t('sheetDate')} value={data.requestedDate ?? data.sheet?.date} />
      </FilterForm>

      {data.error ? (
        <ErrorState kind="server" className="mt-6" />
      ) : !data.sheet ? (
        <EmptyState title={t('noSheet')} className="mt-6" />
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-foreground text-lg font-semibold">
              <time dateTime={data.sheet.date}>{data.sheet.dateLabel}</time>
            </p>
            <Button asChild variant="outline" size="sm" colorPalette="primary" title={t('xmlHint')}>
              <a href={data.sheet.xmlUrl} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="size-4" aria-hidden="true" />
                {t('xmlFeed')}
              </a>
            </Button>
          </div>

          <DataTable className="mt-4" columns={columns} rows={data.sheet.rates} rowKey={(r) => r.code} caption={t('officialRates')} />

          <p className="text-muted-foreground mt-3 text-xs">{t('ratesNote')}</p>
        </div>
      )}
    </section>
  )
}
