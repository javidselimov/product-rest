/**
 * The chart as an indented list (spec 027, spec 060): the tree the public site lays the desktop chart
 * out from and the order tablet and mobile stack the cards in. A card with two or more children has
 * "Sıranı dəyiş" for them; the parent and everything else is picked in the form.
 */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { EditIcon, PlusIcon, TrashIcon } from '@cbar/lib-react-ui-kit/icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { NODE_LIST_INDENT } from '../model/constants'
import type { OrgChartNode } from '../model/schemas'
import { flattenChart, nodeTitle } from '../model/tree'
import { SiblingOrderDialog } from './sibling-order-dialog'

interface NodeListProps {
  nodes: OrgChartNode[]
  onAddChild: (node: OrgChartNode) => void
  onEdit: (node: OrgChartNode) => void
  onDelete: (node: OrgChartNode) => void
}

export function NodeList({ nodes, onAddChild, onEdit, onDelete }: NodeListProps) {
  const { t } = useTranslation('organization')
  const untitled = t('chart.untitled')
  const childCount = useMemo(() => {
    const counts = new Map<number, number>()
    for (const n of nodes) if (n.parentId !== null) counts.set(n.parentId, (counts.get(n.parentId) ?? 0) + 1)
    return counts
  }, [nodes])

  return (
    <ul className="divide-border flex flex-col divide-y" aria-label={t('chart.listLabel')}>
      {flattenChart(nodes).map(({ node, depth }) => {
        const name = nodeTitle(node, 'az', untitled)
        return (
          <li
            key={node.id}
            className="flex items-center gap-2 py-2 pr-2"
            style={{ paddingLeft: NODE_LIST_INDENT.BASE + depth * NODE_LIST_INDENT.PER_DEPTH }}
          >
            <button
              type="button"
              className="hover:text-primary focus-visible:ring-ring min-w-0 flex-1 rounded-xs text-left focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => onEdit(node)}
            >
              <span className="text-foreground block truncate text-sm font-medium">
                {name}
                {node.curatorDirect ? ' *' : ''}
              </span>
              <span className="text-muted-foreground block truncate text-xs">{t(`chart.kinds.${node.kind}`)}</span>
            </button>
            {!node.isActive ? (
              <Badge size="sm" variant="subtle" colorPalette="black">
                {t('chart.inactive')}
              </Badge>
            ) : null}
            {node.departmentsOpen ? (
              <Badge size="sm" variant="subtle" colorPalette="black">
                {t('chart.departmentsOpenBadge')}
              </Badge>
            ) : null}
            {(childCount.get(node.id) ?? 0) >= 2 ? <SiblingOrderDialog parentId={node.id} parentName={name} /> : null}
            <IconButton size="sm" variant="ghost" colorPalette="black" aria-label={t('chart.addChild', { name })} onClick={() => onAddChild(node)}>
              <PlusIcon />
            </IconButton>
            <IconButton size="sm" variant="ghost" colorPalette="black" aria-label={t('chart.edit', { name })} onClick={() => onEdit(node)}>
              <EditIcon />
            </IconButton>
            <IconButton size="sm" variant="ghost" colorPalette="red" aria-label={t('chart.delete', { name })} onClick={() => onDelete(node)}>
              <TrashIcon />
            </IconButton>
          </li>
        )
      })}
    </ul>
  )
}
