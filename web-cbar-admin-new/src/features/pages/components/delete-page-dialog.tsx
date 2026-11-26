/** Səhifə silmə dialoqu: alt səhifə sayını göstərir; 409 mesajı dialoqda qalır. */

import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { pagesKeys } from '../api/pages.keys'
import { pagesService } from '../api/pages.service'
import type { PageNode } from '../model/schemas'
import { countDescendants } from '../model/tree'

interface DeletePageDialogProps {
  node: PageNode | null
  onClose: () => void
}

export function DeletePageDialog({ node, onClose }: DeletePageDialogProps) {
  const { t } = useTranslation('pages')
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: (id: number) => pagesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pagesKeys.all })
      toast.success(t('deleted'))
      onClose()
    },
  })
  const count = node ? countDescendants(node) : 0
  const name = node?.title ?? t('untitled')

  return (
    <DeleteDialog
      open={node !== null}
      title={t('delete.title')}
      description={
        count > 0
          ? t('delete.withChildren', { name, count })
          : t('delete.confirm', { name })
      }
      isPending={remove.isPending}
      error={remove.error}
      onCancel={onClose}
      onConfirm={() => node && remove.mutate(node.id)}
    />
  )
}
