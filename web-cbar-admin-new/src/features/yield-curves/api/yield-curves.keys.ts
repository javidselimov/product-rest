/** Gəlirlik əyrisi açarları — hər data dəsti öz CRUD modul köküdür (siyahı + silmə mühərrikdən). */

import { crudKeys } from '@/features/crud/api/crud.keys'
import type { YieldCurveDataset } from '../model/schemas'

export const YIELD_CURVE_MODULE_IDS = {
  yields: 'yield-curve-yields',
  parameters: 'yield-curve-parameters',
  periods: 'yield-curve-periods',
} as const satisfies Record<YieldCurveDataset, string>

export const yieldCurveKeys = (dataset: YieldCurveDataset) =>
  crudKeys(YIELD_CURVE_MODULE_IDS[dataset])

export const yieldCurvePointsKey = (date: string) =>
  [...yieldCurveKeys('yields').all, 'points', date] as const
