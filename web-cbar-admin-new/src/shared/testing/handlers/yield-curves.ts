/**
 * Gəlirlik əyrisi mock-ları — real kontrakt (api-cbar-admin openapi
 * `paths/statistics.yaml` → yieldCurve*): üç müstəqil data dəsti tarixə görə
 * yaddaşda; siyahılar yeni → köhnə səhifələnir; GET nöqtələr / DELETE 204 /
 * bare 404; POST import multipart — mövcud tarix `overwrite=true` olmadan 409
 * `date_exists`, ilə — data tam əvəzlənir. xlsx burada oxunmur: hər fayl
 * həmin data dəstinin nümunə faylı sayılır (`IMPORTED`).
 */

import { HttpResponse, http } from 'msw'

import {
  yieldParametersFixtures,
  yieldPeriodsFixtures,
  yieldPointsFixtures,
  type YieldParametersMock,
  type YieldPeriodsMock,
  type YieldPointsMock,
} from '../fixtures/yield-curves'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { importProblem } from './currency'
import { noContent, problem404 } from './lib/errors'

let points: YieldPointsMock[] = structuredClone(yieldPointsFixtures)
let parameters: YieldParametersMock[] = structuredClone(yieldParametersFixtures)
let periods: YieldPeriodsMock[] = structuredClone(yieldPeriodsFixtures)

export const yieldCurvesStore = {
  reset: () => {
    points = structuredClone(yieldPointsFixtures)
    parameters = structuredClone(yieldParametersFixtures)
    periods = structuredClone(yieldPeriodsFixtures)
  },
  points: () => points,
  parameters: () => parameters,
  periods: () => periods,
}

/** Mock-un "oxuduğu" fayllar — nümunə `*_2026_10_12.xlsx`-dən bir hissə. */
const IMPORTED = {
  yields: [
    { period: 90, yield: 6.9 },
    { period: 91, yield: 6.89 },
    { period: 92, yield: 6.87 },
    { period: 93, yield: 6.85 },
  ],
  parameters: { beta0: 7.2654, beta1: 5.3365, beta2: -9.5262, lambda: 0.0199 },
  periods: {
    threeMonth: 6.9,
    sixMonth: 6.39,
    nineMonth: 6.53,
    oneYear: 6.7,
    twoYear: 6.98,
    threeYear: 7.07,
    fourYear: 7.12,
  },
}

const byDateDesc = (a: { curveDate: string }, b: { curveDate: string }) =>
  b.curveDate.localeCompare(a.curveDate)

function paged<T>(request: Request, rows: T[]) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE))
  const start = (page - 1) * pageSize
  return HttpResponse.json({
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  })
}

/** Import sorğusunun ümumi yoxlamaları; uğurda `{ date, overwrite }`. */
async function readImport(request: Request) {
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
  return { date, overwrite: form.get('overwrite') === 'true' }
}

const dateExists = (date: string, count: number) =>
  importProblem(
    409,
    'date_exists',
    `Data for ${date} already exists; send overwrite=true to replace it.`,
    { count },
  )

const now = () => new Date().toISOString()

export const yieldCurvesHandlers = [
  // --- Əyri nöqtələri ---
  http.get('/api/v1/yield-curves/yields', ({ request }) =>
    paged(
      request,
      [...points].sort(byDateDesc).map((p) => ({
        curveDate: p.curveDate,
        pointsCount: p.points.length,
        updatedAt: p.updatedAt,
      })),
    ),
  ),

  http.post('/api/v1/yield-curves/yields/import', async ({ request }) => {
    const read = await readImport(request)
    if (read instanceof Response) return read
    const existing = points.find((p) => p.curveDate === read.date)
    if (existing && !read.overwrite)
      return dateExists(read.date, existing.points.length)
    points = [
      ...points.filter((p) => p.curveDate !== read.date),
      { curveDate: read.date, points: [...IMPORTED.yields], updatedAt: now() },
    ]
    return HttpResponse.json({
      curveDate: read.date,
      imported: IMPORTED.yields.length,
    })
  }),

  http.get('/api/v1/yield-curves/yields/:date', ({ params }) => {
    const row = points.find((p) => p.curveDate === params.date)
    return row
      ? HttpResponse.json({ curveDate: row.curveDate, points: row.points })
      : problem404()
  }),

  http.delete('/api/v1/yield-curves/yields/:date', ({ params }) => {
    if (!points.some((p) => p.curveDate === params.date)) return problem404()
    points = points.filter((p) => p.curveDate !== params.date)
    return noContent()
  }),

  // --- Parametrlər ---
  http.get('/api/v1/yield-curves/parameters', ({ request }) =>
    paged(request, [...parameters].sort(byDateDesc)),
  ),

  http.post('/api/v1/yield-curves/parameters/import', async ({ request }) => {
    const read = await readImport(request)
    if (read instanceof Response) return read
    if (parameters.some((p) => p.curveDate === read.date) && !read.overwrite)
      return dateExists(read.date, 1)
    const row = { curveDate: read.date, ...IMPORTED.parameters, updatedAt: now() }
    parameters = [...parameters.filter((p) => p.curveDate !== read.date), row]
    return HttpResponse.json(row)
  }),

  http.delete('/api/v1/yield-curves/parameters/:date', ({ params }) => {
    if (!parameters.some((p) => p.curveDate === params.date))
      return problem404()
    parameters = parameters.filter((p) => p.curveDate !== params.date)
    return noContent()
  }),

  // --- Müddətlər ---
  http.get('/api/v1/yield-curves/periods', ({ request }) =>
    paged(request, [...periods].sort(byDateDesc)),
  ),

  http.post('/api/v1/yield-curves/periods/import', async ({ request }) => {
    const read = await readImport(request)
    if (read instanceof Response) return read
    if (periods.some((p) => p.curveDate === read.date) && !read.overwrite)
      return dateExists(read.date, 1)
    const row = { curveDate: read.date, ...IMPORTED.periods, updatedAt: now() }
    periods = [...periods.filter((p) => p.curveDate !== read.date), row]
    return HttpResponse.json(row)
  }),

  http.delete('/api/v1/yield-curves/periods/:date', ({ params }) => {
    if (!periods.some((p) => p.curveDate === params.date)) return problem404()
    periods = periods.filter((p) => p.curveDate !== params.date)
    return noContent()
  }),
]
