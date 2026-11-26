/**
 * MEAS — contracts/public-api.md #10–#12. 10 s keşlənir (spec 003 FR-015).
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson } from '@/server/cached'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import type { Locale } from '@/shared/i18n'

import { measListSchema, measRefSchema, type MeasList, type MeasRef } from '../model/schemas'

const measRefListSchema = z.array(measRefSchema)

const fetchList = cachedJson(measListSchema, { keyPrefix: 'meas-list', tag: 'meas' })
const fetchEmitents = cachedJson(measRefListSchema, { keyPrefix: 'meas-emitents', tag: 'meas' })
const fetchInfoTypes = cachedJson(measRefListSchema, { keyPrefix: 'meas-info-types', tag: 'meas' })

export function getMeas(
  locale: Locale,
  page = 1,
  emitentId?: number,
  infoTypeId?: number,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<MeasList> {
  const params = new URLSearchParams({ locale, page: String(page), pageSize: String(pageSize) })
  if (emitentId != null) params.set('emitentId', String(emitentId))
  if (infoTypeId != null) params.set('infoTypeId', String(infoTypeId))
  return fetchList(`/api/v1/meas?${params}`)
}

export function getMeasEmitents(locale: Locale): Promise<MeasRef[]> {
  return fetchEmitents(`/api/v1/meas-emitents?locale=${locale}`)
}

export function getMeasInfoTypes(locale: Locale): Promise<MeasRef[]> {
  return fetchInfoTypes(`/api/v1/meas-info-types?locale=${locale}`)
}
