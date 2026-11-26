/**
 * Shared layout numbers of the panel UI (spec 032): table column widths used
 * by more than one module, pagination window size, skeleton counts.
 */

/** Pixel widths of recurring `DataTable` columns. */
export const COLUMN_WIDTH = {
  /** Narrow numeric id. */
  ID: 60,
  /** Id in dense lists (laws, MEAS, organization, money marks). */
  ID_WIDE: 72,
  /** Single icon action, `sortOrder`, short flags. */
  ICON: 72,
  /** Year, sort order, small numbers. */
  NUMBER_SM: 80,
  /** Sort order with align=right. */
  NUMBER_MD: 90,
  /** Currency code, nominal, sort order in money marks. */
  CODE: 96,
  /** Counts (image count, points). */
  COUNT: 110,
  /** Month, value, count with wider header. */
  NUMBER_LG: 120,
  /** Date, badge, edit/delete actions. */
  ACTIONS: 140,
  /** Status badges row. */
  STATUS: 180,
} as const

/** Edit/delete column added by `CrudListPage`. */
export const ACTIONS_COLUMN_WIDTH = COLUMN_WIDTH.ACTIONS

/** `ListPagination` shows at most this many page items (1 … p-1 p p+1 … N). */
export const PAGINATION_WINDOW = 7

/** Nested lists indent children by this many pixels per depth level. */
export const TREE_INDENT_PX = 20
