/**
 * The CSR page end to end: API responses → loader → view (spec 038).
 */
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

const SLUG = 'korporativ-sosial-mesuliyyet'
const CONTENT = '<p>Giriş mətni</p><p><a data-media-link="" href="/media/1566">KSM Konsepsiyası</a></p>'
const ASSETS = [
  { mediaId: 1566, title: 'KSM Konsepsiyası', mimeType: 'application/pdf', sizeBytes: 2048, group: null, url: '/media/1566' },
  { mediaId: 1567, title: 'foto', mimeType: 'image/jpeg', sizeBytes: 2048, group: null, url: '/media/1567' },
]

function servePage(slug = SLUG) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(mediaTreeAz)),
    http.get(`${API}/api/v1/pages/${slug}`, () =>
      HttpResponse.json({ id: 81, title: 'Korporativ sosial məsuliyyət', slug, content: CONTENT, assets: ASSETS }),
    ),
  )
}

async function renderPage() {
  const data = await loadCmsPage('az', [SLUG])
  renderApp(<CmsPageView data={data!} />, { locale: 'az' })
}

describe('CSR page', () => {
  it('shows the page text, the document and a card per project, and no attachment block', async () => {
    servePage()
    await renderPage()

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /KSM Konsepsiyası \(PDF, 2\.0 KB\)/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Layihələrimiz' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Biləsuvar lisey-məktəb kompleksi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kağızı emal et' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Şəkillər' })).not.toBeInTheDocument()
  })

  it('opens a project with its API text and photos, the first photo standing in for the cover', async () => {
    servePage()
    await renderPage()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Biləsuvar lisey-məktəb kompleksi' }))

    const dialog = screen.getByRole('dialog', { name: 'Biləsuvar şəhərində lisey-məktəb kompleksi' })
    expect(within(dialog).getByText('Layihənin tam mətni')).toBeInTheDocument()
    expect(within(dialog).getByText('1 / 2')).toBeInTheDocument()
  })

  it('keeps the page when the projects cannot be loaded', async () => {
    servePage()
    server.use(http.get(`${API}/api/v1/csr-projects`, () => new HttpResponse(null, { status: 500 })))
    await renderPage()

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /KSM Konsepsiyası/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Layihələrimiz' })).not.toBeInTheDocument()
  })

  it('shows no section title without projects', async () => {
    servePage()
    server.use(http.get(`${API}/api/v1/csr-projects`, () => HttpResponse.json({ items: [] })))
    await renderPage()

    expect(screen.queryByRole('heading', { level: 2, name: 'Layihələrimiz' })).not.toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Layihələrimiz' })).not.toBeInTheDocument()
  })
})
