import { describe, expect, it } from 'vitest'

import { filterSchedule } from './search'
import type { ReleaseScheduleGroup } from './schemas'

const item = (id: number, title: string) => ({
  id,
  title,
  periodicity: null,
  timing: null,
  timingMode: 'text' as const,
  timingUrl: null,
})

const groups: ReleaseScheduleGroup[] = [
  { id: 1, name: 'Pul siyasəti', items: [item(1, 'İllik inflyasiya'), item(2, 'AZN məzənnəsi')] },
  { id: 2, name: 'İnflyasiya qrupu', items: [item(3, 'Normativ-xarakterli aktlar')] },
]

describe('filterSchedule', () => {
  it('matches the content regardless of case and dotted or dotless i', () => {
    expect(filterSchedule(groups, 'INFLYASIYA')).toEqual([{ ...groups[0], items: [groups[0]!.items[0]] }])
    expect(filterSchedule(groups, 'illik')[0]!.items.map((i) => i.id)).toEqual([1])
  })

  it('searches the content only, not the group name', () => {
    expect(filterSchedule(groups, 'qrupu')).toEqual([])
  })

  it('ignores surrounding spaces and keeps everything for a blank query', () => {
    expect(filterSchedule(groups, '  məzənnə ')[0]!.items.map((i) => i.id)).toEqual([2])
    expect(filterSchedule(groups, '   ')).toBe(groups)
  })

  it('leaves out groups without a match', () => {
    expect(filterSchedule(groups, 'aktlar').map((g) => g.id)).toEqual([2])
  })
})
