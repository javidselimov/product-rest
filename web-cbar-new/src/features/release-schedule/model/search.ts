/**
 * Search by content (spec 039 FR-016, research R4). The site filters the rows itself: there are a
 * few dozen, and Postgres `ILIKE` does not fold the Azerbaijani İ/ı pair without ICU.
 */
import { foldForSearch } from '@/shared/lib/search-fold'

import type { ReleaseScheduleGroup } from './schemas'

/** Rows whose content contains `q`; a group with no such row is left out. A blank `q` keeps all. */
export function filterSchedule(groups: ReleaseScheduleGroup[], q: string): ReleaseScheduleGroup[] {
  const needle = foldForSearch(q.trim())
  if (needle === '') return groups
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => foldForSearch(item.title).includes(needle)) }))
    .filter((group) => group.items.length > 0)
}
