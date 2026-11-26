import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { server } from '@/shared/testing/server'

import { findLocaleCounterpart, loadCmsPage } from './loader'

describe('loadCmsPage', () => {
  it('son seqmenti deşifrə edib səhifəni, zənciri və əlavələri qurur', async () => {
    const data = await loadCmsPage('az', ['pul-siyaseti', 'faiz-d%C9%99hlizi'])

    expect(data?.slug).toBe('faiz-dəhlizi')
    expect(data?.html).toContain('/media/12')
    expect(data?.attachments.map((a) => a.url)).toContain('/media/301')
    expect(data?.childPages).toEqual([])
  })

  it('məzmunu boş, uşaqları olan bölmə alt kartlar verir', async () => {
    const data = await loadCmsPage('az', ['haqqimizda'])

    expect(data?.section?.slug).toBe('haqqimizda')
    expect(data?.childPages.map((c) => c.href)).toEqual([
      '/az/haqqimizda/tarix',
      '/az/haqqimizda/teskilati-struktur-ve-idareetme',
    ])
  })

  it('"Haqqımızda" bölməsinin səhifəsi şablon datası alır, digər bölmə almır (spec 024)', async () => {
    const about = await loadCmsPage('az', ['haqqimizda', 'tarix'])
    expect(about?.shellPage?.shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Haqqımızda', 'Tarix'])
    expect(about?.shellPage?.shell.share.pageUrl).toBe('/az/haqqimizda/tarix')
    expect(about?.shellPage?.blocks).toEqual([{ kind: 'html', html: about?.html }])

    const other = await loadCmsPage('az', ['pul-siyaseti', 'faiz-dehlizi'])
    expect(other?.shellPage).toBeNull()
  })

  it('Media ağacının səhifəsi şablon alır, About blokları yox — adi məzmun (spec 028 FR-010)', async () => {
    server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(mediaTreeAz)))
    const data = await loadCmsPage('az', ['teqdimat-ve-meruzeler'])

    expect(data?.shellPage?.section).toBe('media')
    expect(data?.shellPage?.layout).toBe('plain')
    expect(data?.shellPage?.blocks).toEqual([{ kind: 'html', html: data?.html }])
    expect(data?.shellPage?.shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Media', 'Təqdimat və məruzələr'])
    expect(data?.shellPage?.shell.nav.find((n) => n.current)?.title).toBe('Təqdimat və məruzələr')
  })

  it('gives the FAQ topics linked to the page, with their address on the FAQ page (spec 051 US5)', async () => {
    let asked: URLSearchParams | null = null
    server.use(
      http.get(`${API}/api/v1/faq/topics`, ({ request }) => {
        asked = new URL(request.url).searchParams
        return HttpResponse.json([
          { slug: 'pul-siyaseti', name: 'Pul siyasəti', questionCount: 23 },
          { slug: 'repo', name: 'REPO əməliyyatları', questionCount: 4 },
        ])
      }),
    )
    const data = await loadCmsPage('az', ['pul-siyaseti', 'faiz-dehlizi'])

    expect(asked!.get('pageId')).toBe('21')
    expect(asked!.get('locale')).toBe('az')
    expect(data?.faqTopics).toEqual([
      { slug: 'pul-siyaseti', name: 'Pul siyasəti', questionCount: 23, href: '/az/sual-cavab?topic=pul-siyaseti' },
      { slug: 'repo', name: 'REPO əməliyyatları', questionCount: 4, href: '/az/sual-cavab?topic=repo' },
    ])
  })

  it('a failing FAQ request leaves the page without link cards, its content still loads (spec 051 US5)', async () => {
    server.use(http.get(`${API}/api/v1/faq/topics`, () => new HttpResponse(null, { status: 500 })))
    const data = await loadCmsPage('az', ['pul-siyaseti', 'faiz-dehlizi'])

    expect(data?.html).toContain('/media/12')
    expect(data?.faqTopics).toEqual([])
  })

  it('mövcud olmayan slug null verir', async () => {
    await expect(loadCmsPage('az', ['yoxdur'])).resolves.toBeNull()
  })

  it('a bare `%` in the address (Next.js passes `/az/%25` as `%`) is looked up as typed and is a missing page, not an error', async () => {
    const asked: string[] = []
    server.use(
      http.get(`${API}/api/v1/pages/:slug`, ({ params }) => {
        asked.push(String(params.slug))
        return new HttpResponse(null, { status: 404 })
      }),
    )
    await expect(loadCmsPage('az', ['%'])).resolves.toBeNull()
    await expect(findLocaleCounterpart('az', ['100%-test'])).resolves.toBeNull()
    expect(asked).toEqual(['%', '100%-test'])
  })
})

describe('findLocaleCounterpart', () => {
  it('digər dilin slug-ı səhifənin bu dildəki ünvanına çevrilir (/en/tarix → /en/history)', async () => {
    await expect(loadCmsPage('en', ['tarix'])).resolves.toBeNull()
    await expect(findLocaleCounterpart('en', ['tarix'])).resolves.toBe('/en/history')
  })

  it('keeps the query of the switched page, so a FAQ topic or a sort survives the language switch (spec 051 US4)', async () => {
    await expect(findLocaleCounterpart('en', ['tarix'], { topic: 'pul-siyaseti', sort: 'oldest' })).resolves.toBe(
      '/en/history?topic=pul-siyaseti&sort=oldest',
    )
  })

  it('heç bir dildə olmayan slug null verir', async () => {
    await expect(findLocaleCounterpart('en', ['yoxdur'])).resolves.toBeNull()
  })
})
