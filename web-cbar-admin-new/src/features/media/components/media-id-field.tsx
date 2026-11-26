/** Tək media sahəsi (`FieldType 'media'`): önizləmə + `#id · ad` + Dəyiş/Təmizlə. */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { AttachIcon } from '@cbar/lib-react-ui-kit/icons'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MediaAccept } from '@/shared/crud/types'

import { MediaPickerDialog } from './media-picker-dialog'
import { MediaPreview } from './media-preview'

interface MediaIdFieldProps {
  /** Seçilmiş media id (string, '' = yoxdur). */
  value: string
  onChange: (value: string) => void
  /** Detail-dən oxunmuş fayl adı — yeni fayl seçilənə qədər göstərilir. */
  nameHint?: string
  disabled?: boolean
  /** Only images or only documents can be picked (spec 053). */
  accept?: MediaAccept
}

export function MediaIdField({
  value,
  onChange,
  nameHint,
  disabled,
  accept,
}: MediaIdFieldProps) {
  const { t } = useTranslation('media')
  const [open, setOpen] = useState(false)
  const [pickedName, setPickedName] = useState<string | null>(null)
  // Detail cavabında mime yoxdur — yalnız seçicidən gələndə məlumdur (şəkil deyilsə sorğu getmir).
  const [pickedMime, setPickedMime] = useState<string | null>(null)
  const name = pickedName ?? nameHint
  const mediaId = value && Number.isFinite(Number(value)) ? Number(value) : null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MediaPreview mediaId={mediaId} name={name} mimeType={pickedMime} />
      <span
        className="text-foreground bg-muted rounded-md px-3 py-2 text-sm"
        data-slot="media-value"
      >
        {value ? `#${value}${name ? ` · ${name}` : ''}` : t('field.none')}
      </span>
      <Button
        type="button"
        variant="outline"
        colorPalette="black"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <AttachIcon size={16} />
        {value ? t('field.change') : t('field.choose')}
      </Button>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          colorPalette="black"
          size="sm"
          onClick={() => {
            onChange('')
            setPickedName(null)
            setPickedMime(null)
          }}
          disabled={disabled}
        >
          {t('field.clear')}
        </Button>
      ) : null}
      {open ? (
        <MediaPickerDialog
          open={open}
          accept={accept}
          onClose={() => setOpen(false)}
          onPick={(item) => {
            onChange(String(item.id))
            setPickedName(item.originalName)
            setPickedMime(item.mimeType)
            setOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
