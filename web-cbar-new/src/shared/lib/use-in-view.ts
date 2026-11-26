'use client'

/**
 * Whether an element is in (or within `rootMargin` of) the viewport (spec 049, contracts/ui-contract.md §2).
 *
 * `false` on the server and on the first client render, so hydration matches. With `once` the answer
 * never goes back to `false` and the element stops being watched.
 */
import { useEffect, useState, type RefObject } from 'react'

import { observeViewport } from './viewport-observer'

type Options = Readonly<{ rootMargin: string; once?: boolean }>

export function useInView(ref: RefObject<Element | null>, { rootMargin, once = false }: Options): boolean {
  const [inView, setInView] = useState(false)
  const done = once && inView

  useEffect(() => {
    const el = ref.current
    if (!el || done) return

    // The no-IntersectionObserver fallback calls back synchronously, before `stop` is assigned.
    const watch = { settled: false, stop: undefined as (() => void) | undefined }
    watch.stop = observeViewport(el, rootMargin, ({ isIntersecting }) => {
      setInView(isIntersecting)
      if (isIntersecting && once) {
        watch.settled = true
        watch.stop?.()
      }
    })
    if (watch.settled) watch.stop()
    return watch.stop
  }, [ref, rootMargin, once, done])

  return inView
}
