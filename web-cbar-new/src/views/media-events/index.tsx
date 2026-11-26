/**
 * Events list in the Media section shell (spec 034, contracts/ui-contract.md §3, Figma
 * `2291:37473`, `2297:6340`). Server component: tabs, categories and "Show more" are links.
 */
import { ClockIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { ErrorState } from '@/shared/ui/error-state'
import { EventTags } from '@/widgets/event-tags'
import { SectionShell } from '@/widgets/section-shell'

import { CategoryTabs } from './category-tabs'
import { EventsFilter } from './events-filter'
import { PAST, type EventRowData, type MediaEventsData } from './loader'

const TAB = 'flex h-10 items-center text-lg leading-6 font-semibold whitespace-nowrap'

function EventRow({ event }: Readonly<{ event: EventRowData }>) {
  return (
    <li>
      <Link
        href={event.href}
        data-slot="event-row"
        className="border-site-divider hover:border-primary flex items-center gap-3.5 rounded-xs border bg-background p-4 transition-colors tab:gap-5 tab:p-5"
      >
        <span className="bg-site-surface flex h-18 w-15 shrink-0 flex-col items-center justify-center rounded-xs text-center tab:h-20 tab:w-18">
          <span className={cn('text-primary font-bold', event.dayIsRange ? 'text-[22px]' : 'text-[28px]')}>{event.day}</span>
          <span className="text-muted-foreground text-[13px] font-medium">{event.month}</span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <EventTags tags={event.tags} />
          <span className="text-foreground text-[17px] leading-6 font-semibold">{event.title}</span>
          {event.time || event.detail ? (
            <span className="text-muted-foreground flex items-center gap-1 text-[13px] leading-[18px]">
              {event.time ? (
                <>
                  <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{event.time}</span>
                  {event.detail ? <span aria-hidden="true">·</span> : null}
                </>
              ) : null}
              {event.detail ? <span>{event.detail}</span> : null}
            </span>
          ) : null}
        </span>

        <span aria-hidden="true" className="bg-site-surface text-primary flex size-10 shrink-0 items-center justify-center rounded-xs font-semibold max-tab:hidden">
          →
        </span>
      </Link>
    </li>
  )
}

export function MediaEventsView({ data }: Readonly<{ data: MediaEventsData }>) {
  const t = getT(data.locale, 'media')

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <section data-slot="media-events" aria-label={data.title} className="flex flex-col gap-8 tab:gap-12">
        <div className="border-site-divider flex gap-8 border-b pb-[15px]">
          <Link href={data.upcomingHref} aria-current={data.past ? undefined : 'true'} className={cn(TAB, data.past ? 'text-muted-foreground' : 'text-primary')}>
            {t('events.upcoming')}
          </Link>
          <Link href={data.pastHref} aria-current={data.past ? 'true' : undefined} className={cn(TAB, data.past ? 'text-primary' : 'text-muted-foreground')}>
            {t('events.past')}
          </Link>
        </div>

        <div className="flex flex-col gap-8">
          <EventsFilter
            action={data.basePath}
            when={data.past ? PAST : undefined}
            categoryId={data.categoryId}
            clearHref={data.clearHref}
            filters={data.filters}
            typeOptions={data.typeOptions}
            labels={{
              form: t('events.filter.form'),
              search: t('events.filter.search'),
              dateRange: t('events.filter.dateRange'),
              dateFrom: t('events.filter.dateFrom'),
              dateTo: t('events.filter.dateTo'),
              type: t('events.filter.type'),
              allTypes: t('events.all'),
              submit: t('events.filter.submit'),
              clear: t('events.filter.clear'),
            }}
          >
            <CategoryTabs
              all={data.allCategories}
              categories={data.categories}
              label={t('events.filter.categories')}
              otherLabel={t('events.filter.other')}
              pickerLabel={t('events.filter.category')}
              searchLabel={t('events.filter.categorySearch')}
            />
          </EventsFilter>

          {data.error || data.groups === null ? (
            <ErrorState kind="server" />
          ) : data.groups.length === 0 ? (
            <div data-slot="events-empty" className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-foreground text-base font-semibold">{t(data.past ? 'events.emptyPast' : 'events.emptyUpcoming')}</p>
              {data.past ? null : (
                <Link href={data.pastHref} className="text-primary text-sm underline">
                  {t('events.seePast')}
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {data.groups.map((group) => (
                <section key={group.key} aria-label={group.title} className="flex flex-col gap-3">
                  <h2 className="text-foreground text-xl leading-[26px] font-semibold">{group.title}</h2>
                  <ul className="flex flex-col gap-3">
                    {group.items.map((event) => (
                      <EventRow key={event.key} event={event} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {data.moreHref ? (
            <Link href={data.moreHref} scroll={false} className="text-primary self-center text-base leading-6 font-medium underline">
              {t('events.more')}
            </Link>
          ) : null}
        </div>
      </section>
    </SectionShell>
  )
}
