import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'

import { getT } from '@/shared/i18n/server'
import { Attachments } from '@/widgets/attachments/attachments'
import { BackLink } from '@/widgets/back-link/back-link'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import type { LawViewData } from './loader'

export function LawView({ data }: { data: LawViewData }) {
  const { locale } = data
  const t = getT(locale, 'content')

  return (
    <div data-slot="law" className="mx-auto max-w-3xl">
      <Card>
        <CardContent className="p-8">
          <article>
            <h1 className="text-foreground text-2xl font-semibold">{data.title}</h1>
            <p className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {data.categoryName ? (
                <Badge variant="subtle" colorPalette="primary" size="sm">
                  {data.categoryName}
                </Badge>
              ) : null}
              <time>{data.dateLabel}</time>
            </p>
            <CmsContent html={data.html} className="mt-6" />
            <Attachments locale={locale} files={data.attachments} heading={t('attachments')} />
          </article>
        </CardContent>
      </Card>

      <BackLink href={`/${locale}/laws`} label={t('back.laws')} />
    </div>
  )
}
