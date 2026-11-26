/**
 * What an AZIR import wrote (spec 058 FR-015): one row per term with the value it replaced
 * under it, a warning when the volume came in manat, and the rows that were not written.
 */

import { Alert, AlertDescription } from '@cbar/lib-react-ui-kit/alert'
import {
  DataTable,
  type DataTableColumn,
} from '@cbar/lib-react-ui-kit/data-table'
import { useTranslation } from 'react-i18next'

import { EMPTY_CELL } from '../model/constants'
import { formatDay } from '../model/import-state'
import type { AzirImportResult, AzirImportValue } from '../model/schemas'

type NumberField = 'rate' | 'dealVolume' | 'dealCount' | 'minRate' | 'maxRate'

const NUMBER_FIELDS: readonly NumberField[] = [
  'rate',
  'dealVolume',
  'dealCount',
  'minRate',
  'maxRate',
]

const show = (value: number | null) =>
  value === null ? EMPTY_CELL : String(value)

interface AzirImportSummaryProps {
  result: AzirImportResult
}

export function AzirImportSummary({
  result,
}: Readonly<AzirImportSummaryProps>) {
  const { t } = useTranslation('azir')
  const yesNo = (value: boolean) =>
    t(value ? 'import.summary.yes' : 'import.summary.no')

  /** The new value, and the replaced one under it when it differs. */
  const cell = (
    current: string,
    before: string | undefined,
  ) => (
    <div className="flex flex-col items-end">
      <span>{current}</span>
      {before !== undefined && before !== current ? (
        <span className="text-muted-foreground text-xs line-through">
          {t('import.previous', { value: before })}
        </span>
      ) : null}
    </div>
  )

  const columns: DataTableColumn<AzirImportValue>[] = [
    {
      key: 'term',
      title: t('import.summary.term'),
      // The kit's DataTable renders a cell only through `render`.
      render: (_value, row) => row.term,
    },
    ...NUMBER_FIELDS.map(
      (field): DataTableColumn<AzirImportValue> => ({
        key: field,
        title: t(`import.summary.${field}`),
        align: 'right',
        render: (_value, row) =>
          cell(
            show(row[field]),
            row.previous ? show(row.previous[field]) : undefined,
          ),
      }),
    ),
    {
      key: 'isReservePlan',
      title: t('import.summary.reserve'),
      render: (_value, row) =>
        cell(
          yesNo(row.isReservePlan),
          row.previous ? yesNo(row.previous.isReservePlan) : undefined,
        ),
    },
  ]

  return (
    <div className="space-y-3">
      <Alert variant="surface" colorPalette="green">
        <AlertDescription>
          {t('import.done', {
            date: formatDay(result.valueDate),
            count: result.values.length,
          })}
        </AlertDescription>
      </Alert>
      {result.volumeConverted ? (
        <Alert variant="surface" colorPalette="yellow">
          <AlertDescription>{t('import.converted')}</AlertDescription>
        </Alert>
      ) : null}
      <DataTable
        aria-label={t('import.summary.caption')}
        columns={columns}
        data={result.values}
        rowKey="term"
      />
      {result.skipped.length > 0 ? (
        <section className="space-y-1">
          <h3 className="text-sm font-medium">
            {t('import.summary.skippedTitle')}
          </h3>
          <ul className="text-muted-foreground list-disc pl-5 text-sm">
            {result.skipped.map((row) => (
              <li key={row.row}>
                {t(`import.skipped.${row.reason}`, {
                  row: row.row,
                  name: row.name,
                })}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
