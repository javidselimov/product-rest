/**
 * Category filter (spec 034, Figma `2301:2556`, `2323:124130`). Up to five categories are tabs;
 * more add "Other", whose place a chosen category takes; on a phone every category sits in one
 * scrolling row. Links and a native `<details>`, so it needs no JavaScript.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

import { CATEGORY_DROPDOWN_MIN, CATEGORY_TABS_VISIBLE } from './constants'
import { CategorySearch } from './category-search'
import type { CategoryLink } from './loader'

const TAB = 'flex h-11 shrink-0 items-center rounded-xs px-4.5 text-base leading-7 font-medium whitespace-nowrap'
const tabState = (active: boolean) => (active ? 'bg-site-accent-strong text-primary-foreground' : 'text-muted-foreground hover:text-foreground')

type CategoryTabsProps = Readonly<{
  all: CategoryLink
  categories: CategoryLink[]
  label: string
  otherLabel: string
  pickerLabel: string
  searchLabel: string
}>

function Tab({ item, className }: Readonly<{ item: CategoryLink; className?: string }>) {
  return (
    <Link href={item.href} aria-current={item.active ? 'true' : undefined} className={cn(TAB, tabState(item.active), className)}>
      {item.name}
    </Link>
  )
}

export function CategoryTabs({ all, categories, label, otherLabel, pickerLabel, searchLabel }: CategoryTabsProps) {
  if (categories.length === 0) return null

  if (categories.length >= CATEGORY_DROPDOWN_MIN) {
    return <CategorySearch items={[all, ...categories]} label={pickerLabel} searchLabel={searchLabel} />
  }

  const overflow = categories.slice(CATEGORY_TABS_VISIBLE)
  const picked = overflow.find((item) => item.active)

  return (
    <nav
      aria-label={label}
      data-slot="event-categories"
      className="bg-site-surface flex min-w-0 items-center overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] tab:w-fit tab:overflow-visible tab:[mask-image:none]"
    >
      <Tab item={all} />
      {categories.slice(0, CATEGORY_TABS_VISIBLE).map((item) => (
        <Tab key={item.key} item={item} />
      ))}
      {overflow.map((item) => (
        <Tab key={item.key} item={item} className="tab:hidden" />
      ))}
      {overflow.length > 0 ? (
        <details data-slot="event-categories-more" className="relative hidden tab:block">
          <summary className={cn(TAB, tabState(picked !== undefined), 'cursor-pointer list-none')}>{picked?.name ?? otherLabel} ▾</summary>
          <ul className="bg-background border-input absolute z-10 mt-1 flex min-w-48 flex-col rounded-xs border p-2">
            {overflow.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={`block rounded-xs px-2 py-1.5 text-sm ${item.active ? 'text-primary font-medium' : 'text-foreground hover:bg-site-surface-muted'}`}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </nav>
  )
}
