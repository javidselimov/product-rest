/** MEAS seed-ə bənzər nümunələr: 3 emitent, 3 məlumat tipi (az/en), 25 sənəd. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface MeasLookupFixture extends MockRow {
  isActive: boolean
  updatedAt: string
  translations: { az?: { name: string }; en?: { name: string } }
}

export interface MeasDocumentFixture extends MockRow {
  emitentId: number
  infoTypeId: number
  regDate: string
  dqn: string | null
  mediaId: number | null
  status: string
  updatedAt: string
  media: {
    id: number
    originalName: string
    mimeType: string | null
    sizeBytes: number | null
  } | null
}

export const measEmitentFixtures: MeasLookupFixture[] = [
  {
    id: 1,
    isActive: true,
    updatedAt: '2026-01-05T10:00:00+00:00',
    translations: {
      az: { name: 'Maliyyə Nazirliyi' },
      en: { name: 'Ministry of Finance' },
    },
  },
  {
    id: 2,
    isActive: true,
    updatedAt: '2026-01-06T10:00:00+00:00',
    translations: {
      az: { name: 'Mərkəzi Bank' },
      en: { name: 'Central Bank' },
    },
  },
  {
    id: 3,
    isActive: false,
    updatedAt: '2026-01-07T10:00:00+00:00',
    translations: { az: { name: 'İpoteka və Kredit Zəmanət Fondu' } },
  },
]

export const measInfoTypeFixtures: MeasLookupFixture[] = [
  {
    id: 1,
    isActive: true,
    updatedAt: '2026-01-05T11:00:00+00:00',
    translations: {
      az: { name: 'Emissiya prospekti' },
      en: { name: 'Issue prospectus' },
    },
  },
  {
    id: 2,
    isActive: true,
    updatedAt: '2026-01-06T11:00:00+00:00',
    translations: {
      az: { name: 'Yekun hesabat' },
      en: { name: 'Final report' },
    },
  },
  {
    id: 3,
    isActive: true,
    updatedAt: '2026-01-07T11:00:00+00:00',
    translations: { az: { name: 'Qeydiyyat bildirişi' } },
  },
]

const STATUSES = ['published', 'draft', 'scheduled', 'archived'] as const

export const measDocumentFixtures: MeasDocumentFixture[] = Array.from(
  { length: 25 },
  (_, i) => {
    const n = i + 1
    const day = String((i % 28) + 1).padStart(2, '0')
    return {
      id: n,
      emitentId: (i % 3) + 1,
      infoTypeId: ((i + 1) % 3) + 1,
      regDate: `2026-03-${day}`,
      dqn: i % 5 === 4 ? null : `AZ${1000 + n}-2026`,
      mediaId: n === 1 ? 3 : null,
      status: STATUSES[i % STATUSES.length],
      updatedAt: `2026-03-${day}T12:00:00+00:00`,
      media:
        n === 1
          ? {
              id: 3,
              originalName: 'hesabat-2025.pdf',
              mimeType: 'application/pdf',
              sizeBytes: 240113,
            }
          : null,
    }
  },
)
