/**
 * Bölmənin sol menyusu — Figma `subcategories` (`1382:36606`, spec 024 FR-004; Media `1559:62331`).
 *
 * Server komponenti, adi keçidlər. Aktiv zəncir açıq qalır; cari səhifə `aria-current`
 * ilə işarələnir (Figma-da aktiv vəziyyət çəkilməyib — `text-primary`, ui-contract §2).
 */
import { CaretRightIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import type { SectionKey } from '@/entities/page-node'

import type { SectionNavItem } from './model'

function NavLink({ item, className }: Readonly<{ item: SectionNavItem; className: string }>) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {item.title}
      </a>
    )
  }
  return (
    <Link href={item.href} className={className} aria-current={item.current ? 'page' : undefined}>
      {item.title}
    </Link>
  )
}

const linkState = (item: SectionNavItem) => (item.current ? 'text-primary' : 'hover:text-primary')

/**
 * A page link of an open group. "Nəşrlər Menu" (spec 054 ui-contract §2, Figma `2804:21370`): 16/28, faint by default,
 * the current page in the text colour at 500; the other sections keep their 14/28 muted links with a primary current.
 */
const childClass = (child: SectionNavItem, section: SectionKey | undefined) =>
  section === 'publications'
    ? `block text-base leading-7 ${child.current ? 'text-foreground font-medium' : 'text-site-faint hover:text-foreground'}`
    : `block text-sm leading-7 ${child.current ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'}`

type SectionNavProps = Readonly<{ locale: Locale; items: SectionNavItem[]; section?: SectionKey }>

export function SectionNav({ locale, items, section }: SectionNavProps) {
  if (items.length === 0) return null
  const t = getT(locale, 'section')

  return (
    <nav data-slot="section-nav" data-print="hide" aria-label={t('nav.label')} className="bg-site-surface-muted rounded-xs p-5">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.key}>
            <div className="flex items-start justify-between gap-1">
              <NavLink item={item} className={`text-foreground text-base leading-7 font-semibold ${linkState(item)}`} />
              {item.children.length > 0 ? (
                // Figma açıq qrupda da sağa baxan caret çəkir (`1382:36606`).
                <CaretRightIcon aria-hidden="true" className="text-foreground mt-1.5 size-4 shrink-0" />
              ) : null}
            </div>
            {item.open && item.children.length > 0 ? (
              <ul className="mt-3 flex flex-col gap-3">
                {item.children.map((child) => (
                  <li key={child.key}>
                    <NavLink item={child} className={childClass(child, section)} />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}
