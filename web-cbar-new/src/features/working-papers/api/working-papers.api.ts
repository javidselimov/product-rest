/** Working papers (spec 054). Cached for 10 s like the other CMS content (spec 003 FR-015). */
import 'server-only'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import {
  workingPaperDetailSchema,
  workingPaperListSchema,
  type WorkingPaperDetailDto,
  type WorkingPaperListItemDto,
} from '../model/schemas'

const fetchList = cachedJson(workingPaperListSchema, { keyPrefix: 'working-papers', tag: 'working-papers' })
const fetchItem = cachedJsonOrNull(workingPaperDetailSchema, { keyPrefix: 'working-paper', tag: 'working-papers' })

/** Every paper visible in the locale, newest first. */
export async function getWorkingPapers(locale: Locale): Promise<WorkingPaperListItemDto[]> {
  return (await fetchList(`/api/v1/working-papers?locale=${locale}`)).items
}

/** One paper by its `NN-YYYY` key; `null` when it is not visible in the locale. */
export function getWorkingPaper(key: string, locale: Locale): Promise<WorkingPaperDetailDto | null> {
  return fetchItem(`/api/v1/working-papers/${encodeURIComponent(key)}?locale=${locale}`)
}
