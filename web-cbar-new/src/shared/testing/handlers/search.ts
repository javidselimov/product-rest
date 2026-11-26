import { HttpResponse, http } from 'msw'

import { API } from '../api-base'

export const searchHandlers = [
  http.get(`${API}/api/v1/search`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const q = params.get('q') ?? ''
    const locale = params.get('locale') ?? 'az'
    if (q === 'yoxdur') return HttpResponse.json({ results: [] })
    return HttpResponse.json({
      results: [
        {
          title: 'Manat haqqında',
          url: `/${locale}/haqqimizda/manat`,
          type: 'page',
          snippet: 'Milli valyuta manat…',
        },
        {
          title: 'Manatın məzənnəsi',
          url: `/${locale}/press-releases/manat`,
          type: 'press-release',
          snippet: 'Manatın məzənnəsi',
        },
        {
          title: 'Naməlum',
          url: 'https://example.az/x',
          type: 'video',
          snippet: '',
        },
      ],
    })
  }),
]
