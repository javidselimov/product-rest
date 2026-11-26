/**
 * Qanunlar səhifələri: kateqoriya seçimləri lookup-dan gəlir, ona görə siyahı
 * və forma `LookupGate` arxasındadır. Kateqoriyalar bölməsi registry route-u
 * ilə işləyir — ayrıca səhifə faylı yoxdur.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crudKeys } from '@/features/crud/api/crud.keys'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { useLookupOptions } from '@/features/crud/hooks/use-crud'
import {
  buildLawsModule,
  lawCategoriesModule,
} from '@/features/laws/model/module'
import { lawCategorySchema } from '@/features/laws/model/schemas'

/**
 * Seçimlər kateqoriya modulunun açarı altındadır (`['law-categories','options']`)
 * ki, kateqoriya yaradılanda/silinəndə B1 invalidasiyası onları da yeniləsin.
 */
function useLawsModule() {
  const queryClient = useQueryClient()
  const lookup = useLookupOptions(
    lawCategoriesModule.id,
    lawCategoriesModule.apiPath,
    'name',
    lawCategorySchema,
  )
  const config = useMemo(
    () => buildLawsModule(lookup.options),
    [lookup.options],
  )
  const retry = () =>
    void queryClient.invalidateQueries({
      queryKey: crudKeys(lawCategoriesModule.id).options(),
    })
  return { ...lookup, config, retry }
}

export function LawsPage() {
  const { config, isLoading, isError, error, retry } = useLawsModule()
  return (
    <LookupGate
      loading={isLoading}
      error={isError ? error : undefined}
      onRetry={retry}
    >
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function LawsFormPage() {
  const { config, isLoading, isError, error, retry } = useLawsModule()
  return (
    <LookupGate
      loading={isLoading}
      error={isError ? error : undefined}
      onRetry={retry}
    >
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
