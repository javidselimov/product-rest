/**
 * Qanunlar mock-ları — real kontrakt (contracts/admin-api.md §6, §7):
 * `/laws` paged (search başlıqda, `categoryId`/`status` filtri, düz list DTO),
 * `/law-categories` bare array, `POST /laws/{id}/assets` → 204,
 * `DELETE /laws/{id}/assets/{mediaId}` → 204.
 */

import { http } from 'msw'

import {
  lawCategoryFixtures,
  lawFixtures,
  type LawFixture,
} from '../fixtures/laws'
import { mediaFixtures } from '../fixtures/media'
import { createCrudStore } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

const nowIso = () => new Date().toISOString()

export const lawsStore = createCrudStore<LawFixture>({
  path: '/laws',
  envelope: 'paged',
  seed: lawFixtures,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['categoryId', 'status'],
  listItem: (row) => ({
    id: row.id,
    categoryId: row.categoryId,
    type: row.type,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
  }),
  // Sənədlər upsert gövdəsində gəlmir — mövcud siyahı saxlanılır.
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      updatedAt: nowIso(),
      assets: existing?.assets ?? [],
    }) as LawFixture,
})

export const lawCategoriesStore = createCrudStore({
  path: '/law-categories',
  envelope: 'array',
  seed: lawCategoryFixtures,
  sort: (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
})

const attachAsset = http.post(
  '/api/v1/laws/:id/assets',
  async ({ params, request }) => {
    const law = lawsStore.store.get(Number(params.id))
    if (!law) return problem404()
    const body = (await request.json()) as { mediaId?: number }
    const media = mediaFixtures.find((m) => m.id === body.mediaId)
    if (!media) return message(400, 'Media asset not found.')
    if (law.assets.some((a) => a.mediaId === media.id))
      return message(409, 'Already attached.')
    lawsStore.store.replace({
      ...law,
      assets: [
        ...law.assets,
        {
          mediaId: media.id,
          originalName: media.originalName,
          mimeType: media.mimeType,
          sizeBytes: media.sizeBytes,
        },
      ],
    })
    return noContent()
  },
)

const detachAsset = http.delete(
  '/api/v1/laws/:id/assets/:mediaId',
  ({ params }) => {
    const law = lawsStore.store.get(Number(params.id))
    if (!law) return problem404()
    const mediaId = Number(params.mediaId)
    if (!law.assets.some((a) => a.mediaId === mediaId)) return problem404()
    lawsStore.store.replace({
      ...law,
      assets: law.assets.filter((a) => a.mediaId !== mediaId),
    })
    return noContent()
  },
)

const deleteCategory = http.delete(
  '/api/v1/law-categories/:id',
  ({ params }) => {
    const id = Number(params.id)
    if (!lawCategoriesStore.store.get(id)) return problem404()
    if (lawsStore.store.all().some((l) => l.categoryId === id)) {
      return message(
        409,
        'Category is referenced by laws; reassign or delete them first.',
      )
    }
    lawCategoriesStore.store.remove(id)
    return noContent()
  },
)

export const lawsHandlers = [
  attachAsset,
  detachAsset,
  ...lawsStore.handlers,
  // 409 qaydası üçün öz DELETE handler-i generic-dən əvvəl gəlir.
  deleteCategory,
  ...lawCategoriesStore.handlers,
]

export const resetLawsStores = () => {
  lawsStore.store.reset()
  lawCategoriesStore.store.reset()
}
