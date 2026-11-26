/**
 * "Saytın menyusunda keçid kartı" on the topic form (spec 051 US5/US6): the CMS pages that show a link card to the topic.
 * A page is added from a searchable list of the page tree ("Parent › Page"), removed, or reordered; each change is saved
 * at once with the topic's stored name and status, so the form's unsaved edits stay untouched.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import { Combobox } from '@cbar/lib-react-ui-kit/combobox'
import { CrossIcon } from '@cbar/lib-react-ui-kit/icons'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { SortableList } from '@/shared/ui/sortable-list'
import { faqTopicsKeys } from '../api/faq.keys'
import { faqService } from '../api/faq.service'
import { useFaqPageOptions } from '../hooks/use-faq'
import type { FaqTopicDetail } from '../model/schemas'

export function TopicPagesSection({ topic }: Readonly<{ topic: FaqTopicDetail }>) {
  const { t } = useTranslation('faq')
  const queryClient = useQueryClient()
  const pageOptions = useFaqPageOptions()

  const labelOf = useMemo(() => {
    const byId = new Map(pageOptions.options.map((option) => [option.id, option.label]))
    const titles = new Map(topic.pages.map((page) => [page.id, page.title]))
    return (id: number) => byId.get(id) ?? titles.get(id) ?? `#${id}`
  }, [pageOptions.options, topic.pages])

  const save = useMutation({
    mutationFn: (pageIds: number[]) => faqService.setTopicPages(topic, pageIds),
    onSuccess: () => {
      toast.success(t('topicPages.saved'))
      void queryClient.invalidateQueries({ queryKey: faqTopicsKeys.all })
    },
  })

  const linked = topic.pageIds.map((id) => ({ id }))
  const choices = pageOptions.options
    .filter((option) => !topic.pageIds.includes(option.id))
    .map((option) => ({ value: String(option.id), label: option.label }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('topicPages.title')}</CardTitle>
        <CardDescription>{t('topicPages.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {save.isError ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{isAppError(save.error) ? save.error.message : t('topicPages.saveFailed')}</AlertDescription>
          </Alert>
        ) : null}

        {linked.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('topicPages.empty')}</p>
        ) : (
          <SortableList
            items={linked}
            getKey={(page) => page.id}
            getLabel={(page) => labelOf(page.id)}
            disabled={save.isPending}
            onReorder={(ids) => save.mutate(ids)}
            labels={{
              list: t('topicPages.list'),
              moveUp: (name) => t('sortable.moveUp', { name }),
              moveDown: (name) => t('sortable.moveDown', { name }),
              moved: (name, position) => t('sortable.moved', { name, position }),
            }}
            renderItem={(page) => (
              <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{labelOf(page.id)}</span>
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  aria-label={t('topicPages.remove', { name: labelOf(page.id) })}
                  disabled={save.isPending}
                  onClick={() => save.mutate(topic.pageIds.filter((id) => id !== page.id))}
                >
                  <CrossIcon />
                </IconButton>
              </span>
            )}
          />
        )}

        <Combobox
          aria-label={t('topicPages.add')}
          placeholder={t('topicPages.add')}
          searchPlaceholder={t('topicPages.search')}
          emptyMessage={t('topicPages.noResults')}
          options={choices}
          value=""
          disabled={save.isPending || pageOptions.isLoading}
          onValueChange={(value) => {
            if (value) save.mutate([...topic.pageIds, Number(value)])
          }}
          className="w-full md:w-96"
        />
      </CardContent>
    </Card>
  )
}
