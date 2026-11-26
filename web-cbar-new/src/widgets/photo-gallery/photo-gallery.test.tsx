import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderApp, screen, within } from '@/shared/testing/render'

import { PhotoGallery, type PhotoGalleryLabels } from './photo-gallery'

const labels: PhotoGalleryLabels = {
  label: 'Fotoqalereya',
  prev: 'Əvvəlki şəkil',
  next: 'Növbəti şəkil',
  position: 'Şəkil {{current}} / {{total}}',
  thumb: '{{n}} nömrəli şəkli göstər',
  open: 'Şəkli tam ölçüdə aç',
}

const images = [11, 12, 13, 14].map((id, i) => ({ id, url: `/media/${id}`, alt: `Xəbər — şəkil ${i + 2}` }))

function renderGallery() {
  renderApp(<PhotoGallery images={images} labels={labels} />, { locale: 'az' })
  const region = screen.getByRole('region', { name: 'Fotoqalereya' })
  return {
    region,
    main: () => within(region).getByRole('link', { name: 'Şəkli tam ölçüdə aç' }),
    mainImage: () => within(region).getByRole('img', { name: /^Xəbər — şəkil/ }),
    thumb: (n: number) => within(region).getByRole('button', { name: `${n} nömrəli şəkli göstər` }),
    prev: () => within(region).getByRole('button', { name: 'Əvvəlki şəkil' }),
    next: () => within(region).getByRole('button', { name: 'Növbəti şəkil' }),
    status: () => within(region).getByRole('status'),
  }
}

describe('PhotoGallery', () => {
  it('opens on the first photo with "previous" disabled', () => {
    const g = renderGallery()

    expect(g.mainImage()).toHaveAccessibleName('Xəbər — şəkil 2')
    expect(g.main()).toHaveAttribute('href', '/media/11')
    expect(g.thumb(1)).toHaveAttribute('aria-current', 'true')
    expect(g.status()).toHaveTextContent('Şəkil 1 / 4')
    expect(g.prev()).toBeDisabled()
    expect(g.next()).toBeEnabled()
  })

  it('clicking a thumbnail shows that photo and moves the current marker', async () => {
    const user = userEvent.setup()
    const g = renderGallery()

    await user.click(g.thumb(3))

    expect(g.mainImage()).toHaveAccessibleName('Xəbər — şəkil 4')
    expect(g.main()).toHaveAttribute('href', '/media/13')
    expect(g.thumb(3)).toHaveAttribute('aria-current', 'true')
    expect(g.thumb(1)).not.toHaveAttribute('aria-current')
    expect(g.status()).toHaveTextContent('Şəkil 3 / 4')
  })

  it('"next" walks to the last photo and stops there — it does not wrap', async () => {
    const user = userEvent.setup()
    const g = renderGallery()

    await user.click(g.next())
    await user.click(g.next())
    await user.click(g.next())

    expect(g.status()).toHaveTextContent('Şəkil 4 / 4')
    expect(g.next()).toBeDisabled()
    expect(g.prev()).toBeEnabled()

    await user.click(g.prev())
    expect(g.status()).toHaveTextContent('Şəkil 3 / 4')
  })

  it('arrow keys move the selection while a thumbnail has focus', async () => {
    const user = userEvent.setup()
    const g = renderGallery()

    g.thumb(1).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(g.status()).toHaveTextContent('Şəkil 3 / 4')
    expect(g.thumb(3)).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(g.status()).toHaveTextContent('Şəkil 2 / 4')
  })

  it('the large photo opens the original file in a new tab', () => {
    const g = renderGallery()
    expect(g.main()).toHaveAttribute('target', '_blank')
    expect(g.main()).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})
