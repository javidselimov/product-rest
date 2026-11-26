'use client'

/**
 * Route səviyyəli `loading.tsx` / `error.tsx` üçün ortaq gövdə.
 *
 * Bunlar per-query vəziyyətləri **əvəz etmir, tamamlayır** (konstitusiya
 * Maddə VII.4): səhifə seqmenti hazırlananda görünür, data yüklənəndə isə
 * hər sorğu öz `loading` / `empty` / `error` vəziyyətini özü göstərir.
 */
import { useTranslation } from 'react-i18next'

import { ErrorState } from './error-state'
import { LoadingState } from './loading-state'

export function RouteLoading() {
  const { t } = useTranslation(['common'])

  return <LoadingState label={t('common:states.loading')} />
}

export function RouteError({ reset }: { reset: () => void }) {
  const { t } = useTranslation(['common'])

  return (
    <ErrorState
      title={t('common:states.error')}
      onRetry={reset}
      retryLabel={t('common:actions.retry')}
    />
  )
}
