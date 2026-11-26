/** Page mocks following the real contract (contracts/admin-api.md §4). */

import { HttpResponse, http } from 'msw'

import { mediaFixtures } from '../fixtures/media'
import { pageFixtures, type PageRecord } from '../fixtures/pages'
import { message, noContent, problem404 } from './lib/errors'

let rows: PageRecord[] = structuredClone(pageFixtures)

export const pagesStore = {
  all: () => rows,
  get: (id: number) => rows.find((r) => r.id === id) ?? null,
  reset: () => {
    rows = structuredClone(pageFixtures)
  },
}

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const isDescendant = (candidateId: number, ofId: number): boolean => {
  let current = pagesStore.get(candidateId)
  while (current?.parentId != null) {
    if (current.parentId === ofId) return true
    current = pagesStore.get(current.parentId)
  }
  return false
}

const toNode = (row: PageRecord, locale: string): Record<string, unknown> => ({
  id: row.id,
  parentId: row.parentId,
  sortOrder: row.sortOrder,
  status: row.status,
  title: row.translations[locale]?.title ?? null,
  slug: row.translations[locale]?.slug ?? null,
  navUrl: row.navUrl,
  flags: row.flags,
  children: rows
    .filter((r) => r.parentId === row.id)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => toNode(r, locale)),
})

const toDetail = (row: PageRecord) => row

type StoredFlags = PageRecord['flags']

/**
 * Like the API's PageFlagsDto: an omitted field takes its default, except showInSideNav and
 * showInDropdownNav, which keep the stored value when omitted or null (spec 041 R4, spec 054).
 * showInDropdownNav is stored only when it differs from the left-menu flag it would follow, or a
 * value is stored already (the API's page_nav_details row).
 */
function mergeFlags(
  defaults: StoredFlags,
  sent: Record<string, boolean | null>,
  stored: StoredFlags | null,
): StoredFlags {
  const merged: StoredFlags = { ...defaults }
  for (const [key, value] of Object.entries(sent)) {
    if (typeof value === 'boolean') merged[key] = value
  }
  if (typeof sent.showInSideNav !== 'boolean') {
    merged.showInSideNav = stored?.showInSideNav ?? true
  }
  const storedDropdown = stored?.showInDropdownNav ?? null
  const sentDropdown = sent.showInDropdownNav
  merged.showInDropdownNav =
    typeof sentDropdown === 'boolean' &&
    (sentDropdown !== merged.showInSideNav || storedDropdown !== null)
      ? sentDropdown
      : storedDropdown
  return merged
}

interface UpsertBody {
  parentId?: number | null
  sortOrder?: number
  status?: string
  showInFooter?: boolean
  navUrl?: string | null
  flags?: Record<string, boolean | null> | null
  translations?: Record<
    string,
    {
      title: string
      content?: string | null
      slug?: string
      menuGroup?: string | null
    }
  >
}

/** The API's menu group rule (spec 054): omitted or null keeps the label, `''` clears it, the rest is trimmed. */
const mergeMenuGroup = (
  stored: string | null | undefined,
  sent: string | null | undefined,
): string | null => {
  if (sent == null) return stored ?? null
  const label = sent.trim()
  return label === '' ? null : label
}

const applyTranslations = (
  existing: PageRecord['translations'],
  incoming: UpsertBody['translations'],
  isCreate: boolean,
): PageRecord['translations'] => {
  const result: PageRecord['translations'] = {}
  for (const [locale, tr] of Object.entries(incoming ?? {})) {
    const prev = existing[locale]
    const slug = tr.slug
      ? tr.slug !== prev?.slug
        ? slugify(tr.slug)
        : prev.slug
      : isCreate || !prev
        ? slugify(tr.title)
        : prev.slug
    result[locale] = {
      title: tr.title,
      slug,
      content: tr.content ?? null,
      menuGroup: mergeMenuGroup(prev?.menuGroup, tr.menuGroup),
    }
  }
  return result
}

