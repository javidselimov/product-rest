/**
 * Səhifə ağacı (research R12): kit `DataTable` düzləşdirilmiş sətirlərlə —
 * girinti, başlıq + slug, status/qeyri-aktiv/gizli nişanları, sətir əməlləri
 * bayraqlara görə aktiv/qeyri-aktiv. Qonşular arasında sıra tutacaqdan
 * sürükləyib-buraxmaqla dəyişir (HTML5 DnD — kit `DataTable` sətirə ref
 * vermir, yalnız `onRow` atributları); valideyn dəyişmək Köçür dialoqundadır,
 * klaviatura ilə sıralama da oradan (sıra sahəsi).
 */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  MoveIcon,
  PlusIcon,
  TrashIcon,
} from '@cbar/lib-react-ui-kit/icons'
import { toast } from '@cbar/lib-react-ui-kit/toast'
import { useCallback, useMemo, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
} from '@/entities/content/model/types'
import { isAppError } from '@/shared/api/types'
import { useReorderPages } from '../hooks/use-pages'
import { COLUMN_WIDTH, TREE_INDENT_REM, TREE_MIN_WIDTH } from '../model/constants'
import type { PageNode } from '../model/schemas'
import {
  canMove,
  canReorder,
  flattenTree,
  planReorder,
  siblingsOf,
  type DropPosition,
  type FlatPage,
} from '../model/tree'
import { GripIcon } from '@/shared/ui/grip-icon'

