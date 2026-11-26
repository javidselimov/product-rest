/**
 * Tarix timeline-ının idarəsi (spec 026 US1–US6). jsdom-da olmayan brauzer API-ləri
 * (`matchMedia`, `IntersectionObserver`, `scrollBy`) yalnız lazım olan testdə stub-lanır;
 * yoxlanılan şey həmişə istifadəçinin gördüyü nəticədir (DOM, ünvan, sürüşmə yeri).
 */
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, fireEvent, render, screen, waitFor, within } from '@/shared/testing/render'

import { AUTOPLAY_MS } from './constants'
import { HistoryStepper } from './history-stepper'

const YEARS = ['1919', '1992', '1998'].map((year) => ({ year, anchorId: `year-${year}` }))
const LABELS = { nav: 'İllər', prev: 'Əvvəlki il', next: 'Növbəti il', zoom: 'Şəkli böyüt' }
/** CMS media şəkli — `HistoryPhotos`-dakı kimi dinamik `href` (səhifə linki deyil). */
const PHOTO = '/media/657'

function panel(year: string) {
  return (
    <div>
      <p>{year}</p>
      <h3>{`Hadisə ${year}`}</h3>
      {year === '1998' ? (
        <a href={PHOTO} data-zoom="" aria-label="Şəkli böyüt: Bina">
          {/* eslint-disable-next-line @next/next/no-img-element -- test */}
          <img src={PHOTO} alt="Bina" />
        </a>
      ) : null}
    </div>
  )
}

function renderStepper(years = YEARS) {
  return render(<HistoryStepper years={years} panels={years.map((y) => panel(y.year))} labels={LABELS} />)
}

const panels = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>('[data-panel]')]
const activeYear = (container: HTMLElement) => panels(container).find((p) => p.hasAttribute('data-active'))?.id
const axis = () => within(screen.getByRole('navigation', { name: 'İllər' }))
const nextButton = () => screen.getByRole('button', { name: 'Növbəti il' })
const prevButton = () => screen.getByRole('button', { name: 'Əvvəlki il' })

/**
 * `IntersectionObserver` stub-ı: timeline-ın görünməsini test idarə edir. `visible: true`
 * tam görünən timeline-dır; həndəsə verilərsə, görünən hissə px-lə sayılır (viewport 700 px).
 */
function stubIntersection(visible: boolean, geometry?: { height: number; visibleHeight: number }) {
  const height = geometry?.height ?? 600
  const visibleHeight = geometry?.visibleHeight ?? (visible ? height : 0)
  const entry = (target: Element) =>
    ({
      target,
      isIntersecting: visibleHeight > 0,
      intersectionRatio: visibleHeight / height,
      boundingClientRect: { height } as DOMRectReadOnly,
      intersectionRect: { height: visibleHeight } as DOMRectReadOnly,
      rootBounds: { height: 700 } as DOMRectReadOnly,
    }) as IntersectionObserverEntry
  class Stub {
    constructor(private readonly cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.cb([entry(target)], this as unknown as IntersectionObserver)
    }
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', Stub)
}

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce && query.includes('reduce'), media: query, addEventListener() {}, removeEventListener() {} }))
}

