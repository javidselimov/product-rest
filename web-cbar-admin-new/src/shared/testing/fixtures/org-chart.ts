/**
 * Org chart samples (spec 027, spec 060): the governor (linked to staff 1), a department under
 * him (linked to division 1, directly under the curator) and a free-text block. `layout` and
 * `connector` are deprecated but the API still returns them.
 */

import type { MockRow } from '../handlers/lib/crud-store'

export interface OrgChartMock extends MockRow {
  parentId: number | null
  kind: number
  staffId: number | null
  divisionId: number | null
  curatorDirect: boolean
  sortOrder: number
  isActive: boolean
  departmentsOpen: boolean
  layout: { x: number; y: number; w: number; h: number } | null
  connector: [number, number][] | null
  updatedAt: string
  translations: Partial<Record<'az' | 'en', { title: string | null; subtitle: string | null }>>
}

export const orgChartFixtures: OrgChartMock[] = [
  {
    id: 1,
    parentId: null,
    kind: 1,
    staffId: 1,
    divisionId: null,
    curatorDirect: false,
    sortOrder: 1,
    isActive: true,
    departmentsOpen: false,
    layout: { x: 355, y: 21, w: 266, h: 98 },
    connector: null,
    updatedAt: '2026-10-29T09:00:00+00:00',
    translations: {},
  },
  {
    id: 2,
    parentId: 1,
    kind: 5,
    staffId: null,
    divisionId: 1,
    curatorDirect: true,
    sortOrder: 1,
    isActive: true,
    departmentsOpen: false,
    layout: { x: 752, y: 0, w: 213, h: 34 },
    connector: null,
    updatedAt: '2026-10-29T09:00:00+00:00',
    translations: {},
  },
  {
    id: 3,
    parentId: 1,
    kind: 4,
    staffId: null,
    divisionId: null,
    curatorDirect: false,
    sortOrder: 2,
    isActive: true,
    departmentsOpen: false,
    layout: null,
    connector: null,
    updatedAt: '2026-10-29T09:00:00+00:00',
    translations: { az: { title: 'Hüquq bloku', subtitle: null }, en: { title: 'Legal block', subtitle: null } },
  },
]
