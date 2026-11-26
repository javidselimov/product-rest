'use client'

/**
 * Scroll reveal (spec 049 US2, contracts/ui-contract.md §3, data-model.md).
 *
 * The state is React's own and is rendered as `data-reveal`:
 * - `static` — server render, hydration, reduced motion, no IntersectionObserver, or the element was
 *   on screen when it started being watched. Nothing is hidden and nothing animates.
 * - `pending` — the browser's first report put the element below the screen; CSS hides it.
 * - `shown` — it entered the viewport later; CSS plays the fade and slide once.
 *
 * Only `pending` hides anything, and the server never renders it, so content stays whole without
 * JavaScript, for crawlers and in print. The look, the reduced-motion and print guards and the
 * `:focus-within` escape live in `app/globals.css`. Do not nest reveals.
 */
import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'

import { REDUCED_MOTION_QUERY, REVEAL_ROOT_MARGIN, REVEAL_STAGGER_MAX_STEPS } from '@/shared/constants/motion'
import { observeViewport } from '@/shared/lib/viewport-observer'

type RevealState = 'static' | 'pending' | 'shown'

type RevealProps = Readonly<
  {
    as?: 'div' | 'li' | 'section'
    /** Position in a card group; later cards wait a little longer (capped). */
    index?: number
    className?: string
    children: ReactNode
  } & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className'>
>

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export function Reveal({ as: Tag = 'div', index = 0, className, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [state, setState] = useState<RevealState>('static')

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    // The no-IntersectionObserver fallback settles synchronously, before `stop` is assigned.
    const watch = { settled: false, stop: undefined as (() => void) | undefined }
    const settle = (next: RevealState) => {
      watch.settled = true
      setState(next)
      watch.stop?.()
    }
    watch.stop = observeViewport(el, REVEAL_ROOT_MARGIN, ({ isIntersecting, initial }) => {
      if (initial) {
        if (isIntersecting) settle('static')
        else setState('pending')
      } else if (isIntersecting) {
        settle('shown')
      }
    })
    if (watch.settled) watch.stop()
    return watch.stop
  }, [])

  const step = Math.min(Math.max(index, 0), REVEAL_STAGGER_MAX_STEPS)
  const revealStyle = { ...style, '--reveal-index': step } as CSSProperties

  return (
    <Tag ref={ref as never} data-reveal={state} className={className} style={revealStyle} {...rest}>
      {children}
    </Tag>
  )
}
