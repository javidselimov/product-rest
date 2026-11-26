/** List cells of the homepage strategy documents (spec 057): where the card goes, and whether it goes anywhere. */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { useTranslation } from 'react-i18next'

import type { StrategyDocRow } from '../model/strategy-docs'

type CellProps = Readonly<{ row: StrategyDocRow }>

/** The linked page, else the first address; a badge when no language has a working link (the site skips the document). */
export function StrategyDocLinkCell({ row }: CellProps) {
  const { t } = useTranslation('homepage')
  const target = row.pageTitle ?? Object.values(row.urls)[0] ?? null
  return (
    <span className="flex flex-wrap items-center gap-1">
      {target ? <span className="line-clamp-1 break-all">{target}</span> : null}
      {row.linkBroken ? (
        <Badge size="xs" variant="subtle" colorPalette="yellow">
          {t('badges.linkBroken')}
        </Badge>
      ) : null}
    </span>
  )
}
