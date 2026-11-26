import { getT } from '@/shared/i18n/server'
import { ChartCard } from '@/widgets/chart-card/chart-card'
import { PageTitle } from '@/widgets/page-title/page-title'

import type { StatisticsViewData } from './loader'

export function StatisticsView({ data }: { data: StatisticsViewData }) {
  const { locale } = data
  const t = getT(locale, ['finance', 'home'])

  return (
    <section data-slot="statistics" className="mx-auto max-w-5xl">
      <PageTitle title={t('home:statistics')} />

      <div className="space-y-6">
        <ChartCard title={t('finance:azir')} data={data.azir.data} error={data.azir.error} emptyLabel={t('finance:noData')} height={320} />
        <ChartCard
          title={t('finance:inflation')}
          subtitle={t('finance:inflationYear', { year: data.year })}
          data={data.inflation.data}
          error={data.inflation.error}
          emptyLabel={t('finance:noData')}
          height={320}
        />
        <ChartCard
          title={t('finance:yieldCurve')}
          caption={data.yieldCurve.caption ?? undefined}
          data={data.yieldCurve.data}
          error={data.yieldCurve.error}
          emptyLabel={t('finance:noData')}
          height={320}
        />
      </div>
    </section>
  )
}
