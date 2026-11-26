import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import {
  publicationsTreeAz,
  WP_INTRO_AZ,
  workingPapersPageAz,
  workingPapersPageEn,
  publicationsTreeEn,
} from '@/shared/testing/fixtures/publications-section'
import { workingPapersAz } from '@/shared/testing/fixtures/working-papers'
import { server } from '@/shared/testing/server'

import { loadWorkingPapersPage } from './loader'

function serveSection(locale: 'az' | 'en' = 'az') {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(locale === 'en' ? publicationsTreeEn() : publicationsTreeAz())),
    http.get(`${API}/api/v1/pages/:slug`, () => HttpResponse.json(locale === 'en' ? workingPapersPageEn : workingPapersPageAz)),
  )
}

describe('loadWorkingPapersPage (spec 054 US1)', () => {
  it('builds the first page, the intro without the legacy accordions, the years and the breadcrumb', async () => {
    serveSection()
    const data = await loadWorkingPapersPage('az', 'isci-meqaleler-silsilesi', {})

    expect(data?.title).toBe('İşçi məqalələri')
    expect(data?.introHtml).toContain('İşçi məqalələr Mərkəzi Bankın əməkdaşları')
    expect(data?.introHtml).not.toContain('<details')
    expect(data?.introHtml).toBe(WP_INTRO_AZ)
    expect(data?.rows).toHaveLength(10)
    expect(data?.rows[0]).toMatchObject({ code: '02/2026', href: '/az/isci-meqaleler-silsilesi/02-2026' })
    expect(data?.total).toBe(workingPapersAz.length)
    expect(data?.years[0]).toBe(2026)
    expect(data?.shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Nəşrlər və tədqiqatlar', 'Tədqiqatlar', 'İşçi məqalələri'])
    // The left menu has the two groups; the research group is open with "İşçi məqalələri" current.
    const research = data?.shell.nav.find((item) => item.title === 'Tədqiqatlar')
    expect(research?.open).toBe(true)
    expect(research?.children.find((item) => item.current)?.title).toBe('İşçi məqalələri')
  })

  it('applies the search, the year and the page from the address, and keeps them in the shared link', async () => {
    serveSection()
    const data = await loadWorkingPapersPage('az', 'isci-meqaleler-silsilesi', { q: 'İNFLYASİYA', year: '2024', page: '1' })
    expect(data?.rows.every((row) => row.year === 2024)).toBe(true)
    expect(data?.q).toBe('İNFLYASİYA')
    expect(data?.year).toBe(2024)
    expect(data?.shell.share.pageUrl).toMatch(/\?q=%C4%B0NFLYAS%C4%B0YA&year=2024$/)
  })

  it('ignores a malformed year and clamps a page past the end', async () => {
    serveSection()
    const data = await loadWorkingPapersPage('az', 'isci-meqaleler-silsilesi', { year: 'abc', page: '99' })
    expect(data?.year).toBeUndefined()
    expect(data?.page).toBe(3)
  })

  it('asks the API for the page locale', async () => {
    serveSection('en')
    let asked: string | null = null
    server.use(
      http.get(`${API}/api/v1/working-papers`, ({ request }) => {
        asked = new URL(request.url).searchParams.get('locale')
        return undefined
      }),
    )
    const data = await loadWorkingPapersPage('en', 'working-paper-series', {})
    expect(asked).toBe('en')
    expect(data?.basePath).toBe('/en/working-paper-series')
  })

  it('is null without papers in the locale, when the API fails or the page is missing, so the CMS text shows', async () => {
    serveSection()
    server.use(http.get(`${API}/api/v1/working-papers`, () => HttpResponse.json({ items: [] })))
    expect(await loadWorkingPapersPage('az', 'isci-meqaleler-silsilesi', {})).toBeNull()

    server.use(http.get(`${API}/api/v1/working-papers`, () => new HttpResponse(null, { status: 500 })))
    expect(await loadWorkingPapersPage('az', 'isci-meqaleler-silsilesi', {})).toBeNull()

    server.use(
      http.get(`${API}/api/v1/working-papers`, () => HttpResponse.json({ items: workingPapersAz })),
      http.get(`${API}/api/v1/pages/:slug`, () => HttpResponse.json({ title: 'Not Found', status: 404 }, { status: 404 })),
    )
    expect(await loadWorkingPapersPage('az', 'isci-meqaleler-silsilesi', {})).toBeNull()
  })
})
