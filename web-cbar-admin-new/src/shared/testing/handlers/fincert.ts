/**
 * FinCERT mocks: the real contract (spec 053, `specs/053-fincert-page/contracts/admin-api.md`). The settings `PUT`
 * keeps a locale left out and answers field failures with `errors` keyed by body path; a direction locale with only a
 * title or only a body is refused; the order endpoints need the full set; a logo must be an image and the RFC file a
 * document. Messages are the API's own Azerbaijani text.
 */

import { HttpResponse, http } from 'msw'

import {
  fincertDirectionFixtures,
  fincertMembershipFixtures,
  fincertSettingsFixture,
  type FincertDirectionMockRow,
  type FincertMembershipMockRow,
  type FincertSettingsMock,
  type FincertSettingsMockTranslation,
} from '../fixtures/fincert'
import { createCrudStore } from './lib/crud-store'
import { message, noContent } from './lib/errors'
import { mediaStore } from './media'

export const FINCERT_ORDER_INVALID =
  'Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır. Səhifəni yeniləyib yenidən cəhd edin.'
export const FINCERT_EMAIL_INVALID = 'E-poçt ünvanı düzgün deyil (məs. fincert@cbar.az).'
export const FINCERT_PAIR_INVALID = '«az» dilində başlıq və mətn birlikdə doldurulmalıdır.'
export const FINCERT_LOGO_INVALID = 'Loqo üçün şəkil faylı seçin.'

const LOCALES = ['az', 'en'] as const
const UPDATED_AT = '2026-11-19T12:00:00+04:00'
const bySortOrder = (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder
const nextSortOrder = (rows: { sortOrder: number }[]): number => rows.reduce((max, row) => Math.max(max, row.sortOrder + 1), 1)
const isWebUrl = (value: string) => /^https?:\/\/[^\s]+$/i.test(value)
const isBlankHtml = (html: string | undefined) => !html || html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() === ''
const mime = (id: number) => mediaStore.all().find((item) => item.id === id)?.mimeType ?? null
const assetRef = (id: number | null) => {
  const item = id === null ? undefined : mediaStore.all().find((media) => media.id === id)
  return item ? { mediaId: item.id, originalName: item.originalName, mimeType: item.mimeType, sizeBytes: item.sizeBytes } : null
}

// ---- settings ----

let settings: FincertSettingsMock = structuredClone(fincertSettingsFixture)

const settingsBody = () => ({
  ...settings,
  translations: Object.fromEntries(
    Object.entries(settings.translations).map(([locale, tr]) => [locale, { ...tr, rfcFile: assetRef(tr.rfcMediaId) }]),
  ),
})

type SettingsUpdate = Omit<FincertSettingsMock, 'updatedAt' | 'translations'> & {
  translations?: Partial<Record<string, Partial<FincertSettingsMockTranslation>>>
}

function settingsErrors(body: SettingsUpdate): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  if (body.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) errors.email = [FINCERT_EMAIL_INVALID]
  if (body.portalUrl && !isWebUrl(body.portalUrl))
    errors.portalUrl = ['Portalın ünvanı http:// və ya https:// ilə başlayan tam link olmalıdır.']
  for (const [locale, tr] of Object.entries(body.translations ?? {})) {
    if (tr?.rfcUrl && !isWebUrl(tr.rfcUrl))
      errors[`translations.${locale}.rfcUrl`] = ['Link http:// və ya https:// ilə başlayan tam ünvan olmalıdır.']
    const fileType = tr?.rfcMediaId ? mime(tr.rfcMediaId) : null
    if (tr?.rfcMediaId && (!fileType || fileType.startsWith('image/')))
      errors[`translations.${locale}.rfcMediaId`] = ['RFC-2350 üçün sənəd faylı seçin (PDF, Word, Excel, ZIP).']
  }
  return errors
}

export const fincertSettingsStore = {
  get: () => settings,
  reset: () => {
    settings = structuredClone(fincertSettingsFixture)
  },
}

