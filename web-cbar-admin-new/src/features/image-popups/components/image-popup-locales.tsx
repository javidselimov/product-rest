/** "Dillər" sütunu — popup-ın hansı dildə şəkli var (spec 009 FR-006). */

import { Badge } from '@cbar/lib-react-ui-kit/badge'

import { LOCALES } from '@/entities/content/model/types'
import type { ImagePopupRow } from '../model/schemas'

export function ImagePopupLocales({ row }: { row: ImagePopupRow }) {
  const locales = LOCALES.filter(
    (locale) => row.translations[locale]?.mediaId != null,
  )
  if (locales.length === 0) return '—'
  return (
    <span className="flex gap-1">
      {locales.map((locale) => (
        <Badge key={locale} size="xs" variant="subtle">
          {locale.toUpperCase()}
        </Badge>
      ))}
    </span>
  )
}
