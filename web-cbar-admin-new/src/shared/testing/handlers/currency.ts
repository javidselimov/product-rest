/**
 * Məzənnə mock-ları — real kontrakt (contracts/admin-api.md §8): vərəqlər
 * tarixə görə yaddaşda; `?date` verilməyəndə son vərəq; PUT (tarix, kod) üzrə
 * upsert — göndərilməyən kodlara toxunulmur; DELETE 204 / bare 404; tarixlər
 * yeni → köhnə səhifələnir; valyuta master-i `{items}`; PUT master 204 / 404.
 * POST import (spec 025): multipart, `BULLETIN_RATES`-i PUT kimi birləşdirir,
 * mövcud tarix `overwrite=true` olmadan 409 `sheet_exists`.
 */

import { HttpResponse, http } from 'msw'

import {
  currencyMasterFixtures,
  rateSheetFixtures,
  type CurrencyMasterMock,
  type RateSheetMock,
} from '../fixtures/currency'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { message, noContent, problem404 } from './lib/errors'

let master: CurrencyMasterMock[] = structuredClone(currencyMasterFixtures)
let sheets: RateSheetMock[] = structuredClone(rateSheetFixtures)

const byDateDesc = (a: RateSheetMock, b: RateSheetMock) =>
  b.date.localeCompare(a.date)
const masterOf = (code: string) => master.find((c) => c.code === code) ?? null

export const currencyStore = {
  reset: () => {
    master = structuredClone(currencyMasterFixtures)
    sheets = structuredClone(rateSheetFixtures)
  },
  master: () => master,
  currency: (code: string) => masterOf(code),
  /** Tarixə görə vərəq (kod → məzənnə) və ya null. */
  sheet: (date: string) => sheets.find((s) => s.date === date)?.rates ?? null,
  dates: () => [...sheets].sort(byDateDesc).map((s) => s.date),
}

const sheetResponse = (sheet: RateSheetMock | null) => {
  if (!sheet) return { date: null, rates: [] }
  const sortOrderOf = (code: string) =>
    masterOf(code)?.sortOrder ?? Number.MAX_SAFE_INTEGER
  const rates = Object.entries(sheet.rates)
    .sort(([a], [b]) => sortOrderOf(a) - sortOrderOf(b))
    .map(([currencyCode, rate]) => {
      const info = masterOf(currencyCode)
      return {
        currencyCode,
        nominal: info?.nominal ?? null,
        nameAz: info?.nameAz ?? null,
        rate,
      }
    })
  return { date: sheet.date, rates }
}

/**
 * İmport mock-unun "oxuduğu" bülleten (spec 025, nümunə fayldan bir hissə,
 * `XDR` artıq `SDR`): master-də olmayan kodlar `skipped`-ə düşür.
 */
export const BULLETIN_RATES: Record<string, number> = {
  USD: 1.7,
  EUR: 1.8992,
  GBP: 2.2468,
  RUB: 2.0276,
  TRY: 0.0344,
  SDR: 2.3005,
  XAU: 7133.251,
}

/** `ErrorProblem(status, message, code, extensions)` gövdəsi. */
export const importProblem = (
  status: number,
  code: string,
  text: string,
  extensions: Record<string, unknown> = {},
) =>
  HttpResponse.json(
    {
      title: 'Error',
      status,
      detail: text,
      message: text,
      code,
      ...extensions,
    },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )

