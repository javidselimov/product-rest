/**
 * The panel's "Sxem" view (spec 060, US4, FR-020): the admin list → what the public site would draw. It repeats
 * api-cbar `OrganizationController.GetChart`: a node is left out when it is inactive, linked to an inactive staff
 * member or division, or has no name in the locale (its own title, else the linked record's name) — and so is its
 * whole branch. Name and role are picked as there; `href` is null (the panel opens the form instead).
 */

import type { Locale } from '@/entities/content/model/types'

import type { OrgChartInput } from '../chart/model/layout'
import { DEPARTMENTS_OPEN_KINDS } from './constants'
import type { OrgChartNode } from './schemas'

export interface ChartLinkStates {
  staff: readonly { id: number; isActive: boolean }[]
  divisions: readonly { id: number; isActive: boolean }[]
}

const inactiveIds = (records: ChartLinkStates['staff']) => new Set(records.filter((r) => !r.isActive).map((r) => r.id))

export function chartInputs(nodes: readonly OrgChartNode[], links: ChartLinkStates, locale: Locale): OrgChartInput[] {
  const inactiveStaff = inactiveIds(links.staff)
  const inactiveDivisions = inactiveIds(links.divisions)

  const shown = new Map<number, OrgChartInput>()
  for (const n of nodes) {
    if (!n.isActive) continue
    if (n.staffId !== null && inactiveStaff.has(n.staffId)) continue
    if (n.divisionId !== null && inactiveDivisions.has(n.divisionId)) continue
    const own = n.translations[locale]
    const linked = n.linked[locale]
    const name = own?.title ?? linked?.name ?? null
    if (name === null) continue
    shown.set(n.id, {
      id: n.id,
      parentId: n.parentId,
      kind: n.kind,
      name,
      role: own?.subtitle ?? linked?.role ?? null,
      curatorDirect: n.curatorDirect,
      href: null,
      departmentsOpen: n.departmentsOpen && DEPARTMENTS_OPEN_KINDS.includes(n.kind),
    })
  }

  // A node stays only when its whole chain up to a root stays (cycles cannot be saved, but stay safe).
  const kept = new Map<number, boolean>()
  const isKept = (id: number, seen = new Set<number>()): boolean => {
    const known = kept.get(id)
    if (known !== undefined) return known
    const parentId = shown.get(id)?.parentId ?? null
    const result = parentId === null || (shown.has(parentId) && !seen.has(parentId) && isKept(parentId, seen.add(id)))
    kept.set(id, result)
    return result
  }

  return [...shown.values()].filter((n) => isKept(n.id))
}
