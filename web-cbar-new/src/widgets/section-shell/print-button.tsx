'use client'

/**
 * Çap düyməsi (spec 024 FR-003) — `window.print()` brauzer API-si olduğu üçün client-dir.
 *
 * JS-siz işləmədiyi üçün yalnız hydration-dan sonra görünür: `useSyncExternalStore`-un
 * server snapshot-u `false`-dur, ona görə server və hydration render-i eynidir (heç nə),
 * uyğunsuzluq yoxdur (Maddə XI.4–5).
 */
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { PrinterIcon } from '@cbar/lib-react-ui-kit/icons'
import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

type PrintButtonProps = Readonly<{ label: string; className?: string }>

export function PrintButton({ label, className }: PrintButtonProps) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  if (!hydrated) return null

  return (
    <IconButton
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      className={className}
      onClick={() => window.print()}
    >
      <PrinterIcon aria-hidden="true" />
    </IconButton>
  )
}
