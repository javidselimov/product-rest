/** FinCERT: the real contract (spec 053, `contracts/public-api.md`). A test of another state overrides it with `server.use`. */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { fincertAz, fincertEn } from '../fixtures/fincert'

export const fincertHandlers = [
  http.get(`${API}/api/v1/fincert`, ({ request }) =>
    HttpResponse.json(new URL(request.url).searchParams.get('locale') === 'en' ? fincertEn : fincertAz),
  ),
]
