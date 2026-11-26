/**
 * Year order of the cooperation tables (specs 045, 046): "newest first" / "oldest first".
 *
 * The choice is the page's `sort` search parameter. The memorandum and the membership tables read it,
 * so one link order works the same on both pages.
 */

export const YEAR_SORT = { NEWEST: 'newest', OLDEST: 'oldest' } as const

export type YearSort = (typeof YEAR_SORT)[keyof typeof YEAR_SORT]

/** The `sort` search parameter; anything but `oldest` is the default order. */
export function parseYearSort(value: string | string[] | undefined): YearSort {
  return value === YEAR_SORT.OLDEST ? YEAR_SORT.OLDEST : YEAR_SORT.NEWEST
}

/**
 * Rows by year, newest or oldest first. The sort is stable, so rows of one year keep the editor's
 * order in both directions, and rows without a year stay at the end of either order.
 */
export function orderByYear<T>(rows: readonly T[], yearOf: (row: T) => number | null, sort: YearSort): T[] {
  const direction = sort === YEAR_SORT.OLDEST ? 1 : -1
  return [...rows].sort((a, b) => {
    const yearA = yearOf(a)
    const yearB = yearOf(b)
    if (yearA === yearB) return 0
    if (yearA === null) return 1
    if (yearB === null) return -1
    return (yearA - yearB) * direction
  })
}
