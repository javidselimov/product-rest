/**
 * IFI mocks: the real contract (spec 044, `contracts/api.md`). The list DTO is flat, and membership
 * dates change only through `/memberships`; create answers 201 with the membership, the rest 204.
 */

import { HttpResponse, http } from 'msw'

import {
  ifiOrganizationFixtures,
  type IfiMembershipMock,
  type IfiOrganizationMockRow,
} from '../fixtures/ifi-organizations'
import { createCrudStore } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

type MembershipBody = Pick<IfiMembershipMock, 'joinedOn' | 'translations'>

export const ifiOrganizationsStore = createCrudStore<IfiOrganizationMockRow>({
  path: '/ifi-organizations',
  envelope: 'paged',
  seed: ifiOrganizationFixtures,
  searchFields: ['translations.az.name'],
  filterFields: ['status'],
  listItem: (row) => ({
    id: row.id,
    status: row.status,
    sortOrder: row.sortOrder,
    showAz: row.showAz,
    showEn: row.showEn,
    name: row.translations.az?.name ?? row.translations.en?.name ?? null,
    memberSince: row.memberSince,
    membershipCount: row.memberships.length,
  }),
  // Membership dates change only through the sub-resource: a PUT body never touches them.
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      logo: existing?.logo ?? null,
      memberships: existing?.memberships ?? [],
    }) as IfiOrganizationMockRow,
})

const { base, store } = ifiOrganizationsStore

const nextMembershipId = () =>
  store.all().flatMap((row) => row.memberships).reduce((max, m) => Math.max(max, m.id), 0) + 1

export const ifiOrganizationsHandlers = [
  http.post(`${base}/:id/memberships`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as MembershipBody
    const sortOrder = Math.max(0, ...row.memberships.map((m) => m.sortOrder)) + 1
    const membership: IfiMembershipMock = { ...body, id: nextMembershipId(), sortOrder }
    store.replace({ ...row, memberships: [...row.memberships, membership] })
    return HttpResponse.json(membership, { status: 201 })
  }),

  http.put(`${base}/:id/memberships/order`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const { ids } = (await request.json()) as { ids: number[] }
    const current = new Set(row.memberships.map((m) => m.id))
    if (ids.length !== current.size || !ids.every((id) => current.has(id))) {
      return message(400, "ids must contain exactly the organization's memberships.")
    }
    const byId = new Map(row.memberships.map((m) => [m.id, m]))
    store.replace({
      ...row,
      memberships: ids.flatMap((id, index) => {
        const m = byId.get(id)
        return m ? [{ ...m, sortOrder: index + 1 }] : []
      }),
    })
    return noContent()
  }),

  http.put(`${base}/:id/memberships/:membershipId`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    const membershipId = Number(params.membershipId)
    const existing = row?.memberships.find((m) => m.id === membershipId)
    if (!row || !existing) return problem404()
    const body = (await request.json()) as MembershipBody
    const updated = { ...existing, ...body }
    store.replace({ ...row, memberships: row.memberships.map((m) => (m.id === membershipId ? updated : m)) })
    return HttpResponse.json(updated)
  }),

  http.delete(`${base}/:id/memberships/:membershipId`, ({ params }) => {
    const row = store.get(Number(params.id))
    const membershipId = Number(params.membershipId)
    if (!row?.memberships.some((m) => m.id === membershipId)) return problem404()
    store.replace({ ...row, memberships: row.memberships.filter((m) => m.id !== membershipId) })
    return noContent()
  }),

  ...ifiOrganizationsStore.handlers,
]
