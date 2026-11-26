/**
 * Ana səhifə blokları mock-ları — real kontrakt (contracts/admin-api.md §6):
 * beş resurs da `{ items }` envelope, tam DTO. Bannerdə tərcümələr optional —
 * `createCrudStore`-un default POST-u boş `translations`-ı 400 ilə rədd etdiyi
 * üçün banner yaratma ayrıca handler ilə əvəz olunur (siyahıda store-dan ƏVVƏL).
 */

import { HttpResponse, http } from 'msw'

import {
  bannerFixtures,
  homepageLinkFixtures,
  newsSlideFixtures,
  publicationFixtures,
  runningLineFixtures,
  strategyDocFixtures,
  type BannerFixture,
  type HomepageLinkFixture,
  type NewsSlideFixture,
  type PublicationFixture,
  type RunningLineFixture,
  type StrategyDocFixture,
} from '../fixtures/homepage'
import { createCrudStore, type MockRow } from './lib/crud-store'
import { message, noContent } from './lib/errors'
import { mediaStore } from './media'
import { pagesStore } from './pages'

const bySortOrder = <Row extends MockRow>(a: Row, b: Row) =>
  Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0) || a.id - b.id

/** Yenilənmə vaxtını da yazır — real API hər upsert-də `updatedAt` qaytarır. */
const stamp = <Row extends MockRow>(
  body: Record<string, unknown>,
  existing: Row | null,
  id: number,
): Row =>
  ({
    ...(existing ?? {}),
    ...body,
    id,
    updatedAt: new Date().toISOString(),
  }) as unknown as Row

const banners = createCrudStore<BannerFixture>({
  path: '/banners',
  envelope: 'items',
  seed: bannerFixtures,
  sort: bySortOrder,
  applyBody: stamp,
})

/** Banner yaratma: tərcüməsiz (yalnız şəkilli) gövdə də qəbul olunur. */
const createBanner = http.post(banners.base, async ({ request }) => {
  const body = (await request.json()) as Record<string, unknown>
  const row = banners.store.insert(
    stamp<BannerFixture>(body, null, banners.store.nextId()),
  )
  return HttpResponse.json(row, { status: 201 })
})

const newsSlider = createCrudStore<NewsSlideFixture>({
  path: '/news-slider',
  envelope: 'items',
  seed: newsSlideFixtures,
  sort: bySortOrder,
  applyBody: stamp,
})

const runningLines = createCrudStore<RunningLineFixture>({
  path: '/running-lines',
  envelope: 'items',
  seed: runningLineFixtures,
  applyBody: stamp,
})

const homepageLinks = createCrudStore<HomepageLinkFixture>({
  path: '/homepage-links',
  envelope: 'items',
  seed: homepageLinkFixtures,
  sort: bySortOrder,
  applyBody: stamp,
})

const publications = createCrudStore<PublicationFixture>({
  path: '/homepage-publications',
  envelope: 'items',
  seed: publicationFixtures,
  sort: bySortOrder,
  applyBody: stamp,
})

// ---- strategy documents (spec 057) ----
// The real contract: a paged list whose items are flat, a detail with the translations and their covers, field errors
// keyed by body path (`translations.az.title`, `pageId`), soft delete and the full-set order endpoint.

export const STRATEGY_DOC_ORDER_INVALID =
  'Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır. Səhifəni yeniləyib yenidən cəhd edin.'
export const STRATEGY_DOC_LINK_REQUIRED = 'Keçid üçün səhifə seçin və ya ünvan yazın.'

const STRATEGY_LOCALES = ['az', 'en'] as const
const STRATEGY_UPDATED_AT = '2026-11-23T12:00:00+04:00'
type StrategyTranslation = NonNullable<StrategyDocFixture['translations']['az']>
type StrategyBody = {
  status: string
  pageId: number | null
  translations?: Record<string, Partial<StrategyTranslation> | undefined>
}

const assetRef = (id: number | null | undefined) => {
  const item = id ? mediaStore.all().find((media) => media.id === id) : undefined
  return item ? { mediaId: item.id, originalName: item.originalName, mimeType: item.mimeType, sizeBytes: item.sizeBytes } : null
}
const pageTitle = (id: number | null) => (id === null ? null : (pagesStore.get(id)?.translations.az?.title ?? null))
const pageShown = (id: number | null) => id !== null && pagesStore.get(id)?.status === 'published'
const isAllowedLink = (link: string) => /^https?:\/\//i.test(link) || (link.startsWith('/') && !link.startsWith('//'))
const nextStrategyOrder = (rows: StrategyDocFixture[]) => rows.reduce((max, row) => Math.max(max, row.sortOrder + 1), 1)

