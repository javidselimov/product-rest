/** International financial institutions: the real contract (spec 044, `contracts/api.md`). */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { ifiOrganizations } from '../fixtures/ifi-organizations'

export const ifiOrganizationsHandlers = [http.get(`${API}/api/v1/ifi-organizations`, () => HttpResponse.json({ items: ifiOrganizations }))]
