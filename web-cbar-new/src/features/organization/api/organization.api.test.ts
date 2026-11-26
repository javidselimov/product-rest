import { describe, expect, it } from 'vitest'

import { initials, isBoard } from '../model/schemas'
import { getDivisions, getOffices, getStaff, getStaffMember } from './organization.api'

describe('organization api', () => {
  it('type parametri ilə heyət, tipsiz hamısı', async () => {
    expect(await getStaff('az', 1)).toHaveLength(2)
    expect(await getStaff('az', 2)).toHaveLength(1)
    expect(await getStaff('az', 3)).toHaveLength(1)
    expect(await getStaff('az')).toHaveLength(4)
  })

  it('əməkdaş; 404 → null', async () => {
    expect((await getStaffMember('az', 1))?.fullName).toBe('Taleh Kazımov')
    await expect(getStaffMember('az', 99)).resolves.toBeNull()
  })

  it('şöbələr və ofislər', async () => {
    expect(await getDivisions('az')).toHaveLength(2)
    expect(await getOffices('az')).toHaveLength(2)
  })

  it('köməkçilər', () => {
    expect(isBoard(1)).toBe(true)
    expect(isBoard(2)).toBe(false)
    expect(initials('Taleh Kazımov')).toBe('TK')
    expect(initials(null)).toBe('•')
  })
})
