/** The FinCERT settings record (spec 053): the query and the save; a save refreshes the stored record in the cache. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fincertKeys } from '../api/fincert.keys'
import { fincertService } from '../api/fincert.service'
import type { FincertSettingsUpdate } from '../model/schemas'

export function useFincertSettings() {
  return useQuery({ queryKey: fincertKeys.settings(), queryFn: fincertService.settings })
}

export function useSaveFincertSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: FincertSettingsUpdate) => fincertService.saveSettings(body),
    onSuccess: (saved) => queryClient.setQueryData(fincertKeys.settings(), saved),
  })
}
