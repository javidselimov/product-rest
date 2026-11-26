/**
 * Qrafik kartı — server komponenti: kit `Card` + başlıq + `Chart` / boş / xəta (spec 002 FR-020).
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import type { ReactNode } from 'react'

import { hasChartData, type ChartData } from '@/features/stats/model/series'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'

import { Chart } from './chart'

type ChartCardProps = {
  title: string
  subtitle?: string
  caption?: string
  data: ChartData | null
  error?: boolean
  emptyLabel: string
  height?: number
  /** Kartın altındakı əlavə məzmun (düymələr, qutular). */
  children?: ReactNode
  className?: string
}

export function ChartCard({
  title,
  subtitle,
  caption,
  data,
  error = false,
  emptyLabel,
  height,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card data-slot="chart-card" className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorState kind="server" />
        ) : hasChartData(data) ? (
          <Chart data={data} height={height} label={title} />
        ) : (
          <EmptyState title={emptyLabel} />
        )}
        {caption ? <p className="text-muted-foreground mt-3 text-xs">{caption}</p> : null}
        {children}
      </CardContent>
    </Card>
  )
}
