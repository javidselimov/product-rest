/**
 * The languages a row is complete in, as badges; a missing language shows as a warning badge ("EN yoxdur"), so the
 * editor sees the missing translation or file in the list. Shared by the FAQ (spec 051) and the monthly reports
 * (spec 052), hence an entity of its own rather than a feature component.
 */

import { Badge } from '@cbar/lib-react-ui-kit/badge'
import { useTranslation } from 'react-i18next'

import { LOCALES } from '@/entities/content/model/types'

export function LocaleBadges({ locales }: Readonly<{ locales: readonly string[] }>) {
  const { t } = useTranslation('common')
  return (
    <span className="flex flex-wrap gap-1">
      {LOCALES.map((locale) =>
        locales.includes(locale) ? (
          <Badge key={locale} size="xs" variant="subtle" colorPalette="black">
            {t(`languages.${locale}`)}
          </Badge>
        ) : (
          <Badge key={locale} size="xs" variant="subtle" colorPalette="yellow">
            {t('languages.missing', { locale: t(`languages.${locale}`) })}
          </Badge>
        ),
      )}
    </span>
  )
}
