/**
 * Organisation → "Struktur sxemi" (spec 027, spec 060): the node tree. The public desktop chart is laid
 * out from this tree (parent, sibling order, kind, a block's "Departamentlər" choice), so there is no
 * canvas: node fields are edited in a dialog, sibling order in "Sıranı dəyiş", and "Saytda bax" opens
 * the page on the site. "Sxem" shows that chart here (US4); view and locale live in the URL.
 */

import { Button } from '@cbar/lib-react-ui-kit/button'
import { Card, CardContent } from '@cbar/lib-react-ui-kit/card'
import { GlobeIcon, PlusIcon } from '@cbar/lib-react-ui-kit/icons'
import { Skeleton } from '@cbar/lib-react-ui-kit/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@cbar/lib-react-ui-kit/tabs'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Locale } from '@/entities/content/model/types'
import { ChartTab } from '@/features/org-chart/components/chart-tab'
import { NodeFormDialog, type NodeFormTarget } from '@/features/org-chart/components/node-form-dialog'
import { NodeList } from '@/features/org-chart/components/node-list'
import { SiblingOrderDialog } from '@/features/org-chart/components/sibling-order-dialog'
import { useDeleteOrgChartNode, useOrgChart } from '@/features/org-chart/hooks/use-org-chart'
import { ORG_CHART_VIEW, SITE_CHART_PATH, type OrgChartView } from '@/features/org-chart/model/constants'
import type { OrgChartNode } from '@/features/org-chart/model/schemas'
import { nodeTitle } from '@/features/org-chart/model/tree'
import { organizationSectionTabs } from '@/features/organization/model/modules'
import { getRuntimeConfig } from '@/shared/config/runtime-config'
import { DeleteDialog } from '@/shared/ui/delete-dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionTabs } from '@/shared/ui/section-tabs'

export function OrgChartPage() {
  const { t } = useTranslation('organization')
  const chart = useOrgChart()
  const remove = useDeleteOrgChartNode()
  const [formTarget, setFormTarget] = useState<NodeFormTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrgChartNode | null>(null)
  const nodes = chart.data ?? []
  const { siteUrl } = getRuntimeConfig().urls
  const roots = nodes.filter((n) => n.parentId === null).length

  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { view?: OrgChartView; locale?: Locale }
  const view: OrgChartView = search.view === ORG_CHART_VIEW.CHART ? ORG_CHART_VIEW.CHART : ORG_CHART_VIEW.LIST
  const locale: Locale = search.locale === 'en' ? 'en' : 'az'
  /** Defaults (the list, az) stay out of the URL. */
  const setSearch = (next: { view?: OrgChartView; locale?: Locale }) => {
    const merged = { view, locale, ...next }
    void navigate({
      to: '.',
      search: (() => ({
        ...(merged.view === ORG_CHART_VIEW.LIST ? {} : { view: merged.view }),
        ...(merged.locale === 'az' ? {} : { locale: merged.locale }),
      })) as never,
      replace: true,
    })
  }
  const editNode = useCallback((node: OrgChartNode) => setFormTarget({ node }), [])

  const confirmDelete = () => {
    if (!deleteTarget) return
    remove.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('chart.deleteDialog.deleted'))
        setDeleteTarget(null)
      },
    })
  }

  return (
    <>
      <PageHeader
        title={t('chart.title')}
        description={t('chart.description')}
        actions={
          <>
            {siteUrl ? (
              <Button asChild variant="outline" colorPalette="black">
                <a href={`${siteUrl}${SITE_CHART_PATH}`} target="_blank" rel="noopener noreferrer">
                  <GlobeIcon size={16} />
                  {t('chart.viewOnSite')}
                </a>
              </Button>
            ) : null}
            {roots >= 2 ? <SiblingOrderDialog parentId={null} parentName={null} /> : null}
            <Button onClick={() => setFormTarget({ parentId: null })}>
              <PlusIcon size={16} />
              {t('chart.newNode')}
            </Button>
          </>
        }
      />
      <SectionTabs tabs={organizationSectionTabs} />

      {chart.isError ? (
        <ErrorState error={chart.error} onRetry={() => void chart.refetch()} />
      ) : chart.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : nodes.length === 0 ? (
        <EmptyState title={t('chart.empty')} />
      ) : (
        <Tabs value={view} onValueChange={(value) => setSearch({ view: value as OrgChartView })} className="gap-4">
          <TabsList aria-label={t('chart.viewSwitch')}>
            <TabsTrigger value={ORG_CHART_VIEW.LIST}>{t('chart.views.list')}</TabsTrigger>
            <TabsTrigger value={ORG_CHART_VIEW.CHART}>{t('chart.views.chart')}</TabsTrigger>
          </TabsList>
          <TabsContent value={ORG_CHART_VIEW.LIST}>
            <Card>
              <CardContent>
                <NodeList
                  nodes={nodes}
                  onAddChild={(node) => setFormTarget({ parentId: node.id })}
                  onEdit={editNode}
                  onDelete={setDeleteTarget}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value={ORG_CHART_VIEW.CHART}>
            <ChartTab nodes={nodes} locale={locale} onLocaleChange={(next) => setSearch({ locale: next })} onEdit={editNode} />
          </TabsContent>
        </Tabs>
      )}

      <NodeFormDialog target={formTarget} nodes={nodes} onClose={() => setFormTarget(null)} />
      <DeleteDialog
        open={deleteTarget !== null}
        title={t('chart.deleteDialog.title')}
        description={t('chart.deleteDialog.description', {
          name: deleteTarget ? nodeTitle(deleteTarget, 'az', t('chart.untitled')) : '',
        })}
        onConfirm={confirmDelete}
        onCancel={() => {
          remove.reset()
          setDeleteTarget(null)
        }}
        isPending={remove.isPending}
        error={remove.error}
      />
    </>
  )
}
