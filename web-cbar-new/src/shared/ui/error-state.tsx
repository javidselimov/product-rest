'use client'

/**
 * Sorğunun `error` vəziyyəti (konstitusiya Maddə VII.4).
 *
 * Yalnız i18n mətni göstərilir — stack trace və daxili ünvan heç vaxt
 * istifadəçiyə çatmır (Maddə VII.3). `kind` verilərsə mesaj `errors:*`
 * namespace-indən avtomatik seçilir.
 */
import { Alert, AlertDescription, AlertTitle } from '@cbar/lib-react-ui-kit/alert'
import { Button } from '@cbar/lib-react-ui-kit/button'
import { useTranslation } from 'react-i18next'

import type { AppErrorKind } from '@/shared/api/app-error'

type ErrorStateProps = {
  /** Verilməzsə `kind`-ə görə i18n başlığı seçilir. */
  title?: string
  description?: string
  kind?: AppErrorKind
  /** Verilərsə «yenidən cəhd» düyməsi göstərilir. */
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

const KIND_KEY: Record<AppErrorKind, string> = {
  validation: 'errors:loadError',
  auth: 'errors:loadError',
  forbidden: 'errors:loadError',
  notFound: 'errors:notFound.title',
  server: 'errors:server',
  network: 'errors:network',
  schema: 'errors:contract',
  unknown: 'errors:unexpected',
}

export function ErrorState({
  title,
  description,
  kind,
  onRetry,
  retryLabel,
  className,
}: ErrorStateProps) {
  const { t } = useTranslation(['errors', 'common'])
  const heading = title ?? t(kind ? KIND_KEY[kind] : 'errors:loadError')

  return (
    <Alert data-slot="error-state" variant="subtle" colorPalette="red" className={className}>
      <AlertTitle>{heading}</AlertTitle>
      {description ? <AlertDescription>{description}</AlertDescription> : null}
      {onRetry ? (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel ?? t('common:actions.retry')}
          </Button>
        </div>
      ) : null}
    </Alert>
  )
}