beforeEach(() => {
  window.history.replaceState(null, '', '/az/tarix')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('US1 — il-il vərəqləmə', () => {
  it('ilkin halda birinci il aktivdir, bütün panellər DOM-dadır', () => {
    const { container } = renderStepper()
    expect(panels(container).map((p) => p.id)).toEqual(['year-1919', 'year-1992', 'year-1998'])
    expect(activeYear(container)).toBe('year-1919')
    expect(axis().getByRole('link', { name: '1919' })).toHaveAttribute('aria-current', 'step')
  })

  it('"Növbəti il" növbəti ili açır, keçilmiş nöqtə işarələnir, irəliləmə dəyişir', () => {
    const { container } = renderStepper()
    fireEvent.click(nextButton())
    expect(activeYear(container)).toBe('year-1992')
    expect(axis().getByRole('link', { name: '1992' })).toHaveAttribute('aria-current', 'step')
    expect(axis().getByRole('link', { name: '1919' })).toHaveAttribute('data-done')
    expect(axis().getByRole('link', { name: '1919' })).not.toHaveAttribute('aria-current')
  })

  it('sərhəddə düymə deaktivdir', () => {
    renderStepper()
    expect(prevButton()).toBeDisabled()
    fireEvent.click(nextButton())
    fireEvent.click(nextButton())
    expect(nextButton()).toBeDisabled()
    expect(prevButton()).toBeEnabled()
  })

  it('ox linki lövbərə getmir, ili dəyişir', () => {
    const { container } = renderStepper()
    const link = axis().getByRole('link', { name: '1998' })
    expect(link).toHaveAttribute('href', '#year-1998')
    expect(fireEvent.click(link)).toBe(false) // preventDefault
    expect(activeYear(container)).toBe('year-1998')
  })

  it('bir il olanda ox və düymələr yoxdur', () => {
    const { container } = renderStepper(YEARS.slice(0, 1))
    expect(activeYear(container)).toBe('year-1919')
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Növbəti il' })).toBeNull()
  })

  it('FR-007a: kart hündürlüyü dəyişəndə kliklənən düymə ekranda yerində qalır', () => {
    let scrolled = 0
    vi.stubGlobal('scrollBy', (_x: number, y: number) => {
      scrolled += y
    })
    renderStepper()
    const button = nextButton()
    vi.spyOn(button, 'getBoundingClientRect')
      .mockReturnValueOnce({ top: 900 } as DOMRect)
      .mockReturnValueOnce({ top: 700 } as DOMRect)
    fireEvent.click(button)
    expect(scrolled).toBe(-200)
  })
})

describe('US2 — #il ünvanı', () => {
  it.each(['#1992', '#year-1992'])('%s ilə açılış həmin ili aktiv edir', (hash) => {
    window.history.replaceState(null, '', `/az/tarix${hash}`)
    const { container } = renderStepper()
    expect(activeYear(container)).toBe('year-1992')
  })

  it('timeline-da olmayan il birinci ili saxlayır', () => {
    window.history.replaceState(null, '', '/az/tarix#1850')
    const { container } = renderStepper()
    expect(activeYear(container)).toBe('year-1919')
  })

  it('il dəyişəndə ünvan yenilənir, tarixçəyə addım düşmür', () => {
    renderStepper()
    const before = window.history.length
    fireEvent.click(nextButton())
    expect(window.location.hash).toBe('#1992')
    expect(window.history.length).toBe(before)
  })

  it('açılışda ünvana toxunulmur', () => {
    window.history.replaceState(null, '', '/az/tarix#main')
    renderStepper()
    expect(window.location.hash).toBe('#main')
  })
})

describe('US3 — klaviatura və toxunma', () => {
  it('←/→ ili dəyişir', () => {
    const { container } = renderStepper()
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(activeYear(container)).toBe('year-1992')
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(activeYear(container)).toBe('year-1919')
  })

  it('yazı sahəsində və modifikatorla ←/→ işləmir', () => {
    const { container } = render(
      <>
        <input aria-label="Axtar" />
        <HistoryStepper years={YEARS} panels={YEARS.map((y) => panel(y.year))} labels={LABELS} />
      </>,
    )
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Axtar' }), { key: 'ArrowRight' })
    fireEvent.keyDown(document, { key: 'ArrowRight', altKey: true })
    expect(activeYear(container)).toBe('year-1919')
  })

  it('üfüqi swipe ili dəyişir, şaquli və qısa sürüşdürmə dəyişmir', () => {
    const { container } = renderStepper()
    const card = container.querySelector('[data-slot="history-card"]') as HTMLElement
    const swipe = (dx: number, dy: number) => {
      fireEvent.touchStart(card, { touches: [{ clientX: 200, clientY: 200 }] })
      fireEvent.touchEnd(card, { changedTouches: [{ clientX: 200 + dx, clientY: 200 + dy }] })
    }
    swipe(-30, 0)
    expect(activeYear(container)).toBe('year-1919')
    swipe(-80, 120)
    expect(activeYear(container)).toBe('year-1919')
    swipe(-80, 10)
    expect(activeYear(container)).toBe('year-1992')
    swipe(80, 0)
    expect(activeYear(container)).toBe('year-1919')
  })

  it('istifadəçi keçidindən sonra kart elan olunur, əvvəl yox', () => {
    const { container } = renderStepper()
    const card = container.querySelector('[data-slot="history-card"]') as HTMLElement
    expect(card).toHaveAttribute('aria-live', 'off')
    fireEvent.click(nextButton())
    expect(card).toHaveAttribute('aria-live', 'polite')
  })
})

describe('US4 — avtomatik keçid', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stubIntersection(true)
  })

  const tick = (ms = AUTOPLAY_MS) => act(() => vi.advanceTimersByTime(ms))

  it('hər 5 s növbəti il, sonuncuda gözləyir; elan söndürülüb, ünvan dəyişmir', () => {
    const { container } = renderStepper()
    tick()
    expect(activeYear(container)).toBe('year-1992')
    tick()
    expect(activeYear(container)).toBe('year-1998')
    tick()
    expect(activeYear(container)).toBe('year-1998')
    expect(container.querySelector('[data-slot="history-card"]')).toHaveAttribute('aria-live', 'off')
    expect(window.location.hash).toBe('')
  })

  it('reduced-motion-da başlamır', () => {
    stubReducedMotion(true)
    const { container } = renderStepper()
    tick()
    expect(activeYear(container)).toBe('year-1919')
  })

  it('#il ilə açılışda başlamır; başqa lövbər mane olmur', () => {
    window.history.replaceState(null, '', '/az/tarix#1919')
    const first = renderStepper()
    tick()
    expect(activeYear(first.container)).toBe('year-1919')
    first.unmount()

    window.history.replaceState(null, '', '/az/tarix#main')
    const second = renderStepper()
    tick()
    expect(activeYear(second.container)).toBe('year-1992')
  })

  it('siçan kartın üstündə olanda fasilə verir, çıxanda davam edir', () => {
    const { container } = renderStepper()
    const card = container.querySelector('[data-slot="history-card"]')!
    fireEvent.pointerEnter(card)
    tick(AUTOPLAY_MS * 3)
    expect(activeYear(container)).toBe('year-1919')
    fireEvent.pointerLeave(card)
    tick()
    expect(activeYear(container)).toBe('year-1992')
  })

  it('klaviatura fokusu timeline-ın içində olanda fasilə verir, çıxanda davam edir', () => {
    const { container } = render(
      <>
        <HistoryStepper years={YEARS} panels={YEARS.map((y) => panel(y.year))} labels={LABELS} />
        <button type="button">Kənar</button>
      </>,
    )
    const link = axis().getByRole('link', { name: '1992' })
    fireEvent.keyDown(link, { key: 'Tab' })
    fireEvent.focus(link)
    tick(AUTOPLAY_MS * 3)
    expect(activeYear(container)).toBe('year-1919')
    // Timeline daxilində fokus dəyişməsi fasiləni saxlayır.
    fireEvent.blur(link, { relatedTarget: nextButton() })
    fireEvent.focus(nextButton())
    tick(AUTOPLAY_MS * 2)
    expect(activeYear(container)).toBe('year-1919')
    fireEvent.blur(nextButton(), { relatedTarget: screen.getByRole('button', { name: 'Kənar' }) })
    tick()
    expect(activeYear(container)).toBe('year-1992')
  })

  it('siçanla klikdən gələn fokus fasilə vermir', () => {
    const { container } = renderStepper()
    fireEvent.pointerDown(nextButton())
    fireEvent.focus(nextButton())
    tick()
    expect(activeYear(container)).toBe('year-1992')
  })

  it('istifadəçi keçidi avtomatik keçidi dayandırmır, yalnız sayğacı sıfırlayır', () => {
    const { container } = renderStepper([...YEARS, { year: '2005', anchorId: 'year-2005' }])
    tick(AUTOPLAY_MS - 1000)
    fireEvent.click(nextButton())
    expect(activeYear(container)).toBe('year-1992')
    // Köhnə sayğacın 1 s-i qalmışdı — sıfırlanıb, 4 s sonra hələ dəyişmir.
    tick(AUTOPLAY_MS - 1000)
    expect(activeYear(container)).toBe('year-1992')
    tick(1000)
    expect(activeYear(container)).toBe('year-1998')
    // Klaviatura ilə geri → avtomatik keçid oradan davam edir.
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(activeYear(container)).toBe('year-1992')
    tick()
    expect(activeYear(container)).toBe('year-1998')
  })

  it('toxunma avtomatik keçidi dayandırmır', () => {
    const { container } = renderStepper()
    fireEvent.touchStart(container.querySelector('[data-slot="history-card"]')!, { touches: [{ clientX: 0, clientY: 0 }] })
    tick()
    expect(activeYear(container)).toBe('year-1992')
  })

  it('istifadəçi keçidi elan olunur, ardınca gələn avtomatik keçid yox', () => {
    const { container } = renderStepper([...YEARS, { year: '2005', anchorId: 'year-2005' }])
    const card = container.querySelector('[data-slot="history-card"]') as HTMLElement
    fireEvent.click(nextButton())
    expect(card).toHaveAttribute('aria-live', 'polite')
    tick()
    expect(activeYear(container)).toBe('year-1998')
    expect(card).toHaveAttribute('aria-live', 'off')
    expect(window.location.hash).toBe('#1992')
  })

  it('görünən pay viewport-a görə sayılır: hündür timeline-ın yarım ekranı kifayətdir, dörddə biri yox', () => {
    // 1400 px timeline, 700 px viewport: 400 px görünür → ratio 0.29, amma viewport-un 57 %-i.
    stubIntersection(true, { height: 1400, visibleHeight: 400 })
    const tall = renderStepper()
    tick()
    expect(activeYear(tall.container)).toBe('year-1992')
    tall.unmount()

    // 600 px timeline-ın 150 px-i görünür → 25 % < 50 %.
    stubIntersection(true, { height: 600, visibleHeight: 150 })
    const peeking = renderStepper()
    tick(AUTOPLAY_MS * 2)
    expect(activeYear(peeking.container)).toBe('year-1919')
  })

  it('timeline ekranda deyilsə və ya tab gizlidirsə vaxt sayılmır', () => {
    stubIntersection(false)
    const hidden = renderStepper()
    tick(AUTOPLAY_MS * 2)
    expect(activeYear(hidden.container)).toBe('year-1919')
    hidden.unmount()

    stubIntersection(true)
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    const background = renderStepper()
    tick(AUTOPLAY_MS * 2)
    expect(activeYear(background.container)).toBe('year-1919')
  })
})

