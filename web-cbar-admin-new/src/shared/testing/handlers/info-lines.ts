/**
 * Məlumat sətirləri mock-ları — real kontrakt (contracts/admin-api.md §6):
 * siyahı QRUPLU paged `{ items: [{ alias, lines }], total: <sətir sayı>, page, pageSize }`
 * (`alias` like-filtr, pageSize 50); `GET/POST/PUT/DELETE /{id}` tək sətirlə işləyir
 * (`createCrudStore`-dan; onun öz siyahı handler-i qruplu handler-dən SONRA gəldiyi
 * üçün heç vaxt uyğun gəlmir).
 */

import { HttpResponse, http } from 'msw'

import { infoLineFixtures, type InfoLineFixture } from '../fixtures/info-lines'
import { LARGE_PAGE_SIZE } from '@/shared/constants/pagination'
import { createCrudStore } from './lib/crud-store'

const INFO_LINES_PAGE_SIZE = LARGE_PAGE_SIZE

const lines = createCrudStore<InfoLineFixture>({
  path: '/info-lines',
  envelope: 'paged',
  seed: infoLineFixtures,
  pageSize: INFO_LINES_PAGE_SIZE,
  applyBody: (body, existing, id) =>
    ({
      ...(existing ?? {}),
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    }) as InfoLineFixture,
})

const byAliasThenSort = (a: InfoLineFixture, b: InfoLineFixture) =>
  a.alias.localeCompare(b.alias) || a.sortOrder - b.sortOrder || a.id - b.id

const groupedList = http.get(lines.base, ({ request }) => {
  const url = new URL(request.url)
  const alias = url.searchParams.get('alias')?.toLowerCase().trim() ?? ''
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(
    url.searchParams.get('pageSize') ?? String(INFO_LINES_PAGE_SIZE),
  )

  const matching = lines.store
    .all()
    .filter((line) => !alias || line.alias.toLowerCase().includes(alias))
    .sort(byAliasThenSort)
  const start = (page - 1) * pageSize
  const pageLines = matching.slice(start, start + pageSize)

  const groups: { alias: string; lines: InfoLineFixture[] }[] = []
  for (const line of pageLines) {
    const group = groups.find((g) => g.alias === line.alias)
    if (group) group.lines.push(line)
    else groups.push({ alias: line.alias, lines: [line] })
  }

  return HttpResponse.json({
    items: groups,
    total: matching.length,
    page,
    pageSize,
  })
})

export const infoLinesStore = lines.store

export const infoLinesHandlers = [groupedList, ...lines.handlers]
