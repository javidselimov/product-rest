/**
 * Köçürmə dialoqu: valideyn seçimi kit `TreeSelect` ilə — düyünün özü və
 * nəsilləri seçilə bilmir (dövr yaranmır); `allowClear` = kökə köçür.
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
} from '@cbar/lib-react-ui-kit/dialog'
import { Field, FieldLabel } from '@cbar/lib-react-ui-kit/field'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { TreeSelect } from '@cbar/lib-react-ui-kit/tree-select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { pagesKeys } from '../api/pages.keys'
import { pagesService } from '../api/pages.service'
import type { PageNode } from '../model/schemas'
import { descendantIds, toTreeSelectData } from '../model/tree'

interface MoveDialogProps {
  node: PageNode | null
  tree: PageNode[]
  onClose: () => void
}

export function MoveDialog({ node, tree, onClose }: MoveDialogProps) {
  const { t } = useTranslation(['pages', 'common'])
  const queryClient = useQueryClient()
  const [parentId, setParentId] = useState<number | null>(
    node?.parentId ?? null,
  )
  const [sortOrder, setSortOrder] = useState(String(node?.sortOrder ?? 1))
  const [localError, setLocalError] = useState<string | null>(null)

  const treeData = useMemo(
    () =>
      node
        ? toTreeSelectData(tree, descendantIds(node), t('pages:untitled'))
        : [],
    [node, tree, t],
  )

  const move = useMutation({
    mutationFn: (body: { newParentId: number | null; sortOrder: number }) =>
      pagesService.move(node!.id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pagesKeys.all })
      toast.success(t('pages:moved'))
      onClose()
    },
  })

  const submit = () => {
    const order = Number(sortOrder)
    if (sortOrder.trim() === '' || !Number.isInteger(order)) {
      setLocalError(t('pages:move.sortOrderInvalid'))
      return
    }
    setLocalError(null)
    move.mutate({ newParentId: parentId, sortOrder: order })
  }

  const errorMessage =
    localError ??
    (move.error
      ? isAppError(move.error)
        ? move.error.message
        : t('common:errors.unexpected')
      : null)

  return (
    <Dialog
      open={node !== null}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('pages:move.title', {
              name: node?.title ?? t('pages:untitled'),
            })}
          </DialogTitle>
          <DialogDescription>{t('pages:move.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="move-parent">
              {t('pages:move.parent')}
            </FieldLabel>
            <TreeSelect
              id="move-parent"
              treeData={treeData}
              value={parentId}
              onChange={(value) =>
                setParentId(
                  typeof value === 'number'
                    ? value
                    : value === null
                      ? null
                      : Number(value),
                )
              }
              treeDefaultExpandAll
              showSearch
              allowClear
              placeholder={t('pages:move.root')}
              searchPlaceholder={t('common:search')}
              aria-label={t('pages:move.parent')}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="move-sort">
              {t('pages:fields.sortOrder')}
            </FieldLabel>
            <Input
              id="move-sort"
              type="number"
              step={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="max-w-40"
            />
          </Field>
          {errorMessage ? (
            <Alert variant="surface" colorPalette="red">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            colorPalette="black"
            onClick={onClose}
            disabled={move.isPending}
          >
            {t('common:actions.cancel')}
          </Button>
          <Button onClick={submit} disabled={move.isPending}>
            {move.isPending ? <Spinner className="size-4" /> : null}
            {t('pages:move.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
