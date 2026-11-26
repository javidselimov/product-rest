/**
 * Ortaq media seçici (spec FR-022, research R8): axtarış (debounce), 24-lük
 * səhifələmə, kart grid (şəkillər önizləmə ilə, digərləri mime ikonu — spec 010;
 * kartda böyütmə yoxdur, klik seçimdir), `disabledIds` artıq
 * bağlanmış faylları söndürür.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@cbar/lib-react-ui-kit/dialog'
import { SearchIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { acceptsMedia } from '@/entities/media/model/accept'
import {
  MEDIA_PAGE_SIZE,
  formatBytes,
  type MediaItem,
} from '@/entities/media/model/types'
import { formatDate } from '@/shared/crud/date-io'
import type { MediaAccept } from '@/shared/crud/types'
import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/timing'
import { useDebounced } from '@/shared/lib/debounce'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { ListPagination } from '@/shared/ui/list-pagination'
import { useMediaList } from '../hooks/use-media'
import { MediaPreview } from './media-preview'

export interface MediaPickerDialogProps {
  open: boolean
  onClose: () => void
  onPick: (item: MediaItem) => void
  /** Seçilə bilməyən (artıq bağlanmış) media id-ləri. */
  disabledIds?: number[]
  /** Only these files can be picked; the others stay listed but disabled (spec 053). */
  accept?: MediaAccept
  error?: string | null
  title?: string
}

export function MediaPickerDialog({
  open,
  onClose,
  onPick,
  disabledIds = [],
  accept,
  error,
  title,
}: MediaPickerDialogProps) {
  const { t, i18n } = useTranslation('media')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounced(search, SEARCH_DEBOUNCE_MS)
  const list = useMediaList({ page, search: debounced || undefined }, open)
  const items = list.data?.items ?? []
  const total = list.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE))

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title ?? t('picker.title')}</DialogTitle>
          <DialogDescription>
            {t('picker.description')}
            {accept ? <> {t(`picker.accept.${accept}`)}</> : null}
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          startElement={<SearchIcon size={16} />}
          aria-label={t('search')}
          autoFocus
        />

        {error ? (
          <Alert variant="surface" colorPalette="red">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {list.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={() => void list.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <ul
            className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4"
            aria-label={t('picker.list')}
          >
            {items.map((item) => {
              const disabled = disabledIds.includes(item.id) || !acceptsMedia(accept, item.mimeType)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onPick(item)}
                    aria-label={t('picker.pick', { name: item.originalName })}
                    className={cn(
                      'border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-ring flex h-full w-full flex-col items-start gap-2 rounded-md border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                      disabled && 'hover:bg-card cursor-not-allowed opacity-50',
                    )}
                  >
                    <MediaPreview
                      mediaId={item.id}
                      name={item.originalName}
                      mimeType={item.mimeType}
                      size="md"
                      zoomable={false}
                    />
                    <span
                      className="w-full truncate text-sm font-medium"
                      title={item.originalName}
                    >
                      {item.originalName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      #{item.id} · {formatBytes(item.sizeBytes)} ·{' '}
                      {formatDate(item.createdAt, i18n.language)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {total > MEDIA_PAGE_SIZE ? (
          <ListPagination
            page={page}
            pageCount={pageCount}
            total={total}
            onPageChange={setPage}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
