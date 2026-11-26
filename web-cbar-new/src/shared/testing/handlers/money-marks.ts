import { HttpResponse, http } from 'msw'

import { safeDecodeURIComponent } from '@/shared/lib/uri'

import { API } from '../api-base'
import { paginate } from '../factories'
import {
  moneyMarkCategories,
  moneyMarkDetailFixture,
  moneyMarkItems,
  moneyMarkNewsDetailFixture,
  moneyMarkNewsItems,
} from '../fixtures/money-marks'

export const moneyMarksHandlers = [
  http.get(`${API}/api/v1/money-mark-news`, ({ request }) => {
    const params = new URL(request.url).searchParams
    return HttpResponse.json(
      paginate(
        moneyMarkNewsItems,
        Number(params.get('page') ?? '1'),
        Number(params.get('pageSize') ?? '10'),
      ),
    )
  }),

  http.get(`${API}/api/v1/money-mark-news/:slug`, ({ params }) => {
    const slug = safeDecodeURIComponent(String(params.slug))
    if (slug === 'yoxdur') return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...moneyMarkNewsDetailFixture, slug })
  }),

  http.get(`${API}/api/v1/money-marks`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const type = params.get('type')
    const categoryId = params.get('categoryId')
    let items = moneyMarkItems
    if (type === '2')
      items = items.filter(
        (m) => m.slug.includes('qepik') || m.slug.includes('sikke'),
      )
    if (type === '1') items = items.filter((m) => m.slug.includes('manat'))
    if (categoryId === '2')
      items = items.filter((m) => m.categoryName === 'Yubiley')
    return HttpResponse.json(items)
  }),

  http.get(`${API}/api/v1/money-marks/:slug`, ({ params }) => {
    const slug = safeDecodeURIComponent(String(params.slug))
    if (slug === 'yoxdur') return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...moneyMarkDetailFixture,
      slug,
      type: slug.includes('qepik') ? 2 : 1,
    })
  }),

  http.get(`${API}/api/v1/money-mark-categories`, () =>
    HttpResponse.json(moneyMarkCategories),
  ),
]
