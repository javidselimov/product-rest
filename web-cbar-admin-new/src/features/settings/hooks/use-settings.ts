import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { settingsKeys } from '../api/settings.keys'
import { settingsService } from '../api/settings.service'

export function useSettingsList() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => settingsService.list(),
  })
}

/** Upsert: uğurda siyahı invalidasiya olunur; toast çağıran komponentdədir. */
export function useSettingSave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      settingsService.put(key, { value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}
