/**
 * Hər müşahidə olunan elementi dərhal "görünən" edən IntersectionObserver.
 * `setup.ts`-dəki qlobal polyfill heç vaxt callback çağırmır (kit/floating-ui
 * üçün kifayətdir), ona görə lazy önizləmə (spec 010) testlərdə yüklənmir —
 * önizləməni yoxlayan test bunu `beforeEach`-də qoşur.
 */

import { vi } from 'vitest'

class InViewObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  private readonly callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    queueMicrotask(() =>
      this.callback(
        [
          {
            target,
            isIntersecting: true,
            intersectionRatio: 1,
          } as unknown as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      ),
    )
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

export function mockAllInView() {
  vi.stubGlobal('IntersectionObserver', InViewObserver)
  return () => vi.unstubAllGlobals()
}
