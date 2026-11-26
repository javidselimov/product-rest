/**
 * Qalereya mock-ları — real kontrakt (contracts/admin-api.md §6 `/galleries`, §7):
 * paged siyahı (list DTO düz: `title`, `imageCount`), detail `images[]`,
 * şəkil alt-resursu: POST 200 `{id, mediaId, sortOrder}` / 409 "Already attached.",
 * PUT /order (tam id dəsti yoxlanılır → 400), DELETE 204.
 */

import { HttpResponse, http } from 'msw'

import { galleryFixtures, type GalleryMockRow } from '../fixtures/galleries'
import { mediaFixtures } from '../fixtures/media'
import { createCrudStore } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

const firstTitle = (row: GalleryMockRow) =>
  row.translations.az?.title ?? row.translations.en?.title ?? null

export const galleriesStore = createCrudStore<GalleryMockRow>({
  path: '/galleries',
  envelope: 'paged',
  seed: galleryFixtures,
  listItem: (row) => ({
    id: row.id,
    eventDate: row.eventDate,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    updatedAt: row.updatedAt,
    imageCount: row.images.length,
    title: firstTitle(row),
  }),
  // Şəkillər yalnız alt-resurs ilə dəyişir — PUT gövdəsi onlara toxunmur.
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      images: existing?.images ?? [],
      updatedAt: new Date().toISOString(),
    }) as GalleryMockRow,
})

const { base, store } = galleriesStore

const nextImageId = () =>
  store
    .all()
    .flatMap((gallery) => gallery.images.map((image) => image.id))
    .reduce((max, imageId) => Math.max(max, imageId), 0) + 1

const imageHandlers = [
  http.post(`${base}/:id/images`, async ({ params, request }) => {
    const gallery = store.get(Number(params.id))
    if (!gallery) return problem404()
    const body = (await request.json()) as { mediaId?: unknown }
    const mediaId = Number(body.mediaId)
    if (!Number.isInteger(mediaId) || mediaId <= 0)
      return message(400, 'mediaId is required.')
    if (gallery.images.some((image) => image.mediaId === mediaId)) {
      return message(409, 'Already attached.')
    }
    const media = mediaFixtures.find((m) => m.id === mediaId)
    if (!media) return message(404, 'Media not found.')
    const image = {
      id: nextImageId(),
      mediaId,
      originalName: media.originalName,
      sortOrder: gallery.images.length,
    }
    store.replace({ ...gallery, images: [...gallery.images, image] })
    return HttpResponse.json({
      id: image.id,
      mediaId: image.mediaId,
      sortOrder: image.sortOrder,
    })
  }),

  http.put(`${base}/:id/images/order`, async ({ params, request }) => {
    const gallery = store.get(Number(params.id))
    if (!gallery) return problem404()
    const body = (await request.json()) as { imageIds?: unknown }
    const imageIds = Array.isArray(body.imageIds)
      ? body.imageIds.map(Number)
      : []
    const current = new Set(gallery.images.map((image) => image.id))
    const complete =
      imageIds.length === current.size &&
      new Set(imageIds).size === current.size &&
      imageIds.every((imageId) => current.has(imageId))
    if (!complete) {
      return message(
        400,
        "imageIds must contain exactly the gallery's image ids.",
      )
    }
    const images = imageIds.map((imageId, index) => ({
      ...gallery.images.find((image) => image.id === imageId)!,
      sortOrder: index,
    }))
    store.replace({ ...gallery, images })
    return noContent()
  }),

  http.delete(`${base}/:id/images/:imageId`, ({ params }) => {
    const gallery = store.get(Number(params.id))
    if (!gallery) return problem404()
    const imageId = Number(params.imageId)
    if (!gallery.images.some((image) => image.id === imageId))
      return problem404()
    const images = gallery.images
      .filter((image) => image.id !== imageId)
      .map((image, index) => ({ ...image, sortOrder: index }))
    store.replace({ ...gallery, images })
    return noContent()
  }),
]

export const galleriesHandlers = [...imageHandlers, ...galleriesStore.handlers]
