/** FAQ queries outside the CRUD engine (spec 051): topic and page choices, a topic's questions. */

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { SelectOption } from '@/entities/content/model/types'
import { DETAIL_STALE_MS } from '@/shared/constants/timing'
import { faqKeys } from '../api/faq.keys'
import { faqService, type FaqPageNode } from '../api/faq.service'

/** Topics as select options (name, else `#id`), in the site's order. */
export function useFaqTopicOptions() {
  const query = useQuery({ queryKey: faqKeys.topicOptions(), queryFn: faqService.topics, staleTime: DETAIL_STALE_MS })
  const options = useMemo<SelectOption[]>(
    () => (query.data ?? []).map((topic) => ({ value: topic.id, label: topic.name ?? `#${topic.id}` })),
    [query.data],
  )
  return { options, isLoading: query.isLoading, isError: query.isError, error: query.error }
}

export const PATH_SEPARATOR = ' › '

/** Every page of the tree as "Parent › Child" (az titles), so the editor finds a page by its place in the menu. */
function flatten(nodes: FaqPageNode[], trail: string[] = []): { id: number; label: string }[] {
  return nodes.flatMap((node) => {
    const path = [...trail, node.title ?? `#${node.id}`]
    return [{ id: node.id, label: path.join(PATH_SEPARATOR) }, ...flatten(node.children, path)]
  })
}

export function useFaqPageOptions() {
  const query = useQuery({ queryKey: faqKeys.pageOptions(), queryFn: faqService.pageTree, staleTime: DETAIL_STALE_MS })
  const options = useMemo(() => flatten(query.data ?? []), [query.data])
  return { options, isLoading: query.isLoading, isError: query.isError }
}

export function useTopicQuestions(topicId: string) {
  return useQuery({ queryKey: faqKeys.topicQuestions(topicId), queryFn: () => faqService.topicQuestions(topicId) })
}
