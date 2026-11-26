/**
 * Faiz dəhlizi kartı — aşağı/yuxarı hədd, uçot dərəcəsi (Figma `809:24733`): üç qutu,
 * sonuncu (uçot dərəcəsi) teal fonda vurğulanır.
 */
import type { StatRow } from '@/features/homepage/model/schemas'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { StatBox, StatCard } from './stat-card'

export function CorridorCard({
  locale,
  items,
  dateLabel,
}: {
  locale: Locale
  items: StatRow[]
  dateLabel?: string | null
}) {
  const t = getT(locale, 'home')

  return (
    // Figma: padding 20, çərçivə içəri (INSIDE) — CSS-də 1px çərçivə padding-ə əlavə olunur, ona görə 19.
    <StatCard title={t('interestCorridor')} dateLabel={dateLabel} slot="corridor-card" className="p-[19px]">
      {/* Figma `809:24704`: qutular sabit 110px, `space-between`; dar ekranda bərabər kiçilir. */}
      <ul className="flex justify-between gap-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex flex-[0_1_110px]">
            <StatBox variant="corridor" label={item.label} value={item.value} accent={i === items.length - 1} className="w-full" />
          </li>
        ))}
      </ul>
    </StatCard>
  )
}
