/**
 * Monthly report mocks: the real contract (spec 052, `contracts/admin-api.md`). The list comes newest period first;
 * a second report for a taken period is a 409 and a report without a file a 400, both `problem+json` with `message`,
 * as the API answers. A file the media library does not know is the deleted one (`mediaName: null`, `missingFile`).
 */

import { HttpResponse, http } from 'msw'

import { mediaFixtures } from '../fixtures/media'
import {
  monthlyReportFixtures,
  monthlyReportSeriesFixtures,
  type MonthlyReportMockFile,
  type MonthlyReportMockRow,
} from '../fixtures/monthly-reports'
import { createCrudStore } from './lib/crud-store'

const BASE = '/api/v1/monthly-reports'
const MONTHS_AZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']

const seriesOf = (key: string) => monthlyReportSeriesFixtures.find((s) => s.key === key)
const seriesOrder = (key: string) => monthlyReportSeriesFixtures.findIndex((s) => s.key === key)
const mediaName = (id: number) => mediaFixtures.find((m) => m.id === id)?.originalName ?? null

const problem = (status: number, text: string) =>
  HttpResponse.json(
    { status, title: text, message: text },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )

interface UpsertBody {
  series: string
  year: number
  month: number
  status: string
  translations?: Record<string, { mediaId: number }>
}

export const monthlyReportsStore = createCrudStore<MonthlyReportMockRow>({
  path: '/monthly-reports',
  envelope: 'paged',
  seed: monthlyReportFixtures,
  filterFields: ['series', 'year', 'status'],
  listItem: (row) => {
    const files = Object.entries(row.translations) as [string, MonthlyReportMockFile][]
    return {
      id: row.id,
      series: row.series,
      seriesName: seriesOf(row.series)?.name ?? row.series,
      periodMonths: seriesOf(row.series)?.periodMonths ?? 1,
      year: row.year,
      month: row.month,
      status: row.status,
      locales: files.map(([locale]) => locale),
      missingFile: files.some(([, file]) => file.mediaName === null),
      updatedAt: row.updatedAt,
    }
  },
  applyBody: (body, existing, id) => {
    const input = body as unknown as UpsertBody
    const translations = Object.fromEntries(
      Object.entries(input.translations ?? {}).map(([locale, file]) => [
        locale,
        { mediaId: file.mediaId, mediaName: mediaName(file.mediaId) },
      ]),
    )
    return {
      ...(existing ?? {}),
      id,
      series: input.series,
      year: input.year,
      month: input.month,
      status: input.status,
      updatedAt: '2026-11-18T10:00:00+00:00',
      translations,
    } as MonthlyReportMockRow
  },
  sort: (a, b) =>
    b.year - a.year || b.month - a.month || seriesOrder(a.series) - seriesOrder(b.series) || a.id - b.id,
})

/** The API's own checks before the store saves: a file, and one report per series and period. */
async function refuse(request: Request, exceptId: number | null) {
  const body = (await request.clone().json()) as UpsertBody
  if (Object.keys(body.translations ?? {}).length === 0) return problem(400, 'Ən azı bir dildə fayl seçin.')
  const taken = monthlyReportsStore.store
    .all()
    .some((row) => row.series === body.series && row.year === body.year && row.month === body.month && row.id !== exceptId)
  if (taken) return problem(409, `Bu seriyada ${MONTHS_AZ[body.month - 1]} ${body.year} üçün hesabat artıq var.`)
  return undefined
}

export const monthlyReportsHandlers = [
  http.get(`${BASE}/series`, () => HttpResponse.json(monthlyReportSeriesFixtures)),
  http.post(BASE, ({ request }) => refuse(request, null)),
  http.put(`${BASE}/:id`, ({ request, params }) => refuse(request, Number(params.id))),
  ...monthlyReportsStore.handlers,
]
