/**
 * Menyu keçidi — xarici ünvan yeni pəncərədə, daxili `Link` ilə.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { NavSection } from './nav'

type NavAnchorProps = {
  item: Pick<NavSection, 'href' | 'external'>
  className?: string
  children: ReactNode
}

export function NavAnchor({ item, className, children }: NavAnchorProps) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }

  return (
    <Link href={item.href} className={className}>
      {children}
    </Link>
  )
}
