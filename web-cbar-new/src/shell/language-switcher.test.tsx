import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { navigationState } from '@/shared/testing/setup'
import { renderApp, screen } from '@/shared/testing/render'

import { LanguageSwitcher, switchLocaleHref } from './language-switcher'

// `next/link` işarələnir ki, client naviqasiyası ilə adi keçidi ayırmaq olsun.
vi.mock('next/link', () => ({
  default: ({ href, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={href} data-next-link="" {...props} />
  ),
}))

describe('switchLocaleHref', () => {
  it('locale seqmentini dəyişir və sorğunu saxlayır', () => {
    expect(switchLocaleHref('/az/laws', 'type=law&page=2', 'en')).toBe('/en/laws?type=law&page=2')
  })

  it('kök yolda da işləyir', () => {
    expect(switchLocaleHref('/az', '', 'en')).toBe('/en')
    expect(switchLocaleHref('/', '', 'en')).toBe('/en')
  })
})

describe('LanguageSwitcher', () => {
  it('yalnız digər dili göstərir və sorğu parametrlərini qoruyur', () => {
    navigationState.pathname = '/az/laws'
    navigationState.searchParams = new URLSearchParams('type=law&page=2')

    renderApp(<LanguageSwitcher locale="az" />, { locale: 'az' })

    const link = screen.getByRole('link', { name: 'Dili dəyiş: English' })

    expect(link).toHaveAttribute('href', '/en/laws?type=law&page=2')
    expect(link).toHaveTextContent('EN')
    expect(screen.queryByText('AZ')).toBeNull()
  })

  // Müyəssərlik menyusu dili yalnız init-də oxuyur, root `<html lang>` da client
  // naviqasiyasında yenilənmir — dil dəyişəndə səhifə tam yüklənməlidir (spec 007 R4).
  it('client naviqasiyası deyil, adi keçiddir (tam yüklənmə)', () => {
    navigationState.pathname = '/az/laws'

    renderApp(<LanguageSwitcher locale="az" />, { locale: 'az' })

    expect(screen.getByRole('link', { name: 'Dili dəyiş: English' })).not.toHaveAttribute(
      'data-next-link',
    )
  })

  it('en səhifəsində az-a keçid verir', () => {
    navigationState.pathname = '/en/media'

    renderApp(<LanguageSwitcher locale="en" />, { locale: 'en' })

    expect(screen.getByRole('link', { name: 'Switch language: Azərbaycanca' })).toHaveAttribute(
      'href',
      '/az/media',
    )
  })
})
