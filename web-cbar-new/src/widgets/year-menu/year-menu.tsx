/**
 * Year choice of the publications section (spec 054 ui-contract §3, §5; Figma `2724:6931`, `2748:10921`, `2762:11841`,
 * `2797:20705`): the working paper list and every year archive.
 *
 * A native `<details>` with links, like the memorandum sort menu (`year-sort-menu.tsx`), so it opens and chooses without
 * JavaScript and stays a server component; the choice lives in the `year` search parameter and the caller builds each
 * option's address, keeping the page's other parameters. The panel looks like the Figma dropdown; the native `<select>`
 * popup cannot.
 */
import { CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

export type YearMenuOption = Readonly<{ key: string; label: string; href: string; selected: boolean }>

type YearMenuProps = Readonly<{
  /** Text of the closed button: the chosen year, or "İl: Hamısı". */
  summary: string
  /** Accessible name of the option list; with `visibleLabel` also shown before the button ("İl"). */
  label: string
  visibleLabel?: boolean
  options: readonly YearMenuOption[]
  /** Width of the button and panel at each breakpoint. */
  className?: string
}>

export function YearMenu({ summary, label, visibleLabel = false, options, className }: YearMenuProps) {
  const chosen = options.find((option) => option.selected)?.key ?? ''

  const menu = (
    // The key closes the list after a choice: client navigation keeps the element, and with it `open`.
    <details key={chosen} data-slot="year-menu" data-print="hide" className={cn('group relative', className)}>
      <summary className="border-site-file-border text-site-faint focus-visible:ring-ring flex h-11 cursor-pointer list-none items-center gap-2 rounded-xs border px-3 py-2.5 text-sm leading-7 outline-none focus-visible:ring-2 max-tab:h-12 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <CaretDownIcon aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <ul
        aria-label={label}
        className="border-site-file-border bg-background absolute inset-x-0 top-full z-10 mt-1 max-h-[352px] overflow-y-auto rounded-xs border py-2 shadow-md"
      >
        {options.map((option) => (
          <li key={option.key}>
            <Link
              href={option.href}
              scroll={false}
              aria-current={option.selected ? 'true' : undefined}
              className="hover:bg-site-menu-hover focus-visible:bg-site-menu-hover aria-[current]:bg-site-menu-selected text-foreground block h-10 px-4 py-[9px] text-base leading-[22px] outline-none aria-[current]:font-semibold"
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  )

  if (!visibleLabel) return menu
  return (
    <div className="flex items-center gap-4">
      <span data-slot="year-menu-label" className="text-foreground text-base leading-[22px] font-medium">
        {label}
      </span>
      {menu}
    </div>
  )
}
