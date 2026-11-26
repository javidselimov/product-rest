import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { mediaPageAz, mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { buildSectionShell } from '@/widgets/section-shell'

import { MediaView } from './index'
import type { MediaViewData } from './loader'

const data: MediaViewData = {
  locale: 'az',
  title: mediaPageAz.title,
  html: prepareCmsHtml(mediaPageAz.content),
  attachments: [],
  shell: buildSectionShell({
    section: 'media',
    tree: mediaTreeAz,
    locale: 'az',
    current: { slug: 'media' },
    pageUrl: 'https://www.cbar.az/az/media',
    pageTitle: mediaPageAz.title,
  }),
}

describe('MediaView — Figma giriş səhifəsi (spec 028 US1)', () => {
  it('breadcrumb iki səviyyə, son element link deyil; bir H1 CMS başlığıdır; giriş mətni var', () => {
    const { container } = renderApp(<MediaView data={data} />, { locale: 'az' })

    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(within(crumbs).getByText('Media')).toHaveAttribute('aria-current', 'page')

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Media' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="cms-content"]')).toHaveAttribute('data-variant', 'about')
    expect(container.textContent).toContain('Mərkəzi Bankın kommunikasiyası')
  })

  it('sol menyu CMS ağacındandır, heç bir bənd aktiv deyil; qalereya/video grid-ləri yoxdur', () => {
    const { container } = renderApp(<MediaView data={data} />, { locale: 'az' })

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(mediaTreeAz[0]!.children.map((n) => n.title))
    expect(within(nav).getByRole('link', { name: 'Fotoqalereya' })).toHaveAttribute('href', '/az/media#galleries')
    expect(links.some((l) => l.hasAttribute('aria-current'))).toBe(false)
    expect(container.querySelector('#galleries, #videos, #streams')).toBeNull()
  })

  it('paylaşma linkləri cari ünvanı daşıyır', () => {
    renderApp(<MediaView data={data} />, { locale: 'az' })

    const share = screen.getByRole('list', { name: 'Paylaş' })
    expect(within(share).getByRole('link', { name: /Facebook-da paylaş/ }).getAttribute('href')).toContain(
      encodeURIComponent('https://www.cbar.az/az/media'),
    )
  })
})
