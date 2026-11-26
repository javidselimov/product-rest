/**
 * Məzənnə query/mutation hook-ları. Vərəq və tarix siyahısı `currencyKeys.rates`
 * kökü ilə birlikdə yenilənir; valyuta master-i ayrıca.
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { isAppError } from '@/shared/api/types'
import { DETAIL_STALE_MS } from '@/shared/constants/timing'
import { currencyKeys } from '../api/currency.keys'
import { currencyService } from '../api/currency.service'
import type {
  CurrencyEdit,
  ImportSheetPayload,
  PutSheetPayload,
} from '../model/schemas'

export function useSheet(date: string) {
  return useQuery({
    queryKey: currencyKeys.sheet(date),
    queryFn: () => currencyService.sheet(date || undefined),
    placeholderData: keepPreviousData,
  })
}

export function useSheetDates(page: number, enabled = true) {
  return useQuery({
    queryKey: currencyKeys.dates(page),
    queryFn: () => currencyService.dates(page),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useCurrencies() {
  return useQuery({
    queryKey: currencyKeys.master,
    queryFn: () => currencyService.currencies(),
    staleTime: DETAIL_STALE_MS,
  })
}

export function useSaveSheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PutSheetPayload) => currencyService.putSheet(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: currencyKeys.rates }),
  })
}

export function useImportSheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ImportSheetPayload) =>
      currencyService.importSheet(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: currencyKeys.rates }),
  })
}

export function useDeleteSheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (date: string) => currencyService.deleteSheet(date),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: currencyKeys.rates }),
  })
}

export interface CurrencySaveEntry {
  code: string
  body: CurrencyEdit
}

export interface CurrencySaveResult {
  saved: string[]
  failed: { code: string; message: string }[]
}

/**
 * Dirty valyutaları ARDICIL `PUT /currencies/{code}` ilə saxlayır: uğursuz olanlar
 * nəticədə `failed` kimi qayıdır (komponent onları dirty saxlayır), ən azı biri
 * uğurludursa master yenilənir.
 */
export function useSaveCurrencies() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('common')
  return useMutation({
    mutationFn: async (
      entries: CurrencySaveEntry[],
    ): Promise<CurrencySaveResult> => {
      const saved: string[] = []
      const failed: CurrencySaveResult['failed'] = []
      for (const entry of entries) {
        try {
          await currencyService.putCurrency(entry.code, entry.body)
          saved.push(entry.code)
        } catch (error) {
          failed.push({
            code: entry.code,
            message: isAppError(error) ? error.message : t('errors.unexpected'),
          })
        }
      }
      return { saved, failed }
    },
    onSuccess: async ({ saved }) => {
      if (saved.length > 0) {
        await queryClient.invalidateQueries({ queryKey: currencyKeys.master })
      }
    },
  })
}
