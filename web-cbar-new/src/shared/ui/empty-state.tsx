'use client'

/** Sorğunun `empty` vəziyyəti (konstitusiya Maddə VII.4). */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  /** i18n açarından gələn mətn — burada hardcoded string yoxdur. */
  title: string
  description?: string
  /** İstəyə bağlı əməliyyat (məs. «Yeni layihə» düyməsi). */
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn('border-border flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center', className)}
    >
      <p className="text-foreground text-sm font-medium">{title}</p>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