// ---- directions ----

const directionLocales = (row: FincertDirectionMockRow) => LOCALES.filter((locale) => row.translations[locale])

export const fincertDirectionsStore = createCrudStore<FincertDirectionMockRow>({
  path: '/fincert/directions',
  envelope: 'paged',
  seed: fincertDirectionFixtures,
  sort: bySortOrder,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['status'],
  listItem: (row): Record<string, unknown> => ({
    id: row.id,
    number: [...(fincertDirectionsStore.store.all() as FincertDirectionMockRow[])].sort(bySortOrder).findIndex((d) => d.id === row.id) + 1,
    sortOrder: row.sortOrder,
    status: row.status,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
    locales: directionLocales(row),
    incompleteLocales: [],
    updatedAt: row.updatedAt,
  }),
  applyBody: (body, existing, id): FincertDirectionMockRow => {
    const sent = (body.translations ?? {}) as Record<string, { title?: string; body?: string }>
    const filled = Object.fromEntries(
      Object.entries(sent).filter(([, tr]) => tr.title?.trim() && !isBlankHtml(tr.body)),
    ) as FincertDirectionMockRow['translations']
    return {
      id,
      sortOrder:
        existing?.sortOrder ?? nextSortOrder(fincertDirectionsStore.store.all() as FincertDirectionMockRow[]),
      status: String(body.status),
      updatedAt: UPDATED_AT,
      translations: filled,
    }
  },
})

function invalidDirection(body: Record<string, unknown>) {
  const translations = (body.translations ?? {}) as Record<string, { title?: string; body?: string }>
  for (const [locale, tr] of Object.entries(translations)) {
    const started = Boolean(tr.title?.trim()) || !isBlankHtml(tr.body)
    const filled = Boolean(tr.title?.trim()) && !isBlankHtml(tr.body)
    if (started && !filled) return `«${locale}» dilində başlıq və mətn birlikdə doldurulmalıdır.`
  }
  const any = Object.values(translations).some((tr) => tr.title?.trim() && !isBlankHtml(tr.body))
  return any ? null : 'Ən azı bir dildə başlıq və mətn yazılmalıdır.'
}

// ---- memberships ----

export const fincertMembershipsStore = createCrudStore<FincertMembershipMockRow>({
  path: '/fincert/memberships',
  envelope: 'paged',
  seed: fincertMembershipFixtures,
  sort: bySortOrder,
  searchFields: ['translations.az.name', 'translations.en.name'],
  filterFields: ['status'],
  listItem: (row): Record<string, unknown> => {
    const shown = row.translations.az ?? row.translations.en
    return {
      id: row.id,
      sortOrder: row.sortOrder,
      status: row.status,
      name: shown?.name ?? null,
      badge: shown?.badge ?? null,
      logo: assetRef(row.logoMediaId),
      url: row.url,
      locales: LOCALES.filter((locale) => row.translations[locale]),
      updatedAt: row.updatedAt,
    }
  },
  applyBody: (body, existing, id): FincertMembershipMockRow => ({
    id,
    sortOrder:
      existing?.sortOrder ?? nextSortOrder(fincertMembershipsStore.store.all() as FincertMembershipMockRow[]),
    status: String(body.status),
    logoMediaId: (body.logoMediaId as number | null) ?? null,
    url: (body.url as string | null) || null,
    updatedAt: UPDATED_AT,
    translations: body.translations as FincertMembershipMockRow['translations'],
  }),
})

const membershipDetail = (row: FincertMembershipMockRow) => ({ ...row, logo: assetRef(row.logoMediaId) })

function invalidMembership(body: Record<string, unknown>) {
  const logo = body.logoMediaId as number | null | undefined
  if (logo && !(mime(logo) ?? '').startsWith('image/')) return FINCERT_LOGO_INVALID
  const url = body.url as string | null | undefined
  if (url && !isWebUrl(url)) return 'Link http:// və ya https:// ilə başlayan tam ünvan olmalıdır.'
  const translations = (body.translations ?? {}) as Record<string, { name?: string }>
  return Object.values(translations).some((tr) => tr.name?.trim()) ? null : 'Təşkilatın ən azı bir dildə adı olmalıdır.'
}

