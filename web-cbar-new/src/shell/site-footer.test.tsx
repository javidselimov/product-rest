import { describe, expect, it } from 'vitest'

import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'

import { SiteFooter } from './site-footer'

describe('SiteFooter', () => {
  it('allowlist bölmələri, əlaqə, düymələr və 6 sosial keçid render olunur', () => {
    renderApp(<SiteFooter locale="az" tree={pageTreeAz} />, { locale: 'az' })

    const nav = screen.getByRole('navigation', { name: 'Naviqasiya' })
    expect(within(nav).getAllByRole('link')).toHaveLength(7)
    expect(within(nav).getByRole('link', { name: 'Pul siyasəti' })).toHaveAttribute('href', '/az/pul-siyaseti')
    expect(within(nav).getByRole('link', { name: 'Maliyyə sabitliyi' })).toBeInTheDocument()

    // Köhnə saytın və Figma-nın ünvanı (spec 022).
    expect(screen.getByText(/Heydər Əliyev prospekti, 167, AZ1029/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '(+994 12) 966' })).toHaveAttribute('href', 'tel:966')
    expect(screen.getByRole('link', { name: '(+994 12) 493 5058' })).toHaveAttribute('href', 'tel:+994124935058')
    expect(screen.getByRole('link', { name: 'Onlayn müraciət' })).toHaveAttribute('href', 'https://contact.e-cbar.az/')

    const socials = within(screen.getByRole('list', { name: 'Sosial şəbəkələr' })).getAllByRole('link')
    expect(socials).toHaveLength(6)
    for (const link of socials) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(screen.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/Merkezi_Bank_AZ')
  })

  it('tünd fon üçün inverse loqo işlədilir', () => {
    renderApp(<SiteFooter locale="az" tree={pageTreeAz} />, { locale: 'az' })

    expect(screen.getByRole('img', { name: 'Azərbaycan Respublikasının Mərkəzi Bankı' })).toHaveAttribute(
      'src',
      '/site/logo-az-inverse.svg',
    )
  })

  it('faydalı linklər: xarici yeni pəncərədə, MEAS daxili səhifədir', () => {
    renderApp(<SiteFooter locale="az" tree={pageTreeAz} />, { locale: 'az' })

    const useful = within(screen.getByRole('navigation', { name: 'Faydalı linklər' }))
    expect(useful.getAllByRole('link')).toHaveLength(8)

    const infobank = useful.getByRole('link', { name: 'Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi' })
    expect(infobank).toHaveAttribute('href', 'https://infobank.az/')
    expect(infobank).toHaveAttribute('target', '_blank')
    expect(infobank).toHaveAttribute('rel', 'noopener noreferrer')

    const meas = useful.getByRole('link', { name: 'Məlumatların Elektron Açıqlanması Sistemi' })
    expect(meas).toHaveAttribute('href', '/az/securities')
    expect(meas).not.toHaveAttribute('target')
  })

  it('Figma-da gizli olanlar və hədəfi olmayan hüquqi keçidlər render olunmur', () => {
    renderApp(<SiteFooter locale="az" tree={pageTreeAz} />, { locale: 'az' })

    expect(screen.queryByText(/Mətbuat üçün/)).toBeNull()
    expect(screen.queryByRole('link', { name: 'Məxfilik siyasəti' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Saytın xəritəsi' })).toBeNull()
  })

  it('en dilində X hesabı, ünvan və müəlliflik mətni dəyişir', () => {
    renderApp(<SiteFooter locale="en" tree={pageTreeAz} />, { locale: 'en' })

    expect(screen.getByRole('link', { name: 'X' })).toHaveAttribute('href', 'https://x.com/Central_Bank_AZ')
    expect(screen.getByText(/167 Heydar Aliyev Avenue/)).toBeInTheDocument()
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Financial literacy portal' })).toHaveAttribute('href', 'https://bizimpullar.az/')
  })

  it('boş ağacla naviqasiya boş, qalan hissə render olunur', () => {
    renderApp(<SiteFooter locale="az" tree={[]} />, { locale: 'az' })

    expect(within(screen.getByRole('navigation', { name: 'Naviqasiya' })).queryAllByRole('link')).toHaveLength(0)
    expect(screen.getAllByRole('link', { name: 'Sorğu platforması' })).toHaveLength(2)
  })
})
