/**
 * Event mocks: the real contract (spec 034, contracts/admin-api.md). The list DTO is flat, the
 * detail adds `{ id, title }` of each link; `DELETE /event-categories/{id}` is 409 while an event
 * uses the category.
 */

import { http } from 'msw'

import {
  eventCategoryFixtures,
  eventFixtures,
  type EventCategoryMockRow,
  type EventMockRow,
} from '../fixtures/events'
import { createCrudStore } from './lib/crud-store'
import { message } from './lib/errors'

const CATEGORY_IN_USE = 'The category is used by an event.'

const categoryName = (row: EventCategoryMockRow | null | undefined) =>
  row?.translations.az?.name ?? row?.translations.en?.name ?? null

export const eventCategoriesStore = createCrudStore<EventCategoryMockRow>({
  path: '/event-categories',
  envelope: 'items',
  seed: eventCategoryFixtures,
  listItem: (row) => ({ ...row, name: categoryName(row) }),
})

export const eventsStore = createCrudStore<EventMockRow>({
  path: '/events',
  envelope: 'paged',
  seed: eventFixtures,
  searchFields: ['translations.az.title'],
  filterFields: ['status', 'type', 'categoryId'],
  listItem: (row) => ({
    id: row.id,
    type: row.type,
    status: row.status,
    startsOn: row.startsOn,
    endsOn: row.endsOn,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
    categoryName: categoryName(
      row.categoryId === null
        ? null
        : eventCategoriesStore.store.get(row.categoryId),
    ),
  }),
})

export const eventsHandlers = [
  http.delete(`${eventCategoriesStore.base}/:id`, ({ params }) => {
    const id = Number(params.id)
    return eventsStore.store.all().some((event) => event.categoryId === id)
      ? message(409, CATEGORY_IN_USE)
      : undefined
  }),
  ...eventCategoriesStore.handlers,
  ...eventsStore.handlers,
]
