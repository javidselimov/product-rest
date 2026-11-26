/**
 * Event pages (spec 034). The form's choices come from other sections, so the list and the form
 * sit behind `LookupGate`, as the laws pages do; composing them is this layer's job, since one
 * feature does not import another. The categories section is a registry route with no page file.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crudKeys } from '@/features/crud/api/crud.keys'
import { crudService } from '@/features/crud/api/crud.service'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { useLookupOptions } from '@/features/crud/hooks/use-crud'
import { eventsKeys } from '@/features/events/api/events.keys'
import { EVENT_LINK_PAGE_SIZE } from '@/features/events/model/constants'
import {
  buildEventsModule,
  eventCategoriesModule,
} from '@/features/events/model/module'
import { eventCategoryRowSchema } from '@/features/events/model/schemas'
import { galleriesModule } from '@/features/galleries/model/module'
import { pagesService } from '@/features/pages/api/pages.service'
import type { PageNode } from '@/features/pages/model/schemas'
import { pressReleasesModule } from '@/features/press-releases/model/module'
import type { SelectOption } from '@/entities/content/model/types'

const PAGE_TITLES_LOCALE = 'az'

const asOption = (row: {
  id: number
  title?: string | null
}): SelectOption => ({
  value: row.id,
  label: row.title ?? `#${row.id}`,
})

const flattenPages = (nodes: PageNode[]): SelectOption[] =>
  nodes.flatMap((node) => [asOption(node), ...flattenPages(node.children)])

async function loadLinks() {
  const [galleries, pressReleases, pages] = await Promise.all([
    crudService.list(galleriesModule, { pageSize: EVENT_LINK_PAGE_SIZE }),
    crudService.list(pressReleasesModule, { pageSize: EVENT_LINK_PAGE_SIZE }),
    pagesService.tree(PAGE_TITLES_LOCALE),
  ])
  return {
    galleries: galleries.items.map(asOption),
    pressReleases: pressReleases.items.map(asOption),
    pages: flattenPages(pages),
  }
}

function useEventsModule() {
  const queryClient = useQueryClient()
  const categories = useLookupOptions(
    eventCategoriesModule.id,
    eventCategoriesModule.apiPath,
    'name',
    eventCategoryRowSchema,
  )
  const links = useQuery({ queryKey: eventsKeys.links(), queryFn: loadLinks })

  const config = useMemo(
    () =>
      buildEventsModule({
        categories: categories.options,
        galleries: links.data?.galleries ?? [],
        pressReleases: links.data?.pressReleases ?? [],
        pages: links.data?.pages ?? [],
      }),
    [categories.options, links.data],
  )
  const retry = () => {
    void queryClient.invalidateQueries({
      queryKey: crudKeys(eventCategoriesModule.id).options(),
    })
    void queryClient.invalidateQueries({ queryKey: eventsKeys.links() })
  }

  return {
    config,
    retry,
    isLoading: categories.isLoading || links.isPending,
    error: categories.isError ? categories.error : links.error,
  }
}

export function EventsPage() {
  const { config, isLoading, error, retry } = useEventsModule()
  return (
    <LookupGate loading={isLoading} error={error ?? undefined} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function EventsFormPage() {
  const { config, isLoading, error, retry } = useEventsModule()
  return (
    <LookupGate loading={isLoading} error={error ?? undefined} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