export const strategyDocs = createCrudStore<StrategyDocFixture>({
  path: '/homepage-strategy-docs',
  envelope: 'paged',
  seed: strategyDocFixtures,
  sort: (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['status'],
  listItem: (row): Record<string, unknown> => {
    const shown = row.translations.az ?? row.translations.en
    const titled = STRATEGY_LOCALES.filter((locale) => row.translations[locale])
    return {
      id: row.id,
      sortOrder: row.sortOrder,
      status: row.status,
      title: shown?.title ?? null,
      pageId: row.pageId,
      pageTitle: pageTitle(row.pageId),
      urls: Object.fromEntries(titled.flatMap((locale) => (row.translations[locale]?.url ? [[locale, row.translations[locale]!.url]] : []))),
      cover: assetRef(row.translations.az?.coverMediaId ?? row.translations.en?.coverMediaId),
      locales: titled,
      linkBroken: !titled.some((locale) => row.translations[locale]?.url || pageShown(row.pageId)),
      updatedAt: row.updatedAt,
    }
  },
  applyBody: (body, existing, id): StrategyDocFixture => {
    const { status, pageId, translations } = body as unknown as StrategyBody
    const titled = Object.entries(translations ?? {}).filter(([, tr]) => tr?.title?.trim())
    return {
      id,
      sortOrder: existing?.sortOrder ?? nextStrategyOrder(strategyDocs.store.all()),
      status,
      pageId,
      createdAt: existing?.createdAt ?? STRATEGY_UPDATED_AT,
      updatedAt: STRATEGY_UPDATED_AT,
      translations: Object.fromEntries(
        titled.map(([locale, tr]) => [
          locale,
          { title: tr!.title!.trim(), summary: tr!.summary || null, coverMediaId: tr!.coverMediaId ?? null, url: tr!.url || null },
        ]),
      ),
    }
  },
})

const strategyDetail = (row: StrategyDocFixture) => ({
  ...row,
  page: row.pageId !== null && pagesStore.get(row.pageId) ? { id: row.pageId, title: pageTitle(row.pageId) } : null,
  translations: Object.fromEntries(
    Object.entries(row.translations).map(([locale, tr]) => [locale, { ...tr, cover: assetRef(tr?.coverMediaId) }]),
  ),
})

type Fail = (key: string, text: string) => void

/** The checks of one language: its address and its cover. */
function strategyLocaleErrors(locale: string, tr: Partial<StrategyTranslation> | undefined, fail: Fail) {
  const url = tr?.url?.trim() ?? ''
  if (url && !isAllowedLink(url)) fail(`translations.${locale}.url`, 'Ünvan http://, https:// və ya / ilə başlamalıdır.')
  const cover = tr?.coverMediaId
  if (cover && !(assetRef(cover)?.mimeType ?? '').startsWith('image/'))
    fail(`translations.${locale}.coverMediaId`, 'Üz qabığı üçün şəkil faylı seçin.')
}

/** The API's field rules (`StrategyDocRules`), with its messages, keyed by body path. */
function strategyErrors(body: StrategyBody): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const fail: Fail = (key, text) => {
    errors[key] ??= [text]
  }
  if (body.status !== 'published' && body.status !== 'draft') fail('status', 'Sənəd yalnız «Dərc olunub» və ya «Qaralama» ola bilər.')
  const entries = Object.entries(body.translations ?? {})
  for (const [locale, tr] of entries) strategyLocaleErrors(locale, tr, fail)
  const titled = entries.filter(([, tr]) => tr?.title?.trim())
  if (titled.length === 0) fail('translations.az.title', 'Sənədin ən azı bir dildə başlığı olmalıdır.')
  const titledUrl = titled.some(([, tr]) => tr?.url?.trim())
  if (body.pageId === null && !titledUrl) fail('pageId', STRATEGY_DOC_LINK_REQUIRED)
  else if (body.pageId !== null && !pagesStore.get(body.pageId)) fail('pageId', 'Seçilmiş səhifə tapılmadı.')
  return errors
}

const strategyProblem = async (request: Request) => {
  const errors = strategyErrors((await request.clone().json()) as StrategyBody)
  const [first] = Object.values(errors)
  return first
    ? HttpResponse.json(
        { title: 'Bad Request', status: 400, message: first[0], errors, traceId: '00-test' },
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
      )
    : undefined
}

const strategyHandlers = [
  // Before the store's handlers: `PUT …/order` would otherwise match `PUT …/:id`.
  http.put(`${strategyDocs.base}/order`, async ({ request }) => {
    const ids = ((await request.json()) as { ids: number[] }).ids
    const current = strategyDocs.store.all()
    const known = new Set(current.map((row) => row.id))
    if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id)))
      return message(400, STRATEGY_DOC_ORDER_INVALID)
    ids.forEach((id, index) => strategyDocs.store.replace({ ...current.find((row) => row.id === id)!, sortOrder: index + 1 }))
    return noContent()
  }),
  http.get(`${strategyDocs.base}/:id`, ({ params }) => {
    const row = strategyDocs.store.get(Number(params.id))
    return row ? HttpResponse.json(strategyDetail(row)) : undefined
  }),
  http.post(strategyDocs.base, ({ request }) => strategyProblem(request)),
  http.put(`${strategyDocs.base}/:id`, ({ request }) => strategyProblem(request)),
  ...strategyDocs.handlers,
]

export const bannersStore = banners.store
export const newsSliderStore = newsSlider.store
export const runningLinesStore = runningLines.store
export const homepageLinksStore = homepageLinks.store
export const publicationsStore = publications.store
export const strategyDocsStore = strategyDocs.store

export const resetHomepageStores = () => {
  bannersStore.reset()
  newsSliderStore.reset()
  runningLinesStore.reset()
  homepageLinksStore.reset()
  publicationsStore.reset()
  strategyDocsStore.reset()
}

export const homepageHandlers = [
  createBanner,
  ...banners.handlers,
  ...newsSlider.handlers,
  ...runningLines.handlers,
  ...homepageLinks.handlers,
  ...publications.handlers,
  ...strategyHandlers,
]
