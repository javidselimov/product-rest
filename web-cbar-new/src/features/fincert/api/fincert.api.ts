/** FinCERT (spec 053). Cached for 10 s like the other CMS content (spec 003 FR-015), as the FAQ is. */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { fincertSchema, type FincertDto } from '../model/schemas'

const fetchFincert = cachedJson(fincertSchema, { keyPrefix: 'fincert', tag: 'fincert' })

export function getFincert(locale: Locale): Promise<FincertDto> {
  return fetchFincert(`/api/v1/fincert?locale=${locale}`)
}
