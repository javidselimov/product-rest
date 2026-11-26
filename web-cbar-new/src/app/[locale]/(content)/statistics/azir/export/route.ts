/**
 * `GET /{locale}/statistics/azir/export` — cari aralığın `.xlsx` faylı (spec 021
 * contracts/web-routes.md §2, contracts/xlsx.md).
 *
 * Səhifə ilə eyni parser və eyni sətir funksiyası işlədilir, fayl ekranla eynidir
 * (SC-003). Sətirlər səhifənin `cachedJson` keşindən gəlir.
 */
import { type NextRequest } from 'next/server'

import { toIsoDate } from '@/entities/content'
import { getAzir } from '@/features/stats/api/stats.api'
import { toAzirWorkbook } from '@/features/stats/model/azir-export'
import { parseAzirRange } from '@/features/stats/model/azir-range'
import { AZIR_TABLE_TERM, toAzirTableRows } from '@/features/stats/model/azir-rows'
import { EXPORT_CACHE_CONTROL } from '@/shared/constants/cache'
import { HTTP_STATUS } from '@/shared/constants/http'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import { getT } from '@/shared/i18n/server'
import { isSupportedLocale } from '@/shared/i18n'
import { logger } from '@/shared/lib/logger'
import { buildXlsx } from '@/shared/lib/xlsx'

export const dynamic = 'force-dynamic'

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function text(body: string, status: number): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

export async function GET(request: NextRequest, context: { params: Promise<{ locale: string }> }) {
  const { locale } = await context.params
  if (!isSupportedLocale(locale)) return new Response(null, { status: HTTP_STATUS.NOT_FOUND })

  const t = getT(locale, ['finance', 'errors'])
  const { searchParams } = request.nextUrl
  const range = parseAzirRange(
    { dateFrom: searchParams.getAll(QUERY_PARAM.DATE_FROM), dateTo: searchParams.getAll(QUERY_PARAM.DATE_TO) },
    toIsoDate(new Date()),
  )
  if (range.error) return text(t(`finance:azirPage.filter.error.${range.error}`), HTTP_STATUS.BAD_REQUEST)

  let rows
  try {
    rows = toAzirTableRows(await getAzir({ from: range.from, to: range.to, term: AZIR_TABLE_TERM }))
  } catch (error) {
    logger.error('azir export: api-cbar-a çatmaq olmadı', { from: range.from, to: range.to, error })
    return text(t('errors:server'), HTTP_STATUS.BAD_GATEWAY)
  }

  const workbook = toAzirWorkbook(rows, {
    sheetName: '1D AZIR',
    headers: [
      t('finance:azirPage.columns.date'),
      t('finance:azirPage.columns.rate'),
      t('finance:azirPage.columns.volume'),
      t('finance:azirPage.columns.count'),
    ],
    notesSheetName: t('finance:azirPage.export.sheetNotes'),
    notesHeader: t('finance:azirPage.export.reserveDates'),
    footnote: t('finance:azirPage.reserveFootnote'),
  })
  const bytes = buildXlsx(workbook)
  const filename = `AZIR-1D_${range.from}_${range.to}.xlsx`

  // `buildXlsx` `Uint8Array<ArrayBufferLike>` qaytarır; `BodyInit` `ArrayBuffer` əsaslısını tələb edir.
  return new Response(bytes as Uint8Array<ArrayBuffer>, {
    status: HTTP_STATUS.OK,
    headers: {
      'Content-Type': XLSX_TYPE,
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': EXPORT_CACHE_CONTROL,
    },
  })
}
