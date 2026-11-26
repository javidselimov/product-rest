'use client'

/** Səhifə başlığı — bütün view-lar eyni formanı işlədir. */
import type { ReactNode } from 'react'

type PageHeaderProps = {
  /** i18n açarından gələn başlıq. */
  title: string
  description?: string
  /** Sağ tərəfdəki əməliyyatlar (düymələr, filtrlər). */
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className="flex flex-wrap items-start justify-between gap-4 pb-6"
    >
      <div className="space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  )
}
