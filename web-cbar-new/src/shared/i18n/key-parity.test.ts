/**
 * Açar pariteti (SC-005, FR-019).
 *
 * `az` və `en` açar dəstləri **eyni** olmalıdır: bir dildə əlavə edilib
 * digərində unudulan açar UI-da tərcüməsiz mətn kimi görünür.
 */
import { describe, expect, it } from 'vitest'

import { NAMESPACES, SUPPORTED_LANGUAGES, resources } from './index'

type JsonTree = { [key: string]: string | JsonTree }

/** İç-içə obyekti `a.b.c` formasında düz siyahıya çevirir. */
function flatten(tree: JsonTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' ? [path] : flatten(value, path)
  })
}

describe('locale açarları', () => {
  it.each(NAMESPACES)('%s namespace-i hər iki dildə eyni açar dəstinə malikdir', (ns) => {
    const az = flatten(resources.az[ns] as unknown as JsonTree).sort()
    const en = flatten(resources.en[ns] as unknown as JsonTree).sort()

    expect(en).toEqual(az)
  })

  it('hər dildə bütün namespace-lər mövcuddur', () => {
    for (const locale of SUPPORTED_LANGUAGES) {
      expect(Object.keys(resources[locale]).sort()).toEqual([...NAMESPACES].sort())
    }
  })

  it('heç bir tərcümə boş deyil', () => {
    for (const locale of SUPPORTED_LANGUAGES) {
      for (const ns of NAMESPACES) {
        const tree = resources[locale][ns] as unknown as JsonTree
        for (const key of flatten(tree)) {
          const value = key
            .split('.')
            .reduce<string | JsonTree>((node, part) => (node as JsonTree)[part], tree)
          expect(String(value).trim(), `${locale}:${ns}.${key}`).not.toBe('')
        }
      }
    }
  })
})
