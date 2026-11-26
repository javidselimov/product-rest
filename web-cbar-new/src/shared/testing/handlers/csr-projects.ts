/** CSR projects: the real contract (spec 038, `contracts/api.md`). */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { csrProjects } from '../fixtures/csr-projects'

export const csrProjectsHandlers = [http.get(`${API}/api/v1/csr-projects`, () => HttpResponse.json({ items: csrProjects }))]
