/**
 * Release schedule mocks: the real contract (spec 039, `contracts/admin-api.md`). The item list DTO
 * is flat with az-first names, and deleting a group or periodicity is 409 while an item uses it.
 */

import { http } from 'msw'

import {
  releaseScheduleGroupFixtures,
  releaseScheduleItemFixtures,
  releaseSchedulePeriodicityFixtures,
  type ReleaseScheduleGroupMockRow,
  type ReleaseScheduleItemMockRow,
  type ReleaseSchedulePeriodicityMockRow,
} from '../fixtures/release-schedule'
import { createCrudStore } from './lib/crud-store'
import { message } from './lib/errors'

const GROUP_IN_USE = 'The group is used by an item.'
const PERIODICITY_IN_USE = 'The periodicity is used by an item.'

type Named = ReleaseScheduleGroupMockRow | ReleaseSchedulePeriodicityMockRow
const nameOf = (row: Named | null | undefined) =>
  row?.translations.az?.name ?? row?.translations.en?.name ?? null

export const releaseScheduleGroupsStore = createCrudStore<ReleaseScheduleGroupMockRow>({
  path: '/release-schedule/groups',
  envelope: 'items',
  seed: releaseScheduleGroupFixtures,
  listItem: (row) => ({ ...row, name: nameOf(row) }),
})

export const releaseSchedulePeriodicitiesStore =
  createCrudStore<ReleaseSchedulePeriodicityMockRow>({
    path: '/release-schedule/periodicities',
    envelope: 'items',
    seed: releaseSchedulePeriodicityFixtures,
    listItem: (row) => ({ ...row, name: nameOf(row) }),
  })

export const releaseScheduleItemsStore = createCrudStore<ReleaseScheduleItemMockRow>({
  path: '/release-schedule/items',
  envelope: 'paged',
  seed: releaseScheduleItemFixtures,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['status', 'groupId', 'periodicityId'],
  listItem: (row) => ({
    id: row.id,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
    group: nameOf(releaseScheduleGroupsStore.store.get(row.groupId)),
    periodicity:
      row.periodicityId === null
        ? null
        : nameOf(releaseSchedulePeriodicitiesStore.store.get(row.periodicityId)),
    timingMode: row.timingMode,
    sortOrder: row.sortOrder,
    status: row.status,
    showAz: row.showAz,
    showEn: row.showEn,
  }),
})

const items = () => releaseScheduleItemsStore.store.all()

export const releaseScheduleHandlers = [
  http.delete(`${releaseScheduleGroupsStore.base}/:id`, ({ params }) =>
    items().some((item) => item.groupId === Number(params.id))
      ? message(409, GROUP_IN_USE)
      : undefined,
  ),
  http.delete(`${releaseSchedulePeriodicitiesStore.base}/:id`, ({ params }) =>
    items().some((item) => item.periodicityId === Number(params.id))
      ? message(409, PERIODICITY_IN_USE)
      : undefined,
  ),
  ...releaseScheduleGroupsStore.handlers,
  ...releaseSchedulePeriodicitiesStore.handlers,
  ...releaseScheduleItemsStore.handlers,
]
