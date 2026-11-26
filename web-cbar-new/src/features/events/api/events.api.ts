/**
 * Events, contracts/public-api.md (spec 034). Cached for 10 s (spec 003 FR-015); each filter
 * combination is its own cache key.
 */
import 'server-only'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import {
  eventCategoryListSchema,
  eventDetailSchema,
  eventListSchema,
  type EventCategory,
  type EventDetail,
  type EventList,
} from '../model/schemas'

const fetchList = cachedJson(eventListSchema, { keyPrefix: 'event-list', tag: 'events' })
const fetchDetail = cachedJsonOrNull(eventDetailSchema, { keyPrefix: 'event-detail', tag: 'events' })
const fetchCategories = cachedJson(eventCategoryListSchema, { keyPrefix: 'event-categories', tag: 'events' })

export type EventsQuery = {
  when?: 'upcoming' | 'past'
  pageSize?: number
  /** Title search; blank is not sent. */
  q?: string
  /** `YYYY-MM-DD`: keeps events ending on or after this day. */
  from?: string
  /** `YYYY-MM-DD`: keeps events starting on or before this day. */
  to?: string
  type?: number
  categoryId?: number
  /** `newest`: start date descending across past and upcoming, later time first (spec 059). Omitted = the API default order. */
  sort?: 'newest'
}

export function getEvents(locale: Locale, query: EventsQuery = {}): Promise<EventList> {
  const params = new URLSearchParams({ locale })
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, String(value))
  }
  return fetchList(`/api/v1/events?${params}`)
}

export function getEvent(locale: Locale, slug: string): Promise<EventDetail | null> {
  return fetchDetail(`/api/v1/events/${encodeURIComponent(slug)}?locale=${locale}`)
}

export async function getEventCategories(locale: Locale): Promise<EventCategory[]> {
  return (await fetchCategories(`/api/v1/event-categories?locale=${locale}`)).items
}
