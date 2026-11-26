import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { homepageFixture } from '../fixtures/homepage'

export const homepageHandlers = [
  http.get(`${API}/api/v1/homepage`, () => HttpResponse.json(homepageFixture)),
]
