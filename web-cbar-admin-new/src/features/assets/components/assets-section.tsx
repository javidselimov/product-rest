/**
 * Shared attachment section (research R9a): attach / detach, used by press releases
 * and laws; after each success `onChanged` lets the parent refetch its detail.
 *
 * Spec 030 extends it optionally: `reorderable` adds move up/down buttons (index swap →
 * the full `mediaIds` list is PUT to `/order`), `badgeFor` labels a row (e.g. which image
 * is the cover), and spec 033 `localeControl` picks a row's language. All are off by default,
 * so laws keep the plain list.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Badge } from '@cbar/lib-react-ui-kit/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cbar/lib-react-ui-kit/select'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ASSET_LOCALE_ALL,
  formatBytes,
  type AttachedAsset,
  type MediaItem,
} from '@/entities/media/model/types'
import { MediaPickerDialog } from '@/features/media/components/media-picker-dialog'
import { MediaPreview } from '@/features/media/components/media-preview'
import { isAppError } from '@/shared/api/types'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { assetsService } from '../api/assets.service'

export interface AssetLocaleControl {
  /** Accessible name of a row's select. */
  ariaLabel: (name: string) => string
  options: { value: string; label: string }[]
}

interface AssetsSectionProps {
  /** Collection path, e.g. "/laws/3/assets". */
  assetsPath: string
  /** Attachments in server order (the API already sorts by `sortOrder`). */
  assets: AttachedAsset[]
  /** Called after a successful attach / detach / reorder (invalidate the parent detail). */
  onChanged: () => void
  /** Card title key; may carry a namespace (`pressReleases:attachments.title`). */
  titleKey?: string
  /** Card description key; same convention as `titleKey`. */
  descriptionKey?: string
  /** Show move up/down buttons and PUT the new order to `{assetsPath}/order`. */
  reorderable?: boolean
  /** Label shown next to the file name, or null for no badge. */
  badgeFor?: (
    asset: AttachedAsset,
    index: number,
    assets: AttachedAsset[],
  ) => string | null
  /** Show a language select on each row and PUT the choice to `{assetsPath}/{mediaId}/locale`. */
  localeControl?: AssetLocaleControl
}

const assetName = (asset: AttachedAsset) =>
  asset.originalName ?? `#${asset.mediaId}`

export function AssetsSection({
  assetsPath,
  assets,
  onChanged,
  titleKey,
  descriptionKey,
  reorderable = false,
  badgeFor,
  localeControl,
}: AssetsSectionProps) {
  const { t } = useTranslation('media')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [rowError, setRowError] = useState<string | null>(null)
  const [detachTarget, setDetachTarget] = useState<AttachedAsset | null>(null)
  const title = t(titleKey ?? 'assets.title')

  const attach = useMutation({
    mutationFn: (item: MediaItem) => assetsService.attach(assetsPath, item.id),
    onSuccess: () => {
      setPickerOpen(false)
      setPickerError(null)
      toast.success(t('assets.attached'))
      onChanged()
    },
    onError: (error) =>
      setPickerError(
        isAppError(error) ? error.message : t('assets.attachFailed'),
      ),
  })
  const detach = useMutation({
    mutationFn: (asset: AttachedAsset) =>
      assetsService.detach(assetsPath, asset.mediaId),
    onSuccess: () => {
      setDetachTarget(null)
      toast.success(t('assets.detached'))
      onChanged()
    },
  })
  const reorder = useMutation({
    mutationFn: (mediaIds: number[]) =>
      assetsService.reorder(assetsPath, mediaIds),
    onSuccess: () => {
      setRowError(null)
      toast.success(t('assets.reordered'))
      onChanged()
    },
    onError: (error) =>
      setRowError(
        isAppError(error) ? error.message : t('assets.reorderFailed'),
      ),
  })
  const setLocale = useMutation({
    mutationFn: ({ mediaId, value }: { mediaId: number; value: string }) =>
      assetsService.setLocale(
        assetsPath,
        mediaId,
        value === ASSET_LOCALE_ALL ? null : value,
      ),
    onSuccess: () => {
      setRowError(null)
      toast.success(t('assets.localeChanged'))
      onChanged()
    },
    onError: (error) =>
      setRowError(isAppError(error) ? error.message : t('assets.localeFailed')),
  })

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= assets.length) return
    const ids = assets.map((asset) => asset.mediaId)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorder.mutate(ids)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {t(descriptionKey ?? 'assets.description')}
        </CardDescription>
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
            {t('assets.add')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {rowError ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{rowError}</AlertDescription>
          </Alert>
        ) : null}
        {assets.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('assets.empty')}</p>
        ) : (
          <ul className="divide-border divide-y" aria-label={title}>
            {assets.map((asset, index) => {
              const name = assetName(asset)
              const badge = badgeFor?.(asset, index, assets) ?? null
              return (
                <li
                  key={asset.mediaId}
                  className="flex items-center gap-3 py-2"
                >
                  <MediaPreview
                    mediaId={asset.mediaId}
                    name={asset.originalName}
                    mimeType={asset.mimeType}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {name}
                      </span>
                      {badge ? (
                        <Badge size="sm" variant="subtle" colorPalette="black">
                          {badge}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      #{asset.mediaId} · {formatBytes(asset.sizeBytes)}
                    </span>
                  </span>
                  {localeControl ? (
                    <Select
                      value={asset.locale ?? ASSET_LOCALE_ALL}
                      disabled={setLocale.isPending}
                      onValueChange={(value) =>
                        setLocale.mutate({ mediaId: asset.mediaId, value })
                      }
                    >
                      <SelectTrigger
                        className="w-36"
                        aria-label={localeControl.ariaLabel(name)}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {localeControl.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  {reorderable ? (
                    <>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorPalette="black"
                        aria-label={t('assets.moveUpAria', { name })}
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUpIcon />
                      </IconButton>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        colorPalette="black"
                        aria-label={t('assets.moveDownAria', { name })}
                        disabled={
                          index === assets.length - 1 || reorder.isPending
                        }
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDownIcon />
                      </IconButton>
                    </>
                  ) : null}
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    aria-label={t('assets.detachAria', {
                      name: asset.originalName ?? asset.mediaId,
                    })}
                    onClick={() => {
                      detach.reset()
                      setDetachTarget(asset)
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
          onPick={(item) => attach.mutate(item)}
          disabledIds={assets.map((a) => a.mediaId)}
          error={pickerError}
        />
      ) : null}

      <DeleteDialog
        open={detachTarget !== null}
        title={t('assets.detachTitle')}
        description={t('assets.detachConfirm', {
          name: detachTarget?.originalName ?? detachTarget?.mediaId ?? '',
        })}
        confirmLabel={t('assets.detach')}
        isPending={detach.isPending}
        error={detach.error}
        onCancel={() => setDetachTarget(null)}
        onConfirm={() => detachTarget && detach.mutate(detachTarget)}
      />
    </Card>
  )
}
