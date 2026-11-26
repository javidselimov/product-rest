/**
 * Left section tree: the top section's title and its pages, with the active chain open
 * (spec 002 FR-015, data-model.md §2). A server component with plain links.
 *
 * The active node is found by slug (CMS page) or `navUrl` (feature page). Pages turned off for
 * the left menu are left out unless they are on the active chain (spec 041).
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

import { activeChainIds, isCurrentNode, isInSideNav, nodeHref, type PageNode } from '@/entities/page-node'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

type SectionSidebarProps = {
  section: PageNode
  locale: Locale
  currentSlug?: string
  currentHref?: string
}

export function SectionSidebar({ section, locale, currentSlug, currentHref }: SectionSidebarProps) {
  const t = getT(locale, 'content')
  const isCurrent = (node: PageNode) => isCurrentNode(node, locale, { slug: currentSlug, href: currentHref })
  const chainIds = activeChainIds(section, isCurrent)
  const hrefOf = nodeHref

  function renderLevel(level: PageNode[], depth: number): ReactNode {
    const items = level.filter((node) => isInSideNav(node, chainIds))
    if (items.length === 0) return null

    return (
      <ul className={depth === 0 ? 'space-y-1' : 'border-border ml-3 space-y-1 border-l pl-3'}>
        {items.map((node) => {
          const current = isCurrent(node)
          const external = node.navUrl != null && /^https?:\/\//.test(node.navUrl)
          const className = `block rounded-sm px-2 py-1.5 text-sm transition-colors ${
            current ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          }`

          return (
            <li key={node.id}>
              {external ? (
                <a href={node.navUrl ?? '#'} target="_blank" rel="noopener noreferrer" className={className}>
                  {node.title}
                </a>
              ) : (
                <Link href={hrefOf(node, locale)} className={className} aria-current={current ? 'page' : undefined}>
                  {node.title}
                </Link>
              )}
              {chainIds.has(node.id) ? renderLevel(node.children, depth + 1) : null}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <aside data-slot="section-sidebar" aria-label={t('sectionNavigation')} className="w-80 shrink-0 max-lg:hidden">
      <div className="bg-primary text-primary-foreground rounded-md px-4 py-3 text-base font-semibold">
        <Link href={`/${locale}/${section.slug}`} className="hover:underline">
          {section.title}
        </Link>
      </div>
      <nav className="mt-4">{renderLevel(section.children, 0)}</nav>
    </aside>
  )
}
