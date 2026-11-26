/** İnflyasiya query/mutation-ları: seriya upsert-i və ana səhifə xülasəsi. */

import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { inflationKeys } from '../api/inflation.keys'
import { inflationService } from '../api/inflation.service'
import type {
  InflationSettingsPayload,
  InflationUpsertPayload,
} from '../model/schemas'

export function useInflationUpsert() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('inflation')
  return useMutation({
    mutationFn: (payload: InflationUpsertPayload) =>
      inflationService.upsert(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: inflationKeys.all })
      toast.success(t('form.saved'))
    },
  })
}

export function useInflationSettings() {
  return useQuery({
    queryKey: inflationKeys.settings,
    queryFn: () => inflationService.settings(),
  })
}

export function useSaveInflationSettings() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('inflation')
  return useMutation({
    mutationFn: (payload: InflationSettingsPayload) =>
      inflationService.saveSettings(payload),
    onSuccess: (saved) => {
      queryClient.setQueryData(inflationKeys.settings, saved)
      toast.success(t('settings.saved'))
    },
  })
}
