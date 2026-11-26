/**
 * Desktop org-chart layout (spec 060): the tree alone — parent, sibling order, kind and the block's
 * `departmentsOpen` — decides where every card goes. No DOM; the widget renders the result.
 *
 * Rules L1–L11 are `specs/060-org-chart-auto-layout/contracts/layout-rules.md`. Only horizontal
 * geometry is computed here (card widths are fixed); heights come from the text and from open
 * dropdowns, so the widget leaves them to the CSS flow.
 */
import { CHART, COLUMN_STEP, ORG_CHART_KIND, SIDE_REACH, columnsWidth } from '../constants'

const { governor: GOVERNOR, deputy: DEPUTY, director: DIRECTOR, block: BLOCK, department: DEPARTMENT, group: GROUP } = ORG_CHART_KIND

/** What the layout needs from a node; the widget's card data satisfies it. */
export type OrgChartInput = {
  id: number
  parentId: number | null
  kind: number
  name: string
  role: string | null
  curatorDirect: boolean
  href: string | null
  departmentsOpen: boolean
}

export type TreeNode<T> = { node: T; children: TreeNode<T>[] }

/** Flat list → tree; order stays as listed, a node whose parent is missing becomes a root. */
export function buildTree<T extends { id: number; parentId: number | null }>(flat: readonly T[]): TreeNode<T>[] {
  const byId = new Map<number, TreeNode<T>>()
  for (const node of flat) byId.set(node.id, { node, children: [] })
  const roots: TreeNode<T>[] = []
  for (const item of byId.values()) {
    const parent = item.node.parentId == null ? undefined : byId.get(item.node.parentId)
    if (parent && parent !== item) parent.children.push(item)
    else roots.push(item)
  }
  return roots
}

export type ChartCard = Omit<OrgChartInput, 'parentId' | 'departmentsOpen'>

/** `plain` has no departments; `dropdown` opens on click (L9); `open` shows them always (L10). */
export type BlockMode = 'plain' | 'dropdown' | 'open'

export type ChartBlock = {
  card: ChartCard
  mode: BlockMode
  departments: ChartCard[]
  /** The deputy's side departments, when they join this always-open block's row (L7). */
  side: ChartCard[]
}

export type ColumnItem = { type: 'block'; block: ChartBlock } | { type: 'other'; card: ChartCard; children: ColumnItem[] }

/** A 68 px column: a director general and the blocks under them, or (head null) a block of its own. */
export type ChartColumn = { head: ChartCard | null; items: ColumnItem[] }

type GroupBase = {
  /** Left edge in the chart and width, px. */
  x: number
  width: number
  /** Left edge of the first column inside the group. */
  columnsLeft: number
  columns: ChartColumn[]
}

/** The governor's own director columns (Figma "Azər Ələsgərov"). */
export type DirectorsGroup = GroupBase & { type: 'directors' }

/**
 * A deputy over its columns. `row` deputies hang from the governor's bar; a `raised` one stands
 * higher and its `child` deputies hang from its own line (L5).
 */
export type DeputyGroup = GroupBase & {
  type: 'deputy'
  card: ChartCard
  role: 'row' | 'raised' | 'child'
  cardLeft: number
  /** Bar over the columns, relative to the group; null without columns. */
  columnBar: { from: number; to: number } | null
  /** Side departments as a column of their own (L7); empty when they joined an always-open block. */
  side: ChartCard[]
  sideJoinsOpenBlock: boolean
  /** Right edge of the side departments' line, relative to the group; null without side departments. */
  sideLineX: number | null
  /** Raised deputy: the line to its child deputies ends at this chart x (the last child's centre). */
  childLineTo: number | null
}

export type ChartGroup = DirectorsGroup | DeputyGroup

export type ChartLayout = {
  width: number
  governor: { card: ChartCard; left: number; listLeft: number; departments: ChartCard[] } | null
  /** Deputies' bar, chart x; null without deputies hanging from the governor. */
  bar: { from: number; to: number } | null
  /** The governor's "L" lines down to its own director columns (chart x of each column centre). */
  leftLink: { centers: number[] } | null
  groups: ChartGroup[]
  /** Roots other than the governor: plain columns under the chart, so nothing is lost (FR-002). */
  extraRoots: ChartColumn[]
}

type Tree = TreeNode<OrgChartInput>

const toCard = ({ id, kind, name, role, curatorDirect, href }: OrgChartInput): ChartCard => ({ id, kind, name, role, curatorDirect, href })
const isBlock = (t: Tree) => t.node.kind === BLOCK || t.node.kind === GROUP
const isDepartment = (t: Tree) => t.node.kind === DEPARTMENT

function blockItems(t: Tree): ColumnItem[] {
  const departments = t.children.filter(isDepartment).map((c) => toCard(c.node))
  let mode: BlockMode = 'plain'
  if (departments.length > 0) mode = t.node.departmentsOpen ? 'open' : 'dropdown'
  // Anything else under a block (L11) follows it in the column.
  const rest = t.children.filter((c) => !isDepartment(c)).flatMap(columnItems)
  return [{ type: 'block', block: { card: toCard(t.node), mode, departments, side: [] } }, ...rest]
}

