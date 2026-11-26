/**
 * Təşkilat mock-ları — real kontrakt (contracts/admin-api.md §6): üç resurs
 * da bare `array` envelope; heyət siyahısı `type` filtri qəbul edir.
 * Heyət foto alt-resursu qalereya şəkilləri ilə eyni: POST 200 `{id, mediaId, sortOrder}`
 * (400 şəkil deyil / 409 "Already attached."), PUT /order (tam id dəsti → 400), DELETE 204.
 */

import { HttpResponse, http } from 'msw'

import { mediaFixtures } from '../fixtures/media'
import {
  divisionFixtures,
  officeFixtures,
  staffFixtures,
  type DivisionMock,
  type OfficeMock,
  type StaffMock,
} from '../fixtures/organization'
import { createCrudStore, type MockRow } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

const bySortOrder = <Row extends MockRow & { sortOrder: number }>(
  a: Row,
  b: Row,
) => a.sortOrder - b.sortOrder || a.id - b.id

export const divisionsStore = createCrudStore<DivisionMock>({
  path: '/organization/divisions',
  envelope: 'array',
  seed: divisionFixtures,
  sort: bySortOrder,
})

export const officesStore = createCrudStore<OfficeMock>({
  path: '/organization/offices',
  envelope: 'array',
  seed: officeFixtures,
  sort: bySortOrder,
})

export const staffStore = createCrudStore<StaffMock>({
  path: '/organization/staff',
  envelope: 'array',
  seed: staffFixtures,
  filterFields: ['type'],
  sort: bySortOrder,
  // Fotolar yalnız alt-resurs ilə dəyişir — PUT gövdəsi onlara toxunmur.
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      photos: existing?.photos ?? [],
      updatedAt: new Date().toISOString(),
    }) as StaffMock,
})

const staffBase = staffStore.base

const nextPhotoId = () =>
  staffStore.store
    .all()
    .flatMap((member) => member.photos.map((photo) => photo.id))
    .reduce((max, photoId) => Math.max(max, photoId), 0) + 1

const photoHandlers = [
  http.post(`${staffBase}/:id/photos`, async ({ params, request }) => {
    const member = staffStore.store.get(Number(params.id))
    if (!member) return problem404()
    const body = (await request.json()) as { mediaId?: unknown }
    const mediaId = Number(body.mediaId)
    if (!Number.isInteger(mediaId) || mediaId <= 0)
      return message(400, 'mediaId is required.')
    const media = mediaFixtures.find((m) => m.id === mediaId)
    if (!media) return message(400, 'Media asset not found.')
    if (!media.mimeType?.startsWith('image/'))
      return message(400, 'Only image assets can be attached as photos.')
    if (member.photos.some((photo) => photo.mediaId === mediaId))
      return message(409, 'Already attached.')
    const photo = {
      id: nextPhotoId(),
      mediaId,
      originalName: media.originalName,
      sortOrder: member.photos.length + 1,
    }
    staffStore.store.replace({ ...member, photos: [...member.photos, photo] })
    return HttpResponse.json({
      id: photo.id,
      mediaId: photo.mediaId,
      sortOrder: photo.sortOrder,
    })
  }),

  http.put(`${staffBase}/:id/photos/order`, async ({ params, request }) => {
    const member = staffStore.store.get(Number(params.id))
    if (!member) return problem404()
    const body = (await request.json()) as { photoIds?: unknown }
    const photoIds = Array.isArray(body.photoIds)
      ? body.photoIds.map(Number)
      : []
    const current = new Set(member.photos.map((photo) => photo.id))
    const complete =
      photoIds.length === current.size &&
      new Set(photoIds).size === current.size &&
      photoIds.every((photoId) => current.has(photoId))
    if (!complete) {
      return message(
        400,
        "photoIds must contain exactly the member's photo ids.",
      )
    }
    const photos = photoIds.map((photoId, index) => ({
      ...member.photos.find((photo) => photo.id === photoId)!,
      sortOrder: index + 1,
    }))
    staffStore.store.replace({ ...member, photos })
    return noContent()
  }),

  http.delete(`${staffBase}/:id/photos/:photoId`, ({ params }) => {
    const member = staffStore.store.get(Number(params.id))
    if (!member) return problem404()
    const photoId = Number(params.photoId)
    if (!member.photos.some((photo) => photo.id === photoId))
      return problem404()
    staffStore.store.replace({
      ...member,
      photos: member.photos.filter((photo) => photo.id !== photoId),
    })
    return noContent()
  }),
]

export const organizationHandlers = [
  ...divisionsStore.handlers,
  ...officesStore.handlers,
  ...photoHandlers,
  ...staffStore.handlers,
]
