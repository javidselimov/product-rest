/**
 * Server tərəfli sadə cədvəl — məzənnə vərəqi və MEAS üçün (kit `data-table`
 * client tərəfli TanStack sarğısıdır; burada məlumat statikdir və JS-siz render
 * olunmalıdır). Rənglər yalnız kit token-larıdır; dar ekranda konteyner sürüşür.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import type { ReactNode } from 'react'

export type Column<T> = {
  key: string
  header: string
  align?: 'left' | 'right'
  className?: string
  cell: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  caption?: string
  className?: string
}

export function DataTable<T>({ columns, rows, rowKey, caption, className }: DataTableProps<T>) {
  return (
    <div data-slot="data-table" className={cn('border-border bg-card overflow-x-auto rounded-md border', className)}>
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="bg-primary text-primary-foreground text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('px-4 py-3 font-medium', column.align === 'right' && 'text-right', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-border even:bg-muted/40 border-t">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('text-foreground px-4 py-2.5', column.align === 'right' && 'text-right', column.className)}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
