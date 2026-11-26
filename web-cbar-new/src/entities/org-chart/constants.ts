/**
 * Desktop org-chart geometry (spec 060, spec 032), in CSS pixels, from Figma `2007:86378` (structure, 971×771)
 * read with figma_node on 2026-11-26. The rules that use them are
 * `specs/060-org-chart-auto-layout/contracts/layout-rules.md`.
 */
/** `kind` of an org-chart node (api-cbar `OrgChartKind`). */
export const ORG_CHART_KIND = { governor: 1, deputy: 2, director: 3, block: 4, department: 5, group: 6 } as const

export const CHART = {
  /** Governor card `2007:86445`. */
  governorWidth: 266,
  governorMinHeight: 98,
  /** Governor's department list `2007:86453`: rows 213 wide, 4 apart, 131 right of the governor card. */
  listWidth: 213,
  listGap: 4,
  listOffset: 131,
  /** The list's comb runs this far left of the list (`Line 26`); each row gets a tick of the same length. */
  combOffset: 29,
  /** Governor row bottom (list bottom 804) → the deputies' bar (`Line 3`, y 829). */
  barBelowRow: 25,
  /** Deputy card `2007:86415`. */
  deputyWidth: 145,
  deputyMinHeight: 100,
  /** Bar → deputy top: 137 for the row (966), 57 for a deputy raised above its child deputies (Əliyar, 886). */
  deputyDrop: 137,
  raisedDeputyDrop: 57,
  /** A raised deputy's line to its child deputies leaves its right edge this far below its top (`Line 38`, 920). */
  childLineTop: 34,
  /** Deputy bottom (1066) → its columns' top (1119); the bar over the columns sits this far above them (`Group 6`). */
  columnsBelowDeputy: 53,
  columnBarAbove: 18,
  /** Director-general column: 68 wide, 6 apart (Gülər, Vüsal), items 10 apart (column frames' itemSpacing). */
  columnWidth: 68,
  columnGap: 6,
  columnItemGap: 10,
  directorMinHeight: 68,
  /** Deputy groups and the governor's director column sit in one row, 5 apart (14460 → 14465 → 14615 …). */
  groupGap: 5,
  /** Always-open block (`2007:86471`): card 37 high, its row of departments 8 below, departments 8 apart. */
  openBlockMinHeight: 37,
  openRowGap: 8,
  openListGap: 8,
  /** A deputy's side departments: 4 right of the last column, their line 7 right of them (`Line 39–41`). */
  sideGap: 4,
  sideLineOffset: 7,
  /**
   * Dropdown list under an open block (R6, measured on the Figma open state, 2026-11-26): 8 below the block, departments
   * 4 apart — tighter than the always-open row (8).
   */
  dropdownGap: 8,
  dropdownItemGap: 4,
} as const

/** Width of `count` director columns side by side. */
export const columnsWidth = (count: number): number => (count > 0 ? count * CHART.columnWidth + (count - 1) * CHART.columnGap : 0)

/** Horizontal step from one column's left edge to the next. */
export const COLUMN_STEP = CHART.columnWidth + CHART.columnGap

/** How far a deputy's side departments and their line reach right of its columns. */
export const SIDE_REACH = CHART.sideGap + CHART.columnWidth + CHART.sideLineOffset

/** The raised deputy's lead over the row (966 − 886). */
export const RAISE = CHART.deputyDrop - CHART.raisedDeputyDrop

/** Spacer above the governor's own director columns, so their tops line up with the deputies' columns. */
export const DIRECTORS_SPACER = CHART.deputyDrop + CHART.deputyMinHeight + CHART.columnsBelowDeputy

/** Spacer above a block that reports to a deputy directly: it starts level with the blocks under a director. */
export const DIRECT_BLOCK_SPACER = CHART.directorMinHeight + CHART.columnItemGap
