/**
 * Media kitabxanası kart grid-i (spec FR-021, data-model.md §4). Şəkillər
 * önizləmə ilə (klik böyüdür), digərləri mime ikonu ilə (spec 010). API ölçü
 * (width/height) vermir — ölçülər sütunu həmişə "—". Silmə düyməsi valideynə (`onDelete`) ötürülür — dialoq və
 * mutation səhifədədir.
 */

import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { TrashIcon } from '@cbar/lib-react-ui-kit/icons'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { useTranslation } from 'react-i18next'

import { formatBytes, type MediaItem } from '@/entities/media/model/types'
import { formatDate } from '@/shared/crud/date-io'
import { GRID_SKELETON_COUNT } from '../model/constants'

import { MediaPreview } from './media-preview'

const GRID_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'

interface MediaGridProps {
  items: MediaItem[]
  onDelete: (item: MediaItem) => void
}

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  const { t, i18n } = useTranslation('media')

  return (
    <ul className={GRID_CLASS} aria-label={t('grid')}>
      {items.map((item) => {
        return (
          <li key={item.id}>
            <Card className="h-full">
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <MediaPreview
                    mediaId={item.id}
                    name={item.originalName}
                    mimeType={item.mimeType}
                    size="md"
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    aria-label={t('deleteAria', { name: item.originalName })}
                    onClick={() => onDelete(item)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>
                <p
                  className="text-foreground line-clamp-2 text-sm font-medium break-all"
                  title={item.originalName}
                >
                  {item.originalName}
                </p>
                <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                  <dt>{t('type')}</dt>
                  <dd className="truncate" title={item.mimeType ?? undefined}>
                    {item.mimeType || '—'}
                  </dd>
                  <dt>{t('size')}</dt>
                  <dd>{formatBytes(item.sizeBytes)}</dd>
                  <dt>{t('dimensions')}</dt>
                  <dd>—</dd>
                  <dt>{t('created')}</dt>
                  <dd>{formatDate(item.createdAt, i18n.language)}</dd>
                </dl>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

/** Yüklənmə vəziyyəti — kart ölçüsündə skeleton-lar. */
export function MediaGridSkeleton({ count = GRID_SKELETON_COUNT }: { count?: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-xl" />
      ))}
    </div>
  )
}
