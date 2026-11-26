import { getT } from '@/shared/i18n/server'
import { BackLink } from '@/widgets/back-link/back-link'
import { ContentList } from '@/widgets/content-list/content-list'
import { ListPagination } from '@/widgets/list-pagination/list-pagination'
import { PageTitle } from '@/widgets/page-title/page-title'

import type { MoneyMarkNewsViewData } from './loader'

export function MoneyMarkNewsView({ data }: { data: MoneyMarkNewsViewData }) {
  const { locale } = data
  const t = getT(locale, 'content')
  const basePath = `/${locale}/national-currency/news`

  return (
    <section data-slot="money-mark-news">
      <PageTitle title={t('moneyMarkNews')} />
      <ContentList items={data.items} error={data.error} emptyLabel={t('noItems')} errorLabel={t('loadError')} />
      <ListPagination basePath={basePath} params={{}} page={data.page} total={data.total} pageSize={data.pageSize} className="mt-8" />
      <div>
        <BackLink href={`/${locale}/national-currency`} label={t('back.nationalCurrency')} />
      </div>
    </section>
  )
}
