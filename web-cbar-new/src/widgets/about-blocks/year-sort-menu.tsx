/**
 * Year order choice of the cooperation tables (spec 045 Figma `2208:5872`, spec 046 `2224:7212`):
 * "Tarix: əvvəlcə yenilər" / "Üzvlük tarixi: əvvəlcə yenilər".
 *
 * A native `<details>` with two links, so it opens and sorts without JavaScript and stays a server
 * component; the choice lives in the `sort` search parameter. Figma draws the closed button only,
 * the list below it follows the kit's popover look.
 */
import { ArrowDownIcon, ArrowUpIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

import { YEAR_SORT, type YearSort } from '@/features/about-content/model/year-sort'
import { QUERY_PARAM } from '@/shared/constants/query-params'

const SORTS: readonly YearSort[] = [YEAR_SORT.NEWEST, YEAR_SORT.OLDEST]

type YearSortMenuProps = Readonly<{
  sort: YearSort
  /** The muted label before the choice ("Tarix:"). */
  label: string
  optionLabel: (sort: YearSort) => string
  /** Extra classes of the button, for the per-table padding. */
  className?: string
}>

export function YearSortMenu({ sort, label, optionLabel, className }: YearSortMenuProps) {
  const Icon = sort === YEAR_SORT.OLDEST ? ArrowUpIcon : ArrowDownIcon

  return (
    // The key closes the list after a choice: client navigation keeps the element, and with it `open`.
    <details key={sort} data-slot="year-sort" data-print="hide" className="relative">
      <summary
        className={cn(
          'hover:bg-site-surface-muted focus-visible:ring-ring flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-xs px-3 text-sm leading-5 outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden',
          className,
        )}
      >
        <span className="text-site-logo-muted">{label}</span>
        <span className="text-primary font-medium">{optionLabel(sort)}</span>
        <Icon className="text-primary size-4 shrink-0" aria-hidden="true" />
      </summary>
      <ul className="border-site-divider bg-background absolute top-full right-0 z-10 mt-1 flex min-w-full flex-col rounded-xs border py-1 shadow-md">
        {SORTS.map((option) => (
          <li key={option}>
            <Link
              href={`?${QUERY_PARAM.SORT}=${option}`}
              scroll={false}
              aria-current={option === sort ? 'true' : undefined}
              className="hover:bg-site-surface-muted aria-[current]:text-primary block px-3 py-2 text-sm leading-5 whitespace-nowrap aria-[current]:font-medium"
            >
              {optionLabel(option)}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  )
}
