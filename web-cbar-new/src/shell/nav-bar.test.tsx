import { fireEvent } from '@testing-library/react'
import Link from 'next/link'
import { describe, expect, it, vi } from 'vitest'

import { renderApp, screen, within } from '@/shared/testing/render'

import { NavBar } from './nav-bar'

/** jsdom layout hesablamır — keçidlərin mövqeyini əl ilə veririk. */
function place(element: Element, left: number, width: number) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    left,
    width,
    x: left,
    y: 0,
    top: 0,
    right: left + width,
    bottom: 20,
    height: 20,
    toJSON: () => ({}),
  } as DOMRect)
}

function renderBar() {
  renderApp(
    <NavBar>
      <li data-slot="nav-section">
        <Link href="/az/a">Birinci</Link>
      </li>
      <li data-slot="nav-section">
        <Link href="/az/b">İkinci</Link>
      </li>
    </NavBar>,
    { locale: 'az' },
  )
  const [first, second] = screen.getAllByRole('link')
  // Provider-lər (toast) öz siyahılarını da render edir — çubuğu keçiddən tapırıq.
  const list = first.closest('ul') as HTMLUListElement
  place(list, 100, 1000)
  place(first, 150, 80)
  place(second, 300, 60)
  const indicator = list.querySelector('[data-slot="nav-indicator"]') as HTMLElement
  return { list, first, second, indicator }
}

describe('NavBar — sürüşən alt xətt', () => {
  it('hover xətti bölmə keçidinin altına qoyur, başqa bəndə keçəndə yerini dəyişir', () => {
    const { first, second, indicator } = renderBar()

    expect(indicator).not.toHaveAttribute('data-visible')

    fireEvent.pointerOver(first)
    expect(indicator).toHaveAttribute('data-visible')
    expect(indicator.style.left).toBe('50px')
    expect(indicator.style.width).toBe('80px')

    fireEvent.pointerOver(second)
    expect(indicator.style.left).toBe('200px')
    expect(indicator.style.width).toBe('60px')
    // İkinci keçiddə animasiya ilə sürüşür (birincidə dərhal yerinə qoyulurdu).
    expect(indicator.className).toContain('transition-[left,width,opacity]')
  })

  it('çubuqdan çıxanda xətt sönür', () => {
    const { list, first, indicator } = renderBar()

    fireEvent.pointerOver(first)
    fireEvent.pointerLeave(list)

    expect(indicator).not.toHaveAttribute('data-visible')
  })

  it('klaviatura fokusu da xətti göstərir; xətt ekran oxuyucudan gizlidir', () => {
    const { second, indicator } = renderBar()

    fireEvent.focus(second)

    expect(indicator).toHaveAttribute('data-visible')
    expect(indicator).toHaveAttribute('aria-hidden', 'true')
    expect(within(second.closest('ul') as HTMLElement).getAllByRole('listitem')).toHaveLength(2)
  })
})
