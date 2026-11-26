'use client'

/**
 * Sorğunun `loading` vəziyyəti (konstitusiya Maddə VII.4).
 *
 * Route səviyyəli `loading.tsx` bunu **əvəz etmir, tamamlayır** — hər sorğu öz
 * vəziyyətini özü göstərir.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { Spinner } from '@cbar/lib-react-ui-kit/spinner'

type LoadingStateProps = {
  /** Ekran oxuyucusuna və gözə görünən mətn — i18n açarından gəlir. */
  label: string
  className?: string
}

export function LoadingState({ label, className }: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      className={cn('flex min-h-40 flex-col items-center justify-center gap-3', className)}
    >
      <Spinner label={label} />
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  )
}
