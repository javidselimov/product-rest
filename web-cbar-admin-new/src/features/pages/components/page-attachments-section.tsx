/**
 * Səhifə sənədləri (research R9b): az/en başlıq + qrup etiketi ilə bağla,
 * başlıqları redaktə et, yuxarı/aşağı sırala (tam siyahı PUT), ayır.
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@cbar/lib-react-ui-kit/field'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  formatBytes,
  iconForMime,
  type MediaItem,
} from '@/entities/media/model/types'
import { MediaPickerDialog } from '@/features/media/components/media-picker-dialog'
import { isAppError } from '@/shared/api/types'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { pagesKeys } from '../api/pages.keys'
import { pagesService } from '../api/pages.service'
import type { PageAsset } from '../model/schemas'

interface TitlesDraft {
  az: string
  en: string
  group: string
}

interface PageAttachmentsSectionProps {
  pageId: string | number
  assets: PageAsset[]
}

export function PageAttachmentsSection({
  pageId,
  assets,
}: PageAttachmentsSectionProps) {
  const { t } = useTranslation(['pages', 'common'])
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: pagesKeys.detail(pageId) })

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pending, setPending] = useState<MediaItem | null>(null)
  const [editing, setEditing] = useState<PageAsset | null>(null)
  const [draft, setDraft] = useState<TitlesDraft>({ az: '', en: '', group: '' })
  const [detachTarget, setDetachTarget] = useState<PageAsset | null>(null)

  const sorted = [...assets].sort((a, b) => a.sortOrder - b.sortOrder)

  const attach = useMutation({
    mutationFn: (item: MediaItem) =>
      pagesService.attachAsset(pageId, {
        mediaId: item.id,
        translations: {
          az: { title: draft.az.trim() || item.originalName },
          en: { title: draft.en.trim() || item.originalName },
        },
        groupLabel: draft.group.trim() || null,
      }),
    onSuccess: async () => {
      await invalidate()
      setPending(null)
      toast.success(t('pages:assets.attached'))
    },
  })
  const update = useMutation({
    mutationFn: (asset: PageAsset) =>
      pagesService.updateAsset(pageId, asset.id, {
        translations: {
          az: { title: draft.az.trim() },
          en: { title: draft.en.trim() },
        },
        groupLabel: draft.group.trim() || null,
      }),
    onSuccess: async () => {
      await invalidate()
      setEditing(null)
      toast.success(t('pages:assets.updated'))
    },
  })
  const order = useMutation({
    mutationFn: (ids: number[]) => pagesService.orderAssets(pageId, ids),
    onSuccess: async () => {
      await invalidate()
      toast.success(t('pages:assets.reordered'))
    },
    onError: (error) =>
      toast.error(
        isAppError(error) ? error.message : t('common:errors.unexpected'),
      ),
  })
  const detach = useMutation({
    mutationFn: (asset: PageAsset) =>
      pagesService.detachAsset(pageId, asset.id),
    onSuccess: async () => {
      await invalidate()
      setDetachTarget(null)
      toast.success(t('pages:assets.detached'))
    },
  })

  const swap = (index: number, direction: -1 | 1) => {
    const ids = sorted.map((a) => a.id)
    const target = index + direction
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    order.mutate(ids)
  }

  const openTitles = (asset: PageAsset | null, item: MediaItem | null) => {
    setDraft({
      az: asset?.translations.az?.title ?? item?.originalName ?? '',
      en: asset?.translations.en?.title ?? item?.originalName ?? '',
      group: asset?.groupLabel ?? '',
    })
    if (asset) setEditing(asset)
    if (item) setPending(item)
  }

  const dialogOpen = pending !== null || editing !== null
  const dialogError = attach.error ?? update.error
  const closeDialog = () => {
    setPending(null)
    setEditing(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pages:assets.title')}</CardTitle>
        <CardDescription>{t('pages:assets.description')}</CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="outline"
            colorPalette="black"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            <PlusIcon size={16} />
            {t('pages:assets.add')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('pages:assets.empty')}
          </p>
        ) : (
          <ul
            className="divide-border divide-y"
            aria-label={t('pages:assets.title')}
          >
            {sorted.map((asset, index) => {
              const Icon = iconForMime(asset.mimeType)
              const name =
                asset.translations.az?.title ??
                asset.originalName ??
                `#${asset.mediaId}`
              return (
                <li key={asset.id} className="flex items-center gap-3 py-2">
                  <span className="bg-muted text-muted-foreground grid size-8 place-items-center rounded-md">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {name}
                      </span>
                      {asset.groupLabel ? (
                        <Badge
                          size="xs"
                          variant="subtle"
                          colorPalette="secondary"
                        >
                          {asset.groupLabel}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {asset.translations.en?.title ?? '—'} ·{' '}
                      {asset.originalName ?? ''} ·{' '}
                      {formatBytes(asset.sizeBytes)}
                    </span>
                  </span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('pages:assets.moveUp', { name })}
                    disabled={index === 0 || order.isPending}
                    onClick={() => swap(index, -1)}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('pages:assets.moveDown', { name })}
                    disabled={index === sorted.length - 1 || order.isPending}
                    onClick={() => swap(index, 1)}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="black"
                    aria-label={t('pages:assets.editTitles', { name })}
                    onClick={() => openTitles(asset, null)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    aria-label={t('pages:assets.detachAria', { name })}
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
          onPick={(item) => {
            setPickerOpen(false)
            attach.reset()
            openTitles(null, item)
          }}
          disabledIds={assets.map((a) => a.mediaId)}
        />
      ) : null}

      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => (!next ? closeDialog() : undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t('pages:assets.titlesTitle')
                : t('pages:assets.attachTitle')}
            </DialogTitle>
            <DialogDescription>
              {pending?.originalName ?? editing?.originalName ?? ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="asset-title-az">
                {t('pages:assets.titleAz')}
              </FieldLabel>
              <Input
                id="asset-title-az"
                value={draft.az}
                onChange={(e) => setDraft({ ...draft, az: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-title-en">
                {t('pages:assets.titleEn')}
              </FieldLabel>
              <Input
                id="asset-title-en"
                value={draft.en}
                onChange={(e) => setDraft({ ...draft, en: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="asset-group">
                {t('pages:assets.group')}
              </FieldLabel>
              <Input
                id="asset-group"
                value={draft.group}
                onChange={(e) => setDraft({ ...draft, group: e.target.value })}
              />
              <FieldDescription>{t('pages:assets.groupHint')}</FieldDescription>
            </Field>
            {dialogError ? (
              <Alert variant="surface" colorPalette="red">
                <AlertDescription>
                  {isAppError(dialogError)
                    ? dialogError.message
                    : t('common:errors.unexpected')}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              colorPalette="black"
              onClick={closeDialog}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              disabled={attach.isPending || update.isPending}
              onClick={() =>
                editing
                  ? update.mutate(editing)
                  : pending && attach.mutate(pending)
              }
            >
              {attach.isPending || update.isPending ? (
                <Spinner className="size-4" />
              ) : null}
              {editing ? t('common:actions.save') : t('pages:assets.attach')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={detachTarget !== null}
        title={t('pages:assets.detachTitle')}
        description={t('pages:assets.detachConfirm', {
          name:
            detachTarget?.translations.az?.title ??
            detachTarget?.originalName ??
            '',
        })}
        confirmLabel={t('pages:assets.detach')}
        isPending={detach.isPending}
        error={detach.error}
        onCancel={() => setDetachTarget(null)}
        onConfirm={() => detachTarget && detach.mutate(detachTarget)}
      />
    </Card>
  )
}
