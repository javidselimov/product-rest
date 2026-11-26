import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { pageDetailFixture } from '@/shared/testing/fixtures/pages'
import { server } from '@/shared/testing/server'

import { loadFaqPage } from './loader'

describe('loadFaqPage (spec 051)', () => {
  it('builds view A, the breadcrumb and the video cards from the page and the FAQ', async () => {
    server.use(http.get(`${API}/api/v1/pages/:slug`, () => HttpResponse.json({ ...pageDetailFixture, title: 'Sual-cavab', slug: 'sual-cavab' })))
    const data = await loadFaqPage('az', 'sual-cavab', {})

    expect(data?.view.kind).toBe('all')
    expect(data?.basePath).toBe('/az/sual-cavab')
    expect(data?.shell.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Sual-cavab', href: null },
    ])
    expect(data?.shell.nav).toEqual([])
    expect(data?.videos).toEqual([
      {
        id: 1,
        title: 'Sığorta hadisəsi zamanı zərərlərin birbaşa tənzimlənməsi',
        href: 'https://www.youtube.com/watch?v=FZrEo1nXlgs',
        thumbnail: 'https://i.ytimg.com/vi/FZrEo1nXlgs/hqdefault.jpg',
      },
    ])
  })

  it('keeps the search and the topic in the shared address', async () => {
    const data = await loadFaqPage('az', 'sual-cavab', { q: 'repo', topic: 'pul-siyaseti' })
    expect(data?.shell.share.pageUrl).toMatch(/\/az\/sual-cavab\?q=repo&topic=pul-siyaseti$/)
  })

  it('is null when the FAQ API fails, so the route shows the CMS text', async () => {
    server.use(http.get(`${API}/api/v1/faq`, () => new HttpResponse(null, { status: 500 })))
    expect(await loadFaqPage('az', 'sual-cavab', {})).toBeNull()
  })

  it('is null when the en FAQ has no question yet, so the en page shows its own CMS text (spec 051 US4)', async () => {
    server.use(
      http.get(`${API}/api/v1/pages/:slug`, () => HttpResponse.json({ ...pageDetailFixture, title: 'FAQ', slug: 'faq' })),
      http.get(`${API}/api/v1/faq`, () => HttpResponse.json({ topics: [], videos: [] })),
    )
    expect(await loadFaqPage('en', 'faq', {})).toBeNull()
  })

  it('asks the API for the page locale, so en shows only what has an en translation', async () => {
    let asked: string | null = null
    server.use(
      http.get(`${API}/api/v1/pages/:slug`, () => HttpResponse.json({ ...pageDetailFixture, title: 'FAQ', slug: 'faq' })),
      http.get(`${API}/api/v1/faq`, ({ request }) => {
        asked = new URL(request.url).searchParams.get('locale')
        return undefined
      }),
    )
    const data = await loadFaqPage('en', 'faq', {})

    expect(asked).toBe('en')
    expect(data?.basePath).toBe('/en/faq')
    expect(data?.view.kind === 'all' ? data.view.topics.map((topic) => topic.name) : []).toEqual(['Monetary policy'])
  })

  it('is null when the FAQ is empty or the page does not exist in the locale', async () => {
    server.use(http.get(`${API}/api/v1/faq`, () => HttpResponse.json({ topics: [], videos: [] })))
    expect(await loadFaqPage('az', 'sual-cavab', {})).toBeNull()

    server.use(http.get(`${API}/api/v1/pages/:slug`, () => new HttpResponse(null, { status: 404 })))
    expect(await loadFaqPage('en', 'faq', {})).toBeNull()
  })
})
