/**
 * CSR mocks: the real contract (spec 038, `contracts/api.md`). The list DTO is flat, photos change
 * only through `/assets`, and `DELETE /csr-categories/{id}` is 409 while a project uses the category.
 */

import { http } from 'msw'

import { mediaFixtures } from '../fixtures/media'
import {
  csrCategoryFixtures,
  csrProjectFixtures,
  type CsrCategoryMockRow,
  type CsrProjectMockRow,
} from '../fixtures/csr-projects'
import { createCrudStore } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

const CATEGORY_IN_USE = 'The category is used by a project.'

const categoryName = (row: CsrCategoryMockRow | null | undefined) =>
  row?.translations.az?.name ?? row?.translations.en?.name ?? null

export const csrCategoriesStore = createCrudStore<CsrCategoryMockRow>({
  path: '/csr-categories',
  envelope: 'items',
  seed: csrCategoryFixtures,
  listItem: (row) => ({ ...row, name: categoryName(row) }),
})

export const csrProjectsStore = createCrudStore<CsrProjectMockRow>({
  path: '/csr-projects',
  envelope: 'paged',
  seed: csrProjectFixtures,
  searchFields: ['translations.az.cardTitle', 'translations.az.title'],
  filterFields: ['status', 'categoryId'],
  listItem: (row) => ({
    id: row.id,
    status: row.status,
    sortOrder: row.sortOrder,
    showAz: row.showAz,
    showEn: row.showEn,
    title:
      row.translations.az?.cardTitle ?? row.translations.en?.cardTitle ?? null,
    categoryName: categoryName(csrCategoriesStore.store.get(row.categoryId)),
    imageCount: row.assets.length,
  }),
  // Photos change only through the sub-resource: a PUT body never touches them.
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      cover: existing?.cover ?? null,
      assets: existing?.assets ?? [],
    }) as CsrProjectMockRow,
})

const { base, store } = csrProjectsStore

export const csrProjectsHandlers = [
  http.delete(`${csrCategoriesStore.base}/:id`, ({ params }) => {
    const id = Number(params.id)
    return store.all().some((project) => project.categoryId === id)
      ? message(409, CATEGORY_IN_USE)
      : undefined
  }),

  http.post(`${base}/:id/assets`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const { mediaId } = (await request.json()) as { mediaId: number }
    const media = mediaFixtures.find((m) => m.id === mediaId)
    if (!media?.mimeType?.startsWith('image/')) {
      return message(400, 'Media asset not found or not an image.')
    }
    if (row.assets.some((asset) => asset.mediaId === mediaId)) {
      return message(409, 'Already attached.')
    }
    store.replace({
      ...row,
      assets: [
        ...row.assets,
        {
          mediaId,
          originalName: media.originalName,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes ?? 0,
        },
      ],
    })
    return noContent()
  }),

  http.put(`${base}/:id/assets/order`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const { mediaIds } = (await request.json()) as { mediaIds: number[] }
    const current = new Set(row.assets.map((asset) => asset.mediaId))
    if (
      mediaIds.length !== current.size ||
      !mediaIds.every((id) => current.has(id))
    ) {
      return message(400, "mediaIds must contain exactly the project's photos.")
    }
    const byId = new Map(row.assets.map((asset) => [asset.mediaId, asset]))
    store.replace({
      ...row,
      assets: mediaIds.flatMap((id) => byId.get(id) ?? []),
    })
    return noContent()
  }),

  http.delete(`${base}/:id/assets/:mediaId`, ({ params }) => {
    const row = store.get(Number(params.id))
    const mediaId = Number(params.mediaId)
    if (!row?.assets.some((asset) => asset.mediaId === mediaId)) {
      return problem404()
    }
    store.replace({
      ...row,
      assets: row.assets.filter((asset) => asset.mediaId !== mediaId),
    })
    return noContent()
  }),

  ...csrCategoriesStore.handlers,
  ...csrProjectsStore.handlers,
]
