import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { paginate } from '../factories'
import { measEmitents, measInfoTypes, measItems } from '../fixtures/meas'

export const measHandlers = [
  http.get(`${API}/api/v1/meas`, ({ request }) => {
    const params = new URL(request.url).searchParams
    let items = measItems
    const emitentId = params.get('emitentId')
    const infoTypeId = params.get('infoTypeId')
    if (emitentId)
      items = items.filter((m) =>
        emitentId === '1'
          ? m.emitentName === 'Kapital Bank'
          : m.emitentName !== 'Kapital Bank',
      )
    if (infoTypeId)
      items = items.filter((m) =>
        infoTypeId === '10'
          ? m.infoTypeName === 'İllik hesabat'
          : m.infoTypeName !== 'İllik hesabat',
      )
    return HttpResponse.json(
      paginate(
        items,
        Number(params.get('page') ?? '1'),
        Number(params.get('pageSize') ?? '10'),
      ),
    )
  }),

  http.get(`${API}/api/v1/meas-emitents`, () =>
    HttpResponse.json(measEmitents),
  ),
  http.get(`${API}/api/v1/meas-info-types`, () =>
    HttpResponse.json(measInfoTypes),
  ),
]