export const currencyHandlers = [
  http.get('/api/v1/currency-rates', ({ request }) => {
    const date = new URL(request.url).searchParams.get('date')
    if (date) {
      const sheet = sheets.find((s) => s.date === date) ?? null
      return HttpResponse.json(
        sheet ? sheetResponse(sheet) : { date, rates: [] },
      )
    }
    const latest = [...sheets].sort(byDateDesc)[0] ?? null
    return HttpResponse.json(sheetResponse(latest))
  }),

  http.put('/api/v1/currency-rates', async ({ request }) => {
    const body = (await request.json()) as {
      date?: string
      rates?: { currencyCode?: string; rate?: number }[]
    }
    if (!body.date) return message(400, 'Date is required.')
    if (!body.rates || body.rates.length === 0) {
      return message(400, 'At least one rate is required.')
    }
    const seen = new Set<string>()
    const unknown: string[] = []
    for (const rate of body.rates) {
      const code = rate.currencyCode ?? ''
      if (seen.has(code))
        return message(400, `Duplicate currency code: ${code}.`)
      seen.add(code)
      if (!masterOf(code)) unknown.push(code)
      if (typeof rate.rate !== 'number' || rate.rate <= 0) {
        return message(400, `Rate for ${code} must be positive.`)
      }
    }
    if (unknown.length > 0) {
      return message(400, `Unknown currency codes: ${unknown.join(', ')}.`)
    }
    const existing = sheets.find((s) => s.date === body.date)
    const next: RateSheetMock = existing ?? { date: body.date, rates: {} }
    for (const rate of body.rates) next.rates[rate.currencyCode!] = rate.rate!
    if (!existing) sheets = [...sheets, next]
    return noContent()
  }),

  http.post('/api/v1/currency-rates/import', async ({ request }) => {
    const form = await request.formData()
    const date = form.get('date')
    const file = form.get('file')
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return importProblem(
        400,
        'date_required',
        'A date in yyyy-MM-dd format is required.',
      )
    }
    if (!(file instanceof File) || file.size === 0) {
      return importProblem(400, 'file_required', 'An .xlsx file is required.')
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return importProblem(400, 'not_xlsx', 'Only .xlsx files can be imported.')
    }
    const existing = sheets.find((s) => s.date === date)
    if (existing && form.get('overwrite') !== 'true') {
      return importProblem(
        409,
        'sheet_exists',
        `Rates for ${date} already exist; send overwrite=true to import over them.`,
        {
          count: Object.keys(existing.rates).length,
        },
      )
    }
    // xlsx burada oxunmur: hər fayl nümunə bülletenin bu sətirləri sayılır.
    const rates = Object.entries(BULLETIN_RATES)
      .filter(([code]) => masterOf(code))
      .map(([currencyCode, rate]) => ({ currencyCode, rate }))
    const skipped = Object.keys(BULLETIN_RATES).filter(
      (code) => !masterOf(code),
    )
    const next: RateSheetMock = existing ?? { date, rates: {} }
    for (const rate of rates) next.rates[rate.currencyCode] = rate.rate
    if (!existing) sheets = [...sheets, next]
    return HttpResponse.json({ date, imported: rates.length, skipped, rates })
  }),

  http.delete('/api/v1/currency-rates', ({ request }) => {
    const date = new URL(request.url).searchParams.get('date')
    if (!date || !sheets.some((s) => s.date === date)) return problem404()
    sheets = sheets.filter((s) => s.date !== date)
    return noContent()
  }),

  http.get('/api/v1/currency-rates/dates', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE))
    const items = [...sheets]
      .sort(byDateDesc)
      .map((s) => ({ date: s.date, count: Object.keys(s.rates).length }))
    const start = (page - 1) * pageSize
    return HttpResponse.json({
      items: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
    })
  }),

  http.get('/api/v1/currencies', () =>
    HttpResponse.json({
      items: [...master].sort((a, b) => a.sortOrder - b.sortOrder),
    }),
  ),

  http.put('/api/v1/currencies/:code', async ({ params, request }) => {
    const code = String(params.code)
    const existing = masterOf(code)
    if (!existing) return message(404, `Unknown currency '${code}'.`)
    const body = (await request.json()) as Partial<
      Pick<CurrencyMasterMock, 'showOnHomepage' | 'sortOrder' | 'isActive'>
    >
    master = master.map((c) =>
      c.code === code
        ? {
            ...c,
            showOnHomepage: body.showOnHomepage ?? c.showOnHomepage,
            sortOrder: body.sortOrder ?? c.sortOrder,
            isActive: body.isActive ?? c.isActive,
          }
        : c,
    )
    return noContent()
  }),
]
