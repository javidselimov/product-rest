/**
 * Pul nişanları səhifələri — kateqoriya lookup-u ilə qapılı (`LookupGate`):
 * seçim siyahısı yüklənənə qədər siyahı/forma render olunmur (spec edge case).
 * Kateqoriyalar və xəbərlər registry route-ları ilə gedir — burada override yoxdur.
 */

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { crudKeys } from '@/features/crud/api/crud.keys'
import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { LookupGate } from '@/features/crud/components/lookup-gate'
import { useLookupOptions } from '@/features/crud/hooks/use-crud'
import {
  MONEY_MARK_CATEGORIES_ID,
  MONEY_MARK_CATEGORIES_PATH,
  buildMoneyMarksModule,
} from '@/features/money-marks/model/modules'
import { moneyMarkCategorySchema } from '@/features/money-marks/model/schemas'

function useMoneyMarksModule() {
  const queryClient = useQueryClient()
  const lookup = useLookupOptions(
    MONEY_MARK_CATEGORIES_ID,
    MONEY_MARK_CATEGORIES_PATH,
    'name',
    moneyMarkCategorySchema,
  )
  const config = useMemo(
    () => buildMoneyMarksModule(lookup.options),
    [lookup.options],
  )
  const retry = () =>
    void queryClient.invalidateQueries({
      queryKey: crudKeys(MONEY_MARK_CATEGORIES_ID).options(),
    })
  return { config, lookup, retry }
}

export function MoneyMarksPage() {
  const { config, lookup, retry } = useMoneyMarksModule()
  return (
    <LookupGate loading={lookup.isLoading} error={lookup.error} onRetry={retry}>
      <CrudListPage config={config} />
    </LookupGate>
  )
}

export function MoneyMarksFormPage() {
  const { config, lookup, retry } = useMoneyMarksModule()
  return (
    <LookupGate loading={lookup.isLoading} error={lookup.error} onRetry={retry}>
      <CrudFormPage config={config} />
    </LookupGate>
  )
}
