/**
 * `/homepage-blocks` hub səhifəsi (spec US2, tasks T071): bölmə tabları və hər
 * blok üçün bir kart — kart bütövlükdə keçiddir. Blok siyahıları isə registry
 * route-larından gələn generic `CrudListPage`-dir.
 */

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import {
  BookOpenIcon,
  BullhornIcon,
  DocumentIcon,
  ImageIcon,
  PulseIcon,
  RowsIcon,
  ShareBoxIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { HOMEPAGE_SECTION_TABS } from '@/features/homepage/model/section'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionTabs } from '@/shared/ui/section-tabs'

const HUB_CARDS = [
  { key: 'banners', to: '/homepage-blocks/banners', icon: ImageIcon },
  { key: 'newsSlider', to: '/homepage-blocks/news-slider', icon: BullhornIcon },
  { key: 'runningLines', to: '/homepage-blocks/running-lines', icon: RowsIcon },
  { key: 'links', to: '/homepage-blocks/links', icon: ShareBoxIcon },
  {
    key: 'publications',
    to: '/homepage-blocks/publications',
    icon: BookOpenIcon,
  },
  {
    key: 'strategyDocs',
    to: '/homepage-blocks/strategy-docs',
    icon: DocumentIcon,
  },
  { key: 'infoLines', to: '/homepage-blocks/info-lines', icon: PulseIcon },
] as const

export function HomepageBlocksPage() {
  const { t } = useTranslation('homepage')
  const router = useRouter()

  return (
    <>
      <PageHeader title={t('hub.title')} description={t('hub.description')} />
      <SectionTabs tabs={HOMEPAGE_SECTION_TABS} />
      <section
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        aria-label={t('hub.title')}
      >
        {HUB_CARDS.map(({ key, to, icon: Icon }) => {
          const title = t(`hub.${key}.title`)
          return (
            <a
              key={key}
              href={to}
              aria-label={t('hub.open', { name: title })}
              onClick={(e) => {
                e.preventDefault()
                router.history.push(to)
              }}
              className="focus-visible:ring-ring block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Card className="hover:bg-accent hover:text-accent-foreground h-full transition-colors">
                <CardHeader>
                  <span className="bg-muted text-muted-foreground grid size-10 place-items-center rounded-lg">
                    <Icon size={20} />
                  </span>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>
                    {t(`hub.${key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </a>
          )
        })}
      </section>
    </>
  )
}
