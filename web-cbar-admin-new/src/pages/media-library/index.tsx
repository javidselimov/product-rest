/**
 * Media kitabxanası səhifəsi (spec FR-021, contracts/admin-api.md §5): URL
 * state `{ page, search }` (B3), yükləmə düyməsi, axtarış (debounce), kart
 * grid, silmə dialoqu. Silmə 409 (fayl məzmuna bağlıdır) dialoqu bağlayır və
 * API mesajını grid-in üstündə banner kimi göstərir — növbəti əməl banneri silir.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { SearchIcon, XIcon } from '@cbar/lib-react-ui-kit/icons'
import { Input } from '@cbar/lib-react-ui-kit/input'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MEDIA_PAGE_SIZE, type MediaItem } from '@/entities/media/model/types'
import {
  MediaGrid,
  MediaGridSkeleton,
} from '@/features/media/components/media-grid'
import { UploadButton } from '@/features/media/components/upload-button'
import { useMediaDelete, useMediaList } from '@/features/media/hooks/use-media'
import { isAppError } from '@/shared/api/types'
import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/timing'
import { useDebounced } from '@/shared/lib/debounce'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { ListPagination } from '@/shared/ui/list-pagination'
import { PageHeader } from '@/shared/ui/page-header'

/** URL search state — route `validateSearch` `{ page?, search? }` verir (B3). */
function useMediaUrlState() {
  const raw = useSearch({ strict: false }) as Record<string, unknown>
  const navigate = useNavigate()
  const patch = (changes: Record<string, unknown>) =>
    void navigate({
      to: '.',
      search: ((prev: Record<string, unknown>) => {
        const next: Record<string, unknown> = { ...prev, ...changes }
        for (const key of Object.keys(next)) {
          if (next[key] === undefined || next[key] === '') delete next[key]
        }
        return next
      }) as never,
      replace: true,
    })
  return {
    page: typeof raw.page === 'number' && raw.page >= 1 ? raw.page : 1,
    search: typeof raw.search === 'string' ? raw.search : '',
    setPage: (page: number) => patch({ page: page > 1 ? page : undefined }),
    setSearch: (search: string) =>
      patch({ search: search || undefined, page: undefined }),
  }
}

export function MediaLibraryPage() {
  const { t } = useTranslation('media')
  const url = useMediaUrlState()

  const [searchText, setSearchText] = useState(url.search)
  const debouncedSearch = useDebounced(searchText, SEARCH_DEBOUNCE_MS)
  useEffect(() => {
    if (debouncedSearch !== url.search) url.setSearch(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const list = useMediaList({ page: url.page, search: url.search || undefined })
  const remove = useMediaDelete()
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  const items = list.data?.items ?? []
  const total = list.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE))

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={<UploadButton />}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Input
            aria-label={t('search')}
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => {
              setBanner(null)
              setSearchText(e.target.value)
            }}
            startElement={<SearchIcon size={16} />}
            className="max-w-sm"
          />
          {list.isFetching && !list.isPending ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Spinner className="size-4" />
              {t('refreshing')}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {banner ? (
        <Alert variant="surface" colorPalette="red" className="items-center">
          <AlertDescription className="flex-1">{banner}</AlertDescription>
          <IconButton
            size="sm"
            variant="ghost"
            colorPalette="red"
            aria-label={t('dismiss')}
            onClick={() => setBanner(null)}
          >
            <XIcon />
          </IconButton>
        </Alert>
      ) : null}

      {list.isPending ? (
        <MediaGridSkeleton />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyHint')} />
      ) : (
        <MediaGrid
          items={items}
          onDelete={(item) => {
            setBanner(null)
            remove.reset()
            setDeleteTarget(item)
          }}
        />
      )}

      {total > 0 ? (
        <ListPagination
          page={url.page}
          pageCount={pageCount}
          total={total}
          onPageChange={url.setPage}
        />
      ) : null}

      <DeleteDialog
        open={deleteTarget !== null}
        title={t('deleteTitle')}
        description={
          deleteTarget
            ? t('deleteConfirm', { name: deleteTarget.originalName })
            : ''
        }
        isPending={remove.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          remove.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
            // 409 (fayl məzmuna bağlıdır) və digər xətalar: dialoq bağlanır, mesaj bannerdə.
            onError: (error) => {
              setDeleteTarget(null)
              setBanner(isAppError(error) ? error.message : t('deleteFailed'))
            },
          })
        }}
      />
    </>
  )
}
