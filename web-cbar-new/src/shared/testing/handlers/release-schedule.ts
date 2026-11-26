/** Information disclosure schedule: the real contract (spec 039, `contracts/public-api.md`). */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { releaseScheduleAz, releaseScheduleEn } from '../fixtures/release-schedule'

export const releaseScheduleHandlers = [
  http.get(`${API}/api/v1/release-schedule`, ({ request }) =>
    HttpResponse.json(new URL(request.url).searchParams.get('locale') === 'en' ? releaseScheduleEn : releaseScheduleAz),
  ),
]
