import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { fincertEmpty } from '@/shared/testing/fixtures/fincert'
import { pageDetailFixture } from '@/shared/testing/fixtures/pages'
import { server } from '@/shared/testing/server'

import { loadFincertPage } from './loader'

const page = () =>
  http.get(`${API}/api/v1/pages/:slug`, () => HttpResponse.json({ ...pageDetailFixture, id: 133, title: 'FinCERT', slug: 'fincert' }))

describe('loadFincertPage (spec 053)', () => {
  it('builds the view, the "Home › FinCERT" breadcrumb and the description from the mission', async () => {
    server.use(page())
    const data = await loadFincertPage('az', 'fincert')

    expect(data?.view.title).toBe('FinCERT')
    expect(data?.shell.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'FinCERT', href: null },
    ])
    expect(data?.shell.nav).toEqual([])
    expect(data?.shell.share.pageUrl).toMatch(/\/az\/fincert$/)
    expect(data?.description).toMatch(/^Azərbaycan Respublikasının Mərkəzi Bankı/)
  })

  it('asks the API for the page locale', async () => {
    let asked: string | null = null
    server.use(
      page(),
      http.get(`${API}/api/v1/fincert`, ({ request }) => {
        asked = new URL(request.url).searchParams.get('locale')
        return undefined
      }),
    )
    const data = await loadFincertPage('en', 'fincert')

    expect(asked).toBe('en')
    expect(data?.view.directions.map((d) => d.title)).toContain('Obtaining and Sharing of Information on Incidents')
  })

  it('is null when the FinCERT API fails, so the route shows the CMS text, and logs a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    server.use(page(), http.get(`${API}/api/v1/fincert`, () => new HttpResponse(null, { status: 500 })))

    expect(await loadFincertPage('az', 'fincert')).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('FinCERT API failed'), expect.objectContaining({ locale: 'az' }))
    warn.mockRestore()
  })

  it('is null when every FinCERT section is empty', async () => {
    server.use(page(), http.get(`${API}/api/v1/fincert`, () => HttpResponse.json(fincertEmpty)))
    expect(await loadFincertPage('az', 'fincert')).toBeNull()
  })

  it('is null when the page does not exist in the locale', async () => {
    server.use(http.get(`${API}/api/v1/pages/:slug`, () => new HttpResponse(null, { status: 404 })))
    expect(await loadFincertPage('en', 'fincert')).toBeNull()
  })
})
