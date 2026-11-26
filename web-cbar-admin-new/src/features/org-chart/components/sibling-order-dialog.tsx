/**
 * "Sıranı dəyiş" for the children of one chart node (spec 060, FR-011): the generic reorder dialog over
 * `PUT /organization/chart/order`. Each move is saved at once; a failure puts the saved order back. The
 * public desktop chart and the tablet/mobile tree show siblings in this order.
 */

import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { SortIcon } from '@cbar/lib-react-ui-kit/icons'
import { useTranslation } from 'react-i18next'

import { ReorderDialog } from '@/features/crud/components/reorder-dialog'

import { orgChartKeys, orgChartService } from '../api/org-chart.service'
import { nodeTitle } from '../model/tree'

interface SiblingOrderDialogProps {
  /** Whose children are reordered; null — the roots. */
  parentId: number | null
  /** The parent's name for the button and the dialog title; null — the roots. */
  parentName: string | null
}

export function SiblingOrderDialog({ parentId, parentName }: SiblingOrderDialogProps) {
  const { t } = useTranslation('organization')
  const untitled = t('chart.untitled')
  const title = parentName === null ? t('chart.reorderRoots') : t('chart.reorderTitle', { name: parentName })
  return (
    <ReorderDialog
      title={title}
      queryKey={orgChartKeys.children(parentId)}
      load={() => orgChartService.children(parentId)}
      save={(ids) => orgChartService.reorder(parentId, ids)}
      getLabel={(node) => nodeTitle(node, 'az', untitled)}
      moduleId={orgChartKeys.all[0]}
      trigger={
        parentName === null ? undefined : (
          <IconButton size="sm" variant="ghost" colorPalette="black" aria-label={t('chart.reorder', { name: parentName })}>
            <SortIcon />
          </IconButton>
        )
      }
    />
  )
}
