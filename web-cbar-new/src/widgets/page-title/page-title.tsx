/**
 * Səhifə başlığı bloku — server komponenti (kit `PageHeader` client-dir və `t` prop-la gəlir).
 */
import type { ReactNode } from 'react'

type PageTitleProps = {
  title: string
  description?: string | null
  actions?: ReactNode
}

export function PageTitle({ title, description, actions }: PageTitleProps) {
  return (
    <header data-slot="page-title" className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
