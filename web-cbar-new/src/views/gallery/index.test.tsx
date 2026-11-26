import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { galleryDetailFixture } from '@/shared/testing/fixtures/media'
import { renderApp, screen } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { GalleryView } from './index'
import { loadGallery } from './loader'

describe('Photo gallery detail (spec 035)', () => {
  it('H1 is the gallery title, the photos are in the gallery viewer, no date', async () => {
    const user = userEvent.setup()
    const data = await loadGallery('az', '300')
    renderApp(<GalleryView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Qalereya 1' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Səhifənin yeri' }).textContent).toContain('Qalereya 1')
    expect(screen.queryByText(/28\.08\.2026|28 avqust 2026/)).toBeNull()

    const thumbs = screen.getAllByRole('button', { name: /nömrəli şəkli göstər$/ })
    expect(thumbs).toHaveLength(galleryDetailFixture.images.length)
    await user.click(thumbs[1]!)
    expect(screen.getByRole('img', { name: 'Qalereya 1 — şəkil 2' })).toBeInTheDocument()
  })

  it('a gallery without images says so', async () => {
    server.use(http.get(`${API}/api/v1/galleries/:id`, () => HttpResponse.json({ ...galleryDetailFixture, images: [] })))
    const data = await loadGallery('az', '300')
    renderApp(<GalleryView data={data!} />, { locale: 'az' })

    expect(screen.getByText('Bu qalereyada şəkil yoxdur')).toBeInTheDocument()
  })

  it('a bad id or a gallery missing in the locale is a 404', async () => {
    await expect(loadGallery('az', 'x')).resolves.toBeNull()
    await expect(loadGallery('az', '999')).resolves.toBeNull()
  })
})
