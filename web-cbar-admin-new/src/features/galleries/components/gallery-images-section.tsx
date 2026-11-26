/**
 * Qalereya şəkilləri bölməsi (research R9c): əlavə et (media seçici, artıq bağlı
 * fayllar söndürülür), yuxarı/aşağı (indeks dəyişimi → tam siyahı `PUT /order`),
 * çıxar (təsdiq dialoqu). Hər uğurdan sonra valideyn detail invalidasiyası.
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
import { galleriesKeys } from '../api/galleries.keys'
import { galleriesService } from '../api/galleries.service'
import { galleryImageSchema, type GalleryImage } from '../model/schemas'

interface GalleryImagesSectionProps {
  id: string
  detail: AnyRow
}

const imageName = (image: GalleryImage) =>
  image.originalName ?? `#${image.mediaId}`

export function GalleryImagesSection({
  id,
  detail,
}: GalleryImagesSectionProps) {
  const { t } = useTranslation('galleries')
  const queryClient = useQueryClient()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<GalleryImage | null>(null)

  // Detail artıq sxemlə yoxlanılıb; burada yalnız tipə salınır və sıralanır.
  const images = useMemo<GalleryImage[]>(() => {
    const parsed = galleryImageSchema.array().safeParse(detail.images ?? [])
    if (!parsed.success) return []
    return [...parsed.data].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
  }, [detail.images])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: galleriesKeys.detail(id) })

  const add = useMutation({
    mutationFn: (item: MediaItem) => galleriesService.addImage(id, item.id),
    onSuccess: async () => {
      setPickerOpen(false)
      setPickerError(null)
      await invalidate()
      toast.success(t('images.added'))
    },
    onError: (error) =>
      setPickerError(isAppError(error) ? error.message : t('images.addFailed')),
  })

  const reorder = useMutation({
    mutationFn: (imageIds: number[]) =>
      galleriesService.reorderImages(id, imageIds),
    onSuccess: async () => {
      setOrderError(null)
      await invalidate()
      toast.success(t('images.reordered'))
    },
    onError: (error) =>
      setOrderError(
        isAppError(error) ? error.message : t('images.reorderFailed'),
      ),
  })

  const remove = useMutation({
    mutationFn: (image: GalleryImage) =>
      galleriesService.removeImage(id, image.id),
    onSuccess: async () => {
      setRemoveTarget(null)
      await invalidate()
      toast.success(t('images.removed'))
    },
  })

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const ids = images.map((image) => image.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('images.title')}</CardTitle>
        <CardDescription>{t('images.description')}</CardDescription>
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
            {t('images.add')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {orderError ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{orderError}</AlertDescription>
          </Alert>
        ) : null}
        {images.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('images.empty')}</p>
        ) : (
          <ul className="divide-border divide-y" aria-label={t('images.title')}>
            {images.map((image, index) => {
              const name = imageName(image)
              return (
                <li key={image.id} className="flex items-center gap-3 py-2">
                  <MediaPreview
                    mediaId={image.mediaId}
                    name={name}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {name}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      #{image.mediaId} ·{' '}
                      {t('images.position', { position: index + 1 })}
                    </span>
                  </span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('images.moveUpAria', { name })}
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('images.moveDownAria', { name })}
                    disabled={index === images.length - 1 || reorder.isPending}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    aria-label={t('images.removeAria', { name })}
                    onClick={() => {
                      remove.reset()
                      setRemoveTarget(image)
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
          disabledIds={images.map((image) => image.mediaId)}
          error={pickerError}
          title={t('images.pickerTitle')}
        />
      ) : null}

      <DeleteDialog
        open={removeTarget !== null}
        title={t('images.removeTitle')}
        description={t('images.removeConfirm', {
          name: removeTarget ? imageName(removeTarget) : '',
        })}
        confirmLabel={t('images.remove')}
        isPending={remove.isPending}
        error={remove.error}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && remove.mutate(removeTarget)}
      />
    </Card>
  )
}
