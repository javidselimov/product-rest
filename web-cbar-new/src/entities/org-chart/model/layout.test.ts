import { describe, expect, it } from 'vitest'

import { figmaOrgChart } from '@/shared/testing/fixtures/org-chart-figma'

import { CHART } from '../constants'

import { buildChartLayout, buildTree, type ChartColumn, type ColumnItem, type OrgChartInput } from './layout'

const node = (id: number, parentId: number | null, kind: number, extra: Partial<OrgChartInput> = {}): OrgChartInput => ({
  id,
  parentId,
  kind,
  name: `n${id}`,
  role: null,
  curatorDirect: false,
  href: null,
  departmentsOpen: false,
  ...extra,
})

const chart = figmaOrgChart.map((n) => ({ ...n, href: null }))

function itemIds(items: readonly ColumnItem[]): number[] {
  return items.flatMap((item) =>
    item.type === 'block'
      ? [item.block.card.id, ...item.block.departments.map((d) => d.id), ...item.block.side.map((d) => d.id)]
      : [item.card.id, ...itemIds(item.children)],
  )
}
const columnIds = (column: ChartColumn) => [...(column.head ? [column.head.id] : []), ...itemIds(column.items)]

function allIds(nodes: readonly OrgChartInput[]): number[] {
  const layout = buildChartLayout(nodes)
  const ids = [
    ...(layout.governor ? [layout.governor.card.id, ...layout.governor.departments.map((d) => d.id)] : []),
    ...layout.groups.flatMap((g) => [
      ...(g.type === 'deputy' ? [g.card.id, ...g.side.map((d) => d.id)] : []),
      ...g.columns.flatMap(columnIds),
    ]),
    ...layout.extraRoots.flatMap(columnIds),
  ]
  return ids
}

describe('buildTree', () => {
  it('keeps the list order and turns an unknown parent into a root', () => {
    const roots = buildTree([node(1, null, 1), node(3, 1, 2), node(2, 1, 2), node(9, 77, 5)])
    expect(roots.map((r) => r.node.id)).toEqual([1, 9])
    expect(roots[0].children.map((c) => c.node.id)).toEqual([3, 2])
  })
})

describe('buildChartLayout — the Figma tree', () => {
  const layout = buildChartLayout(chart)

  it('shows every card exactly once (SC-001)', () => {
    const ids = allIds(chart)
    expect([...ids].sort((a, b) => a - b)).toEqual(chart.map((n) => n.id).sort((a, b) => a - b))
  })

  it('L1–L2: the governor with its departments as a list', () => {
    expect(layout.governor?.card.id).toBe(1)
    expect(layout.governor?.departments.map((d) => d.id)).toEqual([4, 5, 7, 8, 9])
  })

  it('L3–L5: the row is Azər, Əliyar (raised), Toğrul and Əli, Vüsal, Gülər', () => {
    expect(layout.groups.map((g) => (g.type === 'deputy' ? g.card.id : 'directors'))).toEqual(['directors', 2, 10, 11, 27, 31])
    const deputies = layout.groups.filter((g) => g.type === 'deputy')
    expect(deputies.map((g) => g.role)).toEqual(['raised', 'child', 'child', 'row', 'row'])
  })

  it('L6, L8: director columns with their blocks; a block under the deputy is a column of its own', () => {
    const vusal = layout.groups.find((g) => g.type === 'deputy' && g.card.id === 27)!
    expect(vusal.columns.map((c) => c.head?.id ?? null)).toEqual([28, null])
    expect(itemIds(vusal.columns[1].items)).toEqual([30])
    const azer = layout.groups[0]
    expect(azer.columns.map(columnIds)).toEqual([[12, 15, 16]])
  })

  it('L7, L10: Gülər’s side departments join the always-open block’s row', () => {
    const guler = layout.groups.find((g) => g.type === 'deputy' && g.card.id === 31)!
    expect(guler.type === 'deputy' && guler.side).toEqual([])
    const last = guler.columns.at(-1)!.items.at(-1)!
    expect(last.type === 'block' && last.block.mode).toBe('open')
    expect(last.type === 'block' && last.block.departments.map((d) => d.id)).toEqual([40, 41, 42, 43])
    expect(last.type === 'block' && last.block.side.map((d) => d.id)).toEqual([38, 39])
  })

  it('L9: a block with departments is a dropdown; one without is plain', () => {
    const toğrul = layout.groups.find((g) => g.type === 'deputy' && g.card.id === 10)!
    const [credit, monitoring] = toğrul.columns[0].items
    expect(credit.type === 'block' && credit.block.mode).toBe('dropdown')
    expect(credit.type === 'block' && credit.block.departments.map((d) => d.id)).toEqual([101, 102, 103])
    expect(monitoring.type === 'block' && monitoring.block.mode).toBe('plain')
  })

  it('places groups 5 apart and centres each deputy over its columns', () => {
    const [azer, aliyar, togrul, ali, vusal, guler] = layout.groups
    expect(azer.x).toBe(0)
    expect(azer.width).toBe(CHART.columnWidth)
    expect(aliyar.x).toBe(73)
    expect(togrul.x).toBe(223)
    expect(ali.x).toBe(373)
    expect(vusal.x).toBe(523)
    expect(guler.x).toBe(673)
    // Gülər: three columns (216) plus the side departments and their line (79).
    expect(guler.width).toBe(295)
    expect(guler.type === 'deputy' && guler.cardLeft).toBe(35.5)
    expect(layout.width).toBe(968)
  })

  it('draws the bars between the right centres', () => {
    expect(layout.governor?.left).toBe(351)
    expect(layout.governor?.listLeft).toBe(351 + 266 + 131)
    // From Əliyar's centre to Gülər's (both sides of the governor's 484).
    expect(layout.bar).toEqual({ from: 145.5, to: 781 })
    const aliyar = layout.groups[1]
    expect(aliyar.type === 'deputy' && aliyar.childLineTo).toBe(373 + 72.5)
    expect(layout.leftLink).toEqual({ centers: [34] })
  })
})

