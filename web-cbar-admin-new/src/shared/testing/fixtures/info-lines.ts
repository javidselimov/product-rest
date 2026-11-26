/** Məlumat sətirlərinin seed-ə bənzər nümunələri — API onları alias-a görə qruplaşdırır. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface InfoLineFixture extends MockRow {
  alias: string
  year: number | null
  sortOrder: number
  isActive: boolean
  updatedAt: string
  translations: Partial<
    Record<'az' | 'en', { title: string; value: string | null }>
  >
}

export const infoLineFixtures: InfoLineFixture[] = [
  {
    id: 1,
    alias: 'homepage_indicators',
    year: 2026,
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-03-01T08:00:00+00:00',
    translations: {
      az: { title: 'Uçot dərəcəsi', value: '7.25%' },
      en: { title: 'Policy rate', value: '7.25%' },
    },
  },
  {
    id: 2,
    alias: 'homepage_indicators',
    year: 2026,
    sortOrder: 1,
    isActive: true,
    updatedAt: '2026-03-01T08:05:00+00:00',
    translations: {
      az: { title: 'İnflyasiya (illik)', value: '5.1%' },
      en: { title: 'Inflation (yoy)', value: '5.1%' },
    },
  },
  {
    id: 3,
    alias: 'corridor_min',
    year: null,
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-02-15T08:00:00+00:00',
    translations: { az: { title: 'Dəhlizin aşağı həddi', value: '6.25%' } },
  },
  {
    id: 4,
    alias: 'corridor_max',
    year: null,
    sortOrder: 0,
    isActive: true,
    updatedAt: '2026-02-15T08:00:00+00:00',
    translations: { az: { title: 'Dəhlizin yuxarı həddi', value: '8.25%' } },
  },
  {
    id: 5,
    alias: 'money_base',
    year: 2025,
    sortOrder: 0,
    isActive: false,
    updatedAt: '2026-01-10T08:00:00+00:00',
    translations: { az: { title: 'Pul bazası', value: '22.4 mlrd' } },
  },
]
