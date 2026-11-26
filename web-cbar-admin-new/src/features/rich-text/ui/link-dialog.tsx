/**
 * Link ünvanı dialoqu — köhnə panelin `window.prompt`-unun kit `Dialog` qarşılığı.
 * Boş ünvanla təsdiq "linki sil" deməkdir (`onSubmit('')`).
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface LinkDialogProps {
  open: boolean
  initialHref: string
  onClose: () => void
  onSubmit: (href: string) => void
}

interface LinkFormProps {
  initialHref: string
  onSubmit: (href: string) => void
}

function LinkForm({ initialHref, onSubmit }: LinkFormProps) {
  const { t } = useTranslation('richText')
  const [href, setHref] = useState(initialHref)
  const inputId = useId()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(href.trim())
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {t('linkDialog.label')}
        </label>
        <Input
          id={inputId}
          type="url"
          autoFocus
          value={href}
          placeholder={t('linkDialog.placeholder')}
          onChange={(event) => setHref(event.target.value)}
        />
      </div>
      <DialogFooter>
        {initialHref ? (
          <Button
            type="button"
            variant="outline"
            colorPalette="red"
            onClick={() => onSubmit('')}
          >
            {t('linkDialog.unset')}
          </Button>
        ) : null}
        <DialogClose asChild>
          <Button type="button" variant="ghost" colorPalette="black">
            {t('linkDialog.cancel')}
          </Button>
        </DialogClose>
        <Button type="submit">{t('linkDialog.apply')}</Button>
      </DialogFooter>
    </form>
  )
}

export function LinkDialog({
  open,
  initialHref,
  onClose,
  onSubmit,
}: LinkDialogProps) {
  const { t } = useTranslation('richText')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('linkDialog.title')}</DialogTitle>
          <DialogDescription>{t('linkDialog.description')}</DialogDescription>
        </DialogHeader>
        {/* `key` — hər açılışda sahə ilkin ünvanla sıfırlanır (effect-siz). */}
        {open ? (
          <LinkForm
            key={initialHref}
            initialHref={initialHref}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
