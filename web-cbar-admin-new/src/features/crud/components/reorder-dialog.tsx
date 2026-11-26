/**
 * "Sıranı dəyiş" over a paged list (spec 051, generalised in spec 053): a dialog with the full list in a `SortableList`.
 * Each move is saved at once: the list moves optimistically and a failure puts the saved order back. The lists are
 * paged, so order cannot change in the table itself. Used by the FAQ topics and videos, the FinCERT directions and
 * memberships, and the org chart's siblings (spec 060, with an icon `trigger`); the caller gives the title, the full
 * list and the save request.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cbar/lib-react-ui-kit/dialog'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { ErrorState } from '@/shared/ui/error-state'
import { SortableList } from '@/shared/ui/sortable-list'

interface Orderable {
  id: number
}

export interface ReorderDialogProps<Item extends Orderable> {
  /** Translated dialog title, also the list's accessible name ("Mövzuların sırası"). */
  title: string
  queryKey: QueryKey
  load: () => Promise<Item[]>
  save: (ids: number[]) => Promise<unknown>
  getLabel: (item: Item) => string
  /** The module root, so its list and choices refresh after a save. */
  moduleId: string
  /** Opens the dialog instead of the default "Sıranı dəyiş" button, e.g. an icon button in a tree row. */
  trigger?: ReactElement
}

export function ReorderDialog<Item extends Orderable>({ title, queryKey, load, save, getLabel, moduleId, trigger }: ReorderDialogProps<Item>) {
  const { t } = useTranslation('crud')
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const items = useQuery({ queryKey, queryFn: load, enabled: open })

  const reorder = useMutation({
    mutationFn: save,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Item[]>(queryKey)
      if (previous) {
        const byId = new Map(previous.map((item) => [item.id, item]))
        queryClient.setQueryData(
          queryKey,
          ids.flatMap((id) => byId.get(id) ?? []),
        )
      }
      return { previous }
    },
    onError: (error, _ids, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toast.error(isAppError(error) ? error.message : t('reorder.failed'))
    },
    onSuccess: () => toast.success(t('reorder.saved')),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: [moduleId] }),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" colorPalette="black">
            {t('reorder.button')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('reorder.description')}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {items.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : items.isError ? (
            <ErrorState error={items.error} onRetry={() => void items.refetch()} />
          ) : (
            <>
              {reorder.isError ? (
                <Alert variant="surface" colorPalette="red" className="mb-3">
                  <AlertDescription>{t('reorder.failed')}</AlertDescription>
                </Alert>
              ) : null}
              <SortableList
                items={items.data}
                getKey={(item) => item.id}
                getLabel={getLabel}
                disabled={reorder.isPending}
                onReorder={(ids) => reorder.mutate(ids)}
                labels={{
                  list: title,
                  moveUp: (name) => t('sortable.moveUp', { name }),
                  moveDown: (name) => t('sortable.moveDown', { name }),
                  moved: (name, position) => t('sortable.moved', { name, position }),
                }}
                renderItem={(item) => <span className="block truncate text-sm font-medium">{getLabel(item)}</span>}
              />
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" colorPalette="black" onClick={() => setOpen(false)}>
            {t('reorder.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
