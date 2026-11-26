import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import { getPressRelease, getPressReleases } from './press-releases.api'

/** Records the query string of every list request. */
function captureListQueries(): string[] {
  const seen: string[] = []
  server.use(
    http.get(`${API}/api/v1/press-releases`, ({ request }) => {
      seen.push(new URL(request.url).search)
      return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 10 })
    }),
  )
  return seen
}

describe('press releases api', () => {
  it('reads the list envelope and maps the numeric type to the URL form', async () => {
    const list = await getPressReleases('az', { pageSize: 5 })

    expect(list.items).toHaveLength(5)
    expect(list.total).toBe(33)
    expect(list.items[0]?.type).toBe('1')
  })

  it('sends only the filters that are set', async () => {
    const seen = captureListQueries()

    await getPressReleases('az')
    await getPressReleases('en', { page: 3, pageSize: 9, type: '2', q: 'Dünya Bankı', from: '2026-09-01', to: '2026-09-30' })
    await getPressReleases('az', { q: '', from: undefined })

    expect(seen).toEqual([
      `?locale=az&page=1&pageSize=${DEFAULT_PAGE_SIZE}`,
      '?locale=en&page=3&pageSize=9&type=2&q=D%C3%BCnya+Bank%C4%B1&from=2026-09-01&to=2026-09-30',
      `?locale=az&page=1&pageSize=${DEFAULT_PAGE_SIZE}`,
    ])
  })

  it('keeps the interview type and treats a type the site does not know as news', async () => {
    const item = { title: 'A', slug: 'a', publishedAt: '2026-09-01T09:00:00+00:00', imageUrl: null }
    server.use(
      http.get(`${API}/api/v1/press-releases`, () =>
        HttpResponse.json({ items: [{ ...item, id: 1, type: 3 }, { ...item, id: 2, type: 4 }], total: 2, page: 1, pageSize: 10 }),
      ),
    )

    const list = await getPressReleases('az')

    expect(list.items.map((i) => i.type)).toEqual(['3', '1'])
  })

  it('treats an item without type (API before spec 029) as news', async () => {
    server.use(
      http.get(`${API}/api/v1/press-releases`, () =>
        HttpResponse.json({
          items: [{ id: 1, title: 'A', slug: 'a', publishedAt: '2026-09-01T09:00:00+00:00', imageUrl: null }],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
      ),
    )

    const list = await getPressReleases('az')

    expect(list.items[0]?.type).toBe('1')
  })

  it('reads the detail with its assets in API order; 404 → null', async () => {
    const detail = await getPressRelease('az', 'ucot-derecesi')

    expect(detail?.type).toBe('1')
    expect(detail?.assets.map((a) => a.mediaId)).toEqual([811, 812, 801, 813, 814, 815])
    await expect(getPressRelease('en', 'yoxdur')).resolves.toBeNull()
  })
})
