/** AZIR mutations: upsert (toast) and the Excel import; both invalidate the module root (`['azir']`). */

import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { azirKeys } from '../api/azir.keys'
import { azirService } from '../api/azir.service'
import type { AzirImportPayload, AzirUpsertPayload } from '../model/schemas'

/** No toast: the dialog shows the written values itself (spec 058 FR-015). */
export function useAzirImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AzirImportPayload) => azirService.importFile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: azirKeys.all }),
  })
}

export function useAzirUpsert() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('azir')
  return useMutation({
    mutationFn: (payload: AzirUpsertPayload) => azirService.upsert(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: azirKeys.all })
      toast.success(t('form.saved'))
    },
  })
}
