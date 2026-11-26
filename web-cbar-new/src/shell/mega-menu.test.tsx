import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'

import type { PageNode } from '@/entities/page-node'
import { hideInSideNav } from '@/shared/testing/factories'
import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'

import { MegaMenu } from './mega-menu'
import { VISIBLE_SECTIONS, VISIBLE_SECTIONS_NARROW } from './constants'
import { buildNavSections } from './nav'

function node(id: number, title: string, slug: string, navUrl: string | null = null, children: PageNode[] = []): PageNode {
  return { id, title, slug, navUrl, children }
}

function renderMenu(locale: 'az' | 'en' = 'az') {
  const { visible } = buildNavSections(pageTreeAz, locale)
  return renderApp(<MegaMenu locale={locale} visible={visible} />, { locale })
}

function sectionItems() {
  return screen.getAllByRole('listitem').filter((li) => li.getAttribute('data-slot') === 'nav-section')
}

describe('MegaMenu', () => {
  it('yalnız zolağın 9 bölməsi render olunur — overflow hamburger çekmecəsindədir (spec 022 R5, spec 056)', () => {
    renderMenu()

    expect(sectionItems()).toHaveLength(VISIBLE_SECTIONS)
    expect(screen.queryByRole('link', { name: 'E-xidmətlər' })).toBeNull()
  })

  it('1024–1359 enində sığmayan bölmə zolaqdan yalnız desk-dən aşağı gizlənir (spec 056, research R2)', () => {
    renderMenu()

    const items = sectionItems()
    expect(items.slice(0, VISIBLE_SECTIONS_NARROW).some((li) => li.classList.contains('max-desk:hidden'))).toBe(false)
    expect(items.slice(VISIBLE_SECTIONS_NARROW).every((li) => li.classList.contains('max-desk:hidden'))).toBe(true)
  })

  it('"Maliyyə sabitliyi" zolağın 3-cü bölməsidir, paneli CMS ağacından qurulur', () => {
    renderMenu()

    const section = sectionItems()[2]
    expect(within(section).getAllByRole('link')[0]).toHaveTextContent('Maliyyə sabitliyi')
    const panel = section.querySelector('[data-slot="mega-menu-panel"]') as HTMLElement
    expect(within(panel).getByRole('link', { name: 'Maliyyə sabitliyi hesabatı' })).toHaveAttribute('href', '/az/maliyye-sabitliyi-hesabati')
    const sustainable = within(panel).getByRole('link', { name: 'Dayanıqlı Maliyyə' }).closest('li') as HTMLElement
    expect(within(sustainable).getByRole('link', { name: 'Dayanıqlı maliyyə üzrə hesabatlar' })).toBeInTheDocument()
  })

  it('nav çubuğu mobildə (< 744) gizlidir — orada mobil zolaq var', () => {
    renderMenu()

    expect(screen.getByRole('navigation', { name: 'Əsas naviqasiya' })).toHaveClass('max-tab:hidden')
  })

  it('panel: bölmə başlığı, 2-ci səviyyə sütun başlığı, 3-cü səviyyə onun altında', () => {
    renderMenu()

    const section = sectionItems().find((li) => within(li).queryByRole('link', { name: 'Tarix' }))
    const panel = section?.querySelector('[data-slot="mega-menu-panel"]') as HTMLElement

    expect(panel).not.toBeNull()
    // Başlıq mətndir, keçid deyil — bölmə keçidi nav çubuğundadır.
    expect(within(panel).getByText('Haqqımızda')).toBeInTheDocument()
    expect(within(panel).queryByRole('link', { name: 'Haqqımızda' })).toBeNull()

    const column = within(panel).getByRole('link', { name: 'Tarix' }).closest('li') as HTMLElement
    expect(within(column).getByRole('link', { name: 'Sədrlər' })).toBeInTheDocument()
  })

  it('alt bölməsi olmayan bölmənin paneli yoxdur', () => {
    renderMenu()

    const leaf = sectionItems().find((li) => within(li).getAllByRole('link').length === 1)

    expect(leaf?.querySelector('[data-slot="mega-menu-panel"]')).toBeNull()
  })

  it('keçid ünvanları nav modelindən gəlir', () => {
    renderMenu()

    expect(screen.getByRole('link', { name: 'Press relizlər' })).toHaveAttribute('href', '/az/press-releases')
    expect(screen.getByRole('link', { name: 'Məzənnələr' })).toHaveAttribute('href', '/az/currencies')
    expect(screen.getByRole('link', { name: 'Haqqımızda' })).toHaveAttribute('href', '/az/haqqimizda')
  })

  it('paneldəki xarici keçid yeni pəncərədə və rel ilə açılır', () => {
    const tree = [
      node(1, 'Haqqımızda', 'haqqimizda', null, [node(2, 'E-xidmətlər', 'e-xidmetler', 'https://www.e-cbar.az/')]),
    ]
    renderApp(<MegaMenu locale="az" visible={buildNavSections(tree, 'az').visible} />, { locale: 'az' })

    const external = screen.getByRole('link', { name: 'E-xidmətlər' })

    expect(external).toHaveAttribute('href', 'https://www.e-cbar.az/')
    expect(external).toHaveAttribute('target', '_blank')
    expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('üçüncü səviyyə render olunur, dördüncü yoxdur', () => {
    renderMenu()

    expect(screen.getByRole('link', { name: 'Sədrlər' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dərin' })).toBeNull()
  })

  it('en dilində etiketlər ingiliscədir', () => {
    renderMenu('en')

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('sol menyuda gizli səhifə nə bölmənin mega-menyusunda, nə hamburger panelində var (spec 048)', () => {
    // "Tarix" (with its subtree) and "Press relizlər" are off in the left menu; "E-xidmətlər" keeps the hamburger shown.
    const { visible, all } = buildNavSections(hideInSideNav(pageTreeAz, [11, 51]), 'az')
    renderApp(<MegaMenu locale="az" visible={visible} all={all} />, { locale: 'az' })

    expect(screen.queryByRole('link', { name: 'Tarix' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Sədrlər' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Press relizlər' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'Fotoqalereya' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Haqqımızda' }).length).toBeGreaterThan(0)
  })
})

describe('MegaMenu — klikdən sonra bağlanma', () => {
  it('bənd içində keçidə klik edəndə fokus götürülür və data-closed qoyulur; siçan çıxanda silinir', async () => {
    const user = userEvent.setup()
    renderMenu()

    const link = screen.getByRole('link', { name: 'Tarix' })
    const section = link.closest('[data-slot="nav-section"]') as HTMLLIElement

    expect(section).not.toHaveAttribute('data-closed')

    await user.click(link)

    expect(section).toHaveAttribute('data-closed')
    expect(link).not.toHaveFocus()

    await user.unhover(section)

    expect(section).not.toHaveAttribute('data-closed')
  })
})
