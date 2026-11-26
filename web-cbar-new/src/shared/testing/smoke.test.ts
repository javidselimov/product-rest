/**
 * Təməl duman testi (Phase 2 checkpoint).
 *
 * Provider stack-i real şəkildə render olunur və kit `UIMessagesProvider`
 * kataloqu dilə görə tətbiq olunur.
 *
 * JSX yerinə `createElement` işlədilir ki, fayl `.ts` qalsın.
 */
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { renderApp, screen } from './render'

describe('təməl infrastruktur', () => {
  it('provider stack-i render olunur', () => {
    renderApp(createElement('div', { 'data-testid': 'smoke-probe' }))

    expect(screen.getByTestId('smoke-probe')).toBeInTheDocument()
  })

  it('en dilində də render olunur', () => {
    renderApp(createElement('span', { 'data-testid': 'smoke-en' }), {
      locale: 'en',
    })

    expect(screen.getByTestId('smoke-en')).toBeInTheDocument()
  })
})
