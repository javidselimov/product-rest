/**
 * Pul nişanları mock-ları — real kontrakt (contracts/admin-api.md §3, §6):
 * `/money-marks` paged + `categoryId/type/status` filtrləri, siyahı elementi
 * düz (`title` az → ilk mövcud); `/money-mark-categories` bare array;
 * `/money-mark-news` paged + `search/status`.
 */

import {
  moneyMarkCategoryFixtures,
  moneyMarkFixtures,
  moneyMarkNewsFixtures,
  type MoneyMarkCategoryMock,
  type MoneyMarkMock,
  type MoneyMarkNewsMock,
} from '../fixtures/money-marks'
import { createCrudStore } from './lib/crud-store'

const firstTitle = (row: {
  translations: { az?: { title: string }; en?: { title: string } }
}) => row.translations.az?.title ?? row.translations.en?.title ?? null

export const moneyMarksStore = createCrudStore<MoneyMarkMock>({
  path: '/money-marks',
  envelope: 'paged',
  seed: moneyMarkFixtures,
  filterFields: ['categoryId', 'type', 'status'],
  listItem: (row) => ({
    id: row.id,
    categoryId: row.categoryId,
    type: row.type,
    sortOrder: row.sortOrder,
    status: row.status,
    updatedAt: row.updatedAt,
    title: firstTitle(row),
  }),
})

export const moneyMarkCategoriesStore = createCrudStore<MoneyMarkCategoryMock>({
  path: '/money-mark-categories',
  envelope: 'array',
  seed: moneyMarkCategoryFixtures,
  sort: (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
})

export const moneyMarkNewsStore = createCrudStore<MoneyMarkNewsMock>({
  path: '/money-mark-news',
  envelope: 'paged',
  seed: moneyMarkNewsFixtures,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['status'],
  listItem: (row) => ({
    id: row.id,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    title: firstTitle(row),
  }),
})

export const moneyMarksHandlers = [
  ...moneyMarksStore.handlers,
  ...moneyMarkCategoriesStore.handlers,
  ...moneyMarkNewsStore.handlers,
]
