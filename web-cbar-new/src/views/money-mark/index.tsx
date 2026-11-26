
import { IMAGE_SIZES } from '@/shared/constants/layout'
import { getT } from '@/shared/i18n/server'
import { BackLink } from '@/widgets/back-link/back-link'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { PageTitle } from '@/widgets/page-title/page-title'
import { SiteImage } from '@/shared/ui/site-image'

import type { MoneyMarkViewData } from './loader'
import { MoneyMarkTabs } from './money-mark-tabs'

export function MoneyMarkView({ data }: { data: MoneyMarkViewData }) {
  const { locale } = data
  const t = getT(locale, 'content')
  const hasSides = data.frontImageUrl || data.rearImageUrl

  return (
    <section data-slot="money-mark">
      <PageTitle title={data.title} />

      {hasSides ? (
        <div className={`bg-muted grid gap-6 rounded-md p-6 ${data.isCoin ? 'sm:grid-cols-2' : ''}`}>
          <figure className="text-center">
            {data.frontImageUrl ? (
              // Fixed-height box: `object-contain` keeps the ratio and the space is held until the
              // image loads (the earlier `max-h-80` jumped).
              <div className="relative mx-auto h-80 w-full">
                <SiteImage
                  src={data.frontImageUrl}
                  alt={`${data.title} — ${t('frontSide')}`}
                  fill
                  sizes={IMAGE_SIZES.HALF}
                  className="object-contain"
                />
              </div>
            ) : null}
            <figcaption className="text-muted-foreground mt-2 text-sm">{t('frontSide')}</figcaption>
          </figure>
          <figure className="text-center">
            {data.rearImageUrl ? (
              <div className="relative mx-auto h-80 w-full">
                <SiteImage
                  src={data.rearImageUrl}
                  alt={`${data.title} — ${t('rearSide')}`}
                  fill
                  sizes={IMAGE_SIZES.HALF}
                  className="object-contain"
                />
              </div>
            ) : null}
            <figcaption className="text-muted-foreground mt-2 text-sm">{t('rearSide')}</figcaption>
          </figure>
        </div>
      ) : null}

      {data.descriptionHtml || data.securityHtml ? (
        <div className="mt-8">
          {data.securityHtml ? (
            <MoneyMarkTabs
              descriptionLabel={t('description')}
              securityLabel={t('securityFeatures')}
              description={<CmsContent html={data.descriptionHtml} />}
              security={<CmsContent html={data.securityHtml} />}
            />
          ) : (
            <CmsContent html={data.descriptionHtml} />
          )}
        </div>
      ) : null}

      <div>
        <BackLink href={`/${locale}/national-currency?type=${data.type}`} label={t('allMoneyMarks')} />
      </div>
    </section>
  )
}
