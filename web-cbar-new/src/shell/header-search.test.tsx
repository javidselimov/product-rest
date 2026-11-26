import { describe, expect, it } from 'vitest'

import { renderApp, screen } from '@/shared/testing/render'

import { HeaderSearch } from './header-search'

describe('HeaderSearch', () => {
  it('GET forması axtarış səhifəsinə q parametri ilə gedir', () => {
    renderApp(<HeaderSearch locale="az" />)

    const form = screen.getByRole('search', { name: 'Saytda axtarış' })

    expect(form).toHaveAttribute('action', '/az/search')
    expect(form).toHaveAttribute('method', 'get')
    expect(screen.getByRole('searchbox', { name: 'Saytda axtarış' })).toHaveAttribute('name', 'q')
    expect(screen.getByRole('button', { name: 'Axtar' })).toHaveAttribute('type', 'submit')
  })

  it('en dilində ünvan və etiketlər dəyişir', () => {
    renderApp(<HeaderSearch locale="en" />, { locale: 'en' })

    expect(screen.getByRole('search', { name: 'Site search' })).toHaveAttribute('action', '/en/search')
  })
})
