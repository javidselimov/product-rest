/** List cells of the monthly reports (spec 052): the series' short label, the period, and the files per language. */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { useTranslation } from 'react-i18next'

import { LocaleBadges } from '@/entities/content/ui/locale-badges'
import { periodLabel } from '../model/period'
import type { MonthlyReportRow } from '../model/schemas'

type CellProps = Readonly<{ row: MonthlyReportRow }>

/** The short label of a known series; the API's name for one the panel does not know yet. */
export function SeriesCell({ row }: CellProps) {
  const { t } = useTranslation('monthlyReports')
  return <>{t(`series.${row.series}`, { defaultValue: row.seriesName })}</>
}

export function PeriodCell({ row }: CellProps) {
  const { t } = useTranslation('monthlyReports')
  return <>{periodLabel(row.year, row.month, row.periodMonths, (month) => t(`months.${month}`))}</>
}

export function FilesCell({ row }: CellProps) {
  const { t } = useTranslation('monthlyReports')
  return (
    <span className="flex flex-wrap items-center gap-1">
      <LocaleBadges locales={row.locales} />
      {row.missingFile ? (
        <Badge size="xs" variant="subtle" colorPalette="red">
          {t('missingFile')}
        </Badge>
      ) : null}
    </span>
  )
}
