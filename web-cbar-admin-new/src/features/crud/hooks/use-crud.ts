/**
 * CRUD query/mutation hook-ları (B1, B8). Uğurlu save/delete → `[config.id]`
 * invalidasiyası (siyahı + detail + lookup), toast, siyahıya qayıdış.
 */

import { toast } from '@cbar/lib-react-ui-kit/toast'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ZodType } from 'zod'

import {
  firstTranslation,
  type SelectOption,
} from '@/entities/content/model/types'
import { DETAIL_STALE_MS } from '@/shared/constants/timing'
import type { AnyRow, ListParams, ModuleConfig } from '@/shared/crud/types'
import { crudKeys } from '../api/crud.keys'
import { crudService } from '../api/crud.service'

export function useCrudList<Row extends AnyRow>(
  config: ModuleConfig<Row, string>,
  params: ListParams,
) {
  return useQuery({
    queryKey: crudKeys(config.id).list(params),
    queryFn: () => crudService.list(config, params),
    placeholderData: keepPreviousData,
  })
}

export function useCrudDetail<Row extends AnyRow>(
  config: ModuleConfig<Row, string>,
  id: string | undefined,
) {
  return useQuery({
    queryKey: crudKeys(config.id).detail(id ?? 'new'),
    queryFn: () => crudService.detail(config, id!),
    enabled: id !== undefined,
  })
}

/** Mutation key of a module's form save: the form's leave guard asks whether one is running. */
export const crudSaveKey = (moduleId: string) => [moduleId, 'save'] as const

export function useCrudSave<Row extends AnyRow>(
  config: ModuleConfig<Row, string>,
  id: string | undefined,
) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { t } = useTranslation('crud')
  return useMutation({
    mutationKey: crudSaveKey(config.id),
    mutationFn: (payload: unknown) =>
      id === undefined
        ? crudService.create(config, payload)
        : crudService.update(config, id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: crudKeys(config.id).all })
      toast.success(id === undefined ? t('created') : t('saved'))
      router.history.push(config.basePath)
    },
  })
}

export function useCrudDelete<Row extends AnyRow>(
  config: ModuleConfig<Row, string>,
) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('crud')
  return useMutation({
    mutationFn: (row: Row) => crudService.remove(config, row),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: crudKeys(config.id).all })
      toast.success(t('deleted'))
    },
  })
}

/**
 * Lookup seçimləri: etiket `translations.az.name ?? translations.en.name ?? #id`.
 * Açar `[moduleId, 'options']` — modulun invalidasiyası seçimləri də yeniləyir.
 */
export function useLookupOptions(
  moduleId: string,
  path: string,
  nameKey = 'name',
  schema?: ZodType<AnyRow>,
) {
  const query = useQuery({
    queryKey: crudKeys(moduleId).options(),
    queryFn: () => crudService.lookup(path, schema),
    staleTime: DETAIL_STALE_MS,
  })
  const options = useMemo<SelectOption[]>(
    () =>
      (query.data ?? []).map((item) => {
        const translations = item.translations as
          Record<string, Record<string, unknown>> | undefined
        const label = firstTranslation(translations, nameKey)
        return {
          value: item.id as string | number,
          label: label === '—' ? `#${String(item.id)}` : label,
        }
      }),
    [query.data, nameKey],
  )
  return {
    options,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}
