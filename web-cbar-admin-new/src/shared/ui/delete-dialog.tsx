/**
 * Silmə təsdiq dialoqu (spec FR-018, B9). Kit-də alert-dialog yoxdur — `Dialog`
 * `showCloseButton={false}` ilə tərtib olunur; xəta dialoq içində göstərilir.
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
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'

interface DeleteDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
  error?: unknown
  confirmLabel?: string
}

export function DeleteDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  isPending = false,
  error,
  confirmLabel,
}: DeleteDialogProps) {
  const { t } = useTranslation('common')
  const message = error
    ? isAppError(error)
      ? error.message
      : t('errors.unexpected')
    : null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next && !isPending ? onCancel() : undefined)}
    >
      <DialogContent showCloseButton={false} role="alertdialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {message ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            colorPalette="black"
            onClick={onCancel}
            disabled={isPending}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant="solid"
            colorPalette="red"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : null}
            {confirmLabel ?? t('actions.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
