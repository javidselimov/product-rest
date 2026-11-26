/** Event addresses (spec 034). A legacy event opens its CMS page, which keeps its old address. */
import { EVENTS_PATH } from '@/entities/page-node'
import type { Locale } from '@/shared/i18n'

import type { EventListItem } from './schemas'

export const eventsListHref = (locale: Locale) => `/${locale}${EVENTS_PATH}`

export const eventHref = (event: Pick<EventListItem, 'slug' | 'pageSlug'>, locale: Locale) =>
  event.pageSlug ? `/${locale}/${event.pageSlug}` : `${eventsListHref(locale)}/${event.slug}`
