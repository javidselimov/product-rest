import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { DownloadIcon } from '@cbar/lib-react-ui-kit/icons'

import { formatDate, formatNumber } from '@/entities/content'
import type { AzirTableRow } from '@/features/stats/model/azir-rows'
import { AZIR_RATE_FRACTION } from '@/features/stats/model/constants'
import { getT } from '@/shared/i18n/server'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { AzirSummary } from '@/widgets/azir-summary/azir-summary'
import { ChartCard } from '@/widgets/chart-card/chart-card'
import { DataTable, type Column } from '@/widgets/data-table/data-table'
import { DateField } from '@/widgets/filter-form/date-field'
import { FilterForm } from '@/widgets/filter-form/filter-form'
import { PageTitle } from '@/widgets/page-title/page-title'

import type { AzirPageData } from './loader'

export function AzirView({ data }: { data: AzirPageData }) {
  const { locale, range } = data
  const t = getT(locale, 'finance')

  const columns: Column<AzirTableRow>[] = [
    { key: 'date', header: t('azirPage.columns.date'), cell: (r) => <time dateTime={r.date}>{formatDate(r.date, locale)}</time> },
    {
      key: 'rate',
      header: t('azirPage.columns.rate'),
      align: 'right',
      cell: (r) => (
        <span className="font-medium">
          {`${formatNumber(r.rate, locale, AZIR_RATE_FRACTION)}%${r.isReservePlan ? ' *' : ''}`}
        </span>
      ),
    },
    {
      key: 'volume',
      header: t('azirPage.columns.volume'),
      align: 'right',
      cell: (r) => formatNumber(r.dealVolume, locale, { minFraction: 2, maxFraction: 2 }),
    },
    { key: 'count', header: t('azirPage.columns.count'), align: 'right', cell: (r) => formatNumber(r.dealCount, locale, { maxFraction: 0 }) },
  ]

  return (
    <section data-slot="azir" className="mx-auto max-w-5xl">
      <PageTitle title={t('azirPage.title')} />

      <ChartCard title={t('azir')} data={data.chart.data} error={data.chart.error} emptyLabel={t('azirPage.empty')} height={320}>
        <Alert role="note" variant="subtle" colorPalette="secondary" className="mt-4">
          <AlertDescription>{t('azirPage.methodologyAlert')}</AlertDescription>
        </Alert>
      </ChartCard>

      <div className="mt-6">
        <FilterForm action={`/${locale}/statistics/azir`} submitLabel={t('azirPage.filter.submit')} label={t('chooseDate')}>
          <DateField id="azir-date-from" name="dateFrom" label={t('azirPage.filter.from')} value={range.from} />
          <DateField id="azir-date-to" name="dateTo" label={t('azirPage.filter.to')} value={range.to} />
        </FilterForm>

        {range.error ? (
          <Alert variant="subtle" colorPalette="red" className="mt-4">
            <AlertDescription>{t(`azirPage.filter.error.${range.error}`)}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button asChild variant="outline" size="sm" colorPalette="primary">
            <a href={data.exportHref} download>
              <DownloadIcon className="size-4" aria-hidden="true" />
              {t('azirPage.download')}
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {data.rows.error ? (
          <ErrorState kind="server" />
        ) : !data.rows.data || data.rows.data.length === 0 ? (
          <EmptyState title={t('azirPage.empty')} />
        ) : (
          <>
            <DataTable columns={columns} rows={data.rows.data} rowKey={(r) => r.date} caption={t('azirPage.title')} />

            {data.hasReservePlan ? <p className="text-muted-foreground mt-3 text-xs">{t('azirPage.reserveFootnote')}</p> : null}
          </>
        )}
      </div>

      <AzirSummary className="mt-8" locale={locale} data={data.summary.data} error={data.summary.error} />
    </section>
  )
}
