/**
 * Statistics of citizens' appeals (spec 050, Figma `2557:137809`): the summary of the latest common month, the channel
 * tabs with the year links and one table, then the infographics archive. Channel and year are search parameters
 * (research R5). Sizes are in `specs/050-consumer-rights/contracts/ui-contract.md` §4.
 */
import Link from 'next/link'

import { CONSUMER_INFOGRAPHICS_ANCHOR } from '@/entities/page-node'
import { selectStat } from '@/features/about-content/model/consumer-select'
import type { AppealStatisticsBlock, StatSummary, StatTable } from '@/features/about-content/model/types'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { LatestCard, LinkTabs, queryHref, YearArchiveList } from './consumer-parts'

type Query = Record<string, string | string[] | undefined>

/** Counts as typed in the tables and in Figma ("6069"), without a thousands separator. */
const formatCount = (value: number | null) => (value == null ? '' : String(value))

function SummaryCards({ summary, locale }: Readonly<{ summary: StatSummary; locale: Locale }>) {
  const t = getT(locale, 'about')
  return (
    <section data-slot="consumer-summary" className="flex flex-col gap-5">
      <h2 className="text-foreground text-xl leading-7 font-semibold">{t('consumer.summary', { month: summary.monthLabel, year: summary.year })}</h2>
      <ul className="grid grid-cols-1 gap-6 tab:grid-cols-2">
        {summary.cards.map((card) => (
          // Figma `Summary` card 2557:138574: label and total 2 apart, then rows of 8/8 padding with a rule above each.
          <li key={card.channel} className="border-site-consumer-card-border flex flex-col gap-4 rounded-xs border p-6">
            <div className="flex flex-col gap-0.5">
              <p className="text-site-consumer-muted text-sm leading-[22px] font-medium">{card.channel}</p>
              <p className="text-primary text-[36px] leading-[44px] font-semibold tabular-nums">{formatCount(card.total)}</p>
            </div>
            <dl className="flex flex-col">
              {card.sectors.map((sector) => (
                <div
                  key={sector.sector}
                  className="border-site-consumer-card-border flex items-baseline justify-between gap-4 border-t py-2 text-sm leading-[22px]"
                >
                  <dt className="text-foreground">{sector.sector}</dt>
                  <dd className="text-foreground font-semibold tabular-nums">{formatCount(sector.value)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}

const HEAD_CELL = 'px-4 py-3 text-left align-middle text-sm leading-5 font-semibold first:pl-5'
/** 11.5 + 22 + 11.5 + the 1px rule = the 46 of a Figma row. */
const BODY_CELL = 'px-4 py-[11.5px] text-sm leading-[22px] first:pl-5'
const NUMBER_CELL = 'text-right tabular-nums'

function StatTableView({ table, caption }: Readonly<{ table: StatTable; caption: string }>) {
  return (
    // The table scrolls in its own frame on a narrow screen, never the page (spec Edge Cases).
    <div className="border-site-divider overflow-x-auto rounded-xs border">
      <table className="w-full min-w-[640px] border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-site-consumer-soft">
          <tr className="h-[84px]">
            {table.head.map((cell, i) => (
              <th key={`${i}-${cell}`} scope="col" className={`${HEAD_CELL} ${i > 0 && table.form === 'months' ? NUMBER_CELL : ''}`}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.form === 'months'
            ? [...table.rows, ...(table.totalRow ? [table.totalRow] : [])].map((row) => {
                const isTotal = row === table.totalRow
                return (
                  <tr
                    key={row.label}
                    className={isTotal ? 'border-site-consumer-total-rule border-t-[1.5px] font-semibold' : 'border-site-divider border-t'}
                  >
                    <th scope="row" className={`${BODY_CELL} text-left ${isTotal ? 'font-semibold' : 'font-normal'}`}>
                      {row.label}
                    </th>
                    {row.cells.map((cell, i) => (
                      <td key={`${row.label}-${i}`} className={`${BODY_CELL} ${NUMBER_CELL}`}>
                        {formatCount(cell)}
                      </td>
                    ))}
                  </tr>
                )
              })
            : table.rows.map((row, r) => (
                <tr key={`${r}-${row[0] ?? ''}`} className="border-site-divider border-t">
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={`${r}-${i}`} scope="row" className={`${BODY_CELL} text-left font-normal`}>
                        {cell}
                      </th>
                    ) : (
                      <td key={`${r}-${i}`} className={`${BODY_CELL} ${NUMBER_CELL}`}>
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}

export function AppealStatistics({ block, locale, query }: Readonly<{ block: AppealStatisticsBlock; locale: Locale; query?: Query }>) {
  const t = getT(locale, 'about')
  const selection = selectStat(block.channels, query?.[QUERY_PARAM.CHANNEL], query?.[QUERY_PARAM.YEAR])

  return (
    <div data-slot="appeal-statistics" className="flex flex-col gap-14">
      {block.introHtml.trim() ? <CmsContent html={block.introHtml} variant="about" /> : null}
      {block.summary ? <SummaryCards summary={block.summary} locale={locale} /> : null}

      {selection ? (
        <section className="flex flex-col gap-5">
          <h2 className="text-foreground text-xl leading-7 font-semibold">{t('consumer.statistics')}</h2>
          <div className="flex flex-col gap-6">
            <LinkTabs
              variant="box"
              label={t('consumer.channels')}
              tabs={block.channels.map((channel) => ({
                key: String(channel.index),
                label: channel.label,
                href: queryHref({ [QUERY_PARAM.CHANNEL]: String(channel.index) }),
                current: channel.index === selection.channel.index,
              }))}
            />
            {selection.channel.years.length > 0 ? (
              <nav aria-label={t('consumer.years')} className="flex flex-wrap items-center gap-2">
                <span aria-hidden="true" className="text-site-consumer-muted text-sm leading-[21px] font-medium">
                  {t('consumer.year')}
                </span>
                {selection.channel.years.map((year) => {
                  const current = year.year === selection.year?.year
                  return (
                    <Link
                      key={year.year}
                      href={queryHref({ [QUERY_PARAM.CHANNEL]: String(selection.channel.index), [QUERY_PARAM.YEAR]: String(year.year) })}
                      scroll={false}
                      aria-current={current ? 'page' : undefined}
                      className={`focus-visible:outline-ring flex h-9 items-center rounded-xs px-4 text-sm leading-[21px] font-medium outline-none focus-visible:outline-2 ${
                        current ? 'bg-site-consumer-selected text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {year.year}
                    </Link>
                  )
                })}
              </nav>
            ) : null}
            {selection.year ? (
              <StatTableView
                table={selection.year.table}
                caption={t('consumer.table', { channel: selection.channel.label, year: selection.year.year })}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {block.restHtml.trim() ? <CmsContent html={block.restHtml} variant="about" /> : null}

      {block.infographics ? (
        // The infographics page's old address redirects to this anchor (research R6).
        <section id={CONSUMER_INFOGRAPHICS_ANCHOR} className="flex scroll-mt-6 flex-col gap-5">
          <h2 className="text-foreground text-xl leading-7 font-semibold">{t('consumer.infographics')}</h2>
          {block.infographics.latest ? <LatestCard file={block.infographics.latest.month.file} locale={locale} /> : null}
          <YearArchiveList archive={block.infographics} locale={locale} />
        </section>
      ) : null}
    </div>
  )
}
