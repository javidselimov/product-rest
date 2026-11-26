/**
 * Media block: News, Announcements, Gallery (Figma `813:25084`, spec 022 FR-012).
 *
 * Server component: cards render on the server, the tab choice lives in `SectionTabs`
 * (kit `Tabs`). Each tab has 4 cards (image, date, title) and an "all" button on the right.
 * An empty tab is not shown. The `kind: 'video'` path is kept for the hidden video tab (`HOME_BLOCKS`).
 * Cards reveal on scroll, staggered (spec 049); the section around them is not wrapped, so reveals do not nest.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { PlayIcon } from '@cbar/lib-react-ui-kit/icons'

import { SmartLink } from '@/widgets/smart-link/smart-link'
import { Reveal } from '@/shared/ui/reveal'
import { SiteImage } from '@/shared/ui/site-image'

import { FEED_CARDS } from './constants'

import { SectionTabs } from './section-tabs'

export type FeedItem = {
  key: string
  title: string | null
  dateLabel: string | null
  href: string
  imageUrl: string | null
  description?: string | null
  kind: 'image' | 'video'
}

export type FeedTab = {
  key: string
  label: string
  items: FeedItem[]
  viewAllHref: string
  /** Text of the button on the right (for example "Bütün xəbərlər"). */
  viewAllLabel: string
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article className="flex flex-col gap-6">
      <SmartLink href={item.href} className="bg-border relative block aspect-[312/197] w-full overflow-hidden" aria-label={item.title ?? undefined}>
        {item.kind === 'video' ? (
          <span className="bg-primary text-primary-foreground flex size-full items-center justify-center">
            <PlayIcon className="size-12" aria-hidden="true" />
          </span>
        ) : item.imageUrl ? (
          <SiteImage
            src={item.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1360px) 312px, (min-width: 744px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : null}
      </SmartLink>
      <div className="flex flex-col gap-4">
        {item.dateLabel ? <p className="text-muted-foreground text-base/6 font-semibold">{item.dateLabel}</p> : null}
        <h3 className="text-foreground line-clamp-3 text-xl/7 font-semibold">
          <SmartLink href={item.href} className="hover:text-primary hover:underline">
            {item.title}
          </SmartLink>
        </h3>
      </div>
    </article>
  )
}

export function NewsTabs({ title, tabs }: { title: string; tabs: FeedTab[] }) {
  const available = tabs.filter((tab) => tab.items.length > 0)

  return (
    <SectionTabs
      title={title}
      slot="news-tabs"
      tabsAlign="end"
      tabs={available.map((tab) => ({
        key: tab.key,
        label: tab.label,
        content: (
          <div className="flex flex-col items-end gap-9">
            <ul className="grid w-full gap-6 tab:grid-cols-2 desk:grid-cols-4">
              {tab.items.slice(0, FEED_CARDS).map((item, index) => (
                <Reveal as="li" key={item.key} index={index}>
                  <FeedCard item={item} />
                </Reveal>
              ))}
            </ul>
            <Button
              asChild
              variant="outline"
              colorPalette="primary"
              size="xl"
              className="h-14 px-4 text-base font-medium"
            >
              <SmartLink href={tab.viewAllHref}>{tab.viewAllLabel}</SmartLink>
            </Button>
          </div>
        ),
      }))}
    />
  )
}
