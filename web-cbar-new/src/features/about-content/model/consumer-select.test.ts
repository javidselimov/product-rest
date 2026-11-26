import { describe, expect, it } from 'vitest'

import { selectComplaintTab, selectStat } from './consumer-select'
import type { ComplaintIndexBlock, StatChannel, StatTable } from './types'

const archive = { years: [], latest: null }
const tab = (key: 'bank' | 'insurance') => ({ key, archive, introHtml: '', restHtml: '', methodology: null })
const block: ComplaintIndexBlock = { kind: 'complaint-index', tabs: [tab('bank'), tab('insurance')] }

const table: StatTable = { form: 'generic', head: [], rows: [] }
const channels: StatChannel[] = [
  { index: 1, label: 'A', years: [{ year: 2026, table }, { year: 2025, table }] },
  { index: 2, label: 'B', years: [{ year: 2026, table }] },
]

describe('selectComplaintTab', () => {
  it('picks the tab in the address, the bank tab otherwise', () => {
    expect(selectComplaintTab(block, 'insurance')?.key).toBe('insurance')
    expect(selectComplaintTab(block, ['insurance', 'bank'])?.key).toBe('insurance')
    expect(selectComplaintTab(block, 'other')?.key).toBe('bank')
    expect(selectComplaintTab(block, undefined)?.key).toBe('bank')
  })
})

describe('selectStat', () => {
  it('picks the channel and year in the address, falling back to the first channel and its newest year', () => {
    expect(selectStat(channels, '1', '2025')).toMatchObject({ channel: { index: 1 }, year: { year: 2025 } })
    expect(selectStat(channels, '2', '2025')).toMatchObject({ channel: { index: 2 }, year: { year: 2026 } })
    expect(selectStat(channels, '9', undefined)).toMatchObject({ channel: { index: 1 }, year: { year: 2026 } })
    expect(selectStat([], '1', '2026')).toBeUndefined()
  })
})
