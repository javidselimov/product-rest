import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import {
  adviserMembers,
  boardMembers,
  divisions,
  managementMembers,
  offices,
} from '../fixtures/organization'

const allMembers = [...boardMembers, ...managementMembers, ...adviserMembers]

export const organizationHandlers = [
  http.get(`${API}/api/v1/organization/staff`, ({ request }) => {
    const type = new URL(request.url).searchParams.get('type')
    if (type === '3') return HttpResponse.json(adviserMembers)
    if (type === '2') return HttpResponse.json(managementMembers)
    if (type === '1') return HttpResponse.json(boardMembers)
    return HttpResponse.json(allMembers)
  }),

  http.get(`${API}/api/v1/organization/staff/:id`, ({ params }) => {
    const member = allMembers.find(
      (m) => m.id === Number(params.id),
    )
    return member
      ? HttpResponse.json(member)
      : new HttpResponse(null, { status: 404 })
  }),

  http.get(`${API}/api/v1/organization/divisions`, () =>
    HttpResponse.json(divisions),
  ),
  http.get(`${API}/api/v1/organization/offices`, () =>
    HttpResponse.json(offices),
  ),
  // Sxem qurulmayıb — struktur bölmələr CMS şəklini göstərir; sxem testi `orgChartNodes`-u verir.
  http.get(`${API}/api/v1/organization/chart`, () => HttpResponse.json([])),
]
