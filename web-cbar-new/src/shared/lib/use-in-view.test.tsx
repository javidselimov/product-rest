/**
 * `useInView` (spec 049): false until the element approaches the viewport, sticky with `once`,
 * immediately true without IntersectionObserver.
 */
import { useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { installIntersectionObserver } from '@/shared/testing/intersection-observer'
import { act, render, screen } from '@/shared/testing/render'

import { useInView } from './use-in-view'

afterEach(() => vi.unstubAllGlobals())

function Probe({ once }: Readonly<{ once?: boolean }>) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { rootMargin: '0px', once })
  return <div ref={ref}>{inView ? 'in view' : 'out of view'}</div>
}

describe('useInView', () => {
  it('turns true when the element enters and stays true with once', () => {
    const io = installIntersectionObserver()
    render(<Probe once />)
    const box = screen.getByText('out of view')

    act(() => io.enter(box))
    expect(screen.getByText('in view')).toBeInTheDocument()

    act(() => io.leave(box))
    expect(screen.getByText('in view')).toBeInTheDocument()
    expect(io.isObserved(box)).toBe(false)
  })

  it('follows the element both ways without once', () => {
    const io = installIntersectionObserver()
    render(<Probe />)
    const box = screen.getByText('out of view')

    act(() => io.enter(box))
    act(() => io.leave(box))
    expect(screen.getByText('out of view')).toBeInTheDocument()
  })

  it('is true straight away without IntersectionObserver', () => {
    render(<Probe once />)
    expect(screen.getByText('in view')).toBeInTheDocument()
  })
})
