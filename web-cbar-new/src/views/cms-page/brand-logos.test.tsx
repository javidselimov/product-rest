/**
 * The "Central Bank logo" page end to end: API response → loader → view (spec 040 US1, US2).
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

const SLUG = 'merkezi-bankin-logosu'
const CONTENT =
  '<h2>Loqo versiyaları</h2><table><tbody>' +
  '<tr><td><p><img src="/media/101" alt="Rəngli loqo"></p></td><td><p>Rəngli horizontal versiya</p></td><td><p>Əsas versiya</p></td><td><p>açıq</p></td></tr>' +
  '<tr><td><p><img src="/media/102" alt="Ağ loqo"></p></td><td><p>Ağ horizontal versiya</p></td><td><p>Tünd fonlar üçün</p></td><td><p>tünd</p></td></tr>' +
  '</tbody></table>'
const ASSETS = [
  { mediaId: 201, title: 'SVG', mimeType: 'image/svg+xml', sizeBytes: 49_152, group: null, url: '/media/201' },
  { mediaId: 202, title: 'PDF / EPS', mimeType: 'application/zip', sizeBytes: 2_516_582, group: null, url: '/media/202' },
]

const mediaRoot = mediaTreeAz[0]!
const treeWith = (slug: string) => [
  { ...mediaRoot, children: [...mediaRoot.children, { id: 553, title: 'Mərkəzi Bankın loqosu', slug, navUrl: null, children: [] }] },
]

function servePage(slug = SLUG, content = CONTENT) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(treeWith(slug))),
    http.get(`${API}/api/v1/pages/${slug}`, () =>
      HttpResponse.json({ id: 553, title: 'Mərkəzi Bankın loqosu', slug, content, assets: ASSETS }),
    ),
  )
}

async function renderPage(slug = SLUG) {
  const data = await loadCmsPage('az', ['media', slug])
  renderApp(<CmsPageView data={data!} />, { locale: 'az' })
}

describe('Central Bank logo page', () => {
  it('shows the versions from the table and a download card per page file', async () => {
    servePage()
    await renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Mərkəzi Bankın loqosu' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Loqo versiyaları' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Rəngli horizontal versiya' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ağ loqo' })).toHaveAttribute('src', '/media/102')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    const svg = screen.getByRole('link', { name: 'SVG yüklə, 48 KB' })
    expect(svg).toHaveAttribute('href', '/media/201')
    expect(svg).toHaveAttribute('download')
    expect(screen.getByRole('link', { name: 'PDF / EPS yüklə, 2,4 MB' })).toHaveAttribute('href', '/media/202')
  })

  it('lists the files only once, as download cards', async () => {
    servePage()
    await renderPage()

    expect(screen.getAllByRole('link', { name: /yüklə/ })).toHaveLength(ASSETS.length)
    expect(screen.queryByRole('link', { name: /^SVG$/ })).not.toBeInTheDocument()
  })

  it('keeps the text and the files while the table does not follow the rule', async () => {
    servePage(SLUG, '<p>Hazırlanır</p><table><tbody><tr><td>tək xana</td></tr></tbody></table>')
    await renderPage()

    expect(screen.getByText('Hazırlanır')).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveTextContent('tək xana')
    expect(screen.getAllByRole('link', { name: /yüklə/ })).toHaveLength(ASSETS.length)
  })

  it('leaves another Media page with a table untouched', async () => {
    servePage('fotoqalereya-diger')
    await renderPage('fotoqalereya-diger')

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /yüklə/ })).not.toBeInTheDocument()
  })
})
