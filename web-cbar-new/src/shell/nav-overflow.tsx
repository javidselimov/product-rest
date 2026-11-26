'use client'

/**
 * Hamburger paneli — tablet və masaüstü (spec 022, Figma `1088:26873`, istifadəçi istəyi 2026-10-12).
 *
 * Mobil `MobileNav` çekmecəsindən fərqli olaraq burada çekmecə yoxdur: hamburgerin üstünə
 * gələndə (və ya klaviatura ilə fokuslananda) mega-menyu paneli kimi nav çubuğunun altında
 * panel açılır. Toxunma ekranında hover yoxdur — düymə klikdə paneli açıb-bağlayır.
 * Panelin məzmunu (`children`) server komponentidir; burada yalnız açıq/bağlı vəziyyəti var.
 *
 * - siçan: üstünə gələndə açılır, çıxanda bağlanır (klik hover-dakı paneli bağlamır).
 *   Bənd çubuğun bütün hündürlüyünü tutur (düymə 36, çubuq 74) ki, düymədən panelə enəndə
 *   aradakı zolaqda siçan bənddən çıxmasın; çəp hərəkət üçün bağlanma `LEAVE_DELAY` gecikir;
 * - toxunma: klik açır, ikinci klik və ya kənara toxunuş bağlayır;
 * - klaviatura: `:focus-visible` fokus açır, fokus paneldən çıxanda və Escape-də bağlanır;
 * - paneldə keçid seçiləndə panel bağlanır (client-side keçiddən sonra siçan hələ üstündədir).
 *
 * JS yüklənənə qədər panel CSS `group-hover/s` ilə də açılır; `data-closed` hər ikisindən üstündür.
 */
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { MenuIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'

import { LEAVE_DELAY } from './constants'

type NavOverflowProps = {
  label: string
  /** Panel qabı `PANEL` sinifləri ilə — `id` buradan verilir. */
  panelClassName: string
  className?: string
  children: ReactNode
}

function isFocusVisible(element: Element): boolean {
  try {
    return element.matches(':focus-visible')
  } catch {
    return false
  }
}

export function NavOverflow({ label, panelClassName, className, children }: Readonly<NavOverflowProps>) {
  const panelId = useId()
  const [hover, setHover] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [closed, setClosed] = useState(false)

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const open = !closed && (hover || focused || pinned)

  useEffect(() => () => clearTimeout(leaveTimer.current), [])

  function close() {
    setClosed(true)
    setPinned(false)
  }

  function handlePointerEnter(event: PointerEvent<HTMLLIElement>) {
    // Toxunmada "hover" klikdən əvvəl gəlir və klik onu dərhal bağlayardı.
    if (event.pointerType !== 'mouse') return
    clearTimeout(leaveTimer.current)
    setHover(true)
  }

  function handlePointerLeave(event: PointerEvent<HTMLLIElement>) {
    // Toxunmada pointerleave hər toxunuşdan sonra gəlir — orada panel klikə bağlıdır.
    if (event.pointerType !== 'mouse') {
      setHover(false)
      setClosed(false)
      return
    }
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => {
      setHover(false)
      setPinned(false)
      setClosed(false)
    }, LEAVE_DELAY)
  }

  function handleFocus(event: FocusEvent<HTMLLIElement>) {
    // Siçan/toxunma ilə düyməyə düşən fokus açmır — onu klik idarə edir. Daxildə gəzən
    // fokus da açmır: Escape-dən sonra düyməyə qaytarılan fokus paneli təzədən açmasın.
    const fromInside = event.currentTarget.contains(event.relatedTarget as Node | null)
    if (!fromInside && isFocusVisible(event.target)) {
      setFocused(true)
      setClosed(false)
    }
  }

  function handleBlur(event: FocusEvent<HTMLLIElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setFocused(false)
    setPinned(false)
  }

  function handleClick(event: MouseEvent<HTMLLIElement>) {
    const link = (event.target as HTMLElement).closest('a')
    if (!link) return

    link.blur()
    setFocused(false)
    close()
  }

  function handleToggle() {
    if (pinned) {
      close()
    } else {
      setClosed(false)
      setPinned(true)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (event.key !== 'Escape' || !open) return
    setFocused(false)
    close()
    // Kit `IconButton` ref ötürmür — düyməni bəndin içindən tapırıq.
    event.currentTarget.querySelector<HTMLButtonElement>('[data-slot="nav-overflow-trigger"]')?.focus()
  }

  return (
    <li
      className={cn('group/s flex items-center self-stretch', className)}
      data-slot="nav-overflow"
      data-open={open ? '' : undefined}
      data-closed={closed ? '' : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Mobil düymə ilə eyni görünüş (`MobileNav`), nav çubuğunun tünd göy fonunda. */}
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleToggle}
        data-slot="nav-overflow-trigger"
        className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground group-data-open/s:bg-primary-foreground/10"
      >
        <MenuIcon className="size-5" aria-hidden="true" />
      </IconButton>

      <div id={panelId} className={panelClassName} data-slot="nav-overflow-panel">
        {children}
      </div>
    </li>
  )
}
