/**
 * AZIR mock-ları — real kontrakt (contracts/admin-api.md §8): paged 50, yeni → köhnə,
 * `from`/`to`/`term` filtrləri; `POST /azir` (tarix + müddət) üzrə upsert → 200
 * bütün sahələri əvəz edir, sahə xətası → 400 problem+json `errors` (spec 021);
 * silmə `createCrudStore`-dan.
 */

import { HttpResponse, http } from 'msw'

import {
  AZIR_IMPORT_DATE,
  azirFixtures,
  azirImportSkipped,
  azirImportedValues,
  type AzirMockRow,
} from '../fixtures/azir'
import { LARGE_PAGE_SIZE } from '@/shared/constants/pagination'
import { importProblem } from './currency'
import { createCrudStore } from './lib/crud-store'

const sortNewestFirst = (a: AzirMockRow, b: AzirMockRow) =>
  b.valueDate.localeCompare(a.valueDate) || a.term.localeCompare(b.term)

export const azirStore = createCrudStore<AzirMockRow>({
  path: '/azir',
  envelope: 'paged',
  pageSize: LARGE_PAGE_SIZE,
  seed: azirFixtures,
  filterFields: ['term'],
  sort: sortNewestFirst,
})

const list = http.get(azirStore.base, ({ request }) => {
  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const term = url.searchParams.get('term')
  let rows = [...azirStore.store.all()].sort(sortNewestFirst)
  if (from) rows = rows.filter((r) => r.valueDate >= from)
  if (to) rows = rows.filter((r) => r.valueDate <= to)
  if (term) rows = rows.filter((r) => r.term === term)
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? String(LARGE_PAGE_SIZE))
  const start = (page - 1) * pageSize
  return HttpResponse.json({
    items: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  })
})

const nullableNumber = (value: unknown) =>
  typeof value === 'number' ? value : null

/** Server qaydalarının alt çoxluğu (data-model.md §3) — testlərə lazım olanlar. */
const detailErrors = (body: Partial<AzirMockRow>) => {
  const errors: Record<string, string[]> = {}
  if (typeof body.dealVolume === 'number' && body.dealVolume < 0)
    errors.dealVolume = ['Deal volume must be zero or positive.']
  if (
    typeof body.dealCount === 'number' &&
    (body.dealCount < 0 || !Number.isInteger(body.dealCount))
  )
    errors.dealCount = ['Deal count must be a whole number, zero or positive.']
  if (
    typeof body.minRate === 'number' &&
    typeof body.maxRate === 'number' &&
    body.minRate > body.maxRate
  )
    errors.minRate = ['Minimum rate must not exceed maximum rate.']
  return errors
}

/** Spec 018 problem+json; `message` birinci xətadır (contracts §1). */
const validationProblem = (errors: Record<string, string[]>) =>
  HttpResponse.json(
    {
      type: 'urn:cbar:problem:validation',
      title: 'Validation failed.',
      status: 400,
      message: Object.values(errors)[0][0],
      errors,
    },
    { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
  )

const upsert = http.post(azirStore.base, async ({ request }) => {
  const body = (await request.json()) as Partial<AzirMockRow>
  if (!body.valueDate || !body.term || typeof body.rate !== 'number') {
    return HttpResponse.json(
      { message: 'valueDate, term and rate are required.' },
      { status: 400 },
    )
  }
  const errors = detailErrors(body)
  if (Object.keys(errors).length > 0) return validationProblem(errors)

  // Tam əvəzetmə: buraxılmış sahə `null`, işarə `false` olur.
  const fields = {
    valueDate: body.valueDate,
    term: body.term,
    rate: body.rate,
    dealVolume: nullableNumber(body.dealVolume),
    dealCount: nullableNumber(body.dealCount),
    minRate: nullableNumber(body.minRate),
    maxRate: nullableNumber(body.maxRate),
    isReservePlan: body.isReservePlan === true,
    updatedAt: new Date().toISOString(),
  }
  const existing = azirStore.store
    .all()
    .find((r) => r.valueDate === body.valueDate && r.term === body.term)
  const row = existing
    ? azirStore.store.replace({ ...existing, ...fields })
    : azirStore.store.insert({ id: azirStore.store.nextId(), ...fields })
  return HttpResponse.json({
    id: row.id,
    valueDate: row.valueDate,
    term: row.term,
    rate: row.rate,
    dealVolume: row.dealVolume,
    dealCount: row.dealCount,
    minRate: row.minRate,
    maxRate: row.maxRate,
    isReservePlan: row.isReservePlan,
  })
})

/**
 * `POST /azir/import` (spec 058): any .xlsx "is" the sample workbook (27.10.2026, four terms);
 * terms already stored for the date need `overwrite=true` (409 `date_exists`), the rest is a merge.
 */
const importDay = http.post(`${azirStore.base}/import`, async ({ request }) => {
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0)
    return importProblem(400, 'file_required', 'An .xlsx file is required.')
  if (!file.name.toLowerCase().endsWith('.xlsx'))
    return importProblem(400, 'not_xlsx', 'Only .xlsx files can be imported.')

  const stored = (term: string) =>
    azirStore.store
      .all()
      .find((r) => r.valueDate === AZIR_IMPORT_DATE && r.term === term)
  const existing = azirImportedValues.filter((v) => stored(v.term))
  if (existing.length > 0 && form.get('overwrite') !== 'true')
    return importProblem(
      409,
      'date_exists',
      `AZIR values for ${AZIR_IMPORT_DATE} already exist; send overwrite=true to replace them.`,
      {
        valueDate: AZIR_IMPORT_DATE,
        count: existing.length,
        terms: existing.map((v) => v.term),
      },
    )

  const values = azirImportedValues.map((value) => {
    const row = stored(value.term)
    const fields = {
      ...value,
      valueDate: AZIR_IMPORT_DATE,
      updatedAt: new Date().toISOString(),
    }
    if (row) azirStore.store.replace({ ...row, ...fields })
    else azirStore.store.insert({ id: azirStore.store.nextId(), ...fields })
    return {
      ...value,
      previous: row
        ? {
            rate: row.rate,
            dealVolume: row.dealVolume,
            dealCount: row.dealCount,
            minRate: row.minRate,
            maxRate: row.maxRate,
            isReservePlan: row.isReservePlan,
          }
        : null,
    }
  })
  return HttpResponse.json({
    valueDate: AZIR_IMPORT_DATE,
    values,
    skipped: azirImportSkipped,
    volumeConverted: false,
  })
})

/** Xüsusi siyahı/upsert/import handler-ləri əvvəldədir — MSW ilk uyğunu götürür. */
export const azirHandlers = [list, upsert, importDay, ...azirStore.handlers]
