/** Siyahı hüceyrə render qaydaları (B4). */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import type { ReactNode } from 'react'

import { formatDate, formatDateTime } from '@/shared/crud/date-io'
import { getByPath, nsKey } from '@/shared/crud/path'
import type { AnyRow, ColumnConfig } from '@/shared/crud/types'

const isEmpty = (value: unknown) =>
  value === null || value === undefined || value === ''

export function renderCellValue<Row extends AnyRow>(
  column: ColumnConfig<Row>,
  row: Row,
  t: (key: string) => string,
  ns: string,
  language: string,
): ReactNode {
  if (column.render === 'custom') return column.renderCell?.(row) ?? '—'
  const value = getByPath(row, column.key)
  switch (column.render) {
    case 'date':
      return formatDate(value, language)
    case 'datetime':
      return formatDateTime(value, language)
    case 'badge': {
      if (isEmpty(value)) return '—'
      const key = String(value)
      const labelKey = column.badgeLabelKey?.[key]
      return (
        <Badge
          size="sm"
          variant="subtle"
          colorPalette={column.badgePalette?.[key] ?? 'black'}
        >
          {labelKey ? t(nsKey(ns, labelKey)) : key}
        </Badge>
      )
    }
    default:
      return isEmpty(value) ? '—' : String(value)
  }
}
