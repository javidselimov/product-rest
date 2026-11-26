/**
 * CSR project pages (spec 038). The form's category choices sit behind `LookupGate`, as on the
 * events pages. The categories section is a registry route with no page file.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crudKeys } from '@/features/crud/api/crud.keys'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { useLookupOptions } from '@/features/crud/hooks/use-crud'
import {
  buildCsrProjectsModule,
  csrCategoriesModule,
} from '@/features/csr-projects/model/module'
import { csrCategoryRowSchema } from '@/features/csr-projects/model/schemas'

function useCsrProjectsModule() {
  const queryClient = useQueryClient()
  const categories = useLookupOptions(
    csrCategoriesModule.id,
    csrCategoriesModule.apiPath,
    'name',
    csrCategoryRowSchema,
  )

  const config = useMemo(
    () => buildCsrProjectsModule(categories.options),
    [categories.options],
  )
  const retry = () => {
    void queryClient.invalidateQueries({
      queryKey: crudKeys(csrCategoriesModule.id).options(),
    })
  }

  return {
    config,
    retry,
    isLoading: categories.isLoading,
    error: categories.isError ? categories.error : undefined,
  }
}

export function CsrProjectsPage() {
  const { config, isLoading, error, retry } = useCsrProjectsModule()
  return (
    <LookupGate loading={isLoading} error={error ?? undefined} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function CsrProjectsFormPage() {
  const { config, isLoading, error, retry } = useCsrProjectsModule()
  return (
    <LookupGate loading={isLoading} error={error ?? undefined} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
