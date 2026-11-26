/**
 * Heyət üzvünün mətbuat fotoları bölməsi — `GalleryImagesSection`-ın eynisi, `/photos`
 * alt-resursu ilə: əlavə et (media seçici, artıq bağlı fayllar söndürülür), yuxarı/aşağı
 * (indeks dəyişimi → tam siyahı `PUT /order`), çıxar (təsdiq dialoqu). Hər uğurdan sonra
 * valideyn detail invalidasiyası. Saytda bio altındakı "Fotoşəkillər" (Figma `2037:4289`).
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@cbar/lib-react-ui-kit/card'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { MediaItem } from '@/entities/media/model/types'
import { MediaPickerDialog } from '@/features/media/components/media-picker-dialog'
import { MediaPreview } from '@/features/media/components/media-preview'
import { isAppError } from '@/shared/api/types'
import type { AnyRow } from '@/shared/crud/types'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { staffKeys, staffPhotosService } from '../api/staff-photos.service'
import { staffPhotoSchema, type StaffPhoto } from '../model/schemas'

interface StaffPhotosSectionProps {
  id: string
  detail: AnyRow
}

const photoName = (photo: StaffPhoto) =>
  photo.originalName ?? `#${photo.mediaId}`

export function StaffPhotosSection({ id, detail }: StaffPhotosSectionProps) {
  const { t } = useTranslation('organization')
  const queryClient = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<StaffPhoto | null>(null)

  // Detail artıq sxemlə yoxlanılıb; burada yalnız tipə salınır və sıralanır.
  const photos = useMemo<StaffPhoto[]>(() => {
    const parsed = staffPhotoSchema.array().safeParse(detail.photos ?? [])
    if (!parsed.success) return []
    return [...parsed.data].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
  }, [detail.photos])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) })

  const add = useMutation({
    mutationFn: (item: MediaItem) => staffPhotosService.addPhoto(id, item.id),
    onSuccess: async () => {
      setPickerOpen(false)
      setPickerError(null)
      await invalidate()
      toast.success(t('photos.added'))
    },
    onError: (error) =>
      setPickerError(isAppError(error) ? error.message : t('photos.addFailed')),
  })

  const reorder = useMutation({
    mutationFn: (photoIds: number[]) =>
      staffPhotosService.reorderPhotos(id, photoIds),
    onSuccess: async () => {
      setOrderError(null)
      await invalidate()
      toast.success(t('photos.reordered'))
    },
    onError: (error) =>
      setOrderError(
        isAppError(error) ? error.message : t('photos.reorderFailed'),
      ),
  })

  const remove = useMutation({
    mutationFn: (photo: StaffPhoto) =>
      staffPhotosService.removePhoto(id, photo.id),
    onSuccess: async () => {
      setRemoveTarget(null)
      await invalidate()
      toast.success(t('photos.removed'))
    },
  })

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= photos.length) return
    const ids = photos.map((photo) => photo.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('photos.title')}</CardTitle>
        <CardDescription>{t('photos.description')}</CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            colorPalette="black"
            size="sm"
            onClick={() => {
              setPickerError(null)
              setPickerOpen(true)
            }}
          >
            <PlusIcon size={16} />
            {t('photos.add')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {orderError ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{orderError}</AlertDescription>
          </Alert>
        ) : null}
        {photos.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('photos.empty')}</p>
        ) : (
          <ul className="divide-border divide-y" aria-label={t('photos.title')}>
            {photos.map((photo, index) => {
              const name = photoName(photo)
              return (
                <li key={photo.id} className="flex items-center gap-3 py-2">
                  <MediaPreview
                    mediaId={photo.mediaId}
                    name={name}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {name}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      #{photo.mediaId} ·{' '}
                      {t('photos.position', { position: index + 1 })}
                    </span>
                  </span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('photos.moveUpAria', { name })}
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('photos.moveDownAria', { name })}
                    disabled={index === photos.length - 1 || reorder.isPending}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    aria-label={t('photos.removeAria', { name })}
                    onClick={() => {
                      remove.reset()
                      setRemoveTarget(photo)
                    }}
                  >
                    <TrashIcon />
                  </IconButton>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>

      {pickerOpen ? (
        <MediaPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(item) => add.mutate(item)}
          disabledIds={photos.map((photo) => photo.mediaId)}
          error={pickerError}
          title={t('photos.pickerTitle')}
        />
      ) : null}

      <DeleteDialog
        open={removeTarget !== null}
        title={t('photos.removeTitle')}
        description={t('photos.removeConfirm', {
          name: removeTarget ? photoName(removeTarget) : '',
        })}
        confirmLabel={t('photos.remove')}
        isPending={remove.isPending}
        error={remove.error}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && remove.mutate(removeTarget)}
      />
    </Card>
  )
}
