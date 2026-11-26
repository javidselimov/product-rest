import { HttpResponse, http } from 'msw'

import { safeDecodeURIComponent } from '@/shared/lib/uri'

import { API } from '../api-base'
import {
  pageDetailFixture,
  pageTreeAz,
  pageTreeEn,
  parentPageFixture,
} from '../fixtures/pages'

export const pagesHandlers = [
  http.get(`${API}/api/v1/pages/tree`, ({ request }) => {
    const locale = new URL(request.url).searchParams.get('locale')
    return HttpResponse.json(locale === 'en' ? pageTreeEn : pageTreeAz)
  }),

  http.get(`${API}/api/v1/pages/:slug`, ({ params, request }) => {
    const slug = safeDecodeURIComponent(String(params.slug))
    const locale = new URL(request.url).searchParams.get('locale')
    if (slug === 'yoxdur') return new HttpResponse(null, { status: 404 })
    if (slug === 'haqqimizda') return HttpResponse.json(parentPageFixture)
    // Slug-lar dil üzrədir: `tarix` yalnız az-dadır (en-də `history`, id 11).
    if (slug === 'tarix') {
      if (locale === 'en') return new HttpResponse(null, { status: 404 })
      return HttpResponse.json({ ...pageDetailFixture, id: 11, title: 'Tarix', slug })
    }
    return HttpResponse.json({ ...pageDetailFixture, slug })
  }),
]
