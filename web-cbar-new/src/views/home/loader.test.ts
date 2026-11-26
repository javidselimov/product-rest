/**
 * Home page loader: the request count (spec 002 SC-002; spec 022 SC-004: the hidden video
 * tab and the featured release are no longer requested), and a block error marks only that block.
 */
import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { pastEvents } from '@/shared/testing/fixtures/events'
import { azirReferenceFixture } from '@/shared/testing/fixtures/stats'
import { server } from '@/shared/testing/server'

import { loadHome } from './loader'

/** News, announcements and gallery with `pageSize=4` (Figma: 4 cards). */
const FEED_LENGTHS = [4, 4, 4]

// The AZIR request goes with `from = today − 60` (spec 021 R13), so the fixture dates stay fixed.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-08T12:00:00'))
})
afterEach(() => {
  vi.useRealTimers()
})

function recordRequests() {
  const seen: string[] = []
  server.events.on('request:start', ({ request }) => {
    const url = new URL(request.url)
    seen.push(`${url.pathname}${url.search}`)
  })
  return seen
}

describe('loadHome', () => {
  it('10 paralel sorğu + əvvəlki vərəq; gizli video tabının sorğusu yoxdur (spec 022 FR-015)', async () => {
    const seen = recordRequests()

    await loadHome('az')

    expect(seen).toEqual(
      expect.arrayContaining([
        '/api/v1/homepage?locale=az',
        '/api/v1/currencies?locale=az',
        '/api/v1/press-releases?locale=az&page=1&pageSize=4&type=1',
        '/api/v1/press-releases?locale=az&page=1&pageSize=4&type=2',
        '/api/v1/inflation',
        '/api/v1/inflation/settings',
        '/api/v1/azir?from=2026-08-09',
        '/api/v1/galleries?locale=az&page=1&pageSize=4',
        '/api/v1/yield-curves/latest',
        '/api/v1/events?locale=az&sort=newest&pageSize=3',
        '/api/v1/currencies?locale=az&date=2026-09-13',
        '/api/v1/currencies?locale=az&date=2026-09-12',
      ]),
    )
    expect(seen.some((path) => path.startsWith('/api/v1/videos'))).toBe(false)
    expect(seen.some((path) => path.startsWith('/api/v1/press-releases/'))).toBe(false)

    // 9 (first wave) + 5 (`previousSheet`) = 14. Before spec 022 it was 15:
    // the video tab is hidden and the new news cards have no featured-release summary;
    // the Announcements tab (press release `type=2`) adds one request.
    //
    // `previousSheet` was parallelised in spec 003 phase 7: it used to stop at the first hit
    // (2 requests with this fixture), now it checks five days at once. The result is the same, the choice
    // still goes by date order; only the waiting is parallel. Measured with an artificial 3 s
    // delay, the home page went from 15.5 s to 6.7 s. The extra requests
    // go through `@/server/cached`, so later visits do not repeat them.
    expect(seen).toHaveLength(15)
    expect(
      seen.filter((path) => path.includes('currencies?locale=az&date=')),
    ).toHaveLength(5)
  })

  it('hides the calendar when the events request fails or finds nothing (spec 034 US5)', async () => {
    server.use(http.get(`${API}/api/v1/events`, () => new HttpResponse(null, { status: 500 })))
    const failed = await loadHome('az')
    expect(failed.calendar).toEqual([])
    expect(failed.strategyDocs.length).toBeGreaterThan(0)

    server.use(http.get(`${API}/api/v1/events`, () => HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 3 })))
    expect((await loadHome('az')).calendar).toEqual([])
  })

  it('keeps showing the newest past events when nothing is upcoming (spec 059 US1)', async () => {
    // An API with past events only: `when=upcoming` would find nothing, `sort=newest` returns them newest first
    // (the fixture's past events, 2026-06-04 and the legacy COP29 of 2024, are already in that order).
    server.use(
      http.get(`${API}/api/v1/events`, ({ request }) => {
        const params = new URL(request.url).searchParams
        const items = params.get('when') === 'upcoming' ? [] : pastEvents
        return HttpResponse.json({ items, total: items.length, page: 1, pageSize: 3 })
      }),
    )

    const { calendar } = await loadHome('az')

    expect(calendar.map((e) => e.title)).toEqual(pastEvents.map((e) => e.title))
    // A legacy event opens its CMS page (spec 034).
    expect(calendar[1].href).toBe('/az/cop29')
  })

  it('blokları Figma xəritəsi ilə doldurur (spec 022 data-model §2)', async () => {
    const data = await loadHome('az')

    expect(data.hero).toHaveLength(3)
    expect(data.hero[0].href).toBe('/az/press-releases/ucot-derecesi')
    expect(data.hero[0].imageUrl).toBe(`/media/501`)
    expect(data.hero[2].href).toBe('https://conference.example.az')

    expect(data.currency?.rows.map((r) => `${r.code}:${r.trend}`)).toEqual([
      'USD:flat',
      'EUR:down',
      'RUB:up',
      'TRY:flat',
    ])
    expect(data.corridor.map((r) => r.value)).toEqual([
      '6,25%',
      '8,25%',
      '7,25%',
    ])
    // The latest `updatedAt` of the three rows.
    expect(data.corridorDateLabel).toBe('25.09.2026')
    expect(data.inflation?.current).toBe(5.7)
    expect(data.inflation?.currentDate).toBe('avqust 2026')
    expect(data.inflation?.target).toBe('4 (±2)')
    expect(data.moneyMarket?.current1D).toBe(7.02)
    expect(data.moneyMarket?.current1DReserve).toBe(false)
    expect(data.moneyMarket?.terms.map((tm) => tm.days)).toEqual([30, 90, 180])
    expect(data.feedTabs.map((tab) => tab.key)).toEqual(['news', 'announcements', 'gallery'])
    expect(data.feedTabs.map((tab) => tab.items.length)).toEqual(FEED_LENGTHS)
    // Announcements: press release `type=2` (as on the old site).
    expect(data.feedTabs[1].items[0].href).toMatch(/^\/az\/press-releases\//)
    expect(data.feedTabs[1].viewAllHref).toBe('/az/press-releases?type=2')
    expect(data.feedTabs[0].viewAllLabel).toBe('Bütün xəbərlər')
    expect(data.promo?.title).toBe('Yubiley sikkələri')
    // Spec 057: the first three of `/homepage` in the editor's order; a site path gets the locale, a URL stays as it is.
    expect(data.strategyDocs.map((d) => d.href)).toEqual([
      '/az/maliyye-sektorunun-inkisaf-strategiyasi',
      'https://www.cbar.az/strategy.pdf',
      '/az/mikromaliyye-modeli-uzre-strateji-cercive',
    ])
    expect(data.strategyDocs.map((d) => d.key)).toEqual(['1', '2', '3'])
    expect(data.strategyDocs[1].summary).toBe('Qısa mətn')
    // The newest events by start date (spec 059), each with its detail address and type label (spec 034).
    expect(data.calendar.map((e) => e.date)).toEqual(['2026-12-23', '2026-11-18', '2026-11-04'])
    expect(data.calendar[2]).toMatchObject({ time: '12:00', tags: ['Mətbuat konfransı'], href: '/az/media/events/hesabat-teqdimati' })
    expect(data.calendarHref).toBe('/az/media/events')
    expect(data.usefulLinks).toHaveLength(2)
    expect(data.notes.grid).toHaveLength(2)
    expect(data.yieldCurve?.series.categories).toHaveLength(5)
    expect(Object.values(data.errors).every((e) => e === false)).toBe(true)
  })

  it('hides the strategy documents when /homepage fails or an older API has no such field (spec 057)', async () => {
    server.use(http.get(`${API}/api/v1/homepage`, () => new HttpResponse(null, { status: 500 })))
    const failed = await loadHome('az')
    expect(failed.strategyDocs).toEqual([])
    expect(failed.calendar.length).toBeGreaterThan(0)

    server.use(http.get(`${API}/api/v1/homepage`, () => HttpResponse.json({ banners: [], newsSlider: [] })))
    expect((await loadHome('az')).strategyDocs).toEqual([])
  })

  it('bir endpoint 500 verəndə yalnız həmin blok xəta olur', async () => {
    server.use(
      http.get(
        `${API}/api/v1/yield-curves/latest`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    )

    const data = await loadHome('en')

    expect(data.errors.yieldCurve).toBe(true)
    expect(data.yieldCurve).toBeNull()
    expect(data.errors.homepage).toBe(false)
    expect(data.currency?.dateLabel).toBe('14/09/2026')
  })

  it('promo: CMS şəkli yoxdursa statik coin banner yalnız coin.e-cbar.az bannerində; üz qabıqları', async () => {
    const other = await loadHome('az')
    expect(other.promo?.imageUrl).toBeNull()
    expect(other.strategyDocs.map((d) => d.coverUrl)).toEqual(['/media/701', null, null])

    server.use(
      http.get(`${API}/api/v1/homepage`, () =>
        HttpResponse.json({
          banners: [{ title: 'Yubiley', description: 'Sikkələr', link: 'https://coin.e-cbar.az/', imageUrl: null }],
        }),
      ),
    )
    const coin = await loadHome('az')
    expect(coin.promo?.imageUrl).toBe('/site/home/coin-banner.png')
  })

  it('son 1D ehtiyat plan əsasındadırsa kart işarəni alır (spec 021 US6)', async () => {
    server.use(
      http.get(`${API}/api/v1/azir`, () =>
        HttpResponse.json(azirReferenceFixture.filter((v) => v.valueDate <= '2026-08-31')),
      ),
    )

    const data = await loadHome('az')

    expect(data.moneyMarket?.current1D).toBe(7)
    expect(data.moneyMarket?.current1DReserve).toBe(true)
  })
})
