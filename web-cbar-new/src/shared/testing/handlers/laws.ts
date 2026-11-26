import { HttpResponse, http } from 'msw'

import { safeDecodeURIComponent } from '@/shared/lib/uri'

import { API } from '../api-base'
import { paginate } from '../factories'
import { lawCategories, lawDetailFixture, lawItems } from '../fixtures/laws'

export const lawsHandlers = [
  http.get(`${API}/api/v1/laws`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const categoryId = params.get('categoryId')
    const type = params.get('type')
    let items = lawItems
    if (categoryId)
      items = items.filter((l) =>
        categoryId === '1'
          ? l.categoryName === 'Bank qanunvericiliyi'
          : l.categoryName === 'Valyuta tənzimi',
      )
    if (type === '2') items = items.slice(0, 3)
    return HttpResponse.json(
      paginate(
        items,
        Number(params.get('page') ?? '1'),
        Number(params.get('pageSize') ?? '10'),
      ),
    )
  }),

  http.get(`${API}/api/v1/laws/:slug`, ({ params }) => {
    const slug = safeDecodeURIComponent(String(params.slug))
    if (slug === 'yoxdur') return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ ...lawDetailFixture, slug })
  }),

  http.get(`${API}/api/v1/law-categories`, () =>
    HttpResponse.json(lawCategories),
  ),
]
