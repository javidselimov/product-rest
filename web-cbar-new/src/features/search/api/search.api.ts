/**
 * Axtarış — contracts/public-api.md #30.
 *
 * **Qəsdən keşlənmir** (spec 003 FR-017). Digər hər feature `api/` qatı
 * `@/server/cached`-dən keçir, bu isə `getJson`-u birbaşa çağırır: sorğu sətri
 * istifadəçidən gəlir, yəni açar sahəsi praktiki olaraq sonsuzdur — keş yazıları
 * yığılar, amma demək olar heç vaxt təkrar oxunmazdı.
 */
import 'server-only'

import { getJson } from '@/server/api-client'
import type { Locale } from '@/shared/i18n'

import { searchResponseSchema, type SearchResponse } from '../model/schemas'

export function searchSite(locale: Locale, q: string): Promise<SearchResponse> {
  return getJson(`/api/v1/search?q=${encodeURIComponent(q)}&locale=${locale}`, searchResponseSchema)
}
