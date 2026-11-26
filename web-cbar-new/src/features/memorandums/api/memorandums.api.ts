/** Memoranda of Understanding (spec 045). Cached for 10 s (spec 003 FR-015). */
import 'server-only'

import { cachedJson } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import { memorandumListSchema, type MemorandumDto } from '../model/schemas'

const fetchList = cachedJson(memorandumListSchema, { keyPrefix: 'memorandums', tag: 'memorandums' })

/** Newest year first, then the editor's order within a year. */
export async function getMemorandums(locale: Locale): Promise<MemorandumDto[]> {
  return (await fetchList(`/api/v1/memorandums?locale=${locale}`)).items
}