export const pagesHandlers = [
  http.get('/api/v1/pages/tree', ({ request }) => {
    const locale = new URL(request.url).searchParams.get('locale') ?? 'az'
    return HttpResponse.json(
      rows
        .filter((r) => r.parentId === null)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((r) => toNode(r, locale)),
    )
  }),

  http.get('/api/v1/pages/:id', ({ params }) => {
    const row = pagesStore.get(Number(params.id))
    return row ? HttpResponse.json(toDetail(row)) : problem404()
  }),

  http.post('/api/v1/pages', async ({ request }) => {
    const body = (await request.json()) as UpsertBody
    if (!body.translations || Object.keys(body.translations).length === 0) {
      return message(400, 'At least one translation is required.')
    }
    const row: PageRecord = {
      id: rows.reduce((m, r) => Math.max(m, r.id), 0) + 1,
      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder ?? 1,
      status: body.status ?? 'draft',
      showInFooter: body.showInFooter ?? false,
      navUrl: body.navUrl ?? null,
      flags: mergeFlags(
        { ...pageFixtures[0].flags, removableAll: false },
        body.flags ?? {},
        null,
      ),
      translations: applyTranslations({}, body.translations, true),
      assets: [],
    }
    rows = [...rows, row]
    return HttpResponse.json(toDetail(row), { status: 201 })
  }),

  http.put('/api/v1/pages/:id', async ({ params, request }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as UpsertBody
    if (
      body.parentId !== undefined &&
      body.parentId !== null &&
      body.parentId !== row.parentId
    ) {
      return message(
        400,
        'Moving pages is not supported yet (Phase 2: tree move endpoint).',
      )
    }
    if (!body.translations || Object.keys(body.translations).length === 0) {
      return message(400, 'At least one translation is required.')
    }
    const updated: PageRecord = {
      ...row,
      sortOrder: body.sortOrder ?? row.sortOrder,
      status: body.status ?? row.status,
      showInFooter: body.showInFooter ?? row.showInFooter,
      navUrl: body.navUrl === undefined ? row.navUrl : body.navUrl,
      flags: body.flags
        ? mergeFlags(
            { ...pageFixtures[0].flags, removableAll: false },
            body.flags,
            row.flags,
          )
        : row.flags,
      translations: applyTranslations(
        row.translations,
        body.translations,
        false,
      ),
    }
    rows = rows.map((r) => (r.id === row.id ? updated : r))
    return HttpResponse.json(toDetail(updated))
  }),

  http.post('/api/v1/pages/:id/move', async ({ params, request }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as {
      newParentId: number | null
      sortOrder: number
    }
    const f = row.flags
    if (!f.movableU && !f.movableD && !f.movableL && !f.movableR) {
      return message(409, 'Page is not movable.')
    }
    if (body.newParentId === row.id)
      return message(400, 'A page cannot be its own parent.')
    if (body.newParentId !== null && isDescendant(body.newParentId, row.id)) {
      return message(400, 'A page cannot be moved under its own descendant.')
    }
    if (body.newParentId !== null && !pagesStore.get(body.newParentId)) {
      return message(400, 'Parent page not found.')
    }
    rows = rows.map((r) =>
      r.id === row.id
        ? { ...r, parentId: body.newParentId, sortOrder: body.sortOrder }
        : r,
    )
    return noContent()
  }),

  http.delete('/api/v1/pages/:id', ({ params }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    if (!row.flags.removable)
      return message(409, 'Page is protected from deletion.')
    const hasChildren = rows.some((r) => r.parentId === row.id)
    if (hasChildren && !row.flags.removableAll) {
      return message(409, 'Page has children; removableAll is required.')
    }
    const toRemove = new Set<number>([row.id])
    let changed = true
    while (changed) {
      changed = false
      for (const r of rows) {
        if (
          r.parentId !== null &&
          toRemove.has(r.parentId) &&
          !toRemove.has(r.id)
        ) {
          toRemove.add(r.id)
          changed = true
        }
      }
    }
    rows = rows.filter((r) => !toRemove.has(r.id))
    return noContent()
  }),

  http.get('/api/v1/pages/:id/assets', ({ params }) => {
    const row = pagesStore.get(Number(params.id))
    return row ? HttpResponse.json(row.assets) : problem404()
  }),

  http.post('/api/v1/pages/:id/assets', async ({ params, request }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as {
      mediaId: number
      translations?: Record<string, { title: string }>
      groupLabel?: string | null
    }
    const media = mediaFixtures.find((m) => m.id === body.mediaId)
    if (!media) return message(400, 'Media asset not found.')
    const asset = {
      id:
        rows.flatMap((r) => r.assets).reduce((m, a) => Math.max(m, a.id), 100) +
        1,
      mediaId: media.id,
      originalName: media.originalName,
      mimeType: media.mimeType ?? '',
      sizeBytes: media.sizeBytes ?? 0,
      sortOrder: row.assets.length + 1,
      groupLabel: body.groupLabel ?? null,
      translations: body.translations ?? {
        az: { title: media.originalName },
        en: { title: media.originalName },
      },
    }
    rows = rows.map((r) =>
      r.id === row.id ? { ...r, assets: [...r.assets, asset] } : r,
    )
    return HttpResponse.json(asset)
  }),

  http.put('/api/v1/pages/:id/assets/order', async ({ params, request }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    const body = (await request.json()) as { assetIds: number[] }
    const expected = row.assets.map((a) => a.id).sort()
    const received = [...(body.assetIds ?? [])].sort()
    if (JSON.stringify(expected) !== JSON.stringify(received)) {
      return message(400, "assetIds must contain exactly the page's asset ids.")
    }
    rows = rows.map((r) =>
      r.id === row.id
        ? {
            ...r,
            assets: r.assets.map((a) => ({
              ...a,
              sortOrder: body.assetIds.indexOf(a.id) + 1,
            })),
          }
        : r,
    )
    return noContent()
  }),

  http.put('/api/v1/pages/:id/assets/:assetId', async ({ params, request }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    const asset = row.assets.find((a) => a.id === Number(params.assetId))
    if (!asset) return problem404()
    const body = (await request.json()) as {
      translations: Record<string, { title: string }>
      groupLabel?: string | null
    }
    if (!body.translations || Object.keys(body.translations).length === 0) {
      return message(400, 'At least one translation is required.')
    }
    const updated = {
      ...asset,
      translations: body.translations,
      groupLabel: body.groupLabel ?? null,
    }
    rows = rows.map((r) =>
      r.id === row.id
        ? {
            ...r,
            assets: r.assets.map((a) => (a.id === asset.id ? updated : a)),
          }
        : r,
    )
    return HttpResponse.json(updated)
  }),

  http.delete('/api/v1/pages/:id/assets/:assetId', ({ params }) => {
    const row = pagesStore.get(Number(params.id))
    if (!row) return problem404()
    if (!row.assets.some((a) => a.id === Number(params.assetId)))
      return problem404()
    rows = rows.map((r) =>
      r.id === row.id
        ? {
            ...r,
            assets: r.assets.filter((a) => a.id !== Number(params.assetId)),
          }
        : r,
    )
    return noContent()
  }),
]
