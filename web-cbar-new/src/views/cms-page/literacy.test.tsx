/**
 * The "Financial literacy" section end to end: API response → loader → view (spec 047 US1–US3).
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import type { PageNode } from '@/entities/page-node'
import type { PageDetail } from '@/features/pages/model/schemas'
import { API } from '@/shared/testing/api-base'
import {
  literacyTreeAz,
  literacyTreeEn,
  rootAz,
  rootAzLegacy,
  virtualAz,
  virtualAzLegacy,
} from '@/shared/testing/fixtures/literacy-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

function serve(page: PageDetail, tree: PageNode[] = literacyTreeAz(true)) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)),
    http.get(`${API}/api/v1/pages/${page.slug}`, () => HttpResponse.json(page)),
  )
}

async function open(page: PageDetail, segments: string[], locale: 'az' | 'en' = 'az') {
  const data = await loadCmsPage(locale, segments)
  renderApp(<CmsPageView data={data!} />, { locale })
  return data!
}

const sideNavLinks = () =>
  within(screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' }))
    .getAllByRole('link')
    .map((link) => link.textContent)

const PLATFORMS = [
  'Maliyyə Savadlılığı portalı',
  'Virtual Təhsil Platforması',
  'Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi',
]

describe('Financial literacy root (spec 047 US1)', () => {
  it('opens in the section template with the Figma blocks', async () => {
    serve(rootAz)
    const data = await open(rootAz, ['maliyye-savadliligi'])
    expect(data.shellPage).toMatchObject({ section: 'literacy', layout: 'financial-literacy' })

    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(within(crumbs).getByText('Maliyyə savadlılığı')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { level: 1, name: 'Maliyyə savadlılığı' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Maliyyə savadlılığı nədir?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'mmpi@cbar.az-a yazın' })).toBeInTheDocument()
  })

  it('the gallery photos are not listed again as page files', async () => {
    serve(rootAz)
    await open(rootAz, ['maliyye-savadliligi'])

    expect(screen.getByRole('region', { name: 'Fotoqalereya' })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="attachments"]')).toBeNull()
  })

  it('the legacy text still shows every paragraph, its photos as the gallery', async () => {
    serve(rootAzLegacy)
    await open(rootAzLegacy, ['maliyye-savadliligi'])

    expect(screen.getByText(/İnsan maliyyə cəhətdən necə sağlam ola bilər\?/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'mmpi@cbar.az' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Fotoqalereya' })).toBeInTheDocument()
  })

  it('a root without text lists its pages, as before', async () => {
    const empty = { ...rootAz, content: '', assets: [] }
    serve(empty)
    await open(empty, ['maliyye-savadliligi'])

    // The side menu has the same page; the child page cards link it under the section path.
    const links = screen.getAllByRole('link', { name: 'Virtual Təhsil Platforması' }).map((link) => link.getAttribute('href'))
    expect(links).toContain('/az/maliyye-savadliligi/virtual-tehsil-platformasi')
  })
})

describe('Financial literacy platform pages (spec 047 US2)', () => {
  it('a platform page gets its layout, and its photos are not listed again', async () => {
    serve(virtualAz)
    const data = await open(virtualAz, ['maliyye-savadliligi', 'virtual-tehsil-platformasi'])

    expect(data.shellPage?.layout).toBe('literacy-platform')
    expect(screen.getByRole('list', { name: 'Fotoşəkillər' })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="attachments"]')).toBeNull()
    expect(screen.getByRole('link', { name: /Platformaya keçid: edu\.e-cbar\.az/ })).toHaveAttribute('href', 'https://edu.e-cbar.az/')
  })

  it('the draft copy gets the same layout', async () => {
    const draft = { ...virtualAz, id: 457, title: 'Virtual Təhsil Platforması (Kopya)', slug: 'virtual-tehsil-platformasi-copy' }
    serve(draft)
    const data = await loadCmsPage('az', ['maliyye-savadliligi-copy', 'virtual-tehsil-platformasi-copy'])

    expect(data?.shellPage?.layout).toBe('literacy-platform')
  })

  it('the legacy text reads as ordinary content', async () => {
    serve(virtualAzLegacy)
    await open(virtualAzLegacy, ['virtual-tehsil-platformasi'])

    expect(screen.getByText(/Platformada yerləşdirilən bütün resurslar ödənişsizdir/)).toBeInTheDocument()
    expect(screen.queryAllByRole('heading', { level: 2 })).toEqual([])
  })

  it('Seminars stay ordinary content in the template, accordions included', async () => {
    const seminars: PageDetail = {
      id: 108,
      title: 'Seminarlar/vebinarlar',
      slug: 'seminarlar-vebinarlar',
      content: '<details data-accordion=""><summary>2026</summary><div data-type="details-content"><p>Təlim</p></div></details>',
      assets: [],
    }
    serve(seminars)
    const data = await open(seminars, ['seminarlar-vebinarlar'])

    expect(data.shellPage).toMatchObject({ section: 'literacy', layout: 'plain' })
    expect(screen.getByText('2026').closest('details')).not.toBeNull()
  })
})

describe('Financial literacy left menu (spec 047 US3)', () => {
  it('after the seed the left menu lists the three platforms, in the Figma order', async () => {
    serve(virtualAz)
    await open(virtualAz, ['virtual-tehsil-platformasi'])

    expect(sideNavLinks()).toEqual(PLATFORMS)
  })

  it('a hidden page shows in the menu while it is open', async () => {
    const seminars: PageDetail = { id: 108, title: 'Seminarlar/vebinarlar', slug: 'seminarlar-vebinarlar', content: '<p>Təlim</p>', assets: [] }
    serve(seminars)
    await open(seminars, ['seminarlar-vebinarlar'])

    expect(sideNavLinks()).toEqual(['Seminarlar/vebinarlar', ...PLATFORMS])
  })

  it('before the seed the menu lists every page, the draft included', async () => {
    serve(virtualAz, literacyTreeAz())
    await open(virtualAz, ['virtual-tehsil-platformasi'])

    expect(sideNavLinks()).toEqual([
      'Ümumi məlumat',
      'Seminarlar/vebinarlar',
      'Müsabiqələr',
      ...PLATFORMS,
      'Maliyyə savadlılığı (Kopya)',
    ])
  })

  it('in English the menu lists the three platforms', async () => {
    const page: PageDetail = { id: 111, title: 'Virtual Education Platform', slug: 'virtual-education-platform', content: '<p>x</p>', assets: [] }
    serve(page, literacyTreeEn(true))
    await open(page, ['virtual-education-platform'], 'en')

    expect(within(screen.getByRole('navigation', { name: 'Section navigation' })).getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Financial Literacy Portal',
      'Virtual Education Platform',
      'Information and Search System for Financial Products and Services',
    ])
  })
})
