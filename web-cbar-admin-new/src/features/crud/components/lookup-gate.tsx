import { Spinner } from '@cbar/lib-react-ui-kit/spinner'
import type { ReactNode } from 'react'

import { ErrorState } from '@/shared/ui/error-state'

interface LookupGateProps {
  loading: boolean
  error?: unknown
  onRetry?: () => void
  children: ReactNode
}

/** Asılı seçim siyahıları yüklənənə qədər ekranı bağlayır (spec edge case). */
export function LookupGate({
  loading,
  error,
  onRetry,
  children,
}: LookupGateProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-6" />
      </div>
    )
  }
  if (error)
    return (
      <ErrorState
        error={error}
        onRetry={onRetry ?? (() => window.location.reload())}
      />
    )
  return children
}
