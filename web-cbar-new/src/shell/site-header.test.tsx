import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { pageTreeAz, pageTreeEn } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'

import { SiteHeader } from './site-header'

describe('SiteHeader', () => {
  it('loqo, üst keçidlər, axtarış, dil, E-CBAR və menyu render olunur', () => {
    const { container } = renderApp(<SiteHeader locale="az" tree={pageTreeAz} />, { locale: 'az' })
    const band = within(container.querySelector('[data-slot="site-header-top"]') as HTMLElement)

    expect(band.getByRole('img', { name: 'Azərbaycan Respublikasının Mərkəzi Bankı' })).toHaveAttribute(
      'src',
      '/site/logo-az.svg',
    )
    const top = within(screen.getByRole('navigation', { name: 'Əlavə keçidlər' }))
    expect(top.getByRole('link', { name: 'Karyera' })).toHaveAttribute('href', '/az/insan-resurslari')
    expect(top.getByRole('link', { name: 'Media' })).toHaveAttribute('href', '/az/media')
    expect(top.getByRole('link', { name: 'Əlaqə' })).toHaveAttribute('href', '/az/elaqe')
    expect(screen.getByRole('search', { name: 'Saytda axtarış' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dili dəyiş: English' })).toBeInTheDocument()
    // Spec 022: tema seçimi ləğv olunub; qaynar xətt Figma-da başlıqda gizlidir (çekmecədə qalır).
    expect(screen.queryByRole('button', { name: 'Temanı dəyiş' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Qaynar xətt/ })).toBeNull()
    expect(screen.getByRole('link', { name: 'E-CBAR' })).toHaveAttribute('href', 'https://www.e-cbar.az/')
    expect(screen.getByRole('button', { name: 'Menyunu aç' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Əsas naviqasiya' })).toBeInTheDocument()
  })

  it('mobil zolaq (Figma 839:8335): ağ loqo solda, hamburger sağda; üst zolaq mobildə gizlidir', () => {
    const { container } = renderApp(<SiteHeader locale="az" tree={pageTreeAz} />, { locale: 'az' })

    const mobile = container.querySelector('[data-slot="site-header-mobile"]') as HTMLElement
    expect(mobile).toHaveClass('tab:hidden', 'bg-primary', 'justify-between')
    expect(within(mobile).getByRole('img')).toHaveAttribute('src', '/site/logo-az-inverse.svg')
    expect(within(mobile).getByRole('button', { name: 'Menyunu aç' })).toBeInTheDocument()
    const top = container.querySelector('[data-slot="site-header-top"]') as HTMLElement
    expect(top).toHaveClass('max-tab:hidden')
    expect(within(top).getByRole('search', { name: 'Saytda axtarış' })).toBeInTheDocument()
  })

  it('çekmecədə tam enli axtarış, altında sağda kontur dil keçidi (Figma 821:2846)', async () => {
    const user = userEvent.setup()
    renderApp(<SiteHeader locale="az" tree={pageTreeAz} />, { locale: 'az' })

    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))
    const drawer = within(await screen.findByRole('dialog'))

    const search = drawer.getByRole('search', { name: 'Saytda axtarış' })
    expect(drawer.getByRole('searchbox', { name: 'Saytda axtarış' }).closest('[data-slot="input-wrapper"]')).toHaveClass(
      'text-base',
    )
    const language = drawer.getByRole('link', { name: 'Dili dəyiş: English' })
    expect(language).toHaveClass('rounded-full', 'border-site-language-outline', 'self-end')
    expect(language.querySelector('svg')).not.toBeNull()
    expect(search.parentElement).toBe(language.parentElement)
  })

  it('en dilində loqo və etiketlər dəyişir', () => {
    const { container } = renderApp(<SiteHeader locale="en" tree={pageTreeEn} />, { locale: 'en' })
    const band = within(container.querySelector('[data-slot="site-header-top"]') as HTMLElement)

    expect(band.getByRole('img', { name: 'Central Bank of the Republic of Azerbaijan' })).toHaveAttribute(
      'src',
      '/site/logo-en.svg',
    )
    // Bölmə həm çubuqda, həm hamburger panelində (tabletdə) var.
    expect(screen.getAllByRole('link', { name: 'About us' })[0]).toHaveAttribute('href', '/en/about-us')
    expect(screen.getByRole('button', { name: 'All sections' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Careers' })).toHaveAttribute('href', '/en/human-resources')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/en/contacts')
  })

  it('boş ağacla da render olunur (API xətası halı)', () => {
    renderApp(<SiteHeader locale="az" tree={[]} />, { locale: 'az' })

    expect(screen.getByRole('navigation', { name: 'Əsas naviqasiya' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Digər bölmələr' })).toBeNull()
  })
})
