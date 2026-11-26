import { toast } from '@cbar/lib-react-ui-kit/toast'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { mediaKeys } from '../api/media.keys'
import { mediaService, type MediaListParams } from '../api/media.service'

export function useMediaList(params: MediaListParams, enabled = true) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaService.list(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useMediaUpload(onProgress?: (percent: number) => void) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('media')
  return useMutation({
    mutationFn: (file: File | Blob) => mediaService.upload(file, onProgress),
    onSuccess: async (item) => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.lists })
      toast.success(t('uploaded', { name: item.originalName }))
    },
  })
}

export function useMediaDelete() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('media')
  return useMutation({
    mutationFn: (id: number) => mediaService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mediaKeys.lists })
      toast.success(t('deleted'))
    },
  })
}
