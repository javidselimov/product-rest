/**
 * AZN məzənnəsi kartı — USD/EUR/RUB/TRY, dünənlə müqayisədə trend (spec 002 US2-2; Figma `809:24614`).
 * Başlıq məzənnələr səhifəsinə keçiddir (Figma-da ayrıca düymə yoxdur).
 */
import { ArrowDownIcon, ArrowUpIcon } from '@cbar/lib-react-ui-kit/icons'

import { CURRENCY_ICON_BY_CODE, formatRate, type Trend } from '@/features/currencies/model/schemas'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'

import { StatCard } from './stat-card'

export type CurrencyRow = {
  code: string
  nominal: number
  rate: number
  trend: Trend
}

function TrendMark({ trend, label }: { trend: Trend; label: string }) {
  if (trend === 'up') {
    return <ArrowUpIcon className="text-success size-4" aria-label={label} />
  }
  if (trend === 'down') {
    return <ArrowDownIcon className="text-destructive size-4" aria-label={label} />
  }
  return <span className="bg-border inline-block size-2 rounded-full" aria-label={label} />
}

type CurrencyCardProps = {
  locale: Locale
  dateLabel: string
  rows: CurrencyRow[]
}

export function CurrencyCard({ locale, dateLabel, rows }: CurrencyCardProps) {
  const t = getT(locale, 'home')

  return (
    <StatCard
      title={t('aznCurrency')}
      dateLabel={dateLabel}
      href={`/${locale}/currencies`}
      slot="currency-card"
      // Figma: daxili çərçivə kartdan 17px içəridə (212 → 229) = 1px çərçivə + 16 padding.
      className="px-6 py-4"
    >
      <ul className="flex flex-col gap-4">
        {rows.map((row) => (
          <li key={row.code} className="flex h-9 items-center justify-between gap-4">
            {/* Figma: 36px simvol dairəsi, mətnə 16px; "1 USD" #787878 = muted-foreground. */}
            <span className="text-muted-foreground flex items-center gap-4 text-lg/6 font-medium">
              {CURRENCY_ICON_BY_CODE[row.code] ? (
                // eslint-disable-next-line @next/next/no-img-element -- statik valyuta simvolu ikonu
                <img
                  src={CURRENCY_ICON_BY_CODE[row.code]}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 shrink-0"
                />
              ) : null}
              <span>
                {row.nominal} {row.code}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-foreground text-[22px]/7 font-bold">{formatRate(row.rate)}</span>
              <span className="flex w-4 justify-center">
                <TrendMark trend={row.trend} label={t(`trend.${row.trend === 'flat' ? 'same' : row.trend}`)} />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </StatCard>
  )
}
