/**
 * FAQ: the real contract (spec 051, `contracts/public-api.md`). Every CMS page asks for its linked topics, so the
 * default answer is none; a test that needs link cards overrides `/api/v1/faq/topics` with `server.use`.
 */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { faqAz, faqEn } from '../fixtures/faq'

export const faqHandlers = [
  http.get(`${API}/api/v1/faq`, ({ request }) =>
    HttpResponse.json(new URL(request.url).searchParams.get('locale') === 'en' ? faqEn : faqAz),
  ),
  http.get(`${API}/api/v1/faq/topics`, () => HttpResponse.json([])),
]
