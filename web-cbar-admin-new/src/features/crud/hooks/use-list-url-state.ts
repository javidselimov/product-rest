/**
 * Siyahı vəziyyəti URL-də (B3, template D3): `page`, axtarış və filtrlər search
 * param-larıdır; axtarış/filtr dəyişəndə `page` silinir; `replace: true`.
 */

import { useNavigate, useSearch } from '@tanstack/react-router'

import type { ModuleConfig } from '@/shared/crud/types'

export interface ListUrlState {
  page: number
  search: string
  filters: Record<string, string | undefined>
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setFilter: (name: string, value: string | undefined) => void
}

export function useListUrlState(
  config: Pick<ModuleConfig, 'filters' | 'supportsSearch' | 'searchParam'>,
): ListUrlState {
  const raw = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const searchParam = config.searchParam ?? 'search'

  const patch = (changes: Record<string, unknown>) =>
    void navigate({
      to: '.',
      search: ((prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = { ...prev, ...changes }
        for (const key of Object.keys(next)) {
          if (next[key] === undefined || next[key] === '') delete next[key]
        }
        return next
      }) as never,
      replace: true,
    })

  const filters: Record<string, string | undefined> = {}
  for (const filter of config.filters ?? []) {
    const value = raw[filter.name]
    filters[filter.name] =
      value === undefined || value === null ? undefined : String(value)
  }

  return {
    page: typeof raw.page === 'number' && raw.page >= 1 ? raw.page : 1,
    search:
      typeof raw[searchParam] === 'string' ? (raw[searchParam] as string) : '',
    filters,
    setPage: (page) => patch({ page: page > 1 ? page : undefined }),
    setSearch: (search) =>
      patch({ [searchParam]: search || undefined, page: undefined }),
    setFilter: (name, value) =>
      patch({ [name]: value || undefined, page: undefined }),
  }
}
