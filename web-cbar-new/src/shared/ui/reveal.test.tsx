/**
 * Scroll reveal (spec 049 US2, US3). The IntersectionObserver stub stands in for scrolling; the
 * assertions are on `data-reveal`, which is what the CSS shows or hides, and on what a visitor or a
 * screen reader can reach.
 */
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { REDUCED_MOTION_QUERY } from '@/shared/constants/motion'
import { installIntersectionObserver, stubMatchMedia } from '@/shared/testing/intersection-observer'
import { act, render, screen } from '@/shared/testing/render'
import { NewsGrid } from '@/widgets/news-grid'

import { Reveal } from './reveal'

afterEach(() => vi.unstubAllGlobals())

const block = () => screen.getByText('Block').closest<HTMLElement>('[data-reveal]')!

describe('Reveal', () => {
  it('leaves content that is on screen at first alone', () => {
    const io = installIntersectionObserver({ initiallyVisible: () => true })
    render(<Reveal>Block</Reveal>)

    expect(block()).toHaveAttribute('data-reveal', 'static')
    expect(io.isObserved(block())).toBe(false)
  })

  it('hides content below the screen and shows it once when it scrolls in', () => {
    const io = installIntersectionObserver()
    render(<Reveal>Block</Reveal>)
    const el = block()
    expect(el).toHaveAttribute('data-reveal', 'pending')

    act(() => io.enter(el))
    expect(el).toHaveAttribute('data-reveal', 'shown')

    act(() => io.leave(el))
    act(() => io.enter(el))
    expect(el).toHaveAttribute('data-reveal', 'shown')
    expect(io.isObserved(el)).toBe(false)
  })

  it('never hides anything when the visitor asked for reduced motion', () => {
    stubMatchMedia(REDUCED_MOTION_QUERY)
    const io = installIntersectionObserver()
    render(<Reveal>Block</Reveal>)

    expect(block()).toHaveAttribute('data-reveal', 'static')
    expect(io.observerCount()).toBe(0)
  })

  it('never hides anything without IntersectionObserver', () => {
    render(<Reveal>Block</Reveal>)
    expect(block()).toHaveAttribute('data-reveal', 'static')
  })

  it('caps the stagger step', () => {
    render(
      <ul>
        <Reveal as="li" index={20}>
          Late
        </Reveal>
        <Reveal as="li">First</Reveal>
      </ul>,
    )
    expect(screen.getByText('Late').style.getPropertyValue('--reveal-index')).toBe('8')
    expect(screen.getByText('First').style.getPropertyValue('--reveal-index')).toBe('0')
  })

  it('keeps list semantics and forwards attributes', () => {
    render(
      <ul>
        <Reveal as="li" data-slot="card" aria-label="Card">
          Item
        </Reveal>
      </ul>,
    )
    const item = screen.getByRole('listitem', { name: 'Card' })
    expect(item).toHaveAttribute('data-slot', 'card')
  })
})

describe('Reveal without JavaScript (US3)', () => {
  it('sends visible content from the server', () => {
    const html = renderToString(
      <NewsGrid
        items={[{ key: '1', href: '/az/press-releases/1', title: 'Server headline', dateLabel: '16.11.2026', dateTime: '2026-11-16', imageUrl: null }]}
        variant="text"
      />,
    )
    expect(html).toContain('Server headline')
    expect(html).toContain('data-reveal="static"')
    expect(html).not.toContain('pending')
  })

  it('keeps hidden content reachable by keyboard and screen readers', async () => {
    installIntersectionObserver()
    render(
      <Reveal>
        <a href="#details">Hidden link</a>
      </Reveal>,
    )
    expect(screen.getByText('Hidden link').closest('[data-reveal]')).toHaveAttribute('data-reveal', 'pending')

    const link = screen.getByRole('link', { name: 'Hidden link' })
    link.focus()
    expect(link).toHaveFocus()
  })
})
