import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { paginate } from '../factories'
import {
  galleryDetailFixture,
  galleryItems,
  imagePopups,
  videoItems,
  videoStreams,
} from '../fixtures/media'

/** Missing everywhere: an inactive record, or one without a translation in the locale (spec 035). */
export const MISSING_MEDIA_ID = '999'

function pageOf<T>(items: T[], request: Request) {
  const params = new URL(request.url).searchParams
  return paginate(
    items,
    Number(params.get('page') ?? '1'),
    Number(params.get('pageSize') ?? '10'),
  )
}

/**
 * `q`, `from`, `to` as `api-cbar` applies them (spec 035): case-insensitive title substring,
 * inclusive day range on the date field. A record without a date drops out once a bound is set.
 */
function filtered<T extends { title: string | null }>(items: T[], request: Request, dateOf: (item: T) => string | null): T[] {
  const params = new URL(request.url).searchParams
  const q = params.get('q')?.trim().toLocaleLowerCase('az')
  const from = params.get('from')
  const to = params.get('to')
  return items.filter((item) => {
    if (q && !item.title?.toLocaleLowerCase('az').includes(q)) return false
    const day = dateOf(item)?.slice(0, 10)
    if ((from || to) && !day) return false
    if (from && day! < from) return false
    if (to && day! > to) return false
    return true
  })
}

export const mediaHandlers = [
  http.get(`${API}/api/v1/galleries`, ({ request }) =>
    HttpResponse.json(pageOf(filtered(galleryItems, request, (g) => g.eventDate), request)),
  ),

  http.get(`${API}/api/v1/galleries/:id`, ({ params }) => {
    if (params.id === MISSING_MEDIA_ID) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...galleryDetailFixture, id: Number(params.id) })
  }),

  http.get(`${API}/api/v1/videos`, ({ request }) =>
    HttpResponse.json(pageOf(filtered(videoItems, request, (v) => v.publishedAt), request)),
  ),

  http.get(`${API}/api/v1/videos/:id`, ({ params }) => {
    const video = videoItems.find((v) => String(v.id) === params.id)
    return video ? HttpResponse.json(video) : new HttpResponse(null, { status: 404 })
  }),

  http.get(`${API}/api/v1/video-streams`, () =>
    HttpResponse.json(videoStreams),
  ),

  http.get(`${API}/api/v1/image-popups`, ({ request }) =>
    HttpResponse.json(
      new URL(request.url).searchParams.get('locale') === 'en' ? imagePopups.en : imagePopups.az,
    ),
  ),
]
