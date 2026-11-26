'use client'

/**
 * Tarix timeline-ının idarəsi — spec 026 (Figma `1845:119481`, `tarix.html` prototipi).
 *
 * İl kartları serverdə render olunur və bura `panels` kimi gəlir (research R5): hamısı ilk
 * HTML-dədir, qeyri-aktivlər yalnız `js:` altında gizlənir — JS-siz, robot və çap hamısını
 * görür. Bu komponent aktiv ili, il oxunu, düymələri, ←/→, swipe, `#il` ünvanını, avtomatik
 * keçidi və şəkil lightbox-unu idarə edir.
 *
 * Avtomatik keçid istifadəçinin öz keçidləri ilə yanaşı işləyir (FR-015): düymə, nöqtə, ←/→ və
 * swipe onu dayandırmır, yalnız sayğacı sıfırlayır — seçilən il tam 5 s qalır. Fasilə verən
 * hallar: siçan kartın üstündədir, fokus timeline-ın içindədir, lightbox açıqdır; səbəb
 * aradan qalxanda davam edir. Görünən "dayandır" düyməsi yoxdur — WCAG 2.2.2-dən qəbul edilmiş
 * sapma (spec Q2-C, plan Complexity Tracking). Risk azaldılır: reduced-motion və `#il` ilə
 * açılışda heç başlamır, yalnız timeline ekranda və tab aktiv olanda sayır, avtomatik keçid
 * ekran oxuyucusuna elan olunmur və ünvanı dəyişmir.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Dialog, DialogContent, DialogTitle } from '@cbar/lib-react-ui-kit/dialog'
import { ArrowLeftIcon, ArrowRightIcon } from '@cbar/lib-react-ui-kit/icons'
import {
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { AUTOPLAY_MS, MIN_STEP_PX, SWIPE_PX, VISIBLE_SHARE, VISIBLE_THRESHOLD_STEPS } from './constants'

/** Observer thresholds, one per step — the visible share itself is computed in `isVisibleEnough`. */
const VISIBLE_THRESHOLDS = Array.from({ length: VISIBLE_THRESHOLD_STEPS + 1 }, (_, i) => i / VISIBLE_THRESHOLD_STEPS)

const HASH = /^#(?:year-)?(\d{4})$/

/** Avtomatik keçidə fasilə verən səbəblər; çoxluq boşalanda davam edir. */
type PauseReason = 'hover' | 'focus' | 'zoom'

type HistoryStepperProps = Readonly<{
  years: { year: string; anchorId: string }[]
  panels: ReactNode[]
  labels: { nav: string; prev: string; next: string; zoom: string }
}>

/**
 * Timeline "ekrandadır" — görünən hissəsi öz hündürlüyünün və ya viewport-un (hansı kiçikdirsə)
 * yarısından çoxdur. Təkcə `intersectionRatio` olsaydı, viewport-dan hündür kart (mobil, uzun
 * il) heç vaxt 50 %-ə çatmazdı və avtomatik keçid başlamazdı.
 */
function isVisibleEnough(entry: IntersectionObserverEntry) {
  if (!entry.isIntersecting) return false
  const viewport = entry.rootBounds?.height || window.innerHeight
  const reference = Math.min(entry.boundingClientRect.height, viewport)
  return reference > 0 && entry.intersectionRect.height / reference >= VISIBLE_SHARE
}

function reducedMotion() {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Ox ekrana sığmırsa aktiv nöqtəni ortaya gətirir — səhifəni şaquli sürüşdürmədən (024-dəki il naviqasiyası kimi). */
function revealHorizontally(row: HTMLElement | null) {
  const link = row?.querySelector<HTMLElement>('[aria-current="step"]')
  if (!row || !link || row.scrollWidth <= row.clientWidth || typeof row.scrollTo !== 'function') return
  const delta = link.getBoundingClientRect().left - row.getBoundingClientRect().left
  row.scrollTo({ left: row.scrollLeft + delta - (row.clientWidth - link.offsetWidth) / 2, behavior: reducedMotion() ? 'auto' : 'smooth' })
}

/** Hash yalnız ilk açılışda oxunur (`hashchange` dinlənmir — research R6 məhdudiyyəti). */
const subscribeNever = () => () => {}
const readHash = () => window.location.hash

function isTypingTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]') != null
}

