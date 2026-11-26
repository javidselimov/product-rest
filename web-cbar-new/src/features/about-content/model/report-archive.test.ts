import { describe, expect, it } from 'vitest'

import { archiveFromReports, reportTitle } from './report-archive'
import type { ReportSeries } from './types'

const file = (id: number) => ({ id, url: `/media/${id}`, mimeType: 'application/pdf' })

const bank: ReportSeries = {
  key: 'bank-complaint-index',
  name: 'Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi',
  periodMonths: 1,
  // Out of order on purpose: the archive keeps its own order.
  reports: [
    { year: 2025, month: 12, file: file(3) },
    { year: 2026, month: 6, file: file(1) },
    { year: 2026, month: 9, file: file(2) },
  ],
}

const insurance: ReportSeries = {
  key: 'insurance-complaint-index',
  name: 'Avto-icbari sığorta üzrə şikayət indeksi',
  periodMonths: 12,
  reports: [{ year: 2026, month: 5, file: file(11) }],
}

describe('archiveFromReports', () => {
  it('orders years and months newest first and takes the newest month as the latest', () => {
    const archive = archiveFromReports(bank, 'az')

    expect(archive.years.map((y) => [y.year, y.months.map((m) => m.month)])).toEqual([
      [2026, [9, 6]],
      [2025, [12]],
    ])
    expect(archive.latest).toMatchObject({ year: 2026, month: { month: 9, label: 'Sentyabr' } })
  })

  it('labels the months in the visitor language, capital first', () => {
    expect(archiveFromReports(bank, 'az').years[0]?.months.map((m) => m.label)).toEqual(['Sentyabr', 'İyun'])
    expect(archiveFromReports(bank, 'en').years[0]?.months.map((m) => m.label)).toEqual(['September', 'June'])
  })

  it('titles each file with the series name and the period, keeping the API file', () => {
    const month = archiveFromReports(bank, 'az').years[0]?.months[0]

    expect(month?.file).toEqual({
      id: 2,
      url: '/media/2',
      mimeType: 'application/pdf',
      title: 'Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi (Sentyabr 2026)',
    })
  })

  it('gives no latest month for a series without reports', () => {
    expect(archiveFromReports({ ...bank, reports: [] }, 'az')).toEqual({ years: [], latest: null })
  })
})

describe('reportTitle', () => {
  it('names one month', () => {
    expect(reportTitle(bank, 2026, 5, 'az')).toBe(`${bank.name} (May 2026)`)
    expect(reportTitle({ ...bank, name: 'Index' }, 2026, 5, 'en')).toBe('Index (May 2026)')
  })

  it('names the twelve months ending with the month', () => {
    expect(reportTitle(insurance, 2026, 5, 'az')).toBe('Avto-icbari sığorta üzrə şikayət indeksi (İyun 2025 – May 2026)')
  })

  it('starts a twelve-month period ending in January in the previous year', () => {
    expect(reportTitle(insurance, 2026, 1, 'az')).toBe('Avto-icbari sığorta üzrə şikayət indeksi (Fevral 2025 – Yanvar 2026)')
  })
})
