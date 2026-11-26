/** İnflyasiya açarları — CRUD mühərriki ilə eyni kök (`crudKeys('inflation')`). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const INFLATION_MODULE_ID = 'inflation'

export const inflationKeys = {
  ...crudKeys(INFLATION_MODULE_ID),
  /** Ayrı kök: seriya upsert-inin invalidasiyası açıq formanı yenidən yükləməsin. */
  settings: ['inflation-settings'] as const,
}
