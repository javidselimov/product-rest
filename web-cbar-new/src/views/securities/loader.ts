/**
 * MEAS bazası (contracts/routes.md #6): `emitentId`, `infoTypeId`, `page`; üç sorğu birlikdə
 * (köhnə `Promise.all` — biri uğursuzsa səhifə xəta göstərir).
 */
import 'server-only'

import { formatLongDate, mediaUrl } from '@/entities/content'
import { getMeas, getMeasEmitents, getMeasInfoTypes } from '@/features/meas/api/meas.api'
import type { MeasRef } from '@/features/meas/model/schemas'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { optionalIdSchema, pageSchema, type RawSearchParams } from '@/shared/lib/search-params'
import type { Locale } from '@/shared/i18n'

export type SecuritiesRow = {
  id: number
  dateLabel: string
  dqn: string
  emitentName: string | null
  infoTypeName: string | null
  fileUrl: string | null
}

export type SecuritiesViewData = {
  locale: Locale
  emitentId: number | undefined
  infoTypeId: number | undefined
  page: number
  emitents: MeasRef[]
  infoTypes: MeasRef[]
  rows: SecuritiesRow[] | null
  total: number
  pageSize: number
  error: boolean
}

export async function loadSecurities(locale: Locale, searchParams: RawSearchParams): Promise<SecuritiesViewData> {
  const emitentId = optionalIdSchema.parse(searchParams.emitentId)
  const infoTypeId = optionalIdSchema.parse(searchParams.infoTypeId)
  const page = pageSchema.parse(searchParams.page)

  try {
    const [list, emitents, infoTypes] = await Promise.all([
      getMeas(locale, page, emitentId, infoTypeId),
      getMeasEmitents(locale),
      getMeasInfoTypes(locale),
    ])
    return {
      locale,
      emitentId,
      infoTypeId,
      page,
      emitents,
      infoTypes,
      total: list.total,
      pageSize: list.pageSize,
      error: false,
      rows: list.items.map((item) => ({
        id: item.id,
        dateLabel: formatLongDate(item.regDate, locale),
        dqn: item.dqn,
        emitentName: item.emitentName,
        infoTypeName: item.infoTypeName,
        fileUrl: mediaUrl(item.fileUrl),
      })),
    }
  } catch {
    return { locale, emitentId, infoTypeId, page, emitents: [], infoTypes: [], rows: null, total: 0, pageSize: DEFAULT_PAGE_SIZE, error: true }
  }
}
