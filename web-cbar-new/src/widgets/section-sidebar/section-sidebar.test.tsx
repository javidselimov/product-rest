import { describe, expect, it } from 'vitest'

import { hideInSideNav } from '@/shared/testing/factories'
import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'

import { SectionSidebar } from './section-sidebar'

describe('SectionSidebar', () => {
  it('aktiv zənciri açır, digər budaqları bağlı saxlayır', () => {
    renderApp(<SectionSidebar section={pageTreeAz[0]} locale="az" currentSlug="sedrler" />, { locale: 'az' })

    const nav = screen.getByRole('complementary', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Sədrlər' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Tarix' })).toHaveAttribute('href', '/az/tarix')
    // Dərinlik 4 (Dərin) aktiv zəncirin altındadır — Sədrlər aktiv olduğu üçün açılır.
    expect(within(nav).getByRole('link', { name: 'Dərin' })).toBeInTheDocument()
  })

  it('navUrl ilə aktiv feature səhifəsini tapır', () => {
    renderApp(<SectionSidebar section={pageTreeAz[3]} locale="az" currentHref="/az/currencies" />, { locale: 'az' })

    expect(screen.getByRole('link', { name: 'Məzənnələr' })).toHaveAttribute('aria-current', 'page')
  })

  it('bölmə başlığı bölmənin özünə aparır', () => {
    renderApp(<SectionSidebar section={pageTreeAz[1]} locale="en" currentSlug="faiz-dehlizi" />, { locale: 'en' })

    expect(screen.getByRole('link', { name: 'Pul siyasəti' })).toHaveAttribute('href', '/en/pul-siyaseti')
  })
})

describe('SectionSidebar: "Sol menyuda göstər" (spec 041)', () => {
  // 11 Tarix (alt ağaclı: 111 Sədrlər, 1111 Dərin), 12 Təşkilati struktur.
  const [about] = hideInSideNav(pageTreeAz, [11])
  const sidebar = () => screen.getByRole('complementary', { name: 'Bölmə naviqasiyası' })

  it('gizli bənd və alt ağacı başqa səhifədə görünmür, başlıq qalır', () => {
    renderApp(<SectionSidebar section={about!} locale="az" currentSlug="teskilati-struktur-ve-idareetme" />, { locale: 'az' })

    expect(within(sidebar()).queryByRole('link', { name: 'Tarix' })).not.toBeInTheDocument()
    expect(within(sidebar()).queryByRole('link', { name: 'Sədrlər' })).not.toBeInTheDocument()
    expect(within(sidebar()).getByRole('link', { name: 'Haqqımızda' })).toBeInTheDocument()
    expect(within(sidebar()).getByRole('link', { name: 'Təşkilati struktur və idarəetmə' })).toHaveAttribute('aria-current', 'page')
  })

  it('gizli səhifənin özü açıqdır: aktiv bənd kimi görünür', () => {
    renderApp(<SectionSidebar section={about!} locale="az" currentSlug="tarix" />, { locale: 'az' })

    expect(within(sidebar()).getByRole('link', { name: 'Tarix' })).toHaveAttribute('aria-current', 'page')
  })

  it('gizli səhifənin alt səhifəsi açıqdır: zəncir görünür, alt səhifə aktivdir', () => {
    renderApp(<SectionSidebar section={about!} locale="az" currentSlug="sedrler" />, { locale: 'az' })

    expect(within(sidebar()).getByRole('link', { name: 'Tarix' })).not.toHaveAttribute('aria-current')
    expect(within(sidebar()).getByRole('link', { name: 'Sədrlər' })).toHaveAttribute('aria-current', 'page')
  })
})
