/**
 * Tree helpers for the org chart editor (spec 027): the flat API list → indented rows, the
 * parent picker (a node and its descendants are disabled, so no cycle can be chosen), and the
 * display title the public site would show.
 */

import type { TreeSelectNode } from '@cbar/lib-react-ui-kit/tree-select'

import type { Locale } from '@/entities/content/model/types'
import type { OrgChartNode } from './schemas'

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

/** What the public card shows: the override, else the linked record, else the other locale. */
export function nodeTitle(node: OrgChartNode, locale: Locale, fallback: string): string {
  const other: Locale = locale === 'az' ? 'en' : 'az'
  return (
    node.translations[locale]?.title ??
    node.linked[locale]?.name ??
    node.translations[other]?.title ??
    node.linked[other]?.name ??
    fallback
  )
}

export interface OrgChartRow {
  node: OrgChartNode
  depth: number
}

/** Depth-first rows in API order (sortOrder, then id). */
export function flattenChart(nodes: OrgChartNode[]): OrgChartRow[] {
  const rows: OrgChartRow[] = []
  const walk = (items: TreeNode<OrgChartNode>[], depth: number) => {
    for (const item of items) {
      rows.push({ node: item.node, depth })
      walk(item.children, depth + 1)
    }
  }
  walk(buildTree(nodes), 0)
  return rows
}

/** The node itself and every descendant. */
export function descendantIds(nodes: OrgChartNode[], id: number): Set<number> {
  const result = new Set([id])
  let grew = true
  while (grew) {
    grew = false
    for (const n of nodes) {
      if (n.parentId !== null && result.has(n.parentId) && !result.has(n.id)) {
        result.add(n.id)
        grew = true
      }
    }
  }
  return result
}

export function toTreeSelectData(
  nodes: OrgChartNode[],
  excluded: Set<number>,
  title: (node: OrgChartNode) => string,
): TreeSelectNode[] {
  const map = (items: TreeNode<OrgChartNode>[]): TreeSelectNode[] =>
    items.map((item) => ({
      value: item.node.id,
      title: title(item.node),
      disabled: excluded.has(item.node.id),
      children: map(item.children),
    }))
  return map(buildTree(nodes))
}
