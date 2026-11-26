import type { MockRow } from '../handlers/lib/crud-store'

export interface AzirMockRow extends MockRow {
  valueDate: string
  term: string
  rate: number
  dealVolume: number | null
  dealCount: number | null
  minRate: number | null
  maxRate: number | null
  isReservePlan: boolean
  updatedAt: string
}

/** Spec 021 sahələri boş — köhnə sətirlər belə gəlir (FR-002). */
const noDetails = {
  dealVolume: null,
  dealCount: null,
  minRate: null,
  maxRate: null,
  isReservePlan: false,
}

/**
 * Üç iş günü × üç müddət — filtr və upsert testləri üçün. İki 1D sətrinin
 * detalları doludur (biri ehtiyat plan ilə); dəyərlər heç bir `rate` ilə üst-üstə düşmür.
 */
export const azirFixtures: AzirMockRow[] = [
  {
    id: 1,
    valueDate: '2026-02-02',
    term: '1D',
    rate: 7.25,
    dealVolume: 250.5,
    dealCount: 18,
    minRate: 6.9,
    maxRate: 7.65,
    isReservePlan: false,
    updatedAt: '2026-02-02T09:00:00+00:00',
  },
  {
    id: 2,
    valueDate: '2026-02-02',
    term: '30D',
    rate: 7.4,
    ...noDetails,
    updatedAt: '2026-02-02T09:00:00+00:00',
  },
  {
    id: 3,
    valueDate: '2026-02-02',
    term: '90D',
    rate: 7.6,
    ...noDetails,
    updatedAt: '2026-02-02T09:00:00+00:00',
  },
  {
    id: 4,
    valueDate: '2026-02-03',
    term: '1D',
    rate: 7.3,
    dealVolume: 180,
    dealCount: 12,
    minRate: 7.1,
    maxRate: 7.55,
    isReservePlan: true,
    updatedAt: '2026-02-03T09:00:00+00:00',
  },
  {
    id: 5,
    valueDate: '2026-02-03',
    term: '30D',
    rate: 7.45,
    ...noDetails,
    updatedAt: '2026-02-03T09:00:00+00:00',
  },
  {
    id: 6,
    valueDate: '2026-02-04',
    term: '1D',
    rate: 7.35,
    ...noDetails,
    updatedAt: '2026-02-04T09:00:00+00:00',
  },
  {
    id: 7,
    valueDate: '2026-02-04',
    term: '90D',
    rate: 7.7,
    ...noDetails,
    updatedAt: '2026-02-04T09:00:00+00:00',
  },
]

/** What `POST /azir/import` writes for the bank's sample workbook (spec 058 contracts §3). */
export const AZIR_IMPORT_DATE = '2026-10-27'

export const azirImportedValues = [
  { term: '1D', rate: 6.3048, dealVolume: 0, dealCount: 0, minRate: null, maxRate: null, isReservePlan: true },
  { term: '30D', rate: 5.9748, ...noDetails },
  { term: '90D', rate: 6.1316, ...noDetails },
  { term: '180D', rate: 6.3484, ...noDetails },
]

export const azirImportSkipped = [{ row: 10, name: 'AZIR TFAI', reason: 'tfai' }]
