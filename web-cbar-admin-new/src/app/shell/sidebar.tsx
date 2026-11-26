import { BankIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Link, useRouterState } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

import {
  activeNavItem,
  knownNavGroups,
  navEntries,
  type NavItem,
} from '@/app/routes/nav'
import { brand } from '@/shared/config/brand'
import { useUiStore } from '@/shared/model/ui-store'

import { NavGroupSection } from './nav-group'

interface SidebarProps {
  /** Called after a link is followed — the mobile sheet closes itself. */
  onNavigate?: () => void
  className?: string
}

const entries = navEntries()

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const route = useRouterState({ select: (state) => state.location.pathname })
  const { t } = useTranslation(['common', 'nav'])
  const storedGroups = useUiStore((state) => state.openNavGroups)
  const toggleNavGroup = useUiStore((state) => state.toggleNavGroup)
  const openNavGroup = useUiStore((state) => state.openNavGroup)
  const override = useUiStore((state) => state.activeNavOverride)
  // One source for the mark and its group: a managed page form marks its section (spec 053), else the route.
  const activeItem = activeNavItem(route, override)
  const activeGroup = activeItem?.group

  // Arriving at a screen opens its group (spec 046 contract §Behaviour); the editor may close it again.
  // A layout effect, so the group is never painted closed first.
  useLayoutEffect(() => {
    if (activeGroup) openNavGroup(activeGroup)
  }, [activeGroup, openNavGroup])

  const openGroups = new Set(knownNavGroups(storedGroups))

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const active = item.key === activeItem?.key
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onNavigate}
        // The router marks an active link `aria-current="page"` itself, prefix matches included; only an exact match
        // may do so here, where it agrees with `activeItem` — a managed page form marks its section instead (spec 053).
        activeOptions={{ exact: true }}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm no-underline transition-colors',
          'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-sidebar-ring focus-visible:outline-2 focus-visible:outline-offset-2',
          active &&
            'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
        )}
      >
        <Icon size={20} variant={active ? 'solid' : 'outline'} />
        <span className="flex-1">{t(`${item.key}.label`, { ns: 'nav' })}</span>
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col gap-6',
        className,
      )}
    >
      <Link
        to="/"
        onClick={onNavigate}
        className="text-sidebar-foreground flex items-center gap-3 px-5 pt-5 no-underline"
      >
        <span className="bg-sidebar-primary text-sidebar-primary-foreground grid size-9 place-items-center rounded-lg">
          <BankIcon size={20} />
        </span>
        <span className="min-w-0 leading-tight" title={brand.appName}>
          <span className="block truncate text-sm font-semibold">
            {brand.appName}
          </span>
          <span className="text-muted-foreground block text-xs">
            {t('tagline')}
          </span>
        </span>
      </Link>

      <nav
        aria-label={t('navigation.primary')}
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-5"
      >
        {entries.map((entry) =>
          entry.kind === 'item' ? (
            renderItem(entry.item)
          ) : (
            <NavGroupSection
              key={entry.group}
              title={t(`groups.${entry.group}`, { ns: 'nav' })}
              items={entry.items}
              open={openGroups.has(entry.group)}
              active={entry.group === activeGroup}
              onToggle={() => toggleNavGroup(entry.group)}
              renderItem={renderItem}
            />
          ),
        )}
      </nav>
    </div>
  )
}
