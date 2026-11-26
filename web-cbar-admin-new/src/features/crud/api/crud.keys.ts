/**
 * Query açar fabriki (B1): `[config.id]` kökü list, detail və lookup üçün ortaqdır —
 * `invalidateQueries({ queryKey: [id] })` hamısını yeniləyir.
 */

import type { ListParams } from '@/shared/crud/types'

export const crudKeys = (id: string) => ({
  all: [id] as const,
  list: (params: ListParams) => [id, 'list', params] as const,
  detail: (rowId: string | number) => [id, 'detail', String(rowId)] as const,
  options: () => [id, 'options'] as const,
})
