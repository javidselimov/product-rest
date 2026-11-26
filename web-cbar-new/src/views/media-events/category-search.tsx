'use client'

/**
 * Searchable category list for 10+ categories (spec 034, Figma `2323:6049`). The links are plain,
 * so the list works without JavaScript; only narrowing it by name needs state.
 */
import Link from 'next/link'
import { useState } from 'react'

import type { CategoryLink } from './loader'

type CategorySearchProps = Readonly<{
  items: CategoryLink[]
  label: string
  searchLabel: string
}>

const SUMMARY = 'bg-background text-foreground border-input flex h-11 cursor-pointer list-none items-center rounded-xs border px-3 text-sm'

export function CategorySearch({ items, label, searchLabel }: CategorySearchProps) {
  const [query, setQuery] = useState('')
  const active = items.find((item) => item.active)
  const needle = query.trim().toLocaleLowerCase()
  const shown = needle ? items.filter((item) => item.name.toLocaleLowerCase().includes(needle)) : items

  return (
    <details data-slot="event-category-search" className="relative w-full tab:w-78">
      <summary className={SUMMARY}>
        {label}: {active?.name}
      </summary>
      <div className="bg-background border-input absolute z-10 mt-1 flex max-h-80 w-full flex-col gap-1 overflow-y-auto rounded-xs border p-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          // Inside the filter form: Enter narrows this list, it does not send the form.
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.preventDefault()
          }}
          aria-label={searchLabel}
          placeholder={searchLabel}
          className="border-input text-foreground mb-1 h-9 w-full rounded-xs border bg-transparent px-2 text-sm outline-none"
        />
        <ul>
          {shown.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={item.active ? 'true' : undefined}
                className={`block rounded-xs px-2 py-1.5 text-sm ${item.active ? 'text-primary font-medium' : 'text-foreground hover:bg-site-surface-muted'}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
