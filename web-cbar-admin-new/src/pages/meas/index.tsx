/**
 * MEAS sənədləri səhifələri: emitent və məlumat tipi seçimləri iki lookup-dan
 * gəlir — hər ikisi yüklənənə qədər `LookupGate` ekranı bağlayır. Emitentlər və
 * məlumat tipləri bölmələri registry route-u ilə işləyir.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crudKeys } from '@/features/crud/api/crud.keys'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { useLookupOptions } from '@/features/crud/hooks/use-crud'
import {
  buildMeasDocumentsModule,
  measEmitentsModule,
  measInfoTypesModule,
} from '@/features/meas/model/module'
import { measLookupSchema } from '@/features/meas/model/schemas'

/** Seçimlər lookup modullarının açarı altındadır — B1 invalidasiyası onları da yeniləyir. */
function useMeasDocumentsModule() {
  const queryClient = useQueryClient()
  const emitents = useLookupOptions(
    measEmitentsModule.id,
    measEmitentsModule.apiPath,
    'name',
    measLookupSchema,
  )
  const infoTypes = useLookupOptions(
    measInfoTypesModule.id,
    measInfoTypesModule.apiPath,
    'name',
    measLookupSchema,
  )
  const config = useMemo(
    () => buildMeasDocumentsModule(emitents.options, infoTypes.options),
    [emitents.options, infoTypes.options],
  )
  const retry = () => {
    void queryClient.invalidateQueries({
      queryKey: crudKeys(measEmitentsModule.id).options(),
    })
    void queryClient.invalidateQueries({
      queryKey: crudKeys(measInfoTypesModule.id).options(),
    })
  }
  return {
    config,
    isLoading: emitents.isLoading || infoTypes.isLoading,
    error: emitents.isError
      ? emitents.error
      : infoTypes.isError
        ? infoTypes.error
        : undefined,
    retry,
  }
}

export function MeasDocumentsPage() {
  const { config, isLoading, error, retry } = useMeasDocumentsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function MeasDocumentsFormPage() {
  const { config, isLoading, error, retry } = useMeasDocumentsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
