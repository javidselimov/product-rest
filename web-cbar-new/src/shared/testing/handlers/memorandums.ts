/** Memoranda of Understanding: the real contract (spec 045, `contracts/api.md`). */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { memorandums } from '../fixtures/memorandums'

export const memorandumsHandlers = [http.get(`${API}/api/v1/memorandums`, () => HttpResponse.json({ items: memorandums }))]
