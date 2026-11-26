import { describe, expect, it } from 'vitest'

import { chartInputs } from './chart-view'
import type { OrgChartNode } from './schemas'

const node = (over: Partial<OrgChartNode> & Pick<OrgChartNode, 'id'>): OrgChartNode => ({
  parentId: null,
  kind: 5,
  staffId: null,
  divisionId: null,
  curatorDirect: false,
  sortOrder: over.id,
  isActive: true,
  departmentsOpen: false,
  translations: {},
  linked: {},
  ...over,
})

const NO_LINKS = { staff: [], divisions: [] }

describe('chartInputs — the public filter of GET /organization/chart (FR-020)', () => {
  it('takes the own title, else the linked name; the own subtitle, else the linked role', () => {
    const nodes = [
      node({ id: 1, kind: 1, staffId: 7, linked: { az: { name: 'Taleh Kazımov', role: 'Sədr' } } }),
      node({ id: 2, parentId: 1, translations: { az: { title: 'Öz adı', subtitle: null } }, linked: { az: { name: 'Bağlı ad', role: null } } }),
    ]
    expect(chartInputs(nodes, NO_LINKS, 'az').map((n) => [n.id, n.name, n.role])).toEqual([
      [1, 'Taleh Kazımov', 'Sədr'],
      [2, 'Öz adı', null],
    ])
  })

  it('drops an inactive node, a node linked to an inactive record and a node without a name in the locale — with all their descendants', () => {
    const nodes = [
      node({ id: 1, kind: 1, translations: { az: { title: 'Sədr', subtitle: null }, en: { title: 'Governor', subtitle: null } } }),
      node({ id: 2, parentId: 1, isActive: false, translations: { az: { title: 'Deaktiv', subtitle: null } } }),
      node({ id: 3, parentId: 2, translations: { az: { title: 'Deaktivin uşağı', subtitle: null } } }),
      node({ id: 4, parentId: 1, staffId: 9, linked: { az: { name: 'Deaktiv əməkdaş', role: null } } }),
      node({ id: 5, parentId: 1, divisionId: 8, linked: { az: { name: 'Deaktiv şöbə', role: null } } }),
      node({ id: 6, parentId: 1, translations: { az: { title: 'Yalnız AZ', subtitle: null } } }),
      node({ id: 7, parentId: 6, translations: { en: { title: 'Under an AZ-only node', subtitle: null } } }),
    ]
    const links = { staff: [{ id: 9, isActive: false }], divisions: [{ id: 8, isActive: false }] }
    expect(chartInputs(nodes, links, 'az').map((n) => n.id)).toEqual([1, 6])
    expect(chartInputs(nodes, links, 'en').map((n) => n.id)).toEqual([1])
  })

  it('keeps departmentsOpen for a block or group only, and the API order', () => {
    const nodes = [
      node({ id: 3, kind: 4, departmentsOpen: true, translations: { az: { title: 'Blok', subtitle: null } } }),
      node({ id: 1, kind: 2, departmentsOpen: true, translations: { az: { title: 'Müavin', subtitle: null } } }),
    ]
    expect(chartInputs(nodes, NO_LINKS, 'az').map((n) => [n.id, n.departmentsOpen])).toEqual([
      [3, true],
      [1, false],
    ])
  })
})
