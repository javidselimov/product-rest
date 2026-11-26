import { Button } from '@cbar/lib-react-ui-kit/button'
import { PlusIcon } from '@cbar/lib-react-ui-kit/icons'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import {
  useNavigate,
  useParams,
  useRouter,
  useSearch,
} from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, type Locale } from '@/entities/content/model/types'
import { DeletePageDialog } from '@/features/pages/components/delete-page-dialog'
import { MoveDialog } from '@/features/pages/components/move-dialog'
import { PageForm } from '@/features/pages/components/page-form'
import { PageTree } from '@/features/pages/components/page-tree'
import { usePageDetail, usePagesTree } from '@/features/pages/hooks/use-pages'
import type { PageNode } from '@/features/pages/model/schemas'
import { isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'

/** Səhifə ağacı (spec FR-029). Locale URL search-dədir (`?locale=en`). */
export function PagesPage() {
  const { t } = useTranslation(['pages', 'crud'])
  const router = useRouter()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { locale?: Locale }
  const locale: Locale = search.locale === 'en' ? 'en' : 'az'
  const tree = usePagesTree(locale)
  const [moveTarget, setMoveTarget] = useState<PageNode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PageNode | null>(null)

  return (
    <>
      <PageHeader
        title={t('pages:title')}
        description={t('pages:description')}
        actions={
          <Button onClick={() => router.history.push('/pages/new')}>
            <PlusIcon size={16} />
            {t('pages:newPage')}
          </Button>
        }
      />

      <Tabs
        value={locale}
        onValueChange={(value) =>
          void navigate({
            to: '.',
            search: (() => (value === 'az' ? {} : { locale: value })) as never,
            replace: true,
          })
        }
      >
        <TabsList variant="line" aria-label={t('pages:localeSwitch')}>
          {LOCALES.map((l) => (
            <TabsTrigger key={l} value={l}>
              {t(`crud:localeTab.${l}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tree.isError ? (
        <ErrorState error={tree.error} onRetry={() => void tree.refetch()} />
      ) : (
        <PageTree
          nodes={tree.data ?? []}
          loading={tree.isPending}
          onAddChild={(node) =>
            router.history.push(`/pages/new?parentId=${node.id}`)
          }
          onEdit={(node) => router.history.push(`/pages/${node.id}`)}
          onMove={setMoveTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {moveTarget ? (
        <MoveDialog
          node={moveTarget}
          tree={tree.data ?? []}
          onClose={() => setMoveTarget(null)}
        />
      ) : null}
      <DeletePageDialog
        node={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  )
}

/** Yeni səhifə (`?parentId=`) və redaktə (`/pages/$id`). */
export function PageFormPage() {
  const { t } = useTranslation('crud')
  const params = useParams({ strict: false }) as { id?: string }
  const search = useSearch({ strict: false }) as { parentId?: number }
  const id = params.id
  const detail = usePageDetail(id)

  if (id !== undefined && detail.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }
  if (id !== undefined && detail.isError) {
    const error: unknown = detail.error
    const notFound = isAppError(error) && error.status === HTTP_STATUS.NOT_FOUND
    return (
      <ErrorState
        error={notFound ? { message: t('notFound') } : error}
        onRetry={() => void detail.refetch()}
      />
    )
  }
  return (
    <PageForm
      key={id ?? 'new'}
      id={id}
      detail={id !== undefined ? (detail.data ?? null) : null}
      parentId={typeof search.parentId === 'number' ? search.parentId : null}
    />
  )
}
