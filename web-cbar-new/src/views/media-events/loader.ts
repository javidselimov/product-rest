/**
 * Events list (spec 034 US2, US3, contracts/ui-contract.md §1, §3).
 *
 * URL: `when=past` (missing = upcoming), `q`, `from`, `to`, `type`, `category`, `limit`. Invalid
 * values are dropped, never sent to the API. "Show more" asks for one growing page, so it works
 * without JavaScript and a shared link shows the same list.
 */
import 'server-only'

import { findChainBy, isCurrentNode, type PageNode } from '@/entities/page-node'
import { getEventCategories, getEvents } from '@/features/events/api/events.api'
import { dateBox, dateLabel, groupByMonth, type MonthGroup } from '@/features/events/model/format'
import { eventHref, eventsListHref } from '@/features/events/model/routes'
import { EVENT_TYPES, type EventListItem } from '@/features/events/model/schemas'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { buildHref, dateParam, enumParam, optionalIdSchema, queryParam, type RawSearchParams } from '@/shared/lib/search-params'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

import { EVENTS_MAX_PAGE_SIZE, PAST_EVENTS_STEP } from './constants'

export const PAST = 'past'

export type EventsFilters = { q: string; from: string | undefined; to: string | undefined; type: string | undefined }

export type EventRowData = {
  key: string
  href: string
  title: string
  startsOn: string
  tags: string[]
  day: string
  dayIsRange: boolean
  month: string
  /** Upcoming rows lead with the time. */
  time: string | null
  detail: string
}

export type CategoryLink = { key: string; name: string; href: string; active: boolean }

export type EventTypeOption = { value: string; label: string }

export type MediaEventsData = {
  locale: Locale
  title: string
  past: boolean
  basePath: string
  upcomingHref: string
  pastHref: string
  clearHref: string
  filters: EventsFilters
  categoryId: number | undefined
  allCategories: CategoryLink
  categories: CategoryLink[]
  typeOptions: EventTypeOption[]
  groups: MonthGroup<EventRowData>[] | null
  moreHref: string | null
  error: boolean
  shell: SectionShellData
}

const whenParam = enumParam([PAST])
const typeParam = enumParam(EVENT_TYPES.map(String) as [string, ...string[]])

function menuTitle(tree: PageNode[], locale: Locale, href: string): string | null {
  return findChainBy(tree, (node) => isCurrentNode(node, locale, { href }))?.at(-1)?.title ?? null
}

/** A whole number of steps; a missing or wild value is one step. */
function parseLimit(raw: number | undefined): number {
  const steps = Math.ceil((raw ?? PAST_EVENTS_STEP) / PAST_EVENTS_STEP)
  return Math.min(steps * PAST_EVENTS_STEP, EVENTS_MAX_PAGE_SIZE)
}

function toRow(event: EventListItem, locale: Locale, past: boolean): EventRowData {
  const t = getT(locale, 'media')
  const box = dateBox(event)
  const tags = [event.category?.name, event.type === null ? undefined : t(`events.types.${event.type}`)]
  const label = dateLabel(event, locale)
  const leadsWithDate = past || (!event.startTime && !event.location)

  return {
    key: String(event.id),
    href: eventHref(event, locale),
    title: event.title,
    startsOn: event.startsOn,
    tags: tags.filter((tag) => tag !== undefined),
    day: box.day,
    dayIsRange: box.isRange,
    month: t(`events.monthShort.${box.month}`),
    time: leadsWithDate ? null : event.startTime,
    detail: [leadsWithDate ? label : null, event.location].filter(Boolean).join(' · '),
  }
}

export function eventsMetadata(locale: Locale) {
  return {
    title: getT(locale, 'media')('events.title'),
    alternates: { languages: { az: eventsListHref('az'), en: eventsListHref('en') } },
  }
}

export async function loadMediaEvents(locale: Locale, searchParams: RawSearchParams): Promise<MediaEventsData> {
  const t = getT(locale, 'media')
  const past = whenParam.parse(searchParams.when) === PAST
  const when = past ? PAST : undefined
  const filters: EventsFilters = {
    q: queryParam.parse(searchParams.q),
    from: dateParam.parse(searchParams.from),
    to: dateParam.parse(searchParams.to),
    type: typeParam.parse(searchParams.type),
  }
  const categoryId = optionalIdSchema.parse(searchParams.category)
  const limit = parseLimit(optionalIdSchema.parse(searchParams.limit))
  const pageSize = past ? limit : EVENTS_MAX_PAGE_SIZE
  const basePath = eventsListHref(locale)

  const [list, categories, tree] = await Promise.allSettled([
    getEvents(locale, {
      when: past ? 'past' : 'upcoming',
      pageSize,
      q: filters.q,
      from: filters.from,
      to: filters.to,
      type: filters.type ? Number(filters.type) : undefined,
      categoryId,
    }),
    getEventCategories(locale),
    getPagesTree(locale),
  ])
  const pageTree = tree.status === 'fulfilled' ? tree.value : []
  const title = menuTitle(pageTree, locale, basePath) ?? t('events.title')

  const query = { ...filters, category: categoryId, when, limit: undefined }
  const categoryLink = (key: string, name: string, id: number | undefined): CategoryLink => ({
    key,
    name,
    href: buildHref(basePath, query, { category: id }),
    active: categoryId === id,
  })
  const rows = list.status === 'fulfilled' ? list.value.items.map((event) => toRow(event, locale, past)) : null
  const total = list.status === 'fulfilled' ? list.value.total : 0

  return {
    locale,
    title,
    past,
    basePath,
    upcomingHref: buildHref(basePath, query, { when: undefined }),
    pastHref: buildHref(basePath, query, { when: PAST }),
    clearHref: buildHref(basePath, { when }),
    filters,
    categoryId,
    allCategories: categoryLink('all', t('events.all'), undefined),
    categories: (categories.status === 'fulfilled' ? categories.value : []).map((category) =>
      categoryLink(String(category.id), category.name, category.id),
    ),
    typeOptions: EVENT_TYPES.map((type) => ({ value: String(type), label: t(`events.types.${type}`) })),
    groups: rows ? groupByMonth(rows, (row) => row.startsOn, locale) : null,
    moreHref: past && total > limit ? buildHref(basePath, query, { limit: limit + PAST_EVENTS_STEP }) : null,
    error: list.status === 'rejected',
    shell: buildSectionShell({
      section: 'media',
      tree: pageTree,
      locale,
      current: { href: basePath },
      // Shared links keep the filters, so the recipient sees the same list.
      pageUrl: await absolutePageUrl(buildHref(basePath, query)),
      pageTitle: title,
    }),
  }
}
