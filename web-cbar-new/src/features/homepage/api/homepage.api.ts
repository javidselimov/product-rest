/**
 * Ana səhifə paketi — contracts/public-api.md #5. 10 s keşlənir (spec 003 FR-015).
 */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { homepageSchema, type Homepage } from '../model/schemas'

const fetchHomepage = cachedJson(homepageSchema, { keyPrefix: 'homepage', tag: 'homepage' })

export function getHomepage(locale: Locale): Promise<Homepage> {
  return fetchHomepage(`/api/v1/homepage?locale=${locale}`)
}
