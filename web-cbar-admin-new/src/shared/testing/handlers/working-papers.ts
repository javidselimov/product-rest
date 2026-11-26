/**
 * Working paper mocks: the real contract (spec 054, `contracts/admin-api.md`, `openapi/paths/working-papers.yaml`). The
 * list comes year, then number, descending; `search` looks in the titles of both languages; `year` and `status` filter.
 * A number taken in its year is a 409 `problem+json` with only a `message`, as `ConflictProblem` answers; the field
 * checks the panel also makes are a 400 with `errors` keyed like the form (`translations.en.authors`).
 */

import { HttpResponse, http } from 'msw'

import { mediaFixtures } from '../fixtures/media'
import {
  workingPaperFixtures,
  type WorkingPaperMockRow,
  type WorkingPaperMockTranslation,
} from '../fixtures/working-papers'
import { createCrudStore } from './lib/crud-store'

const BASE = '/api/v1/working-papers'
const CODE_DIGITS = 2

interface TranslationBody {
  title: string
  authors?: string[]
  abstract?: string | null
  keywords?: string[]
  mediaId?: number | null
}

interface UpsertBody {
  number: number
  year: number
  paperLanguage: WorkingPaperMockRow['paperLanguage']
  jelCodes?: string[]
  legacyPageId?: number | null
  status: string
  translations: Record<string, TranslationBody>
}

const problem = (status: number, message: string, errors?: Record<string, string[]>) =>
  HttpResponse.json(
    { status, title: message, message, ...(errors ? { errors } : {}) },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )

const code = (number: number, year: number) => `${String(number).padStart(CODE_DIGITS, '0')}/${year}`

function toTranslation(body: TranslationBody): WorkingPaperMockTranslation {
  const media = body.mediaId ? mediaFixtures.find((m) => m.id === body.mediaId) : undefined
  return {
    title: body.title,
    authors: body.authors ?? [],
    abstract: body.abstract ?? null,
    keywords: body.keywords ?? [],
    mediaId: body.mediaId ?? null,
    media: media
      ? { id: media.id, originalName: media.originalName, mimeType: media.mimeType ?? '', sizeBytes: media.sizeBytes ?? 0 }
      : null,
  }
}

export const workingPapersStore = createCrudStore<WorkingPaperMockRow>({
  path: '/working-papers',
  envelope: 'paged',
  seed: workingPaperFixtures,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['year', 'status'],
  listItem: (row) => ({
    id: row.id,
    number: row.number,
    year: row.year,
    code: row.code,
    title: row.translations.az?.title ?? row.translations.en?.title ?? null,
    status: row.status,
    locales: Object.keys(row.translations),
    updatedAt: row.updatedAt,
  }),
  applyBody: (body, existing, id) => {
    const input = body as unknown as UpsertBody
    const translations = Object.fromEntries(
      Object.entries(input.translations)
        .filter(([, tr]) => tr.title.trim() !== '')
        .map(([locale, tr]) => [locale, toTranslation(tr)]),
    )
    return {
      id,
      number: input.number,
      year: input.year,
      code: code(input.number, input.year),
      paperLanguage: input.paperLanguage,
      jelCodes: input.jelCodes ?? [],
      legacyPageId: input.legacyPageId ?? existing?.legacyPageId ?? null,
      status: input.status,
      createdAt: existing?.createdAt ?? '2026-11-18T10:00:00+00:00',
      updatedAt: '2026-11-18T10:00:00+00:00',
      translations,
    }
  },
  sort: (a, b) => b.year - a.year || b.number - a.number || a.id - b.id,
})

/** The API's own checks before the store saves (`WorkingPapersController.ValidateAsync`, `TakenAsync`). */
async function refuse(request: Request, exceptId: number | null) {
  const body = (await request.clone().json()) as UpsertBody
  const errors: Record<string, string[]> = {}
  let titled = 0
  for (const [locale, tr] of Object.entries(body.translations ?? {})) {
    if (!tr.title?.trim()) continue
    titled++
    if ((tr.authors ?? []).length === 0)
      errors[`translations.${locale}.authors`] = ['Başlığı olan dildə ən azı bir müəllif yazın.']
  }
  if (titled === 0) errors.translations = ['Ən azı bir dildə başlıq yazın.']
  const [first] = Object.values(errors)
  if (first) return problem(400, first[0]!, errors)

  const taken = workingPapersStore.store
    .all()
    .some((row) => row.number === body.number && row.year === body.year && row.id !== exceptId)
  if (taken) return problem(409, `${code(body.number, body.year)} nömrəli məqalə artıq var.`)
  return undefined
}

export const workingPapersHandlers = [
  http.post(BASE, ({ request }) => refuse(request, null)),
  http.put(`${BASE}/:id`, ({ request, params }) => refuse(request, Number(params.id))),
  ...workingPapersStore.handlers,
]
