'use client'

/**
 * Nav çubuğunun siyahısı + sürüşən alt xətt (spec 022, istifadəçi istəyi 2026-10-12).
 *
 * Hər bəndin öz alt xətti yerinə çubuqda **bir** xətt var: hover və ya klaviatura fokusu
 * hansı bölməyə keçirsə, xətt onun keçidinin mövqeyinə və eninə animasiya ilə sürüşür.
 * Kursor çubuqdan çıxanda xətt sönür; yenidən girəndə köhnə yerdən sürüşmür, dərhal
 * yeni bəndin altında görünür. `prefers-reduced-motion` olanda keçid animasiyasız.
 *
 * Yalnız dekorasiyadır: mega-menyu paneli əvvəlki kimi CSS ilə (hover/focus-within) və
 * JS-siz açılır. Xətt mövqeyi bölmə keçidinin (`[data-slot=nav-section] > a`) ölçüsündən
 * hesablanır, panelin içində gəzəndə də öz bölməsinin altında qalır.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useRef, useState, type FocusEvent, type ReactNode } from 'react'

type Indicator = { left: number; width: number; visible: boolean; instant: boolean }

const HIDDEN: Indicator = { left: 0, width: 0, visible: false, instant: true }

export function NavBar({ className, children }: Readonly<{ className?: string; children: ReactNode }>) {
  const listRef = useRef<HTMLUListElement>(null)
  const [indicator, setIndicator] = useState<Indicator>(HIDDEN)

  function moveTo(target: EventTarget | null) {
    const list = listRef.current
    // Hamburger bölmə deyil — onun panelində gəzəndə xətt heç bir bölmənin altında qalmasın.
    if (target instanceof Element && target.closest('[data-slot="nav-overflow"]')) {
      hide()
      return
    }
    const section = target instanceof Element ? target.closest('[data-slot="nav-section"]') : null
    const link = section?.querySelector(':scope > a')
    if (!list || !section || !link || !list.contains(section)) return

    const listBox = list.getBoundingClientRect()
    const linkBox = link.getBoundingClientRect()
    setIndicator((prev) => ({
      left: linkBox.left - listBox.left,
      width: linkBox.width,
      visible: true,
      // Görünməz idisə köhnə yerdən sürüşməsin — yerinə dərhal qoyulur, sonra görünür.
      instant: !prev.visible,
    }))
  }

  const hide = () => setIndicator((prev) => ({ ...prev, visible: false }))

  function handleBlur(event: FocusEvent<HTMLUListElement>) {
    if (!listRef.current?.contains(event.relatedTarget as Node | null)) hide()
  }

  return (
    <ul
      ref={listRef}
      className={cn('relative', className)}
      onPointerOver={(event) => moveTo(event.target)}
      onPointerLeave={hide}
      onFocus={(event) => moveTo(event.target)}
      onBlur={handleBlur}
    >
      {children}
      <li
        aria-hidden="true"
        data-slot="nav-indicator"
        data-visible={indicator.visible ? '' : undefined}
        className={cn(
          'bg-site-accent pointer-events-none absolute top-1/2 mt-[18px] h-0.5 opacity-0 motion-reduce:transition-none',
          'data-visible:opacity-100',
          indicator.instant ? 'transition-opacity duration-150' : 'transition-[left,width,opacity] duration-300 ease-out',
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />
    </ul>
  )
}
