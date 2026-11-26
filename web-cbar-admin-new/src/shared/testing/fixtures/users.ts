import type { MockRow } from '../handlers/lib/crud-store'

/** Mock sətri = detail DTO (list DTO `roleId`/`updatedAt`-sız verilir). Şifrə heç vaxt saxlanmır. */
export interface UserMockRow extends MockRow {
  username: string
  email: string
  roleId: number
  roleCode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Seed-ə bənzər: `admin` (id 1, seed.sql), bir moderator, bir MEAS meneceri. */
export const userFixtures: UserMockRow[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@cbar.az',
    roleId: 1,
    roleCode: 'admin',
    isActive: true,
    createdAt: '2026-01-05T09:00:00+00:00',
    updatedAt: '2026-01-05T09:00:00+00:00',
  },
  {
    id: 2,
    username: 'aysel.m',
    email: 'aysel.m@cbar.az',
    roleId: 2,
    roleCode: 'moderator',
    isActive: true,
    createdAt: '2026-01-12T10:30:00+00:00',
    updatedAt: '2026-02-01T08:15:00+00:00',
  },
  {
    id: 3,
    username: 'meas.user',
    email: 'meas.user@cbar.az',
    roleId: 3,
    roleCode: 'meas_manager',
    isActive: false,
    createdAt: '2026-01-20T14:00:00+00:00',
    updatedAt: '2026-01-20T14:00:00+00:00',
  },
]