export function HistoryStepper({ years, panels, labels }: HistoryStepperProps) {
  const count = years.length
  // Ünvandakı il (`#1992` / `#year-1992`) — serverdə və hydration-da boşdur, sonra brauzerinki (R6).
  const hash = useSyncExternalStore(subscribeNever, readHash, () => '')
  const fromHash = useMemo(() => {
    const match = HASH.exec(hash)
    return match ? years.findIndex((y) => y.year === match[1]) : -1
  }, [hash, years])
  /** İstifadəçinin və ya avtomatik keçidin seçdiyi il; seçilməyibsə ünvandakı, o da yoxdursa birinci. */
  const [picked, setPicked] = useState<number | null>(null)
  const index = picked ?? Math.max(fromHash, 0)
  /** İlk il dəyişməsinə qədər `false`: ilk kartda solma animasiyası olmur. */
  const [moved, setMoved] = useState(false)
  /** Son keçid istifadəçinindir — yalnız o halda kart ekran oxuyucusuna elan olunur. */
  const [byUser, setByUser] = useState(false)
  /** İstifadəçi keçidi sayğacı sıfırlayır: hər artım interval-ı yenidən qurur. */
  const [cycle, setCycle] = useState(0)
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const axisRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const pauses = useRef(new Set<PauseReason>())
  /** Son giriş klaviaturadandır — fokus fasiləsi yalnız o halda (siçan kliki də düyməni fokuslayır). */
  const keyboard = useRef(false)
  /** Timeline ekranda ən azı yarı görünür (isVisibleEnough); API yoxdursa görünən sayılır. */
  const visible = useRef(typeof IntersectionObserver === 'undefined')
  const writeHash = useRef(false)
  /** FR-007a: klikdən əvvəl kliklənən elementin ekrandakı yeri. */
  const anchor = useRef<{ el: HTMLElement; top: number } | null>(null)
  const zoomTrigger = useRef<HTMLElement | null>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const setPaused = (reason: PauseReason, on: boolean) => {
    if (on) pauses.current.add(reason)
    else pauses.current.delete(reason)
  }

  /** İstifadəçinin öz keçidi: sayğac sıfırlanır, ünvan yenilənir, element yerində qalır, kart elan olunur. */
  const go = (next: number, from?: Element | null) => {
    const target = Math.max(0, Math.min(count - 1, next))
    setCycle((c) => c + 1)
    if (target === indexRef.current) return
    anchor.current = from instanceof HTMLElement ? { el: from, top: from.getBoundingClientRect().top } : null
    indexRef.current = target
    writeHash.current = true
    setMoved(true)
    setByUser(true)
    setPicked(target)
  }

  // `#il` ilə açılışda timeline ekrana gətirilir (brauzer gizli panelə özü sürüşmür).
  useEffect(() => {
    if (fromHash >= 0) rootRef.current?.scrollIntoView?.({ block: 'start' })
  }, [fromHash])

  /**
   * Səhifə `#il` ilə açılıb (R7) — bir dəfə, mount-da oxunur. `fromHash` canlıdır: istifadəçi
   * keçidi ünvanı yeniləyəndən sonra o da dəyişir, amma avtomatik keçid buna görə sönməməlidir.
   */
  const [openedWithYear] = useState(() => {
    if (typeof window === 'undefined') return false
    const match = HASH.exec(window.location.hash)
    return match != null && years.some((y) => y.year === match[1])
  })
  /** Avtomatik keçid `#il` ilə açılışda, reduced-motion-da və bir ildə heç başlamır; brauzer API-si üçün effekt daxilində çağırılır. */
  const autoplayEnabled = () => count > 1 && !openedWithYear && !reducedMotion()

  // Vaxt yalnız timeline ekranda olanda sayılır — görünürlük ayrıca izlənir ki, sayğac sıfırlananda observer qalsın.
  useEffect(() => {
    if (!autoplayEnabled() || typeof IntersectionObserver === 'undefined' || !rootRef.current) return
    const observer = new IntersectionObserver(([entry]) => (visible.current = entry ? isVisibleEnough(entry) : false), { threshold: VISIBLE_THRESHOLDS })
    observer.observe(rootRef.current)
    return () => observer.disconnect()
    // autoplayEnabled yalnız sabitlərdən (count, mount-dakı hash, media query) asılıdır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, openedWithYear])

  // Sayğac: hər `cycle`-da yenidən qurulur. Sonuncu ildə gözləyir (birinciyə qayıtmır); istifadəçi geri qayıdarsa davam edir.
  useEffect(() => {
    if (!autoplayEnabled()) return
    const timer = window.setInterval(() => {
      if (pauses.current.size > 0 || !visible.current || document.visibilityState === 'hidden') return
      const next = indexRef.current + 1
      if (next >= count) return
      indexRef.current = next
      setByUser(false)
      setMoved(true)
      setPicked(next)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, openedWithYear, cycle])

  // İl dəyişəndən sonra: kliklənən element yerində qalır (FR-007a), ox ortalanır, ünvan yenilənir.
  useLayoutEffect(() => {
    indexRef.current = index
    const held = anchor.current
    anchor.current = null
    if (held?.el.isConnected) {
      const delta = held.el.getBoundingClientRect().top - held.top
      if (delta !== 0) window.scrollBy(0, delta)
    }
    revealHorizontally(axisRef.current)
    if (writeHash.current) {
      writeHash.current = false
      window.history.replaceState(window.history.state, '', `#${years[index]?.year ?? ''}`)
    }
  }, [index, years])

  // ←/→ (FR-012, research R9): yazı sahəsində, modifikatorla və lightbox açıqkən işləmir.
  useEffect(() => {
    if (count < 2) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return
      if (isTypingTarget(event.target) || document.querySelector('[role="dialog"]')) return
      keyboard.current = true
      const focused = document.activeElement
      const from = focused && rootRef.current?.contains(focused) ? focused : null
      go(indexRef.current + (event.key === 'ArrowRight' ? 1 : -1), from)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // `go` hər render-də yenidir, amma yalnız ref-lərlə işləyir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const onTouchStart = (event: TouchEvent) => {
    const point = event.touches[0]
    touch.current = point ? { x: point.clientX, y: point.clientY } : null
  }

  // Yalnız üfüqi, 50 px-dən uzun sürüşdürmə (FR-013); şaquli sürüşdürmə səhifəyə qalır.
  const onTouchEnd = (event: TouchEvent) => {
    const start = touch.current
    const point = event.changedTouches[0]
    touch.current = null
    if (!start || !point) return
    const dx = point.clientX - start.x
    const dy = point.clientY - start.y
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(indexRef.current + (dx < 0 ? 1 : -1))
  }

  // Şəkil linki → lightbox (research R8). Yeni tab üçün modifikatorlu klik brauzerə qalır.
  const onCardClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-zoom]')
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setPaused('zoom', true)
    zoomTrigger.current = link
    setZoom({ src: link.getAttribute('href') ?? '', alt: link.querySelector('img')?.alt ?? '' })
  }

  const ratio = count > 1 ? index / (count - 1) : 0

  return (
    <div ref={rootRef} data-slot="history-stepper" className="flex scroll-mt-6 flex-col gap-6 tab:gap-8 desk:gap-9"
      onKeyDownCapture={() => (keyboard.current = true)}
      onPointerDownCapture={() => (keyboard.current = false)}
      onFocus={() => {
        if (keyboard.current) setPaused('focus', true)
      }}
      onBlur={(event) => {
        // Fokus timeline-dan çıxanda davam edir; içində düymədən düyməyə keçmək fasiləni saxlayır.
        if (!(event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget))) setPaused('focus', false)
      }}
    >
      <div
        data-slot="history-card"
        aria-live={byUser ? 'polite' : 'off'}
        className="flex flex-col gap-6"
        onClick={onCardClick}
        onPointerEnter={() => setPaused('hover', true)}
        onPointerLeave={() => setPaused('hover', false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {panels.map((panel, i) => (
          <div
            key={years[i]?.anchorId ?? i}
            id={years[i]?.anchorId}
            data-panel=""
            data-active={i === index ? '' : undefined}
            className={`scroll-mt-6 js:not-data-active:hidden print:block! ${moved ? 'motion-safe:animate-history-fade' : ''}`}
          >
            {panel}
          </div>
        ))}
      </div>

      {count > 1 ? (
        <>
          <nav aria-label={labels.nav} data-print="hide">
            <div ref={axisRef} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] tab:mx-0 tab:px-0 [&::-webkit-scrollbar]:hidden">
              <div className="relative h-19 [--p:20px] tab:[--p:24px]" style={{ minWidth: `calc(${(count - 1) * MIN_STEP_PX}px + 2 * var(--p))` }}>
                <span aria-hidden="true" className="bg-site-history-track absolute top-5 right-(--p) left-(--p) h-1 rounded-xs" />
                <span
                  aria-hidden="true"
                  className="bg-primary absolute top-5 left-(--p) h-1 rounded-xs transition-[width] duration-350 ease-out motion-reduce:transition-none"
                  style={{ width: `calc((100% - 2 * var(--p)) * ${ratio})` }}
                />
                <ol>
                  {years.map((y, i) => {
                    const active = i === index
                    return (
                      <li key={y.anchorId} className="absolute top-0 h-19 w-0" style={{ left: `calc(var(--p) + (100% - 2 * var(--p)) * ${count > 1 ? i / (count - 1) : 0})` }}>
                        <a
                          href={`#${y.anchorId}`}
                          aria-current={active ? 'step' : undefined}
                          data-done={i < index ? '' : undefined}
                          onClick={(event) => {
                            event.preventDefault()
                            go(i, event.currentTarget)
                          }}
                          className="group focus-visible:ring-ring absolute top-0 -left-[18px] block h-16 w-9 rounded-xs focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <span
                            aria-hidden="true"
                            className="border-site-history-track bg-background absolute top-4 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 transition-colors group-data-done:border-primary group-data-done:bg-primary group-aria-[current=step]:top-2.5 group-aria-[current=step]:size-6 group-aria-[current=step]:border-4 group-aria-[current=step]:border-background group-aria-[current=step]:bg-site-history-accent"
                          />
                          <span className="text-muted-foreground absolute top-[42px] left-1/2 -translate-x-1/2 text-xs leading-4 tracking-[0.25px] whitespace-nowrap group-hover:text-primary group-aria-[current=step]:text-sm group-aria-[current=step]:leading-normal group-aria-[current=step]:font-semibold group-aria-[current=step]:tracking-normal group-aria-[current=step]:text-primary">
                            {y.year}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </nav>

          <div data-print="hide" className="flex justify-end gap-3 no-js:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={labels.prev}
              disabled={index === 0}
              onClick={(event) => go(index - 1, event.currentTarget)}
              className="border-site-history-track text-primary rounded-full"
            >
              <ArrowLeftIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon-lg"
              aria-label={labels.next}
              disabled={index === count - 1}
              onClick={(event) => go(index + 1, event.currentTarget)}
              className="rounded-full"
            >
              <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : null}

      <Dialog
        open={zoom != null}
        onOpenChange={(open) => {
          if (open) return
          setPaused('zoom', false)
          setZoom(null)
        }}
      >
        <DialogContent
          className="w-fit max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xs border-0 bg-transparent p-0 shadow-none sm:max-w-[min(1100px,calc(100%-2rem))]"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            zoomTrigger.current?.focus()
          }}
        >
          <DialogTitle className="sr-only">{zoom?.alt || labels.zoom}</DialogTitle>
          {zoom ? (
            // eslint-disable-next-line @next/next/no-img-element -- CMS media şəkli (spec 002 D4)
            <img src={zoom.src} alt={zoom.alt} decoding="async" className="block max-h-[86vh] w-auto max-w-full object-contain" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
