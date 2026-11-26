/** Release schedule module ids and query keys: the same root as the engine keys (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const RELEASE_SCHEDULE_ITEMS_MODULE_ID = 'release-schedule-items'
export const RELEASE_SCHEDULE_GROUPS_MODULE_ID = 'release-schedule-groups'
export const RELEASE_SCHEDULE_PERIODICITIES_MODULE_ID = 'release-schedule-periodicities'

export const releaseScheduleItemsKeys = crudKeys(RELEASE_SCHEDULE_ITEMS_MODULE_ID)
