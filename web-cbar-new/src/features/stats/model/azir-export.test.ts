// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { type AzirExportLabels, type AzirExportRow, toAzirWorkbook } from './azir-export'

const az: AzirExportLabels = {
  sheetName: '1D AZIR',
  headers: ['Tarix', 'Faiz', 'Əqdlərin həcmi (mln. AZN)', 'Əqdlərin sayı'],
  notesSheetName: 'Qeydlər',
  notesHeader: 'Ehtiyat plan əsasında hesablanmış günlər',
  footnote: '*Ehtiyat plan əsasında hesablanmışdır',
}

const en: AzirExportLabels = {
  sheetName: '1D AZIR',
  headers: ['Date', 'Interest rate', 'Value of transactions (mln. AZN)', 'Number of transactions'],
  notesSheetName: 'Notes',
  notesHeader: 'Days calculated on the basis of the contingency plan',
  footnote: '*Calculated on the basis of the contingency plan',
}

const rows: AzirExportRow[] = [
  { date: '2026-09-14', rate: 7.25, dealVolume: 120.5, dealCount: 14, isReservePlan: false },
  { date: '2026-09-11', rate: 7.2, dealVolume: null, dealCount: null, isReservePlan: true },
  { date: '2026-09-10', rate: 7.1, dealVolume: 80, dealCount: 9, isReservePlan: true },
]

describe('toAzirWorkbook', () => {
  it('uses the localised headers', () => {
    expect(toAzirWorkbook(rows, az).sheets[0].header).toEqual(az.headers)
    expect(toAzirWorkbook(rows, en).sheets[0].header).toEqual(en.headers)
    expect(toAzirWorkbook(rows, en).sheets[0].name).toBe('1D AZIR')
  })

  it('keeps row order, four columns, numbers without markers, null as empty', () => {
    const [sheet] = toAzirWorkbook(rows, az).sheets

    expect(sheet.rows).toEqual([
      [{ date: '2026-09-14' }, 7.25, 120.5, 14],
      [{ date: '2026-09-11' }, 7.2, null, null],
      [{ date: '2026-09-10' }, 7.1, 80, 9],
    ])
  })

  it('without reserve-plan rows there is only the data sheet', () => {
    const plain = rows.map((row) => ({ ...row, isReservePlan: false }))

    expect(toAzirWorkbook(plain, az).sheets).toHaveLength(1)
  })

  it('no rows → header only, one sheet', () => {
    const { sheets } = toAzirWorkbook([], en)

    expect(sheets).toHaveLength(1)
    expect(sheets[0].rows).toEqual([])
  })

  it('reserve-plan rows add a notes sheet with dates, a spacer and the footnote', () => {
    const { sheets } = toAzirWorkbook(rows, az)

    expect(sheets).toHaveLength(2)
    expect(sheets[1]).toEqual({
      name: 'Qeydlər',
      header: ['Ehtiyat plan əsasında hesablanmış günlər'],
      rows: [
        [{ date: '2026-09-11' }],
        [{ date: '2026-09-10' }],
        [null],
        ['*Ehtiyat plan əsasında hesablanmışdır'],
      ],
    })
    expect(toAzirWorkbook(rows, en).sheets[1].name).toBe('Notes')
  })
})
