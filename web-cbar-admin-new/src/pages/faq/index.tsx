/**
 * "Sual-cavab" pages (spec 051). The questions list and form pick topics from a lookup behind `LookupGate`, as the
 * release schedule pages do; the topics and videos lists add "Sıranı dəyiş" to the header. The topic and video forms
 * are registry routes with no page file.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { faqKeys } from '@/features/faq/api/faq.keys'
import { TopicsReorderDialog, VideosReorderDialog } from '@/features/faq/components/reorder-dialog'
import { useFaqTopicOptions } from '@/features/faq/hooks/use-faq'
import { buildFaqQuestionsModule, faqTopicsModule, faqVideosModule } from '@/features/faq/model/module'

function useFaqQuestionsModule() {
  const queryClient = useQueryClient()
  const topics = useFaqTopicOptions()
  const config = useMemo(() => buildFaqQuestionsModule(topics.options), [topics.options])
  return {
    config,
    isLoading: topics.isLoading,
    error: topics.isError ? topics.error : undefined,
    retry: () => void queryClient.invalidateQueries({ queryKey: faqKeys.topicOptions() }),
  }
}

export function FaqQuestionsPage() {
  const { config, isLoading, error, retry } = useFaqQuestionsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function FaqQuestionsFormPage() {
  const { config, isLoading, error, retry } = useFaqQuestionsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}

export function FaqTopicsPage() {
  return <CrudListPage config={faqTopicsModule} extraActions={<TopicsReorderDialog />} />
}

export function FaqVideosPage() {
  return <CrudListPage config={faqVideosModule} extraActions={<VideosReorderDialog />} />
}
