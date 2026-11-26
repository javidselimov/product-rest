import { ChevronDownIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useId, type ReactNode } from 'react'

import type { NavItem } from '@/app/routes/nav'

interface NavGroupSectionProps {
  title: string
  items: NavItem[]
  open: boolean
  /** The open screen is in this group: the title stands out a little. */
  active: boolean
  onToggle: () => void
  renderItem: (item: NavItem) => ReactNode
}

/**
 * A sidebar group that opens and closes (spec 046, `contracts/admin-nav.md`): a button with
 * `aria-expanded` that controls its list. The id comes from `useId`, because the desktop sidebar
 * and the mobile sheet can be on the page at the same time.
 */
export function NavGroupSection({
  title,
  items,
  open,
  active,
  onToggle,
  renderItem,
}: NavGroupSectionProps) {
  const listId = useId()
  return (
    <div className="mt-2 flex flex-col gap-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={onToggle}
        className={cn(
          'flex h-8 items-center justify-between gap-2 rounded-md px-3 text-left text-xs font-medium tracking-wide uppercase transition-colors',
          'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-sidebar-ring focus-visible:outline-2 focus-visible:outline-offset-2',
          active && 'text-sidebar-foreground',
        )}
      >
        <span>{title}</span>
        <ChevronDownIcon
          size={16}
          aria-hidden="true"
          className={cn('shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      <div id={listId} hidden={!open} className="flex flex-col gap-1">
        {items.map(renderItem)}
      </div>
    </div>
  )
}
