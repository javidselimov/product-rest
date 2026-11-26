import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { i18n } from '@/shared/i18n'
import { resetAuthMock } from './handlers/auth'
import { server } from './server'

// Faylın ilk testi lazy route chunk-ını soyuq yükləyir; tam paralel qaçışda bu
// RTL-in default 1000 ms `findBy`/`waitFor` limitini keçib təsadüfi qırmızı verirdi
// (təkbaşına işlədiləndə keçən testlər — spec 004 T001-də ölçülüb).
configure({ asyncUtilTimeout: 5000 })

// jsdom navigator dili en-US-dir — testlər default dil (az) üzərində işləyir.
beforeAll(() => i18n.changeLanguage('az'))

// globals: false olduğundan RTL avtomatik cleanup etmir — əl ilə qeyd olunur.
afterEach(cleanup)

// Paylaşılan queryClient cache-i testlər arasında sızmasın.
afterEach(async () => {
  const { queryClient } = await import('@/app/providers/query-client')
  queryClient.clear()
})

// MSW node server — hər testdə API kontraktı eyni handler-lərdən gəlir.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
// Mock server sessiyası (refresh cookie-nin əvəzi, spec 005) testlər arasında sızmasın.
afterEach(resetAuthMock)
afterAll(() => server.close())

// jsdom-da olmayan brauzer API-ləri — kit komponentlərinin işləməsi üçün minimum.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    root = null
    rootMargin = ''
    thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// Media önizləməsi (spec 010) `<img src>` üçün `blob:` ünvanı yaradır. jsdom-da bu API
// yoxdur, Node-unku isə jsdom `Blob`-unu qəbul etmir — şərtsiz əvəzlənir.
let nextObjectUrl = 0
URL.createObjectURL = () => `blob:test/${++nextObjectUrl}`
URL.revokeObjectURL = () => {}

// `responseType: 'blob'` cavabında MSW XHR interceptor-u jsdom `Blob`-unu Node-un
// `Response`-una ötürür; Node 22 undici `.stream()` çağırır, jsdom 30-da isə yoxdur
// (CI node:22 — 8 test "object.stream is not a function" ilə yükləmədə qalırdı).
if (!Blob.prototype.stream) {
  Blob.prototype.stream = function stream(this: Blob) {
    const bytes = this.arrayBuffer()
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new Uint8Array(await bytes))
        controller.close()
      },
    })
  } as Blob['stream']
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// jsdom-da pointer capture API-si yoxdur — kit Select/Combobox trigger-ləri onu çağırır.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

// ProseMirror (TipTap) jsdom-da Range ölçmələrini tələb edir.
if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () =>
    ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: [][Symbol.iterator],
    }) as unknown as DOMRectList
  Range.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => ({}),
    }) as DOMRect
}
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null
}

// jsdom scrollTo-nu dəstəkləmir — router scroll restoration çağırışları səssiz keçsin.
window.scrollTo = () => {}
