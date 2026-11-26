import { describe, expect, it } from 'vitest'

import { DEFAULT_PAGE_FLAGS, type PageNode } from './schemas'
import {
  canMove,
  descendantIds,
  findNode,
  flattenTree,
  planReorder,
  siblingsOf,
  toTreeSelectData,
} from './tree'

const node = (id: number, children: PageNode[] = [], flags = {}): PageNode => ({
  id,
  parentId: null,
  sortOrder: id,
  status: 'published',
  title: `S${id}`,
  slug: `s${id}`,
  navUrl: null,
  flags: { ...DEFAULT_PAGE_FLAGS, ...flags },
  children,
})

const tree = [node(1, [node(2, [node(3)]), node(4)]), node(5)]

describe('səhifə ağacı köməkçiləri', () => {
  it('flattenTree dərinlik və nəsil sayı verir', () => {
    const flat = flattenTree(tree)
    expect(flat.map((f) => [f.node.id, f.depth, f.descendantCount])).toEqual([
      [1, 0, 3],
      [2, 1, 1],
      [3, 2, 0],
      [4, 1, 0],
      [5, 0, 0],
    ])
  })

  it('descendantIds özünü və nəsilləri toplayır; findNode dərin tapır', () => {
    expect([...descendantIds(tree[0])].sort()).toEqual([1, 2, 3, 4])
    expect(findNode(tree, 3)?.title).toBe('S3')
    expect(findNode(tree, 99)).toBeNull()
  })

  it('toTreeSelectData istisna id-ləri disabled edir', () => {
    const data = toTreeSelectData(tree, descendantIds(tree[0]), '—')
    expect(data[0].disabled).toBe(true)
    expect(data[0].children?.[0].disabled).toBe(true)
    expect(data[1].disabled).toBe(false)
  })

  it('canMove bayraqlara baxır', () => {
    expect(canMove(node(1))).toBe(true)
    expect(
      canMove(
        node(1, [], {
          movableU: false,
          movableD: false,
          movableL: false,
          movableR: false,
        }),
      ),
    ).toBe(false)
  })
})

describe('planReorder (sürüklə-burax sırası)', () => {
  const at = (id: number, sortOrder: number): PageNode => ({
    ...node(id),
    sortOrder,
  })
  const summary = (updates: ReturnType<typeof planReorder>) =>
    updates.map((u) => [u.node.id, u.sortOrder])

  it('arada boş ədəd varsa yalnız sürüklənən yazılır', () => {
    const s = [at(1, 10), at(2, 20), at(3, 30)]
    expect(summary(planReorder(s, s[2]!, s[0]!, 'after'))).toEqual([[3, 11]])
  })

  it('sona və başa: qonşunun ±1-i', () => {
    const s = [at(1, 1), at(2, 2), at(3, 3)]
    expect(summary(planReorder(s, s[0]!, s[2]!, 'after'))).toEqual([[1, 4]])
    const g = [at(1, 5), at(2, 6)]
    expect(summary(planReorder(g, g[1]!, g[0]!, 'before'))).toEqual([[2, 4]])
  })

  it('boşluq yoxdursa 1..n yenidən nömrələnir, yalnız dəyişənlər qaytarılır', () => {
    const s = [at(1, 1), at(2, 2), at(3, 3), at(4, 4)]
    // 4-ü 1 ilə 2 arasına: [1,4,2,3] → 4→2, 2→3, 3→4; 1 dəyişmir.
    expect(summary(planReorder(s, s[3]!, s[0]!, 'after'))).toEqual([
      [4, 2],
      [2, 3],
      [3, 4],
    ])
  })

  it('bərabər sortOrder-lər də yenidən nömrələnir', () => {
    const s = [at(1, 0), at(2, 0), at(3, 0)]
    expect(summary(planReorder(s, s[2]!, s[0]!, 'before'))).toEqual([
      [3, 1],
      [1, 2],
      [2, 3],
    ])
  })

  it('sıra dəyişmirsə və ya hədəf özüdürsə boşdur', () => {
    const s = [at(1, 1), at(2, 2)]
    expect(planReorder(s, s[0]!, s[1]!, 'before')).toEqual([])
    expect(planReorder(s, s[0]!, s[0]!, 'after')).toEqual([])
  })

  it('siblingsOf kök və uşaq qonşularını verir', () => {
    expect(siblingsOf(tree, tree[1]!).map((n) => n.id)).toEqual([1, 5])
    const child = { ...node(4), parentId: 1 }
    expect(siblingsOf(tree, child).map((n) => n.id)).toEqual([2, 4])
  })
})
