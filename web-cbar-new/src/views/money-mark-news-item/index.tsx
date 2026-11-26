import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'

import { getT } from '@/shared/i18n/server'
import { BackLink } from '@/widgets/back-link/back-link'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import type { MoneyMarkNewsItemViewData } from './loader'

export function MoneyMarkNewsItemView({ data }: { data: MoneyMarkNewsItemViewData }) {
  const { locale } = data
  const t = getT(locale, 'content')

  return (
    <div data-slot="money-mark-news-item" className="mx-auto max-w-3xl">
      <Card>
        <CardContent className="p-8">
          <article>
            <h1 className="text-foreground text-2xl font-semibold">{data.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              <time>{data.dateLabel}</time>
            </p>
            <CmsContent html={data.html} className="mt-6" />
          </article>
        </CardContent>
      </Card>

      <BackLink href={`/${locale}/national-currency/news`} label={t('back.news')} />
    </div>
  )
}
