/**
 * İnflyasiya mock-ları — real kontrakt (contracts/admin-api.md §8): bare array,
 * `?year` filtri, yeni → köhnə; `POST /inflation` (il + ay + parametr) üzrə
 * upsert → 200; silmə `createCrudStore`-dan. `GET|PUT /inflation/settings` —
 * ana səhifə xülasəsi (tək sətir, heç saxlanmayıbsa 204).
 */

import { HttpResponse, http } from 'msw'

import {
  inflationFixtures,
  inflationSettingsFixture,
  type InflationMockRow,
  type InflationSettingsMock,
} from '../fixtures/inflation'
import { createCrudStore } from './lib/crud-store'

const sortNewestFirst = (a: InflationMockRow, b: InflationMockRow) =>
  b.year - a.year ||
  b.month - a.month ||
  a.parameterCode.localeCompare(b.parameterCode)

export const inflationStore = createCrudStore<InflationMockRow>({
  path: '/inflation',
  envelope: 'array',
  seed: inflationFixtures,
  filterFields: ['year'],
  sort: sortNewestFirst,
})

const upsert = http.post(inflationStore.base, async ({ request }) => {
  const body = (await request.json()) as Partial<InflationMockRow>
  if (
    typeof body.year !== 'number' ||
    typeof body.month !== 'number' ||
    body.month < 1 ||
    body.month > 12 ||
    !body.parameterCode ||
    typeof body.value !== 'number'
  ) {
    return HttpResponse.json(
      { message: 'year, month (1–12), parameterCode and value are required.' },
      { status: 400 },
    )
  }
  const updatedAt = new Date().toISOString()
  const existing = inflationStore.store
    .all()
    .find(
      (r) =>
        r.year === body.year &&
        r.month === body.month &&
        r.parameterCode === body.parameterCode,
    )
  const row = existing
    ? inflationStore.store.replace({
        ...existing,
        value: body.value,
        updatedAt,
      })
    : inflationStore.store.insert({
        id: inflationStore.store.nextId(),
        year: body.year,
        month: body.month,
        parameterCode: body.parameterCode,
        value: body.value,
        updatedAt,
      })
  return HttpResponse.json({
    id: row.id,
    year: row.year,
    month: row.month,
    parameterCode: row.parameterCode,
    value: row.value,
  })
})

let settings: InflationSettingsMock | null = { ...inflationSettingsFixture }

export const inflationSettingsStore = {
  get: () => settings,
  set: (next: InflationSettingsMock | null) => {
    settings = next
  },
  reset: () => {
    settings = { ...inflationSettingsFixture }
  },
}

const getSettings = http.get(`${inflationStore.base}/settings`, () =>
  settings
    ? HttpResponse.json(settings)
    : new HttpResponse(null, { status: 204 }),
)

const putSettings = http.put(
  `${inflationStore.base}/settings`,
  async ({ request }) => {
    const body = (await request.json()) as Partial<InflationSettingsMock>
    const target = body.targetInflation?.trim()
    if (
      typeof body.currentInflation !== 'number' ||
      !target ||
      !body.nextUpdateDate
    ) {
      return HttpResponse.json(
        { message: 'Target inflation is required.' },
        { status: 400 },
      )
    }
    settings = {
      currentInflation: body.currentInflation,
      targetInflation: target,
      nextUpdateDate: body.nextUpdateDate,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json(settings)
  },
)

/** Xüsusi handler-lər əvvəldədir — MSW ilk uyğunu götürür (`/settings` `/:id`-dən qabaq). */
export const inflationHandlers = [
  getSettings,
  putSettings,
  upsert,
  ...inflationStore.handlers,
]
