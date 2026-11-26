/**
 * A list whose order the editor changes by dragging a row or with its up/down buttons (spec 051 `contracts/admin-ux.md`).
 * The kit has no sortable list; this uses native HTML5 drag and drop, so no dependency is added. The buttons are the
 * keyboard path and the touch path — dragging is the shortcut, never the only way. Every move is announced in a polite
 * live region ("… moved to position 3"). The caller persists the new order in `onReorder` and passes the saved items
 * back; the list keeps no order of its own.
 */

import { ArrowDownIcon, ArrowUpIcon } from '@cbar/lib-react-ui-kit/icons'
import { IconButton } from '@cbar/lib-react-ui-kit/icon-button'
import { cn } from '@cbar/lib-react-ui-kit/lib'
import { useState, type DragEvent, type ReactNode } from 'react'

import { GripIcon } from './grip-icon'

export interface SortableListLabels {
  /** Accessible name of the list. */
  list: string
  moveUp: (name: string) => string
  moveDown: (name: string) => string
  /** Live-region text after a move; `position` is 1-based. */
  moved: (name: string, position: number) => string
}

interface SortableListProps<Item> {
  items: readonly Item[]
  getKey: (item: Item) => number
  /** The row's name in labels and announcements. */
  getLabel: (item: Item) => string
  renderItem: (item: Item, index: number) => ReactNode
  /** The ids in their new order. */
  onReorder: (ids: number[]) => void
  labels: SortableListLabels
  /** While a save is running. */
  disabled?: boolean
}

function moveTo<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  return next
}

export function SortableList<Item>({ items, getKey, getLabel, renderItem, onReorder, labels, disabled = false }: SortableListProps<Item>) {
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const move = (from: number, to: number) => {
    if (disabled || from === to || to < 0 || to >= items.length) return
    const next = moveTo(items, from, to)
    setAnnouncement(labels.moved(getLabel(items[from]!), to + 1))
    onReorder(next.map(getKey))
  }

  const endDrag = () => {
    setDragFrom(null)
    setDragOver(null)
  }

  const dropOn = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    event.preventDefault()
    if (dragFrom !== null) move(dragFrom, index)
    endDrag()
  }

  return (
    <>
      <ul aria-label={labels.list} className="divide-border divide-y">
        {items.map((item, index) => {
          const name = getLabel(item)
          return (
            <li
              key={getKey(item)}
              draggable={!disabled}
              onDragStart={(event) => {
                setDragFrom(index)
                event.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(event) => {
                if (dragFrom === null) return
                event.preventDefault()
                setDragOver(index)
              }}
              onDrop={dropOn(index)}
              onDragEnd={endDrag}
              data-dragging={dragFrom === index || undefined}
              className={cn(
                'flex items-center gap-3 py-2',
                dragFrom === index && 'opacity-50',
                dragOver === index && dragFrom !== index && 'bg-accent',
              )}
            >
              <GripIcon aria-hidden="true" size={16} className={cn('text-muted-foreground shrink-0', !disabled && 'cursor-grab')} />
              <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
              <IconButton
                size="sm"
                variant="ghost"
                colorPalette="black"
                aria-label={labels.moveUp(name)}
                disabled={disabled || index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUpIcon />
              </IconButton>
              <IconButton
                size="sm"
                variant="ghost"
                colorPalette="black"
                aria-label={labels.moveDown(name)}
                disabled={disabled || index === items.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDownIcon />
              </IconButton>
            </li>
          )
        })}
      </ul>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  )
}
