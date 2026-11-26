'use client'

/**
 * List filter row: title search, date range, "clear filters" and submit (spec 029 US2,
 * contracts/ui-contract.md §2, Figma `1048:18772` / tablet `1658:13840`; shared by the gallery
 * lists in spec 035, Figma `1643:29170`).
 *
 * A plain GET form, so it works without JavaScript: it submits `q`, `from`, `to`, whatever hidden
 * fields the caller puts in `children` (the press release `type`), and no `page`, which starts
 * the result at page 1. The date range is two native date inputs inside one field frame — the
 * kit's `DateRangePicker` carries no `name` and submits nothing without JS (research R3).
 * `dates={false}` leaves only the search field, wider on desktop (release schedule, spec 039).
 * `'use client'` only because `inputVariants` lives in a client module; the component has no
 * state and is rendered on the server.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { inputVariants } from '@cbar/lib-react-ui-kit/input'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

import { QUERY_MAX_LENGTH } from '@/shared/constants/limits'

import { LIST_FILTER_CLASS, LIST_FILTER_FIELDS_CLASS } from './model'
import type { ListFilterValues } from './model'

export type ListFilterLabels = {
  form: string
  search: string
  dateRange: string
  dateFrom: string
  dateTo: string
  submit: string
  clear: string
  /** Shown inside the empty search field; defaults to `search`. */
  placeholder?: string
}

type ListFilterProps = Readonly<{
  action: string
  filters: ListFilterValues
  clearHref: string
  labels: ListFilterLabels
  /** Show the date range (default). */
  dates?: boolean
  /** Hidden inputs that must survive a submit (e.g. `type`). */
  children?: ReactNode
}>

const field = cn(inputVariants({ size: 'md' }), 'bg-background text-foreground h-11 w-full desk:w-78')
/** Figma `1724:31379`: the lone search field is 54 high and 672 wide on desktop. */
const wideField = cn(inputVariants({ size: 'md' }), 'bg-background text-foreground h-13.5 w-full desk:w-168')
const bareDate = 'text-foreground min-w-0 flex-1 bg-transparent text-sm outline-none'

export function ListFilter({ action, filters, clearHref, labels, dates = true, children }: ListFilterProps) {
  return (
    <form
      method="get"
      action={action}
      role="search"
      aria-label={labels.form}
      data-slot="list-filter"
      className={dates ? LIST_FILTER_CLASS : cn(LIST_FILTER_CLASS, 'gap-5 tab:gap-6 desk:items-center')}
    >
      {children}

      <div className={LIST_FILTER_FIELDS_CLASS}>
        <input
          type="search"
          name="q"
          maxLength={QUERY_MAX_LENGTH}
          defaultValue={filters.q}
          aria-label={labels.search}
          placeholder={labels.placeholder ?? labels.search}
          className={dates ? field : wideField}
        />

        {dates ? (
          <div role="group" aria-label={labels.dateRange} className={cn(field, 'flex items-center gap-2 focus-within:ring-2 focus-within:ring-ring/50')}>
            <input type="date" name="from" defaultValue={filters.from} aria-label={labels.dateFrom} className={bareDate} />
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <input type="date" name="to" defaultValue={filters.to} aria-label={labels.dateTo} className={bareDate} />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-6">
        <a href={clearHref} className="text-foreground hover:text-primary flex h-11 items-center px-1 text-sm leading-5 font-medium underline">
          {labels.clear}
        </a>
        {/* Figma `1048:18674`: #43B7A7 (brand-secondary-600 = site-accent-strong) with white text. */}
        <Button
          type="submit"
          className="bg-site-accent-strong hover:bg-site-accent-strong/90 text-primary-foreground h-11 w-36 rounded-xs text-base font-medium"
        >
          {labels.submit}
        </Button>
      </div>
    </form>
  )
}
