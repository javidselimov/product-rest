/**
 * Org chart mocks — the real contract (api-cbar-admin openapi `paths/organization.yaml#/chart*`,
 * spec 027, spec 060): flat `array` list by sortOrder then id; POST 201 / PUT 200 return the node with
 * `linked` texts resolved from the staff/division stores; PUT never touches the position, and an omitted or
 * null `departmentsOpen` keeps the stored value (true only for a block or group, else 400); DELETE 409 while
 * the node has children; `PUT /order` 204, 400 unless `ids` are exactly the parent's children, 404 for an
 * unknown parent; `PUT /layout` (deprecated) 204, 400 on an unknown or repeated id. 400s use the `{message}`
 * problem shape like the real API.
 */

import { HttpResponse, http } from 'msw'

import { orgChartFixtures, type OrgChartMock } from '../fixtures/org-chart'
import { message, noContent, problem404 } from './lib/errors'
import { divisionsStore, staffStore } from './organization'

const BASE = '/api/v1/organization/chart'

let rows: OrgChartMock[] = structuredClone(orgChartFixtures)

export const orgChartStore = {
  all: () => rows,
  reset: (seed: OrgChartMock[] = orgChartFixtures) => {
    rows = structuredClone(seed)
  },
}

function linked(row: OrgChartMock) {
  if (row.staffId !== null) {
    const staff = staffStore.store.get(row.staffId)
    const result: Record<string, { name: string; role: string | null }> = {}
    for (const [locale, tr] of Object.entries(staff?.translations ?? {}))
      if (tr) result[locale] = { name: tr.fullName, role: tr.position ?? null }
    return result
  }
  if (row.divisionId !== null) {
    const division = divisionsStore.store.get(row.divisionId)
    const result: Record<string, { name: string; role: null }> = {}
    for (const [locale, tr] of Object.entries(division?.translations ?? {})) if (tr) result[locale] = { name: tr.name, role: null }
    return result
  }
  return {}
}

const dto = (row: OrgChartMock) => ({ ...row, linked: linked(row) })
const sorted = () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)

// Spelled out: `Omit` over MockRow's index signature would drop the typed fields.
interface Body {
  parentId: number | null
  kind: number
  staffId: number | null
  divisionId: number | null
  curatorDirect: boolean
  sortOrder: number
  isActive: boolean
  translations: OrgChartMock['translations']
  departmentsOpen?: boolean | null
}

const OPEN_KINDS = new Set([4, 6])

function validate(body: Body, id: number | null): Response | null {
  if (!Number.isInteger(body.kind) || body.kind < 1 || body.kind > 6) return message(400, 'Kind must be 1–6.')
  if (body.staffId !== null && body.divisionId !== null) return message(400, 'Link a staff member or a division, not both.')
  if (body.departmentsOpen === true && !OPEN_KINDS.has(body.kind))
    return message(400, 'Only a block or a group can show its departments always open.')
  const titled = Object.values(body.translations ?? {}).some((tr) => tr?.title?.trim())
  if (body.staffId === null && body.divisionId === null && !titled)
    return message(400, 'A node without a linked staff member or division needs a title.')
  if (body.parentId !== null) {
    if (!rows.some((r) => r.id === body.parentId)) return message(400, 'Parent node not found.')
    for (let cursor: number | null = body.parentId; cursor !== null; cursor = rows.find((r) => r.id === cursor)?.parentId ?? null)
      if (cursor === id) return message(400, 'A node cannot be placed under itself or one of its descendants.')
  }
  return null
}

const normalize = (body: Body): Body => ({
  parentId: body.parentId ?? null,
  kind: body.kind,
  staffId: body.staffId ?? null,
  divisionId: body.divisionId ?? null,
  curatorDirect: body.curatorDirect,
  sortOrder: body.sortOrder,
  isActive: body.isActive,
  translations: body.translations ?? {},
  departmentsOpen: body.departmentsOpen ?? null,
})

/** Null keeps the stored value, like the API. */
const withOpen = (body: Body, stored: boolean) => {
  const { departmentsOpen, ...rest } = body
  return { ...rest, departmentsOpen: departmentsOpen ?? stored }
}

export const orgChartHandlers = [
  http.get(BASE, () => HttpResponse.json(sorted().map(dto))),

  http.post(BASE, async ({ request }) => {
    const body = normalize((await request.json()) as Body)
    const invalid = validate(body, null)
    if (invalid) return invalid
    const row: OrgChartMock = {
      ...withOpen(body, false),
      id: rows.reduce((max, r) => Math.max(max, r.id), 0) + 1,
      layout: null,
      connector: null,
      updatedAt: new Date().toISOString(),
    }
    rows.push(row)
    return HttpResponse.json(dto(row), { status: 201, headers: { Location: `${BASE}/${row.id}` } })
  }),

  // Registered before `/:id` so "order" and "layout" are not read as ids.
  http.put(`${BASE}/order`, async ({ request }) => {
    const { parentId, ids } = (await request.json()) as { parentId: number | null; ids: number[] }
    if (parentId !== null && !rows.some((r) => r.id === parentId)) return problem404()
    const children = rows.filter((r) => r.parentId === parentId).map((r) => r.id)
    const same = ids.length === children.length && new Set(ids).size === ids.length && ids.every((id) => children.includes(id))
    if (!same) return message(400, 'Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır. Səhifəni yeniləyib yenidən cəhd edin.')
    rows = rows.map((r) => (ids.includes(r.id) ? { ...r, sortOrder: ids.indexOf(r.id) + 1 } : r))
    return noContent()
  }),

  http.put(`${BASE}/layout`, async ({ request }) => {
    const { items } = (await request.json()) as { items: Pick<OrgChartMock, 'id' | 'layout' | 'connector'>[] }
    const ids = items.map((i) => i.id)
    if (items.length === 0) return message(400, 'At least one item is required.')
    if (new Set(ids).size !== ids.length) return message(400, 'Each node id may appear only once.')
    const unknown = ids.filter((i) => !rows.some((r) => r.id === i))
    if (unknown.length > 0) return message(400, `Unknown node id(s): ${unknown.join(', ')}.`)
    rows = rows.map((r) => {
      const item = items.find((i) => i.id === r.id)
      return item ? { ...r, layout: item.layout, connector: item.connector } : r
    })
    return noContent()
  }),

  http.put(`${BASE}/:id`, async ({ params, request }) => {
    const id = Number(params.id)
    const existing = rows.find((r) => r.id === id)
    if (!existing) return problem404()
    const body = normalize((await request.json()) as Body)
    const invalid = validate(body, id)
    if (invalid) return invalid
    const row: OrgChartMock = { ...existing, ...withOpen(body, existing.departmentsOpen), updatedAt: new Date().toISOString() }
    rows = rows.map((r) => (r.id === id ? row : r))
    return HttpResponse.json(dto(row))
  }),

  http.delete(`${BASE}/:id`, ({ params }) => {
    const id = Number(params.id)
    if (!rows.some((r) => r.id === id)) return problem404()
    if (rows.some((r) => r.parentId === id)) return message(409, 'The node still has child nodes; move or delete them first.')
    rows = rows.filter((r) => r.id !== id)
    return noContent()
  }),
]
