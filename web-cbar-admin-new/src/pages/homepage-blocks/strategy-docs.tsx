/**
 * "Strategiya və sənədlər" pages (spec 057). The form's page choices come from the page tree, so the list and the form
 * sit behind `LookupGate`, as the events pages do; composing them is this layer's job, since one feature does not import
 * another. The list carries "Sıranı dəyiş" in its header.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { SelectOption } from '@/entities/content/model/types'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { strategyDocsKeys } from '@/features/homepage/api/strategy-docs.service'
import { StrategyDocsReorderDialog } from '@/features/homepage/components/strategy-docs-reorder-dialog'
import { buildStrategyDocsModule } from '@/features/homepage/model/strategy-docs'
import { pagesService } from '@/features/pages/api/pages.service'
import type { PageNode } from '@/features/pages/model/schemas'

/** The page titles the choices show: the panel's editors work in Azerbaijani. */
const PAGE_TITLES_LOCALE = 'az'

const flattenPages = (nodes: PageNode[]): SelectOption[] =>
  nodes.flatMap((node) => [{ value: node.id, label: node.title ?? `#${node.id}` }, ...flattenPages(node.children)])

function useStrategyDocsModule() {
  const queryClient = useQueryClient()
  const pages = useQuery({
    queryKey: strategyDocsKeys.pageChoices(),
    queryFn: async () => flattenPages(await pagesService.tree(PAGE_TITLES_LOCALE)),
  })
  const config = useMemo(() => buildStrategyDocsModule({ pages: pages.data ?? [] }), [pages.data])
  const retry = () => void queryClient.invalidateQueries({ queryKey: strategyDocsKeys.pageChoices() })
  return { config, retry, isLoading: pages.isPending, error: pages.error }
}

export function StrategyDocsPage() {
  const { config, isLoading, error, retry } = useStrategyDocsModule()
  return (
    <LookupGate loading={isLoading} error={error ?? undefined} onRetry={retry}>
      <CrudListPage config={config} extraActions={<StrategyDocsReorderDialog />} />
    </LookupGate>
  )
}

export function StrategyDocsFormPage() {
  const { config, isLoading, error, retry } = useStrategyDocsModule()
  return (
    <LookupGate loading={isLoading} error={error ?? undefined} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