describe('buildChartLayout — combinations outside Figma (L11)', () => {
  it('keeps a department under a director, a block under the governor and a second root', () => {
    const nodes = [node(1, null, 1), node(2, 1, 3), node(3, 2, 5), node(4, 1, 4), node(5, null, 3)]
    expect([...allIds(nodes)].sort()).toEqual([1, 2, 3, 4, 5])
    const layout = buildChartLayout(nodes)
    expect(layout.extraRoots.map((c) => c.head?.id)).toEqual([5])
    expect(layout.groups[0].columns.map((c) => c.head?.id ?? null)).toEqual([2, null])
  })

  it('without a governor root, every root is a column below', () => {
    const layout = buildChartLayout([node(1, null, 2), node(2, 1, 3)])
    expect(layout.governor).toBeNull()
    expect(layout.extraRoots).toHaveLength(1)
    expect(allIds([node(1, null, 2), node(2, 1, 3)]).sort()).toEqual([1, 2])
  })

  it('ignores departmentsOpen on a kind other than block or group, and on a block without departments', () => {
    const nodes = [node(1, null, 1), node(2, 1, 3, { departmentsOpen: true }), node(3, 2, 4, { departmentsOpen: true })]
    const item = buildChartLayout(nodes).groups[0].columns[0].items[0]
    expect(item.type === 'block' && item.block.mode).toBe('plain')
  })

  it('a group (kind 6) behaves as a block', () => {
    const nodes = [node(1, null, 1), node(2, 1, 3), node(3, 2, 6, { departmentsOpen: true }), node(4, 3, 5)]
    const item = buildChartLayout(nodes).groups[0].columns[0].items[0]
    expect(item.type === 'block' && item.block.mode).toBe('open')
  })

  it('side departments without an always-open block stay a column of their own', () => {
    const nodes = [node(1, null, 1), node(2, 1, 2), node(3, 2, 3), node(4, 2, 5)]
    const group = buildChartLayout(nodes).groups[0]
    expect(group.type === 'deputy' && group.side.map((d) => d.id)).toEqual([4])
    expect(group.type === 'deputy' && group.sideJoinsOpenBlock).toBe(false)
  })
})
