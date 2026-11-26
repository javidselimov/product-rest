/**
 * "Mövzunun sualları" on the topic form (spec 051 US6): the topic's questions in the site's order, reordered by dragging
 * or with the arrows and saved at once, each linking to its form, plus "Yeni sual" with the topic preselected.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import { PlusIcon } from '@cbar/lib-react-ui-kit/icons'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { ErrorState } from '@/shared/ui/error-state'
import { SortableList } from '@/shared/ui/sortable-list'
import { FAQ_QUESTIONS_MODULE_ID, faqKeys, faqTopicsKeys } from '../api/faq.keys'
import { faqService } from '../api/faq.service'
import { useTopicQuestions } from '../hooks/use-faq'
import { CONTENT_STATUS, FAQ_PATH, TOPIC_ID_PARAM } from '../model/constants'
import type { FaqQuestionRow } from '../model/schemas'
import { LocaleBadges } from '@/entities/content/ui/locale-badges'

export function TopicQuestionsSection({ topicId }: Readonly<{ topicId: string }>) {
  const { t } = useTranslation('faq')
  const queryClient = useQueryClient()
  const questions = useTopicQuestions(topicId)

  const reorder = useMutation({
    mutationFn: (ids: number[]) => faqService.reorderTopicQuestions(topicId, ids),
    // Optimistic: the list moves at once; a failure puts the saved order back.
    onMutate: async (ids) => {
      const key = faqKeys.topicQuestions(topicId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FaqQuestionRow[]>(key)
      if (previous) {
        const byId = new Map(previous.map((row) => [row.id, row]))
        queryClient.setQueryData(key, ids.map((id, index) => ({ ...byId.get(id)!, number: index + 1 })))
      }
      return { previous }
    },
    onError: (error, _ids, context) => {
      queryClient.setQueryData(faqKeys.topicQuestions(topicId), context?.previous)
      toast.error(isAppError(error) ? error.message : t('topicQuestions.reorderFailed'))
    },
    onSuccess: () => toast.success(t('topicQuestions.reordered')),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [FAQ_QUESTIONS_MODULE_ID] })
      void queryClient.invalidateQueries({ queryKey: faqTopicsKeys.all })
    },
  })

  const rows = questions.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('topicQuestions.title')}</CardTitle>
        <CardDescription>{t('topicQuestions.description')}</CardDescription>
        <CardAction>
          <Button asChild variant="outline" colorPalette="black" size="sm">
            <Link to={`${FAQ_PATH}/new`} search={{ [TOPIC_ID_PARAM]: Number(topicId) }}>
              <PlusIcon size={16} />
              {t('topicQuestions.add')}
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {questions.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : questions.isError ? (
          <ErrorState error={questions.error} onRetry={() => void questions.refetch()} />
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('topicQuestions.empty')}</p>
        ) : (
          <>
            {reorder.isError ? (
              <Alert variant="surface" colorPalette="red" className="mb-3">
                <AlertDescription>{t('topicQuestions.reorderFailed')}</AlertDescription>
              </Alert>
            ) : null}
            <SortableList
              items={rows}
              getKey={(row) => row.id}
              getLabel={(row) => row.question ?? `#${row.id}`}
              disabled={reorder.isPending}
              onReorder={(ids) => reorder.mutate(ids)}
              labels={{
                list: t('topicQuestions.list'),
                moveUp: (name) => t('sortable.moveUp', { name }),
                moveDown: (name) => t('sortable.moveDown', { name }),
                moved: (name, position) => t('sortable.moved', { name, position }),
              }}
              renderItem={(row) => (
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-muted-foreground w-8 shrink-0 text-right text-sm tabular-nums">{row.number}.</span>
                  <Link
                    to={`${FAQ_PATH}/$id`}
                    params={{ id: String(row.id) }}
                    aria-label={t('topicQuestions.editAria', { name: row.question ?? `#${row.id}` })}
                    className="text-foreground hover:text-primary min-w-0 flex-1 truncate text-sm font-medium"
                  >
                    {row.question ?? `#${row.id}`}
                  </Link>
                  {row.status === CONTENT_STATUS.DRAFT ? (
                    <Badge size="xs" variant="subtle" colorPalette="black">
                      {t('topicQuestions.draft')}
                    </Badge>
                  ) : null}
                  <LocaleBadges locales={row.locales} />
                </span>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}
