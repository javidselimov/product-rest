import { describe, expect, it } from 'vitest'

import { navigationState } from '@/shared/testing/setup'
import { renderApp, screen } from '@/shared/testing/render'

import { NotFoundView } from './index'

describe('NotFoundView', () => {
  it('az dilində başlıq və ana səhifə keçidi', () => {
    navigationState.params = { locale: 'az' }
    renderApp(<NotFoundView />, { locale: 'az' })

    expect(screen.getByText('Səhifə tapılmadı')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ana səhifəyə qayıt' })).toHaveAttribute('href', '/az')
  })

  it('en dilində keçid /en-ə aparır', () => {
    navigationState.params = { locale: 'en' }
    renderApp(<NotFoundView />, { locale: 'en' })

    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en')
  })
})
