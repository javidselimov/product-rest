/**
 * Controllable `IntersectionObserver` for tests (spec 049, research R9).
 *
 * Installed only by the tests that need it — the global setup keeps jsdom's "no IntersectionObserver"
 * path, which is the immediate-load fallback. `observe` delivers the browser's initial entry for the
 * target (visible or not, per `initiallyVisible`); `enter` / `leave` deliver later entries.
 */
import { vi } from 'vitest'

type Options = { initiallyVisible?: (el: Element) => boolean }

export function installIntersectionObserver({ initiallyVisible = () => false }: Options = {}) {
  const observers = new Set<StubObserver>()

  class StubObserver {
    readonly targets = new Set<Element>()
    readonly rootMargin: string

    constructor(
      private readonly cb: IntersectionObserverCallback,
      init?: IntersectionObserverInit,
    ) {
      this.rootMargin = init?.rootMargin ?? '0px'
      observers.add(this)
    }

    observe(target: Element) {
      this.targets.add(target)
      this.fire(target, initiallyVisible(target))
    }

    unobserve(target: Element) {
      this.targets.delete(target)
    }

    disconnect() {
      this.targets.clear()
      observers.delete(this)
    }

    takeRecords() {
      return []
    }

    fire(target: Element, isIntersecting: boolean) {
      const entry = { target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 } as IntersectionObserverEntry
      this.cb([entry], this as unknown as IntersectionObserver)
    }
  }

  vi.stubGlobal('IntersectionObserver', StubObserver)

  const deliver = (el: Element, isIntersecting: boolean) => {
    for (const observer of [...observers]) if (observer.targets.has(el)) observer.fire(el, isIntersecting)
  }

  return {
    enter: (el: Element) => deliver(el, true),
    leave: (el: Element) => deliver(el, false),
    /** Live observers (one per `rootMargin` in the shared pool). */
    observerCount: () => observers.size,
    isObserved: (el: Element) => [...observers].some((o) => o.targets.has(el)),
    restore: () => vi.unstubAllGlobals(),
  }
}

/** Stubs `matchMedia` so `query` matches (reduced motion) or nothing does. */
export function stubMatchMedia(matching: string | null) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === matching,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }))
}
