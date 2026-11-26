/**
 * List filter values (spec 029, spec 035). Kept out of `list-filter.tsx`: that module is
 * `'use client'`, and a function imported from it into a server loader is a client reference.
 */
/** Shared with `ListFilterSkeleton`, so the two cannot drift apart (spec 036). */
export const LIST_FILTER_CLASS = 'flex flex-col gap-4 desk:flex-row desk:items-start desk:justify-between desk:gap-6'
export const LIST_FILTER_FIELDS_CLASS = 'flex flex-col gap-4 desk:flex-row desk:gap-6'

export type ListFilterValues = { q: string; from: string | undefined; to: string | undefined }

/** True when any filter is set — lists use it to pick "no results" over "empty". */
export function hasListFilters(filters: ListFilterValues): boolean {
  return filters.q !== '' || filters.from !== undefined || filters.to !== undefined
}
