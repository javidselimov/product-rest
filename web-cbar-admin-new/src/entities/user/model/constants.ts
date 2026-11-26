/** User entity constants (spec 032). */

import type { RoleCode } from './types'

/** No `GET /roles` — fixed map in seed order (contracts/admin-api.md §9). */
export const ROLE_IDS: Record<RoleCode, number> = {
  admin: 1,
  moderator: 2,
  meas_manager: 3,
}
