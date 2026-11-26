/** Event constants (spec 032, spec 034). */

/** `type` as stored by the API. */
export const EVENT_TYPE = {
  DECISION: 1,
  PRESS_CONFERENCE: 2,
  CONFERENCE: 3,
  SEMINAR: 4,
} as const

/** The API caps paged lists at 100; a linked item further back keeps its name from the detail. */
export const EVENT_LINK_PAGE_SIZE = 100

export const CATEGORY_SORT_ORDER_WIDTH = 90
