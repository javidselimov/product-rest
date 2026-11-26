/**
 * İstifadəçilər: siyahı mühərrikdən, forma xüsusi (`UserForm`). Detail
 * `useCrudDetail` ilə yüklənir; forma `key` ilə sıfırlanır (B6 naxışı).
 */

import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { useCrudDetail } from '@/features/crud/hooks/use-crud'
import { UserForm } from '@/features/users/components/user-form'
import { usersModule } from '@/features/users/model/module'
import type { UserDetail } from '@/features/users/model/schemas'
import { isAppError } from '@/shared/api/types'
import { HTTP_STATUS } from '@/shared/constants/http'
import { ErrorState } from '@/shared/ui/error-state'

export function UsersPage() {
  return <CrudListPage config={usersModule} />
}

export function UserFormPage() {
  const params = useParams({ strict: false }) as { id?: string }
  const id = params.id
  const { t } = useTranslation('crud')
  const detail = useCrudDetail(usersModule, id)

  if (id !== undefined && detail.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 w-full" />
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
    <UserForm
      key={id ?? 'new'}
      id={id}
      detail={
        id !== undefined
          ? ((detail.data as UserDetail | undefined) ?? null)
          : null
      }
    />
  )
}
