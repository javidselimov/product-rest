/**
 * Release schedule pages (spec 039). The item form's group and periodicity choices sit behind
 * `LookupGate`, as on the CSR pages. The groups and periodicities sections are registry routes
 * with no page file.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crudKeys } from '@/features/crud/api/crud.keys'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { useLookupOptions } from '@/features/crud/hooks/use-crud'
import {
  buildReleaseScheduleItemsModule,
  releaseScheduleGroupsModule,
  releaseSchedulePeriodicitiesModule,
} from '@/features/release-schedule/model/module'
import {
  releaseScheduleGroupRowSchema,
  releaseSchedulePeriodicityRowSchema,
} from '@/features/release-schedule/model/schemas'

function useReleaseScheduleItemsModule() {
  const queryClient = useQueryClient()
  const groups = useLookupOptions(
    releaseScheduleGroupsModule.id,
    releaseScheduleGroupsModule.apiPath,
    'name',
    releaseScheduleGroupRowSchema,
  )
  const periodicities = useLookupOptions(
    releaseSchedulePeriodicitiesModule.id,
    releaseSchedulePeriodicitiesModule.apiPath,
    'name',
    releaseSchedulePeriodicityRowSchema,
  )

  const config = useMemo(
    () => buildReleaseScheduleItemsModule(groups.options, periodicities.options),
    [groups.options, periodicities.options],
  )
  const retry = () => {
    for (const id of [releaseScheduleGroupsModule.id, releaseSchedulePeriodicitiesModule.id]) {
      void queryClient.invalidateQueries({ queryKey: crudKeys(id).options() })
    }
  }
  const failed = groups.isError ? groups.error : periodicities.isError ? periodicities.error : undefined

  return {
    config,
    retry,
    isLoading: groups.isLoading || periodicities.isLoading,
    error: failed ?? undefined,
  }
}

export function ReleaseScheduleItemsPage() {
  const { config, isLoading, error, retry } = useReleaseScheduleItemsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function ReleaseScheduleItemsFormPage() {
  const { config, isLoading, error, retry } = useReleaseScheduleItemsModule()
  return (
    <LookupGate loading={isLoading} error={error} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
