/**
 * Shared `IntersectionObserver` pool (spec 049, research R1, contracts/ui-contract.md §1).
 *
 * A page may hold dozens of reveal targets, so all targets with the same `rootMargin` share one
 * observer. Each target gets its first entry flagged `initial`: that is the browser's report of where
 * the element was when it started being watched, which the reveal uses to leave the first screen alone.
 *
 * Without `IntersectionObserver` (old browsers, jsdom) every target counts as visible at once, so
 * heavy widgets load and content shows as before.
 */

export type ViewportEntry = Readonly<{ isIntersecting: boolean; initial: boolean }>
type Callback = (entry: ViewportEntry) => void

type Pool = { observer: IntersectionObserver; targets: Map<Element, { cb: Callback; seen: boolean }> }

const pools = new Map<string, Pool>()

const noop = () => {}

function poolFor(rootMargin: string): Pool {
  const existing = pools.get(rootMargin)
  if (existing) return existing

  const targets: Pool['targets'] = new Map()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = targets.get(entry.target)
        if (!target) continue
        const initial = !target.seen
        target.seen = true
        target.cb({ isIntersecting: entry.isIntersecting, initial })
      }
    },
    { rootMargin, threshold: 0 },
  )
  const pool = { observer, targets }
  pools.set(rootMargin, pool)
  return pool
}

/** Watches `el`; returns the function that stops watching it. */
export function observeViewport(el: Element, rootMargin: string, cb: Callback): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    cb({ isIntersecting: true, initial: true })
    return noop
  }

  const pool = poolFor(rootMargin)
  pool.targets.set(el, { cb, seen: false })
  pool.observer.observe(el)

  return () => {
    if (!pool.targets.delete(el)) return
    pool.observer.unobserve(el)
    if (pool.targets.size === 0) {
      pool.observer.disconnect()
      pools.delete(rootMargin)
    }
  }
}
