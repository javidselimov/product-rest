import { toast } from '@cbar/lib-react-ui-kit/toast'
import { QueryCache, QueryClient } from '@tanstack/react-query'

import { isAppError } from '@/shared/api/types'
import { QUERY_STALE_MS } from '@/shared/constants/timing'
import { i18n } from '@/shared/i18n'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Yalnız BACKGROUND xətaları toast olur (guideline §15): ekranda artıq data
    // varsa və yeniləmə uğursuzdursa. İlk yükləmə xətasını səhifənin öz error
    // state-i göstərir — dublikat toast atılmır.
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        toast.error(
          isAppError(error)
            ? error.message
            : i18n.t('errors.unexpected', { ns: 'common' }),
        )
      }
    },
  }),
  defaultOptions: {
    queries: {
      // Test rejimində retry deterministik olsun deyə sönülüdür.
      retry: import.meta.env.MODE === 'test' ? false : 1,
      staleTime: QUERY_STALE_MS,
      refetchOnWindowFocus: false,
    },
  },
})
