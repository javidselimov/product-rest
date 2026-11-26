/**
 * "AZIR indeksi ilə bağlı məlumatlar" — 11 göstəricili blok (spec 021 FR-015, FR-016).
 * Filtrdən asılı deyil; hesablana bilməyən göstərici `—`-dir, xəta yalnız bu blokdadır.
 */
import { NO_VALUE, formatDate, formatNumber, formatSigned } from '@/entities/content'
import { AZIR_RATE_FRACTION as RATE, AZIR_VOLUME_FRACTION as VOLUME } from '@/features/stats/model/constants'
import type { AzirSummary as AzirSummaryData } from '@/features/stats/model/schemas'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { ErrorState } from '@/shared/ui/error-state'

type AzirSummaryProps = {
  locale: Locale
  data: AzirSummaryData | null
  error: boolean
  className?: string
}

export function AzirSummary({ locale, data, error, className }: AzirSummaryProps) {
  const t = getT(locale, 'finance')
  const percent = (value: number | null) => (value == null ? NO_VALUE : `${formatNumber(value, locale, RATE)}%`)

  const rows: [string, string][] = data
    ? [
        ['lastDate', data.lastDate ? formatDate(data.lastDate, locale) : NO_VALUE],
        ['lastRate', percent(data.lastRate)],
        ['rateChangeSinceMonthEnd', formatSigned(data.rateChangeSinceMonthEnd, locale, RATE)],
        ['rateChangeSinceYearEnd', formatSigned(data.rateChangeSinceYearEnd, locale, RATE)],
        ['lastMinRate', percent(data.lastMinRate)],
        ['lastMaxRate', percent(data.lastMaxRate)],
        ['lastVolume', formatNumber(data.lastVolume, locale, VOLUME)],
        ['volumeChangeSinceMonthEnd', formatSigned(data.volumeChangeSinceMonthEnd, locale, VOLUME)],
        ['volumeMin', formatNumber(data.volumeMinSincePrevYearStart, locale, VOLUME)],
        ['volumeMax', formatNumber(data.volumeMaxSincePrevYearStart, locale, VOLUME)],
        ['lastVolumeUsd', formatNumber(data.lastVolumeUsd, locale, VOLUME)],
      ]
    : []

  return (
    <section data-slot="azir-summary" aria-labelledby="azir-summary-title" className={className}>
      <h2 id="azir-summary-title" className="text-foreground mb-3 text-lg font-semibold">
        {t('azirPage.summary.title')}
      </h2>

      {error || !data ? (
        <ErrorState kind="server" />
      ) : (
        <div className="border-border bg-card overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([key, value]) => (
                <tr key={key} className="border-border even:bg-muted/40 border-t first:border-t-0">
                  <th scope="row" className="text-muted-foreground px-4 py-2.5 text-left font-normal">
                    {t(`azirPage.summary.${key}`)}
                  </th>
                  <td className="text-foreground px-4 py-2.5 text-right font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
