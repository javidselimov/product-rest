/** Ağac köməkçiləri (research R12): düzləşdirmə, nəsil id-ləri, TreeSelect məlumatı. */

import type { TreeSelectNode } from '@cbar/lib-react-ui-kit/tree-select'

import type { PageNode } from './schemas'

export interface FlatPage {
  node: PageNode
  depth: number
  descendantCount: number
}

export const countDescendants = (node: PageNode): number =>
  node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)

/**
 * `expanded` verilibsə, yalnız o id-lərin uşaqları sətirlərə düşür (qalanları
 * yığılı sayılır); verilməyibsə bütün ağac açılır.
 */
export function flattenTree(
  nodes: PageNode[],
  expanded?: ReadonlySet<number>,
  depth = 0,
  acc: FlatPage[] = [],
): FlatPage[] {
  for (const node of nodes) {
    acc.push({ node, depth, descendantCount: countDescendants(node) })
    if (!expanded || expanded.has(node.id))
      flattenTree(node.children, expanded, depth + 1, acc)
  }
  return acc
}

/** Düyün özü + bütün nəsilləri (köçürmədə dövrü istisna etmək üçün). */
export function descendantIds(
  node: PageNode,
  acc: Set<number> = new Set(),
): Set<number> {
  acc.add(node.id)
  for (const child of node.children) descendantIds(child, acc)
  return acc
}

export function findNode(nodes: PageNode[], id: number): PageNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

/** Kit `TreeSelect` üçün: `excluded` id-lər seçilə bilmir (özü və nəsilləri). */
export function toTreeSelectData(
  nodes: PageNode[],
  excluded: Set<number>,
  untitled: string,
): TreeSelectNode[] {
  return nodes.map((node) => ({
    value: node.id,
    title: node.title ?? untitled,
    disabled: excluded.has(node.id),
    children: toTreeSelectData(node.children, excluded, untitled),
  }))
}

export const canMove = (node: PageNode): boolean =>
  node.flags.movableU ||
  node.flags.movableD ||
  node.flags.movableL ||
  node.flags.movableR

/** Qonşular arasında sıra dəyişə bilir (`movable_u/d`, server `/move` ilə eyni qayda). */
export const canReorder = (node: PageNode): boolean =>
  node.flags.movableU || node.flags.movableD

/** Düyünün qonşuları (özü daxil), ekrandakı sıra ilə. */
export function siblingsOf(nodes: PageNode[], node: PageNode): PageNode[] {
  if (node.parentId === null) return nodes
  return findNode(nodes, node.parentId)?.children ?? []
}

export type DropPosition = 'before' | 'after'

export interface ReorderUpdate {
  node: PageNode
  sortOrder: number
}

/**
 * Sürüklənən düyünü `target`-in əvvəlinə/sonrasına qoymaq üçün lazım olan
 * `sortOrder` yazıları. Server `/move` yalnız bir düyünü yeniləyir, qonşuları
 * sürüşdürmür: qonşular arasında boş tam ədəd varsa, yalnız sürüklənən düyün
 * yazılır; yoxdursa, bütün qonşular 1..n kimi yenidən nömrələnir və yalnız
 * dəyəri dəyişənlər qaytarılır. Sıra dəyişmirsə boş massiv.
 */
export function planReorder(
  siblings: PageNode[],
  dragged: PageNode,
  target: PageNode,
  position: DropPosition,
): ReorderUpdate[] {
  if (dragged.id === target.id) return []
  const order = siblings.filter((s) => s.id !== dragged.id)
  const targetIndex = order.findIndex((s) => s.id === target.id)
  if (targetIndex === -1) return []
  const index = position === 'before' ? targetIndex : targetIndex + 1
  order.splice(index, 0, dragged)
  if (order.every((s, i) => s.id === siblings[i]?.id)) return []

  const prev = order[index - 1]
  const next = order[index + 1]
  let slot: number | null = null
  if (prev && next) {
    if (next.sortOrder - prev.sortOrder >= 2) slot = prev.sortOrder + 1
  } else if (prev) {
    slot = prev.sortOrder + 1
  } else if (next && next.sortOrder - 1 >= 0) {
    slot = next.sortOrder - 1
  }
  if (slot !== null) return [{ node: dragged, sortOrder: slot }]

  return order
    .map((node, i) => ({ node, sortOrder: i + 1 }))
    .filter((u) => u.node.sortOrder !== u.sortOrder)
}