/** Sətrin yuxarı yarısı → əvvəlinə, aşağı yarısı → sonrasına. */
const dropPosition = (event: DragEvent<HTMLElement>): DropPosition => {
  const rect = event.currentTarget.getBoundingClientRect()
  return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

interface PageTreeProps {
  nodes: PageNode[]
  loading?: boolean
  onAddChild: (node: PageNode) => void
  onEdit: (node: PageNode) => void
  onMove: (node: PageNode) => void
  onDelete: (node: PageNode) => void
}

export function PageTree({
  nodes,
  loading,
  onAddChild,
  onEdit,
  onMove,
  onDelete,
}: PageTreeProps) {
  const { t } = useTranslation(['pages', 'common'])
  // Açılmış düyünlər; default hamısı yığılıdır (yalnız kök səhifələr görünür).
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set())
  const rows = useMemo(() => flattenTree(nodes, expanded), [nodes, expanded])
  const label = (node: PageNode) => node.title ?? t('untitled')
  const toggle = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const reorder = useReorderPages()
  const [dragged, setDragged] = useState<PageNode | null>(null)
  const [dropTarget, setDropTarget] = useState<{
    id: number
    position: DropPosition
  } | null>(null)

  const endDrag = () => {
    setDragged(null)
    setDropTarget(null)
  }

  /** Yalnız eyni valideynin başqa uşağı buraxma hədəfidir. */
  const isDropTarget = (node: PageNode) =>
    dragged !== null &&
    node.id !== dragged.id &&
    node.parentId === dragged.parentId

  const drop = (target: PageNode, position: DropPosition) => {
    const source = dragged
    endDrag()
    if (!source) return
    const updates = planReorder(
      siblingsOf(nodes, source),
      source,
      target,
      position,
    )
    if (updates.length === 0) return
    const locked = updates.find((u) => !canReorder(u.node))
    if (locked) {
      toast.error(t('reorder.locked', { name: label(locked.node) }))
      return
    }
    reorder.mutate(updates, {
      onSuccess: () => toast.success(t('reorder.done')),
      onError: (error) =>
        toast.error(
          isAppError(error) ? error.message : t('common:errors.unexpected'),
        ),
    })
  }

  const onRow = (row: FlatPage) => ({
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!isDropTarget(row.node)) {
        if (dropTarget) setDropTarget(null)
        return
      }
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      const position = dropPosition(event)
      if (dropTarget?.id !== row.node.id || dropTarget.position !== position)
        setDropTarget({ id: row.node.id, position })
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      if (!isDropTarget(row.node)) return
      event.preventDefault()
      drop(row.node, dropPosition(event))
    },
  })

  const rowClassName = (row: FlatPage) => {
    if (dragged?.id === row.node.id) return 'opacity-50'
    if (dropTarget?.id !== row.node.id) return ''
    return dropTarget.position === 'before'
      ? '[&>td]:border-t-2 [&>td]:border-t-primary'
      : '[&>td]:border-b-2 [&>td]:border-b-primary'
  }

  const columns = useMemo<DataTableColumn<FlatPage>[]>(
    () => [
      {
        key: 'title',
        title: t('columns.title'),
        render: (_v, row) => {
          const isCollapsed = !expanded.has(row.node.id)
          const draggable =
            canReorder(row.node) &&
            siblingsOf(nodes, row.node).length > 1 &&
            !reorder.isPending
          return (
            <div
              className="flex min-w-0 items-center gap-1"
              style={{ paddingLeft: `${row.depth * TREE_INDENT_REM}rem` }}
            >
              {draggable ? (
                // Siçan tutacağı; klaviatura ilə sıra Köçür dialoqundadır.
                <span
                  draggable
                  aria-hidden
                  title={t('actions.drag', { name: label(row.node) })}
                  className="text-muted-foreground hover:text-foreground flex size-6 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData(
                      'text/plain',
                      String(row.node.id),
                    )
                    setDragged(row.node)
                  }}
                  onDragEnd={endDrag}
                >
                  <GripIcon size={16} />
                </span>
              ) : (
                <span className="size-6 shrink-0" />
              )}
              {row.node.children.length > 0 ? (
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorPalette="black"
                  className="shrink-0"
                  aria-expanded={!isCollapsed}
                  aria-label={t(
                    isCollapsed ? 'actions.expand' : 'actions.collapse',
                    { name: label(row.node) },
                  )}
                  onClick={() => toggle(row.node.id)}
                >
                  {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                </IconButton>
              ) : (
                <span className="size-8 shrink-0" />
              )}
              <span className="min-w-0">
                <span className="text-foreground block truncate text-sm font-medium">
                  {label(row.node)}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {row.node.slug ?? '—'}
                </span>
              </span>
            </div>
          )
        },
      },
      {
        key: 'navUrl',
        title: t('columns.navUrl'),
        width: COLUMN_WIDTH.NAV_URL,
        ellipsis: true,
        render: (_v, row) => row.node.navUrl ?? '—',
      },
      {
        key: 'flags',
        title: t('columns.status'),
        width: COLUMN_WIDTH.STATUS,
        render: (_v, row) => (
          <div className="flex flex-wrap gap-1">
            <Badge
              size="sm"
              variant="subtle"
              colorPalette={STATUS_PALETTE[row.node.status] ?? 'black'}
            >
              {t(STATUS_LABEL_KEYS[row.node.status] ?? row.node.status)}
            </Badge>
            {!row.node.flags.active ? (
              <Badge size="sm" variant="outline" colorPalette="red">
                {t('badges.inactive')}
              </Badge>
            ) : null}
            {!row.node.flags.visible ? (
              <Badge size="sm" variant="outline" colorPalette="black">
                {t('badges.hidden')}
              </Badge>
            ) : null}
            {row.node.flags.showInSideNav === false ? (
              <Badge size="sm" variant="outline" colorPalette="black">
                {t('badges.sideNavHidden')}
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        key: 'sortOrder',
        title: t('columns.sortOrder'),
        width: COLUMN_WIDTH.SORT_ORDER,
        align: 'right',
        render: (_v, row) => row.node.sortOrder,
      },
      {
        key: 'actions',
        title: t('columns.actions'),
        width: COLUMN_WIDTH.ACTIONS,
        align: 'right',
        render: (_v, row) => (
          <div className="flex items-center justify-end gap-1">
            <IconButton
              size="sm"
              variant="ghost"
              colorPalette="black"
              aria-label={t('actions.addChild', { name: label(row.node) })}
              onClick={() => onAddChild(row.node)}
            >
              <PlusIcon />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              colorPalette="black"
              aria-label={t('actions.edit', { name: label(row.node) })}
              onClick={() => onEdit(row.node)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              colorPalette="black"
              aria-label={t('actions.move', { name: label(row.node) })}
              disabled={!canMove(row.node)}
              onClick={() => onMove(row.node)}
            >
              <MoveIcon />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              colorPalette="red"
              aria-label={t('actions.delete', { name: label(row.node) })}
              disabled={!row.node.flags.removable}
              onClick={() => onDelete(row.node)}
            >
              <TrashIcon />
            </IconButton>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      nodes,
      expanded,
      toggle,
      reorder.isPending,
      onAddChild,
      onEdit,
      onMove,
      onDelete,
    ],
  )

  return (
    <DataTable
      aria-label={t('title')}
      columns={columns}
      data={rows}
      rowKey={(row) => row.node.id}
      onRow={onRow}
      rowClassName={rowClassName}
      loading={loading}
      emptyText={t('empty')}
      // Sabit layout: `truncate` mətnləri sütunu genişləndirmir, başlıq sütunu
      // qalan eni tutur; üfüqi scroll yalnız konteyner 880px-dən dar olanda.
      className="[&>table]:table-fixed"
      scroll={{ x: TREE_MIN_WIDTH }}
    />
  )
}
