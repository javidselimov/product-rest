/**
 * "Sxem" view of the org chart page (spec 060, US4): the site's desktop chart for one locale, built from the admin
 * list with the public filter (`chartInputs`, FR-020). Staff and divisions are read for their active flags. A card
 * opens its form (FR-021); the list query refreshes after a save, so the chart follows.
 */

import { Tabs, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LOCALES, type Locale } from '@/entities/content/model/types'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'

import { useOrgChartLinks } from '../hooks/use-org-chart'
import { chartInputs } from '../model/chart-view'
import type { OrgChartNode } from '../model/schemas'
import { ChartPreview } from './chart-preview'

interface ChartTabProps {
  nodes: OrgChartNode[]
  locale: Locale
  onLocaleChange: (locale: Locale) => void
  onEdit: (node: OrgChartNode) => void
}

export function ChartTab({ nodes, locale, onLocaleChange, onEdit }: Readonly<ChartTabProps>) {
  const { t } = useTranslation(['organization', 'crud'])
  const links = useOrgChartLinks()
  const inputs = useMemo(() => (links.data ? chartInputs(nodes, links.data, locale) : []), [nodes, links.data, locale])

  const editById = useCallback(
    (id: number) => {
      const node = nodes.find((n) => n.id === id)
      if (node) onEdit(node)
    },
    [nodes, onEdit],
  )
  const editLabel = useCallback((name: string) => t('organization:chart.edit', { name }), [t])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={locale} onValueChange={(value) => onLocaleChange(value as Locale)}>
          <TabsList variant="line" aria-label={t('organization:chart.localeSwitch')}>
            {LOCALES.map((l) => (
              <TabsTrigger key={l} value={l}>
                {t(`crud:localeTab.${l}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <p className="text-muted-foreground text-sm">{t('organization:chart.previewHint')}</p>
      </div>

      {links.isError ? (
        <ErrorState error={links.error} onRetry={() => void links.refetch()} />
      ) : links.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : inputs.length === 0 ? (
        <EmptyState title={t('organization:chart.previewEmpty')} />
      ) : (
        <ChartPreview nodes={inputs} regionLabel={t('organization:chart.previewLabel')} onEdit={editById} label={editLabel} />
      )}
    </div>
  )
}
