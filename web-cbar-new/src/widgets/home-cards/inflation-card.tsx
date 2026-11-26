/**
 * İnflyasiya kartı (Figma `809:24678`, spec 022): illik inflyasiya (teal qutu, tarixlə) və
 * hədəf (boz qutu). Hədəf sərbəst mətndir (`4 (±2)`), köhnə saytdakı kimi.
 *
 * Spec 002-dəki illər üzrə qrafik və il seçimi Figma-da yoxdur — ana səhifədən çıxıb;
 * inflyasiya seriyası `/statistics` səhifəsindədir.
 */
import { formatNumber, NO_VALUE } from '@/entities/content'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { StatBox, StatCard } from './stat-card'

type InflationCardProps = {
  locale: Locale
  current: number | null
  currentDate: string
  target: string | null
}

export function InflationCard({ locale, current, currentDate, target }: InflationCardProps) {
  const t = getT(locale, 'home')

  return (
    <StatCard title={t('inflation')} href={`/${locale}/statistics`} slot="inflation-card">
      {/* Figma: qutular 180 / 184 (384 içində, aralıq 20) — nisbət saxlanılır. */}
      <div className="grid grid-cols-[180fr_184fr] gap-5">
        <StatBox
          variant="inflation"
          accent
          label={t('annualInflation')}
          value={current != null ? `${formatNumber(current, locale)}%` : NO_VALUE}
          note={current != null ? currentDate : null}
        />
        {/* Figma `809:24676`: hədəfdə faizdən əvvəl boşluq var — `4 (±2) %`. */}
        <StatBox variant="inflation" label={t('target')} value={target != null ? `${target} %` : NO_VALUE} />
      </div>
    </StatCard>
  )
}
