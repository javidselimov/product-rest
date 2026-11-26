/**
 * What a visitor sees on the "Central Bank logo" page (spec 040 US1).
 */
import { describe, expect, it } from 'vitest'

import type { BrandLogosBlock, LogoVersion } from '@/features/about-content/model/types'
import { renderApp, screen } from '@/shared/testing/render'

import { BrandLogos } from './brand-logos'

const coloured: LogoVersion = { image: { src: '/media/101', alt: 'Rəngli loqo' }, title: 'Rəngli', description: 'Açıq fonlar', background: 'light' }
const white: LogoVersion = { image: { src: '/media/102', alt: 'Ağ loqo' }, title: 'Ağ', description: null, background: 'dark' }
const pending: LogoVersion = { image: null, title: 'Vertikal', description: null, background: 'light' }

const block = (patch: Partial<BrandLogosBlock> = {}): BrandLogosBlock => ({
  kind: 'brand-logos',
  hero: coloured,
  introHtml: '<h2>Loqo versiyaları</h2>',
  versions: [coloured, white, pending],
  restHtml: '',
  downloads: [{ id: 201, label: 'SVG', size: 49_152, url: '/media/201' }],
  ...patch,
})

const render = (data: BrandLogosBlock, locale: 'az' | 'en' = 'az') => renderApp(<BrandLogos block={data} locale={locale} />, { locale })

describe('BrandLogos', () => {
  it('enlarges the first version as a decorative hero', () => {
    const { container } = render(block())

    const hero = container.querySelector('[data-slot="logo-hero"] img')
    expect(hero).toHaveAttribute('src', '/media/101')
    expect(hero).toHaveAttribute('alt', '')
  })

  it('puts the white logo on the dark preview', () => {
    render(block())

    expect(screen.getByRole('img', { name: 'Ağ loqo' }).parentElement).toHaveClass('bg-site-logo-dark')
    expect(screen.getByRole('img', { name: 'Rəngli loqo' }).parentElement).toHaveClass('bg-site-surface')
  })

  it('keeps a card without an image', () => {
    render(block())

    expect(screen.getByRole('heading', { level: 3, name: 'Vertikal' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('leaves the size out when it is unknown', () => {
    render(block({ downloads: [{ id: 7, label: 'ZIP', size: 0, url: '/media/7' }] }))

    expect(screen.getByRole('link', { name: 'ZIP yüklə' })).toHaveAttribute('download')
  })

  it('labels the button in English', () => {
    render(block(), 'en')

    expect(screen.getByRole('link', { name: 'Download SVG, 48 KB' })).toHaveTextContent('Download')
  })

  it('shows no hero and no download row without them', () => {
    const { container } = render(block({ hero: null, downloads: [] }))

    expect(container.querySelector('[data-slot="logo-hero"]')).toBeNull()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
