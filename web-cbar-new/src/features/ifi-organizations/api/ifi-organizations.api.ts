/** International financial institutions (spec 044). Cached for 10 s (spec 003 FR-015). */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { ifiOrganizationListSchema, type IfiOrganizationDto } from '../model/schemas'

const fetchList = cachedJson(ifiOrganizationListSchema, { keyPrefix: 'ifi-organizations', tag: 'ifi-organizations' })

export async function getIfiOrganizations(locale: Locale): Promise<IfiOrganizationDto[]> {
  return (await fetchList(`/api/v1/ifi-organizations?locale=${locale}`)).items
}
