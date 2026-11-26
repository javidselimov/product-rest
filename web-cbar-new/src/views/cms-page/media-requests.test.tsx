/**
 * The "Media requests" page end to end: API response → loader → view (spec 037 FR-007).
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

const CONTENT =
  '<p>Mətn</p><table><tbody><tr><td><p>E-mail</p></td><td><p><a href="mailto:press@cbar.az">press@cbar.az</a></p></td></tr></tbody></table>'

const mediaRoot = mediaTreeAz[0]!
const treeWith = (slug: string) => [
  { ...mediaRoot, children: [...mediaRoot.children, { id: 519, title: 'Səhifə', slug, navUrl: null, children: [] }] },
]

function servePage(slug: string) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(treeWith(slug))),
    http.get(`${API}/api/v1/pages/${slug}`, () => HttpResponse.json({ id: 519, title: 'Səhifə', slug, content: CONTENT, assets: [] })),
  )
}

describe('Media requests page', () => {
  it('turns the table of the page into cards', async () => {
    servePage('media-sorgulari')
    const data = await loadCmsPage('az', ['media', 'media-sorgulari'])

    expect(data?.shellPage?.layout).toBe('media-requests')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('link', { name: 'press@cbar.az' })).toHaveAttribute('href', 'mailto:press@cbar.az')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('leaves a table on another Media page alone', async () => {
    servePage('diger-sehife')
    const data = await loadCmsPage('az', ['media', 'diger-sehife'])

    expect(data?.shellPage?.layout).toBe('plain')
    renderApp(<CmsPageView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
