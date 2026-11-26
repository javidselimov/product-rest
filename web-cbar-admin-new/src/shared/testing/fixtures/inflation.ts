import type { MockRow } from '../handlers/lib/crud-store'

export interface InflationMockRow extends MockRow {
  year: number
  month: number
  parameterCode: string
  value: number
  updatedAt: string
}

export interface InflationSettingsMock {
  currentInflation: number
  targetInflation: string
  nextUpdateDate: string
  updatedAt: string
}

/** Köhnə paneldəki dəyərlər. */
export const inflationSettingsFixture: InflationSettingsMock = {
  currentInflation: 5.7,
  targetInflation: '4 (±2)',
  nextUpdateDate: '2026-08-16',
  updatedAt: '2026-07-16T09:00:00+00:00',
}

/** İki il × iki parametr — il filtri və upsert testləri üçün. */
export const inflationFixtures: InflationMockRow[] = [
  {
    id: 1,
    year: 2025,
    month: 11,
    parameterCode: 'cpi_yoy',
    value: 5.6,
    updatedAt: '2025-12-05T09:00:00+00:00',
  },
  {
    id: 2,
    year: 2025,
    month: 11,
    parameterCode: 'target',
    value: 4,
    updatedAt: '2025-12-05T09:00:00+00:00',
  },
  {
    id: 3,
    year: 2025,
    month: 12,
    parameterCode: 'cpi_yoy',
    value: 5.4,
    updatedAt: '2026-01-06T09:00:00+00:00',
  },
  {
    id: 4,
    year: 2025,
    month: 12,
    parameterCode: 'target',
    value: 4,
    updatedAt: '2026-01-06T09:00:00+00:00',
  },
  {
    id: 5,
    year: 2026,
    month: 1,
    parameterCode: 'cpi_yoy',
    value: 5.1,
    updatedAt: '2026-02-05T09:00:00+00:00',
  },
  {
    id: 6,
    year: 2026,
    month: 1,
    parameterCode: 'target',
    value: 4,
    updatedAt: '2026-02-05T09:00:00+00:00',
  },
]