// ---- order ----

function reorder<Row extends { id: number; sortOrder: number }>(current: Row[], replace: (row: Row) => unknown, ids: number[]) {
  const known = new Set(current.map((row) => row.id))
  const valid = ids.length === known.size && new Set(ids).size === ids.length && ids.every((id) => known.has(id))
  if (!valid) return message(400, FINCERT_ORDER_INVALID)
  ids.forEach((id, index) => replace({ ...current.find((row) => row.id === id)!, sortOrder: index + 1 }))
  return noContent()
}

const orderBody = async (request: Request) => ((await request.json()) as { ids: number[] }).ids

export function resetFincertMocks() {
  fincertSettingsStore.reset()
  fincertDirectionsStore.store.reset()
  fincertMembershipsStore.store.reset()
}

export const fincertHandlers = [
  http.get('/api/v1/fincert/settings', () => HttpResponse.json(settingsBody())),
  http.put('/api/v1/fincert/settings', async ({ request }) => {
    const body = (await request.json()) as SettingsUpdate
    const errors = settingsErrors(body)
    const [first] = Object.values(errors)
    if (first)
      return HttpResponse.json(
        { title: 'Bad Request', status: 400, message: first[0], errors, traceId: '00-test' },
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
      )
    const translations = { ...settings.translations }
    for (const [locale, tr] of Object.entries(body.translations ?? {})) {
      translations[locale as 'az' | 'en'] = {
        mission: tr?.mission ?? null,
        portalTitle: tr?.portalTitle ?? null,
        portalDescription: tr?.portalDescription ?? null,
        rfcMediaId: tr?.rfcMediaId ?? null,
        rfcUrl: tr?.rfcUrl ?? null,
      }
    }
    settings = { email: body.email, phone: body.phone, portalUrl: body.portalUrl, updatedAt: UPDATED_AT, translations }
    return HttpResponse.json(settingsBody())
  }),

  // Order endpoints first: `PUT …/order` would otherwise match `PUT …/:id`.
  http.put(`${fincertDirectionsStore.base}/order`, async ({ request }) =>
    reorder(fincertDirectionsStore.store.all(), fincertDirectionsStore.store.replace, await orderBody(request)),
  ),
  http.put(`${fincertMembershipsStore.base}/order`, async ({ request }) =>
    reorder(fincertMembershipsStore.store.all(), fincertMembershipsStore.store.replace, await orderBody(request)),
  ),

  http.post(fincertDirectionsStore.base, async ({ request }) => {
    const problem = invalidDirection((await request.clone().json()) as Record<string, unknown>)
    return problem ? message(400, problem) : undefined
  }),
  http.put(`${fincertDirectionsStore.base}/:id`, async ({ request }) => {
    const problem = invalidDirection((await request.clone().json()) as Record<string, unknown>)
    return problem ? message(400, problem) : undefined
  }),

  http.get(`${fincertMembershipsStore.base}/:id`, ({ params }) => {
    const row = fincertMembershipsStore.store.get(Number(params.id))
    return row ? HttpResponse.json(membershipDetail(row)) : undefined
  }),
  http.post(fincertMembershipsStore.base, async ({ request }) => {
    const problem = invalidMembership((await request.clone().json()) as Record<string, unknown>)
    return problem ? message(400, problem) : undefined
  }),
  http.put(`${fincertMembershipsStore.base}/:id`, async ({ request }) => {
    const problem = invalidMembership((await request.clone().json()) as Record<string, unknown>)
    return problem ? message(400, problem) : undefined
  }),

  ...fincertDirectionsStore.handlers,
  ...fincertMembershipsStore.handlers,
]
