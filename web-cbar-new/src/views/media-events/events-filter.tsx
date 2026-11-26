'use client'

/**
 * Events filter (spec 034, Figma `2301:2508` desktop, `2735:33565` tablet, `2735:33766` mobile).
 *
 * A plain GET form, so it works without JavaScript: the tab and the category stay as hidden
 * fields, and leaving `limit` out starts the list again. The kit's `Select` and `DateRangePicker`
 * submit nothing without JS, so the fields are native. `'use client'` only because `inputVariants`
 * lives in a client module; the component has no state.
 *
 * One grid for all widths, so nothing is rendered twice: on tablet and phone "Clear" and "Search"
 * share a row under the fields (Figma: 304 + 336 on tablet, 149 + 181 on a phone, "Clear" centred in
 * its half), on desktop "Search" closes the first row and "Clear" the second.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { inputVariants } from '@cbar/lib-react-ui-kit/input'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

import { QUERY_MAX_LENGTH } from '@/shared/constants/limits'

import type { EventsFilters, EventTypeOption } from './loader'

export type EventsFilterLabels = {
  form: string
  search: string
  dateRange: string
  dateFrom: string
  dateTo: string
  type: string
  allTypes: string
  submit: string
  clear: string
}

type EventsFilterProps = Readonly<{
  action: string
  when: string | undefined
  categoryId: number | undefined
  clearHref: string
  filters: EventsFilters
  typeOptions: EventTypeOption[]
  labels: EventsFilterLabels
  /** The category row. */
  children: ReactNode
}>

const field = cn(inputVariants({ size: 'md' }), 'bg-background text-foreground h-11 w-full min-w-0')
const bareDate = 'text-foreground min-w-0 flex-1 bg-transparent text-sm outline-none'

export function EventsFilter({ action, when, categoryId, clearHref, filters, typeOptions, labels, children }: EventsFilterProps) {
  return (
    <form
      method="get"
      action={action}
      role="search"
      aria-label={labels.form}
      data-slot="events-filter"
      className="grid grid-cols-1 gap-x-4 gap-y-3 tab:grid-cols-2 desk:grid-cols-[1fr_1fr_1fr_144px] desk:gap-y-4"
    >
      {when ? <input type="hidden" name="when" value={when} /> : null}
      {categoryId ? <input type="hidden" name="category" value={categoryId} /> : null}

      <input
        type="search"
        name="q"
        maxLength={QUERY_MAX_LENGTH}
        defaultValue={filters.q}
        aria-label={labels.search}
        placeholder={labels.search}
        className={cn(field, 'tab:col-span-2 desk:col-span-1')}
      />

      <div role="group" aria-label={labels.dateRange} className={cn(field, 'flex items-center gap-2 focus-within:ring-2 focus-within:ring-ring/50')}>
        <input type="date" name="from" defaultValue={filters.from} aria-label={labels.dateFrom} className={bareDate} />
        <span aria-hidden="true" className="text-muted-foreground">
          –
        </span>
        <input type="date" name="to" defaultValue={filters.to} aria-label={labels.dateTo} className={bareDate} />
      </div>

      <select name="type" defaultValue={filters.type ?? ''} aria-label={labels.type} className={field}>
        <option value="">
          {labels.type}: {labels.allTypes}
        </option>
        {typeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {labels.type}: {option.label}
          </option>
        ))}
      </select>

      <div className="mt-1 grid grid-cols-[1fr_181px] items-center gap-3 tab:col-span-2 tab:grid-cols-[1fr_336px] tab:gap-6 desk:contents">
        <a
          href={clearHref}
          className="text-foreground hover:text-primary flex h-11 items-center justify-center text-sm leading-5 font-medium underline desk:col-start-4 desk:row-start-2 desk:justify-self-end"
        >
          {labels.clear}
        </a>
        {/* Same accent button as the news filter. */}
        <Button
          type="submit"
          className="bg-site-accent-strong hover:bg-site-accent-strong/90 text-primary-foreground h-11 w-full rounded-xs text-base font-medium desk:col-start-4 desk:row-start-1 desk:w-36"
        >
          {labels.submit}
        </Button>
      </div>

      <div className="mt-1 min-w-0 tab:col-span-2 desk:col-span-3 desk:row-start-2 desk:mt-0">{children}</div>
    </form>
  )
}
