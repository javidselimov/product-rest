/** Events: the real contract (spec 034, contracts/public-api.md). */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { eventCategories, eventDetail, pastEvents, upcomingEventDetail, upcomingEvents } from '../fixtures/events'

type ListEvent = (typeof upcomingEvents)[number] | (typeof pastEvents)[number]

/** `sort=newest` (spec 059), as api-cbar orders it: newest day first, then the later time, no time last, then the title. */
function newestFirst(a: ListEvent, b: ListEvent): number {
  if (a.startsOn !== b.startsOn) return a.startsOn < b.startsOn ? 1 : -1
  if ((a.startTime === null) !== (b.startTime === null)) return a.startTime === null ? 1 : -1
  if (a.startTime !== b.startTime) return (a.startTime ?? '') < (b.startTime ?? '') ? 1 : -1
  return a.title.localeCompare(b.title)
}

export const eventsHandlers = [
  http.get(`${API}/api/v1/events`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const when = params.get('when')
    const all = when === 'past' ? pastEvents : when === 'upcoming' ? upcomingEvents : [...upcomingEvents, ...pastEvents]
    const q = params.get('q')?.toLocaleLowerCase()
    const type = params.get('type')
    const categoryId = params.get('categoryId')
    const items = all.filter(
      (event) =>
        (!q || event.title.toLocaleLowerCase().includes(q)) &&
        (!type || event.type === Number(type)) &&
        (!categoryId || event.category?.id === Number(categoryId)),
    )
    const sort = params.get('sort')
    if (sort && sort !== 'newest') return new HttpResponse(null, { status: 400 })
    if (sort) items.sort(newestFirst)
    const pageSize = Number(params.get('pageSize') ?? '10')
    return HttpResponse.json({ items: items.slice(0, pageSize), total: items.length, page: 1, pageSize })
  }),

  http.get(`${API}/api/v1/events/:slug`, ({ params }) => {
    if (params.slug === eventDetail.slug) return HttpResponse.json(eventDetail)
    if (params.slug === upcomingEventDetail.slug) return HttpResponse.json(upcomingEventDetail)
    if (params.slug === 'cop29') return HttpResponse.json({ ...pastEvents[1], content: null, gallery: null, pressRelease: null })
    return new HttpResponse(null, { status: 404 })
  }),

  http.get(`${API}/api/v1/event-categories`, () => HttpResponse.json({ items: eventCategories })),
]