function columnItems(t: Tree): ColumnItem[] {
  if (isBlock(t)) return blockItems(t)
  return [{ type: 'other', card: toCard(t.node), children: t.children.flatMap(columnItems) }]
}

/** A director heads its column (L8); any other child is a column of its own (L6, L11). */
function toColumn(t: Tree): ChartColumn {
  if (t.node.kind === DIRECTOR) return { head: toCard(t.node), items: t.children.flatMap(columnItems) }
  return { head: null, items: columnItems(t) }
}

const centerOf = (left: number, index: number) => left + index * COLUMN_STEP + CHART.columnWidth / 2

/** L7: side departments join the last column's always-open block when the column ends with one. */
function attachSide(columns: ChartColumn[], side: ChartCard[]): boolean {
  const last = columns.at(-1)?.items.at(-1)
  if (side.length === 0 || last?.type !== 'block' || last.block.mode !== 'open') return false
  last.block.side = side
  return true
}

function deputyGroup(t: Tree, role: DeputyGroup['role'], x: number): DeputyGroup {
  const columns = t.children.filter((c) => c.node.kind !== DEPARTMENT && c.node.kind !== DEPUTY).map(toColumn)
  const sideCards = t.children.filter(isDepartment).map((c) => toCard(c.node))
  const joins = attachSide(columns, sideCards)
  const span = columnsWidth(columns.length)
  const base = Math.max(CHART.deputyWidth, span)
  const columnsLeft = (base - span) / 2
  const cardLeft = (base - CHART.deputyWidth) / 2
  const center = cardLeft + CHART.deputyWidth / 2
  const columnBar =
    columns.length > 0
      ? { from: Math.min(centerOf(columnsLeft, 0), center), to: Math.max(centerOf(columnsLeft, columns.length - 1), center) }
      : null
  // The side departments sit right of the last column, wherever the card's width put the columns.
  const sideLineX = sideCards.length > 0 ? columnsLeft + span + SIDE_REACH : null
  return {
    type: 'deputy',
    card: toCard(t.node),
    role,
    x,
    width: Math.max(base, sideLineX ?? 0),
    sideLineX,
    columnsLeft,
    cardLeft,
    columns,
    columnBar,
    side: joins ? [] : sideCards,
    sideJoinsOpenBlock: joins,
    childLineTo: null,
  }
}

const deputyCenter = (g: DeputyGroup) => g.x + g.cardLeft + CHART.deputyWidth / 2

function buildRow(governor: Tree): { groups: ChartGroup[]; departments: ChartCard[] } {
  const departments = governor.children.filter(isDepartment).map((c) => toCard(c.node))
  const own = governor.children.filter((c) => c.node.kind !== DEPARTMENT && c.node.kind !== DEPUTY).map(toColumn)
  const groups: ChartGroup[] = []
  let x = 0
  const next = (width: number) => {
    const left = x
    x += width + CHART.groupGap
    return left
  }
  if (own.length > 0) {
    const width = columnsWidth(own.length)
    groups.push({ type: 'directors', x: next(width), width, columnsLeft: 0, columns: own })
  }
  for (const deputy of governor.children.filter((c) => c.node.kind === DEPUTY)) {
    const children = deputy.children.filter((c) => c.node.kind === DEPUTY)
    const parent = deputyGroup(deputy, children.length > 0 ? 'raised' : 'row', x)
    next(parent.width)
    groups.push(parent)
    for (const child of children) {
      const group = deputyGroup(child, 'child', x)
      next(group.width)
      groups.push(group)
      parent.childLineTo = deputyCenter(group)
    }
  }
  return { groups, departments }
}

export function buildChartLayout(nodes: readonly OrgChartInput[]): ChartLayout {
  const roots = buildTree(nodes)
  const governor = roots.find((r) => r.node.kind === GOVERNOR) ?? null
  const extraRoots = roots.filter((r) => r !== governor).map(toColumn)
  if (!governor) return { width: columnsWidth(extraRoots.length), governor: null, bar: null, leftLink: null, groups: [], extraRoots }

  const { groups, departments } = buildRow(governor)
  const rowWidth = groups.length > 0 ? groups.at(-1)!.x + groups.at(-1)!.width : 0
  const center = Math.max(rowWidth / 2, CHART.governorWidth / 2)
  const left = center - CHART.governorWidth / 2
  const listLeft = left + CHART.governorWidth + CHART.listOffset

  const hanging = groups.filter((g): g is DeputyGroup => g.type === 'deputy' && g.role !== 'child').map(deputyCenter)
  const bar = hanging.length > 0 ? { from: Math.min(center, ...hanging), to: Math.max(center, ...hanging) } : null
  const directors = groups.find((g): g is DirectorsGroup => g.type === 'directors')
  const leftLink = directors ? { centers: directors.columns.map((_, i) => directors.x + centerOf(0, i)) } : null

  return {
    width: Math.max(rowWidth, departments.length > 0 ? listLeft + CHART.listWidth : 0, columnsWidth(extraRoots.length)),
    governor: { card: toCard(governor.node), left, listLeft, departments },
    bar,
    leftLink,
    groups,
    extraRoots,
  }
}
