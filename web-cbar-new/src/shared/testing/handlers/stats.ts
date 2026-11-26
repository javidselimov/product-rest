import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import {
  azirDataset,
  azirSummaryFixture,
  inflationFixture,
  inflationSettingsFixture,
  yieldCurveFixture,
} from '../fixtures/stats'

export const statsHandlers = [
  // `from`/`to` daxil olmaqla, `term` dəqiq uyğunluq (contracts/public-api.md §1).
  http.get(`${API}/api/v1/azir`, ({ request }) => {
    const params = new URL(request.url).searchParams
    const term = params.get('term')
    const from = params.get('from')
    const to = params.get('to')
    return HttpResponse.json(
      azirDataset.filter(
        (v) =>
          (!term || v.term === term) &&
          (!from || v.valueDate >= from) &&
          (!to || v.valueDate <= to),
      ),
    )
  }),

  http.get(`${API}/api/v1/azir/summary`, () =>
    HttpResponse.json(azirSummaryFixture),
  ),

  http.get(`${API}/api/v1/inflation`, ({ request }) => {
    const year = new URL(request.url).searchParams.get('year')
    return HttpResponse.json(
      year
        ? inflationFixture.filter((v) => v.year === Number(year))
        : inflationFixture,
    )
  }),

  http.get(`${API}/api/v1/inflation/settings`, () =>
    HttpResponse.json(inflationSettingsFixture),
  ),

  http.get(`${API}/api/v1/yield-curves/latest`, () =>
    HttpResponse.json(yieldCurveFixture),
  ),

  http.get(`${API}/api/v1/yield-curves/:date`, ({ params }) => {
    if (params.date === '1999-01-01')
      return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...yieldCurveFixture,
      curveDate: String(params.date),
    })
  }),
]
