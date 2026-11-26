/**
 * Press release mocks — the real contract (contracts/admin-api.md §6, §7; spec 029
 * contracts/admin-api.md): paged list (`search` on translated titles, `status` and `type`
 * filters, flat `title` in the list DTO), detail with `assets[]`; the document sub-resource
 * `POST {mediaId}` → 204, `DELETE /{mediaId}` → 204 (both idempotent); spec 030 adds
 * `PUT /order` (`mediaIds` = exactly the attached set → 204, otherwise 400 with `message`).
 *
 * `type` on POST/PUT follows the API: omitted/null → create stores 1, update keeps the stored
 * type; any value other than 1 or 2 → 400 with `message`.
 */

import { http } from 'msw'

import { mediaFixtures } from '../fixtures/media'
import {
  pressReleaseFixtures,
  type PressReleaseMockRow,
} from '../fixtures/press-releases'
import { createCrudStore } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

const INVALID_TYPE =
  'Type must be 1 (news), 2 (announcement) or 3 (interview or speech).'

const isValidType = (type: unknown) =>
  type === undefined || type === null || [1, 2, 3].includes(type as number)

export const pressReleasesStore = createCrudStore<PressReleaseMockRow>({
  path: '/press-releases',
  envelope: 'paged',
  seed: pressReleaseFixtures,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['status', 'type'],
  listItem: (row) => ({
    id: row.id,
    type: row.type,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
  }),
  // Documents change only through the sub-resource — a PUT body never touches them.
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      type: (body.type as number | null | undefined) ?? existing?.type ?? 1,
      assets: existing?.assets ?? [],
      updatedAt: new Date().toISOString(),
    }) as PressReleaseMockRow,
})

const { base, store } = pressReleasesStore

/** Rejects an invalid `type`; anything else falls through to the store handlers. */
const typeGuard = (method: typeof http.post) =>
  method(`${base}*`, async ({ request }) => {
    if (/\/assets(\/|$)/.test(new URL(request.url).pathname)) return undefined
    const body = (await request.clone().json()) as { type?: unknown }
    return isValidType(body.type) ? undefined : message(400, INVALID_TYPE)
  })

const assetHandlers = [
  http.post(`${base}/:id/assets`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as { mediaId?: unknown }
    const mediaId = Number(body.mediaId)
    if (!Number.isInteger(mediaId) || mediaId <= 0)
      return message(400, 'mediaId is required.')
    const media = mediaFixtures.find((m) => m.id === mediaId)
    if (!media) return message(404, 'Media not found.')
    if (!row.assets.some((asset) => asset.mediaId === mediaId)) {
      store.replace({
        ...row,
        assets: [
          ...row.assets,
          {
            mediaId,
            originalName: media.originalName,
            mimeType: media.mimeType,
            sizeBytes: media.sizeBytes,
          },
        ],
      })
    }
    return noContent()
  }),

  http.put(`${base}/:id/assets/order`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as { mediaIds?: unknown }
    const mediaIds = Array.isArray(body.mediaIds)
      ? body.mediaIds.map(Number)
      : []
    const current = new Set(row.assets.map((asset) => asset.mediaId))
    const sameSet =
      mediaIds.length === current.size &&
      new Set(mediaIds).size === current.size &&
      mediaIds.every((id) => current.has(id))
    if (!sameSet)
      return message(
        400,
        "mediaIds must contain exactly the press release's attached media ids.",
      )
    const byId = new Map(row.assets.map((asset) => [asset.mediaId, asset]))
    store.replace({
      ...row,
      assets: mediaIds.flatMap((id) => byId.get(id) ?? []),
    })
    return noContent()
  }),

  http.put(`${base}/:id/assets/:mediaId/locale`, async ({ params, request }) => {
    const row = store.get(Number(params.id))
    const mediaId = Number(params.mediaId)
    if (!row?.assets.some((asset) => asset.mediaId === mediaId))
      return problem404()
    const { locale } = (await request.json()) as { locale?: string | null }
    if (locale !== null && locale !== 'az' && locale !== 'en')
      return message(400, 'Unknown locale.')
    store.replace({
      ...row,
      assets: row.assets.map((asset) =>
        asset.mediaId === mediaId ? { ...asset, locale } : asset,
      ),
    })
    return noContent()
  }),

  http.delete(`${base}/:id/assets/:mediaId`, ({ params }) => {
    const row = store.get(Number(params.id))
    if (!row) return problem404()
    const mediaId = Number(params.mediaId)
    store.replace({
      ...row,
      assets: row.assets.filter((asset) => asset.mediaId !== mediaId),
    })
    return noContent()
  }),
]

export const pressReleasesHandlers = [
  ...assetHandlers,
  typeGuard(http.post),
  typeGuard(http.put),
  ...pressReleasesStore.handlers,
]
