import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { CsrProjectsBlock } from '@/features/about-content/model/types'
import { renderApp, screen, within } from '@/shared/testing/render'

import { CsrProjects } from './csr-projects'

const block: CsrProjectsBlock = {
  kind: 'csr-projects',
  introHtml: '<p>Giriş mətni</p>',
  files: [{ id: 1566, title: 'KSM Konsepsiyası', mimeType: 'application/pdf', sizeBytes: 2048, group: null, url: '/media/1566' }],
  projects: [
    {
      id: 1,
      category: 'Təhsil',
      cardTitle: 'Lisey',
      summary: 'Qısa təsvir',
      cover: { src: '/media/1', alt: '' },
      title: 'Biləsuvar liseyi',
      gallery: [
        { src: '/media/1', alt: 'Bina' },
        { src: '/media/2', alt: '' },
        { src: '/media/3', alt: '' },
      ],
      html: '<p>Layihənin tam mətni</p>',
    },
    { id: 2, category: 'Ekologiya', cardTitle: 'Kağız', summary: 'Xülasə', cover: null, title: 'Kağızı emal et', gallery: [], html: '<p>Ekologiya mətni</p>' },
  ],
}

describe('CsrProjects', () => {
  it('shows the intro, the document with its type and size, and a card per project', () => {
    renderApp(<CsrProjects block={block} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /KSM Konsepsiyası \(PDF, 2\.0 KB\)/ })).toHaveAttribute('href', '/media/1566')
    expect(screen.getByRole('heading', { level: 2, name: 'Layihələrimiz' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the project in a dialog and returns to the card on close', async () => {
    const user = userEvent.setup()
    renderApp(<CsrProjects block={block} locale="az" />, { locale: 'az' })

    const card = screen.getByRole('button', { name: 'Lisey' })
    await user.click(card)

    const dialog = screen.getByRole('dialog', { name: 'Biləsuvar liseyi' })
    expect(within(dialog).getByText('Layihənin tam mətni')).toBeInTheDocument()
    expect(within(dialog).getByText('Təhsil')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(card).toHaveFocus()
  })

  it('switches the large photo from the thumbnails', async () => {
    const user = userEvent.setup()
    renderApp(<CsrProjects block={block} locale="az" />, { locale: 'az' })
    await user.click(screen.getByRole('button', { name: 'Lisey' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument()
    expect(within(dialog).getByRole('img', { name: 'Bina' })).toBeInTheDocument()

    const thumb = within(dialog).getByRole('button', { name: 'Biləsuvar liseyi — şəkil 3' })
    await user.click(thumb)

    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument()
    expect(thumb).toHaveAttribute('aria-current', 'true')
    expect(within(dialog).getByRole('img', { name: 'Biləsuvar liseyi — şəkil 3' })).toBeInTheDocument()
  })

  it('has no gallery for a project without photos', async () => {
    const user = userEvent.setup()
    renderApp(<CsrProjects block={block} locale="az" />, { locale: 'az' })
    await user.click(screen.getByRole('button', { name: 'Kağız' }))

    const dialog = screen.getByRole('dialog', { name: 'Kağızı emal et' })
    expect(within(dialog).queryByRole('region')).not.toBeInTheDocument()
  })
})
