/**
 * "İcmal göstəricilər" tablarının panelləri — server komponentləri (Figma `212:3234`, spec 022 data-model §3).
 *
 * Hər panel eyni qabıqdadır: çərçivə, başlıq + tarix, ayırıcı, məzmun, "Daha ətraflı".
 * Data spec 002-dəki mənbələrdəndir (info-line-lar, AZIR, gəlirlilik əyrisi). Figma-da
 * olub datası olmayan hissələr (maliyyə sektorunda sığorta/kapital bazarı kartları,
 * gəlirlilik əyrisinin "Parametrlər" qutusu) göstərilmir — tracker-də qeyd.
 */
import { Button } from '@cbar/lib-react-ui-kit/button'
import { ArrowRightIcon, CalendarIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { StatRow } from '@/features/homepage/model/schemas'
import type { ChartData } from '@/features/stats/model/series'
import { getT } from '@/shared/i18n/server'
import type { Locale } from '@/shared/i18n'
import { Chart } from '@/widgets/chart-card/chart'

export type MoneyMarketTerm = { term: string; days: number; rate: number }

/** `"15301,3 mln. USD"` → rəqəm və vahid ayrı stillənir (Figma: 800 36/40 + 500 24). */
export function splitMetric(value: string): { number: string; unit: string } {
  const match = /^([-+]?[\d\s.,]*\d%?)\s*(.*)$/.exec(value.trim())
  return match ? { number: match[1], unit: match[2] } : { number: value, unit: '' }
}

type PanelProps = {
  locale: Locale
  title: string
  dateLabel?: string | null
  moreHref: string
  children: ReactNode
  slot: string
  /** Panel altında, "Daha ətraflı"-dan əvvəl əlavə düymələr. */
  actions?: ReactNode
}

/**
 * Figma `212:3324` (brauzerdə ölçülüb): çərçivə + 20px padding (Figma-da məzmun 21px içəridədir =
 * 1px çərçivə + 20), bloklar arası 24. Başlıq sətri 28 + 20 + 0 hündürlüklü xətt. Sağ yuxarıda
 * təqvim ikonu + tarix (data varsa). "Daha ətraflı" panelin **içində**, sağda (240×56, göy mətn + ox).
 */
function Panel({ locale, title, dateLabel, moreHref, children, slot, actions }: PanelProps) {
  const t = getT(locale, 'home')

  return (
    <section aria-label={title} data-slot={slot} className="border-border flex w-full flex-col gap-6 border p-5">
      <div className="flex flex-col gap-5">
        <div className="flex h-7 items-center justify-between gap-5">
          <h3 className="text-foreground text-xl/7 font-semibold">{title}</h3>
          {dateLabel ? (
            <p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="size-6" aria-hidden="true" />
              {dateLabel}
            </p>
          ) : null}
        </div>
        <div className="border-border -mb-px border-t" aria-hidden="true" />
      </div>
      {children}
      {actions ? <div className="flex flex-wrap gap-6">{actions}</div> : null}
      <Button
        asChild
        variant="ghost"
        colorPalette="primary"
        size="lg"
        // Figma `223:4263`: məzmun sağa yığılıb (al:MAX, padding 0).
        className="text-primary h-14 w-60 self-end justify-end px-0 text-base font-medium"
      >
        <Link href={moreHref}>
          {t('moreDetails')}
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </Button>
    </section>
  )
}

/**
 * Böyük göstərici (Figma "dövriyyədə" `212:3338`): rəqəm 800 36/40 + vahid 500 24 boz,
 * altında etiket 500 18/24 boz. `boxed` — sabit 322×112 boz qutu (p16), hamısı eyni ölçüdə.
 */
function Metric({ row, boxed }: { row: StatRow; boxed?: boolean }) {
  const { number, unit } = splitMetric(row.value)

  return (
    <div className={`flex flex-col gap-4 ${boxed ? 'bg-site-surface-muted h-28 w-full rounded-xs p-4 tab:w-[322px]' : ''}`}>
      <p className="flex h-10 items-end gap-2 whitespace-nowrap">
        <span className="text-foreground text-4xl/10 font-extrabold">{number}</span>
        {unit ? <span className="text-muted-foreground pb-0.5 text-2xl font-medium">{unit}</span> : null}
      </p>
      <p className="text-muted-foreground text-lg/6 font-medium">{row.label}</p>
    </div>
  )
}

/** Kiçik qutu (Figma `212:3088` "faiz dəhlizi/notes"): etiket + dəyər. */
function SmallBox({ row }: { row: StatRow }) {
  return (
    <div className="bg-site-surface flex flex-col items-center justify-center gap-5 rounded-xs p-5 text-center">
      <span className="text-muted-foreground text-base/6 font-semibold">{row.label}</span>
      <strong className="text-foreground text-2xl/7 font-bold">{row.value}</strong>
    </div>
  )
}

/**
 * TODO(api): Figma-da panelin sağ yuxarısında tarix var (`774:20714`, "16.09.2026"). api-cbar
 * `/homepage` info-line-lar üçün yalnız `year` qaytarır; `InfoLine.UpdatedAt` cavaba əlavə
 * olunanda (ayrıca spec) loader `dateLabel` ötürəcək — `Panel` onu artıq göstərir.
 */
export function MonetaryPanel({ locale, title, rows }: { locale: Locale; title: string; rows: StatRow[] }) {
  return (
    <Panel locale={locale} title={title} moreHref={`/${locale}/statistics`} slot="monetary-panel">
      <ul className="flex flex-wrap gap-5">
        {rows.map((row) => (
          <li key={row.label} className="max-tab:w-full">
            <Metric row={row} boxed />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function NotesPanel({
  locale,
  title,
  rows,
  grid,
}: {
  locale: Locale
  title: string
  rows: StatRow[]
  grid: StatRow[]
}) {
  return (
    <Panel locale={locale} title={title} moreHref={`/${locale}/statistics`} slot="notes-panel">
      <div className="flex flex-col gap-5 desk:flex-row desk:justify-between">
        <ul className="flex flex-col gap-5 desk:w-106">
          {rows.map((row) => (
            <li key={row.label}>
              <Metric row={row} />
            </li>
          ))}
        </ul>
        {grid.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 tab:grid-cols-4 desk:w-186">
            {grid.map((row) => (
              <li key={row.label} className="flex">
                <SmallBox row={row} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Panel>
  )
}

export function FinancialSectorPanel({
  locale,
  title,
  sectorTitle,
  rows,
}: {
  locale: Locale
  title: string
  sectorTitle: string
  rows: StatRow[]
}) {
  return (
    <Panel locale={locale} title={title} moreHref={`/${locale}/statistics`} slot="financial-sector-panel">
      <section aria-label={sectorTitle} className="border-border flex flex-col gap-4 border p-4 tab:w-56">
        <h4 className="text-foreground text-lg/6 font-semibold">{sectorTitle}</h4>
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm font-medium">{row.label}</span>
              <strong className="text-foreground text-xl font-bold">{row.value}</strong>
            </li>
          ))}
        </ul>
      </section>
    </Panel>
  )
}

export function YieldCurvePanel({
  locale,
  title,
  dateLabel,
  series,
}: {
  locale: Locale
  title: string
  dateLabel: string
  series: ChartData
}) {
  return (
    <Panel locale={locale} title={title} dateLabel={dateLabel} moreHref={`/${locale}/statistics`} slot="yield-curve-panel">
      <Chart data={series} height={374} label={title} />
    </Panel>
  )
}

type MoneyMarketPanelProps = {
  locale: Locale
  title: string
  dateLabel: string
  current1D: number | null
  /** Son 1D ehtiyat plan əsasındadır — `*` + footnote (spec 021 US6). */
  current1DReserve?: boolean
  terms: MoneyMarketTerm[]
  series: ChartData | null
}

export function MoneyMarketPanel({
  locale,
  title,
  dateLabel,
  current1D,
  current1DReserve = false,
  terms,
  series,
}: MoneyMarketPanelProps) {
  const t = getT(locale, 'home')
  const reserve = current1D != null && current1DReserve

  return (
    <Panel
      locale={locale}
      title={title}
      dateLabel={dateLabel}
      moreHref={`/${locale}/statistics/azir`}
      slot="money-market-panel"
      actions={
        <Button asChild variant="outline" colorPalette="black" className="h-12 px-5 text-base font-medium">
          <Link href={`/${locale}/statistics/azir`}>{t('azirRates')}</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6 desk:flex-row">
        <div className="flex flex-col gap-6 desk:w-98 desk:shrink-0">
          <p className="text-foreground flex items-baseline gap-3">
            <span className="text-lg font-medium">{t('azirName')}</span>
            <span className="text-4xl/10 font-extrabold">
              {current1D != null ? `${current1D}%${reserve ? '*' : ''}` : '—'}
            </span>
          </p>
          <ul className="grid grid-cols-2 gap-2.5 tab:grid-cols-3">
            {terms.map((term) => (
              <li key={term.term} className="bg-site-surface flex flex-col gap-1 rounded-xs p-3.5">
                <span className="text-primary text-sm font-medium">
                  {term.days} {t('days')}
                </span>
                <strong className="text-foreground text-lg font-bold">{term.rate}%</strong>
                <span className="text-muted-foreground text-xs">{t('accrued')}</span>
              </li>
            ))}
          </ul>
          {reserve ? <p className="text-muted-foreground text-xs">{t('azirReserveFootnote')}</p> : null}
        </div>
        {series && series.categories.length > 0 ? (
          <div className="min-w-0 flex-1">
            <Chart data={series} height={334} label={t('azirRates')} />
          </div>
        ) : null}
      </div>
    </Panel>
  )
}
