/** CSR projects (spec 038). Cached for 10 s (spec 003 FR-015). */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { csrProjectListSchema, type CsrProjectDto } from '../model/schemas'

const fetchList = cachedJson(csrProjectListSchema, { keyPrefix: 'csr-projects', tag: 'csr-projects' })

export async function getCsrProjects(locale: Locale): Promise<CsrProjectDto[]> {
  return (await fetchList(`/api/v1/csr-projects?locale=${locale}`)).items
}
