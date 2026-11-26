/**
 * Monthly report samples: the real contract (spec 052, `contracts/admin-api.md`). The bank series has two months, the
 * newest with both files; the insurance one has a month whose az file was deleted from the media library.
 */

import type { MockRow } from '../handlers/lib/crud-store'

export interface MonthlyReportMockFile {
  mediaId: number
  mediaName: string | null
}

export interface MonthlyReportMockRow extends MockRow {
  series: string
  year: number
  month: number
  status: string
  updatedAt: string
  translations: { az?: MonthlyReportMockFile; en?: MonthlyReportMockFile }
}

export const monthlyReportSeriesFixtures = [
  {
    key: 'bank-complaint-index',
    name: 'Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi',
    nameEn: "Complaint index on bank customers' use of bank services",
    periodMonths: 1,
  },
  {
    key: 'insurance-complaint-index',
    name: 'Avto-icbari sığorta üzrə şikayət indeksi',
    nameEn: 'Complaint index on compulsory MTPL insurance',
    periodMonths: 12,
  },
  {
    key: 'infographics',
    name: 'Azərbaycan Respublikasının Mərkəzi Bankına daxil olan müraciətlərə dair statistik hesabat',
    nameEn: 'Statistical report on appeals received by the Central Bank of the Republic of Azerbaijan',
    periodMonths: 1,
  },
]

export const monthlyReportFixtures: MonthlyReportMockRow[] = [
  {
    id: 1,
    series: 'bank-complaint-index',
    year: 2026,
    month: 5,
    status: 'published',
    updatedAt: '2026-06-10T09:00:00+00:00',
    translations: {
      az: { mediaId: 3, mediaName: 'hesabat-2025.pdf' },
      en: { mediaId: 3, mediaName: 'hesabat-2025.pdf' },
    },
  },
  {
    id: 2,
    series: 'bank-complaint-index',
    year: 2026,
    month: 4,
    status: 'published',
    updatedAt: '2026-05-10T09:00:00+00:00',
    translations: { az: { mediaId: 3, mediaName: 'hesabat-2025.pdf' } },
  },
  {
    id: 3,
    series: 'insurance-complaint-index',
    year: 2026,
    month: 5,
    status: 'published',
    updatedAt: '2026-06-11T09:00:00+00:00',
    translations: { az: { mediaId: 99, mediaName: null } },
  },
]
