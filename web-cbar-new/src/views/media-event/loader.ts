/**
 * Event detail (spec 034 US4, contracts/ui-contract.md §4). Wrapped in `cache` so
 * `generateMetadata` and the page share one request. A legacy event has its content on a CMS
 * page, so its address sends the visitor there.
 */
import 'server-only'

import { cache } from 'react'

import { excerpt, stripHtml } from '@/entities/content'
import { getEvent } from '@/features/events/api/events.api'
import { dateLabel } from '@/features/events/model/format'
import { eventHref, eventsListHref } from '@/features/events/model/routes'
import { getPagesTree } from '@/features/pages/api/pages.api'
import { absolutePageUrl } from '@/server/page-url'
import { EXCERPT_LENGTH } from '@/shared/constants/text'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { safeDecodeURIComponent } from '@/shared/lib/uri'
import type { GalleryImage } from '@/widgets/photo-gallery'
import { buildSectionShell, type SectionShellData } from '@/widgets/section-shell'

export type MediaEventData = {
  locale: Locale
  /** H1 of the section, as on the list. */
  title: string
  eventTitle: string
  tags: string[]
  upcoming: boolean
  date: string
  time: string | null
  location: string | null
  html: string
  hasText: boolean
  description: string
  gallery: GalleryImage[]
  pressReleaseHref: string | null
  shell: SectionShellData
}

export type MediaEventResult = MediaEventData | { redirectTo: string } | null

export const loadMediaEvent = cache(async (locale: Locale, rawSlug: string): Promise<MediaEventResult> => {
  const slug = safeDecodeURIComponent(rawSlug)
  const [event, tree] = await Promise.all([getEvent(locale, slug), getPagesTree(locale).catch(() => [])])
  if (!event) return null
  if (event.pageSlug) return { redirectTo: eventHref(event, locale) }

  const t = getT(locale, 'media')
  const html = prepareCmsHtml(event.content)
  const title = t('events.title')
  const typeTag = event.type === null ? undefined : t(`events.types.${event.type}`)

  return {
    locale,
    title,
    eventTitle: event.title,
    tags: [event.category?.name, typeTag].filter((tag) => tag !== undefined),
    upcoming: event.upcoming,
    date: dateLabel(event, locale),
    time: event.startTime,
    location: event.location,
    html,
    hasText: stripHtml(html).trim() !== '',
    description: excerpt(stripHtml(html), EXCERPT_LENGTH),
    gallery: (event.gallery?.images ?? []).map((image, index) => ({
      id: image.mediaId,
      url: image.url,
      alt: t('events.imageAlt', { title: event.title, n: index + 1 }),
    })),
    pressReleaseHref: event.pressRelease ? `/${locale}/press-releases/${event.pressRelease.slug}` : null,
    shell: buildSectionShell({
      section: 'media',
      tree,
      locale,
      current: { href: eventsListHref(locale) },
      pageUrl: await absolutePageUrl(`${eventsListHref(locale)}/${encodeURIComponent(slug)}`),
      pageTitle: event.title,
      trail: event.title,
    }),
  }
})
