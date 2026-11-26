/**
 * MEAS mock-ları — real kontrakt (contracts/admin-api.md §6): `/meas-documents`
 * paged (search `dqn`-də, `emitentId`/`infoTypeId`/`status` filtri, siyahıda
 * `emitentName`/`infoTypeName`), `/meas-emitents` və `/meas-info-types` bare array.
 * Detail `media: {originalName…}` obyektini `mediaId`-dən qurur.
 */

import { http } from 'msw'

import { firstTranslation } from '@/entities/content/model/types'
import {
  measDocumentFixtures,
  measEmitentFixtures,
  measInfoTypeFixtures,
  type MeasDocumentFixture,
  type MeasLookupFixture,
} from '../fixtures/meas'
import { mediaFixtures } from '../fixtures/media'
import { createCrudStore } from './lib/crud-store'
import { message } from './lib/errors'

const nowIso = () => new Date().toISOString()

const lookupStore = (path: string, seed: MeasLookupFixture[]) =>
  createCrudStore<MeasLookupFixture>({
    path,
    envelope: 'array',
    seed,
    applyBody: (body, existing, id) =>
      ({
        ...(existing ?? {}),
        ...body,
        id,
        updatedAt: nowIso(),
      }) as MeasLookupFixture,
  })

export const measEmitentsStore = lookupStore(
  '/meas-emitents',
  measEmitentFixtures,
)
export const measInfoTypesStore = lookupStore(
  '/meas-info-types',
  measInfoTypeFixtures,
)

const lookupName = (store: typeof measEmitentsStore, id: number) => {
  const row = store.store.get(id)
  const name = row ? firstTranslation(row.translations, 'name') : '—'
  return name === '—' ? null : name
}

const mediaFor = (mediaId: unknown) => {
  if (typeof mediaId !== 'number') return null
  const media = mediaFixtures.find((m) => m.id === mediaId)
  return media
    ? {
        id: media.id,
        originalName: media.originalName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
      }
    : null
}

export const measDocumentsStore = createCrudStore<MeasDocumentFixture>({
  path: '/meas-documents',
  envelope: 'paged',
  seed: measDocumentFixtures,
  searchFields: ['dqn'],
  filterFields: ['emitentId', 'infoTypeId', 'status'],
  listItem: (row) => ({
    id: row.id,
    emitentId: row.emitentId,
    emitentName: lookupName(measEmitentsStore, row.emitentId),
    infoTypeId: row.infoTypeId,
    infoTypeName: lookupName(measInfoTypesStore, row.infoTypeId),
    regDate: row.regDate,
    dqn: row.dqn,
    mediaId: row.mediaId,
    status: row.status,
    updatedAt: row.updatedAt,
  }),
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      updatedAt: nowIso(),
      media: mediaFor(body.mediaId),
    }) as MeasDocumentFixture,
})

/**
 * Emitent / məlumat tipi / media mövcud deyilsə API 400 `{message}` qaytarır.
 * Resolver `undefined` qaytaranda MSW növbəti (generic) handler-ə keçir.
 */
const validateRefs = async ({ request }: { request: Request }) => {
  const body = (await request.clone().json()) as Record<string, unknown>
  if (!measEmitentsStore.store.get(Number(body.emitentId)))
    return message(400, 'Emitent not found.')
  if (!measInfoTypesStore.store.get(Number(body.infoTypeId)))
    return message(400, 'Info type not found.')
  if (
    body.mediaId !== null &&
    body.mediaId !== undefined &&
    !mediaFor(body.mediaId)
  )
    return message(400, 'Media asset not found.')
  return undefined
}

export const measHandlers = [
  http.post(measDocumentsStore.base, validateRefs),
  http.put(`${measDocumentsStore.base}/:id`, validateRefs),
  ...measDocumentsStore.handlers,
  ...measEmitentsStore.handlers,
  ...measInfoTypesStore.handlers,
]

export const resetMeasStores = () => {
  measDocumentsStore.store.reset()
  measEmitentsStore.store.reset()
  measInfoTypesStore.store.reset()
}