describe('US5 — lightbox', () => {
  it('şəkil linki dialoqu açır, Escape bağlayır və fokus linkə qayıdır; açıqkən ←/→ işləmir', async () => {
    window.history.replaceState(null, '', '/az/tarix#1998')
    const { container } = renderStepper()
    const link = screen.getByRole('link', { name: 'Şəkli böyüt: Bina' })
    link.focus()
    expect(fireEvent.click(link)).toBe(false)

    const dialog = await screen.findByRole('dialog', { name: 'Bina' })
    expect(within(dialog).getByRole('img', { name: 'Bina' })).toHaveAttribute('src', '/media/657')
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(activeYear(container)).toBe('year-1998')

    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    // Radix fokusu bağlanandan sonra növbəti tikdə qaytarır.
    await waitFor(() => expect(link).toHaveFocus())
  })

  it('modifikatorlu klik brauzerə qalır (yeni tab)', () => {
    window.history.replaceState(null, '', '/az/tarix#1998')
    renderStepper()
    expect(fireEvent.click(screen.getByRole('link', { name: 'Şəkli böyüt: Bina' }), { ctrlKey: true })).toBe(true)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('lightbox açıqkən avtomatik keçid fasilə verir, bağlananda davam edir', () => {
    vi.useFakeTimers()
    stubIntersection(true)
    // 1992, 1998, 2005 — 1998 ikinci ildir, birinci tik onu açır.
    const { container } = renderStepper([...YEARS.slice(1), { year: '2005', anchorId: 'year-2005' }])
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS))
    fireEvent.click(screen.getByRole('link', { name: 'Şəkli böyüt: Bina' }))
    const dialog = screen.getByRole('dialog', { name: 'Bina' })
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS * 2))
    expect(activeYear(container)).toBe('year-1998')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    // Escape klaviaturadır: fokus linkə qayıdır və fasilə qalır; fokus timeline-dan çıxanda davam edir.
    const link = screen.getByRole('link', { name: 'Şəkli böyüt: Bina' })
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS))
    expect(activeYear(container)).toBe('year-1998')
    fireEvent.blur(link, { relatedTarget: document.body })
    act(() => vi.advanceTimersByTime(AUTOPLAY_MS))
    expect(activeYear(container)).toBe('year-2005')
  })
})

describe('US6 — JS-siz (server HTML)', () => {
  it('bütün panellər markup-dadır, yalnız birincidə data-active var; düymələr no-js-də gizlidir', () => {
    const html = renderToString(<HistoryStepper years={YEARS} panels={YEARS.map((y) => panel(y.year))} labels={LABELS} />)
    for (const y of YEARS) expect(html).toContain(`id="${y.anchorId}"`)
    expect(html.match(/data-active=""/g)).toHaveLength(1)
    expect(html).toContain('Hadisə 1998')
    expect(html).toMatch(/no-js:hidden/)
  })
})
