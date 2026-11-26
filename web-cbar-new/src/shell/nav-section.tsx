'use client'

/**
 * Mega-menyunun üst səviyyə bəndi — flyout-u klikdən sonra bağlayan yeganə client hissə.
 *
 * Flyout CSS ilə (`group-hover/s`, `group-focus-within/s`) açılır. Keçid client-side olduğu
 * üçün klikdən sonra siçan hələ menyunun üstündə, fokus isə klik edilmiş linkdə qalır və
 * flyout açıq görünürdü. Burada klikdə fokus götürülür və `data-closed` qoyulur (CSS onu
 * hover-dan üstün tutub gizlədir); siçan bənddən çıxanda atribut silinir və hover yenə işləyir.
 */
import type { MouseEvent, ReactNode } from 'react'
import { useState } from 'react'

type NavSectionItemProps = {
  children: ReactNode
  className?: string
}

/** `li` statikdir (`relative` deyil): panel nav çubuğuna nisbətən yerləşir (spec 022 R5). */
export function NavSectionItem({ children, className }: NavSectionItemProps) {
  const [closed, setClosed] = useState(false)

  function handleClick(event: MouseEvent<HTMLLIElement>) {
    const link = (event.target as HTMLElement).closest('a')
    if (!link) return

    link.blur()
    setClosed(true)
  }

  return (
    <li
      className={className ? `group/s ${className}` : 'group/s'}
      data-slot="nav-section"
      data-closed={closed ? '' : undefined}
      onClick={handleClick}
      onPointerLeave={() => setClosed(false)}
    >
      {children}
    </li>
  )
}
