/**
 * Əlçatanlıq (spec 002 FR-010, quickstart §4 ssenari 2, 4).
 *
 * Yalnız-ikon control-ların əlçatan adı olmalıdır; qabıq landmark-ları
 * (`banner`, `navigation`, `main`, `contentinfo`) və keçid-ötürmə keçidi mövcuddur.
 */
import { describe, expect, it } from 'vitest'

import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen } from '@/shared/testing/render'

import { SiteShell } from './site-shell'

function accessibleName(element: HTMLElement): string {
  return (
    element.getAttribute('aria-label') ??
    element.getAttribute('title') ??
    element.textContent ??
    ''
  ).trim()
}

describe('qabıq landmark-ları', () => {
  it('banner, navigation, main və contentinfo mövcuddur', () => {
    renderApp(
      <SiteShell locale="az" tree={pageTreeAz}>
        <p data-testid="content" />
      </SiteShell>,
      { locale: 'az' },
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Əsas naviqasiya' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('content'))
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('məzmuna keç keçidi main-ə aparır', () => {
    renderApp(
      <SiteShell locale="az" tree={pageTreeAz}>
        <p />
      </SiteShell>,
      { locale: 'az' },
    )

    expect(screen.getByRole('link', { name: 'Məzmuna keç' })).toHaveAttribute('href', '#content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'content')
  })
})

describe('yalnız-ikon control-lar', () => {
  it('qabıqdakı bütün düymələrin əlçatan adı var', () => {
    renderApp(
      <SiteShell locale="az" tree={pageTreeAz}>
        <p />
      </SiteShell>,
      { locale: 'az' },
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)

    for (const button of buttons) {
      expect(accessibleName(button), button.outerHTML.slice(0, 120)).not.toBe('')
    }
  })
})
