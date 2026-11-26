/** Page tree UI constants (spec 032). */

/** Indent per tree depth (rem). */
export const TREE_INDENT_REM = 1.25

export const COLUMN_WIDTH = {
  NAV_URL: 220,
  STATUS: 180,
  SORT_ORDER: 80,
  ACTIONS: 170,
} as const

/** Horizontal scroll appears only when the container is narrower than this (px). */
export const TREE_MIN_WIDTH = 880

/** Longest menu group label: the API column is varchar(120) (spec 054 data-model). */
export const MENU_GROUP_MAX_LENGTH = 120
