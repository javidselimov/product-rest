/**
 * FAQ mocks: the real contract (spec 051, `specs/051-faq-page/contracts/admin-api.md`). List rows are flat and
 * az-first; a topic with questions cannot be deleted (409); the order endpoints need the full set (400); a link
 * without a YouTube id is refused (400). Messages are the API's own Azerbaijani text.
 */

import { HttpResponse, http } from 'msw'

import { youtubeVideoId } from '@/shared/crud/youtube-url'
import {
  faqQuestionFixtures,
  faqTopicFixtures,
  faqVideoFixtures,
  type FaqQuestionMockRow,
  type FaqTopicMockRow,
  type FaqVideoMockRow,
} from '../fixtures/faq'
import { pagesStore } from './pages'
import { createCrudStore } from './lib/crud-store'
import { message, noContent } from './lib/errors'

export const FAQ_ORDER_INVALID =
  'Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır. Səhifəni yeniləyib yenidən cəhd edin.'
export const FAQ_YOUTUBE_INVALID = 'YouTube linki tanınmadı'
export const faqTopicInUse = (count: number) =>
  `Mövzuda ${count} sual var — əvvəl onları başqa mövzuya keçirin və ya silin`

const LOCALES = ['az', 'en'] as const
const bySortOrder = (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder
const isBlankHtml = (html: string | undefined) =>
  !html || (!/<(img|table|iframe|video|audio)\b/i.test(html) && html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() === '')

const pageTitle = (id: number) => {
  const page = pagesStore.get(id)
  return page ? (page.translations.az?.title ?? page.translations.en?.title ?? null) : null
}
const pagesOf = (row: FaqTopicMockRow) =>
  row.pageIds.flatMap((id) => {
    const title = pageTitle(id)
    return title === null ? [] : [{ id, title }]
  })

const topicName = (row: FaqTopicMockRow | null) => row?.translations.az?.name ?? row?.translations.en?.name ?? null

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const faqTopicsStore = createCrudStore<FaqTopicMockRow>({
  path: '/faq/topics',
  envelope: 'paged',
  seed: faqTopicFixtures,
  sort: bySortOrder,
  searchFields: ['translations.az.name', 'translations.en.name'],
  filterFields: ['status'],
  applyBody: (body, existing, id): FaqTopicMockRow => {
    const translations = body.translations as FaqTopicMockRow['translations']
    const all: FaqTopicMockRow[] = faqTopicsStore.store.all()
    return {
      id,
      slug: existing?.slug ?? slugify(translations.az?.name ?? translations.en?.name ?? `movzu-${id}`),
      sortOrder: existing?.sortOrder ?? all.reduce((max, row) => Math.max(max, row.sortOrder + 1), 0),
      status: String(body.status),
      translations,
      pageIds: (body.pageIds as number[] | null | undefined) ?? existing?.pageIds ?? [],
    }
  },
})

const topicQuestions = (topicId: number): FaqQuestionMockRow[] =>
  faqQuestionsStore.store
    .all()
    .filter((row) => row.topicId === topicId)
    .sort(bySortOrder)

const completeLocales = (row: FaqQuestionMockRow) =>
  LOCALES.filter((locale) => {
    const tr = row.translations[locale]
    return Boolean(tr?.question.trim()) && !isBlankHtml(tr?.answer)
  })

const questionRow = (row: FaqQuestionMockRow) => {
  const complete = completeLocales(row)
  return {
    id: row.id,
    topicId: row.topicId,
    topicName: topicName(faqTopicsStore.store.get(row.topicId)),
    sortOrder: row.sortOrder,
    number: topicQuestions(row.topicId).findIndex((q) => q.id === row.id) + 1,
    status: row.status,
    question: row.translations.az?.question ?? row.translations.en?.question ?? null,
    locales: complete,
    incompleteLocales: LOCALES.filter((locale) => row.translations[locale] && !complete.includes(locale)),
  }
}

export const faqQuestionsStore = createCrudStore<FaqQuestionMockRow>({
  path: '/faq/questions',
  envelope: 'paged',
  seed: faqQuestionFixtures,
  applyBody: (body, existing, id): FaqQuestionMockRow => {
    const topicId = Number(body.topicId)
    const moved = !existing || existing.topicId !== topicId
    return {
      id,
      topicId,
      sortOrder: moved
        ? topicQuestions(topicId).reduce((max, row) => Math.max(max, row.sortOrder + 1), 0)
        : existing.sortOrder,
      status: String(body.status),
      translations: body.translations as FaqQuestionMockRow['translations'],
    }
  },
})

export const faqVideosStore = createCrudStore<FaqVideoMockRow>({
  path: '/faq/videos',
  envelope: 'paged',
  seed: faqVideoFixtures,
  sort: bySortOrder,
  filterFields: ['status'],
  listItem: (row) => ({
    id: row.id,
    youtubeUrl: row.youtubeUrl,
    youtubeId: row.youtubeId,
    sortOrder: row.sortOrder,
    status: row.status,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
  }),
  applyBody: (body, existing, id): FaqVideoMockRow => ({
    id,
    youtubeUrl: String(body.youtubeUrl).trim(),
    youtubeId: youtubeVideoId(String(body.youtubeUrl)) ?? '',
    sortOrder:
      existing?.sortOrder ?? faqVideosStore.store.all().reduce((max, row) => Math.max(max, row.sortOrder + 1), 0),
    status: String(body.status),
    translations: body.translations as FaqVideoMockRow['translations'],
  }),
})

/** `PUT …/order`: the full set in a new order, written as `sortOrder = index`. */
function reorder<Row extends { id: number; sortOrder: number }>(
  current: Row[],
  replace: (row: Row) => unknown,
  ids: number[],
) {
  const known = new Set(current.map((row) => row.id))
  const valid = ids.length === known.size && new Set(ids).size === ids.length && ids.every((id) => known.has(id))
  if (!valid) return message(400, FAQ_ORDER_INVALID)
  ids.forEach((id, index) => replace({ ...current.find((row) => row.id === id)!, sortOrder: index }))
  return noContent()
}

const orderBody = async (request: Request) => ((await request.json()) as { ids: number[] }).ids

/** Question body rule of the API: a started language needs both the question and the answer; one language at least. */
function invalidQuestion(body: Record<string, unknown>) {
  const translations = (body.translations ?? {}) as Record<string, Partial<{ question: string; answer: string }>>
  const filled = Object.values(translations).filter((tr) => tr.question?.trim() || !isBlankHtml(tr.answer))
  if (filled.length === 0) return 'Ən azı bir dildə sual və cavab yazın'
  if (filled.some((tr) => !tr.question?.trim() || isBlankHtml(tr.answer)))
    return 'Başlanmış dildə həm sual, həm cavab olmalıdır'
  return null
}

export const faqHandlers = [
  // Order endpoints first: `PUT /faq/topics/order` would otherwise match `PUT /faq/topics/:id`.
  http.put(`${faqTopicsStore.base}/order`, async ({ request }) =>
    reorder(faqTopicsStore.store.all(), faqTopicsStore.store.replace, await orderBody(request)),
  ),
  http.put(`${faqTopicsStore.base}/:id/questions/order`, async ({ params, request }) =>
    reorder(topicQuestions(Number(params.id)), faqQuestionsStore.store.replace, await orderBody(request)),
  ),
  http.put(`${faqVideosStore.base}/order`, async ({ request }) =>
    reorder(faqVideosStore.store.all(), faqVideosStore.store.replace, await orderBody(request)),
  ),

  http.get(faqTopicsStore.base, ({ request }) => {
    const url = new URL(request.url)
    const pageId = url.searchParams.get('pageId')
    const search = url.searchParams.get('search')?.toLowerCase().trim() ?? ''
    const status = url.searchParams.get('status')
    const items = [...faqTopicsStore.store.all()]
      .sort(bySortOrder)
      .filter((row) => pageId === null || row.pageIds.includes(Number(pageId)))
      .filter((row) => !status || row.status === status)
      .filter((row) => !search || (topicName(row) ?? '').toLowerCase().includes(search))
      .map((row) => ({
        id: row.id,
        slug: row.slug,
        sortOrder: row.sortOrder,
        status: row.status,
        name: topicName(row),
        questionCount: topicQuestions(row.id).length,
        locales: LOCALES.filter((locale) => row.translations[locale]?.name),
        pages: pagesOf(row),
      }))
    return HttpResponse.json({ items, total: items.length, page: 1, pageSize: items.length })
  }),
  http.get(`${faqTopicsStore.base}/:id`, ({ params }) => {
    const row = faqTopicsStore.store.get(Number(params.id))
    return row ? HttpResponse.json({ ...row, pages: pagesOf(row) }) : undefined
  }),
  http.delete(`${faqTopicsStore.base}/:id`, ({ params }) => {
    const count = topicQuestions(Number(params.id)).length
    return count > 0 ? message(409, faqTopicInUse(count)) : undefined
  }),

  http.get(faqQuestionsStore.base, ({ request }) => {
    const url = new URL(request.url)
    const topicId = url.searchParams.get('topicId')
    const status = url.searchParams.get('status')
    const missing = url.searchParams.get('missingLocale')
    const search = url.searchParams.get('search')?.toLowerCase().trim() ?? ''
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
    const topicOrder = (id: number) => faqTopicsStore.store.get(id)?.sortOrder ?? 0
    const rows = [...faqQuestionsStore.store.all()]
      .sort((a, b) => topicOrder(a.topicId) - topicOrder(b.topicId) || a.sortOrder - b.sortOrder)
      .filter((row) => !topicId || row.topicId === Number(topicId))
      .filter((row) => !status || row.status === status)
      .filter((row) => !missing || !completeLocales(row).includes(missing as 'az' | 'en'))
      .filter(
        (row) =>
          !search ||
          LOCALES.some((locale) => row.translations[locale]?.question.toLowerCase().includes(search)),
      )
      .map(questionRow)
    const start = (page - 1) * pageSize
    return HttpResponse.json({ items: rows.slice(start, start + pageSize), total: rows.length, page, pageSize })
  }),
  http.post(faqQuestionsStore.base, async ({ request }) => {
    const problem = invalidQuestion((await request.clone().json()) as Record<string, unknown>)
    return problem ? message(400, problem) : undefined
  }),
  http.put(`${faqQuestionsStore.base}/:id`, async ({ request }) => {
    const problem = invalidQuestion((await request.clone().json()) as Record<string, unknown>)
    return problem ? message(400, problem) : undefined
  }),

  http.post(faqVideosStore.base, async ({ request }) => {
    const body = (await request.clone().json()) as { youtubeUrl?: string }
    return youtubeVideoId(body.youtubeUrl ?? '') ? undefined : message(400, FAQ_YOUTUBE_INVALID)
  }),
  http.put(`${faqVideosStore.base}/:id`, async ({ request }) => {
    const body = (await request.clone().json()) as { youtubeUrl?: string }
    return youtubeVideoId(body.youtubeUrl ?? '') ? undefined : message(400, FAQ_YOUTUBE_INVALID)
  }),

  ...faqTopicsStore.handlers,
  ...faqQuestionsStore.handlers,
  ...faqVideosStore.handlers,
]
