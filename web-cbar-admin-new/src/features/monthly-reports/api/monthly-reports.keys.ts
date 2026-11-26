/** Monthly reports module id and query keys (spec 052): the module id is the engine's key root (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const MONTHLY_REPORTS_MODULE_ID = 'monthly-reports'

export const monthlyReportsKeys = crudKeys(MONTHLY_REPORTS_MODULE_ID)

export const monthlyReportsLookupKeys = {
  /** The fixed series list; seeded by migration, so it never changes with the reports. */
  series: () => ['monthly-report-series'] as const,
}
