/**
 * Monthly reports (spec 052, `contracts/public-api.md`): the bank index over two years, the twelve-month insurance
 * index and the infographics. English has the bank and insurance months with an en file and no infographics.
 */
import type { MonthlyReportSeriesDto } from '@/features/monthly-reports/model/schemas'

const file = (id: number) => ({ id, url: `/media/${id}`, mimeType: 'application/pdf', sizeBytes: 245760 })

export const bankReportsAz: MonthlyReportSeriesDto = {
  key: 'bank-complaint-index',
  name: 'Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi',
  periodMonths: 1,
  reports: [
    { id: 3, year: 2026, month: 9, file: file(2001) },
    { id: 2, year: 2026, month: 8, file: file(2002) },
    { id: 1, year: 2025, month: 12, file: file(2003) },
  ],
}

export const insuranceReportsAz: MonthlyReportSeriesDto = {
  key: 'insurance-complaint-index',
  name: 'Avto-icbari sığorta üzrə şikayət indeksi',
  periodMonths: 12,
  reports: [
    { id: 11, year: 2026, month: 5, file: file(2011) },
    { id: 10, year: 2026, month: 1, file: file(2012) },
  ],
}

export const infographicsReportsAz: MonthlyReportSeriesDto = {
  key: 'infographics',
  name: 'Azərbaycan Respublikasının Mərkəzi Bankına daxil olan müraciətlərə dair statistik hesabat',
  periodMonths: 1,
  reports: [
    { id: 21, year: 2026, month: 9, file: file(2021) },
    { id: 20, year: 2025, month: 11, file: file(2022) },
  ],
}

export const bankReportsEn: MonthlyReportSeriesDto = {
  key: 'bank-complaint-index',
  name: "Complaint index on bank customers' use of bank services",
  periodMonths: 1,
  reports: [{ id: 3, year: 2026, month: 9, file: file(2101) }],
}

export const monthlyReportsAz: MonthlyReportSeriesDto[] = [bankReportsAz, insuranceReportsAz, infographicsReportsAz]
export const monthlyReportsEn: MonthlyReportSeriesDto[] = [bankReportsEn]
