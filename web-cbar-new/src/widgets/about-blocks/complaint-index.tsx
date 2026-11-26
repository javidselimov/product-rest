/**
 * Complaint indices (spec 050, Figma `2453:4111` → `Complaint / Index` 2453:4106): bank and insurance tabs as links,
 * the latest file, the year archive and the tab's methodology. Sizes are in `specs/050-consumer-rights/contracts/ui-contract.md` §3.
 */
import { selectComplaintTab } from '@/features/about-content/model/consumer-select'
import type { ComplaintIndexBlock, Methodology } from '@/features/about-content/model/types'
import { QUERY_PARAM } from '@/shared/constants/query-params'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { CmsContent } from '@/widgets/cms-content/cms-content'

import { LatestCard, LinkTabs, queryHref, YearArchiveList } from './consumer-parts'

type Query = Record<string, string | string[] | undefined>

/** The `about` content variant styles `p` itself, so the methodology sizes override it there (`!`). */
const METHOD_TEXT = '[&_p]:text-sm! [&_p]:leading-[22px]! tab:[&_p]:text-base! tab:[&_p]:leading-7!'
const NOTE_TEXT = '[&_p]:text-site-consumer-muted! [&_p]:text-sm! [&_p]:leading-[22px]!'

function MethodologyBox({ methodology, locale }: Readonly<{ methodology: Methodology; locale: Locale }>) {
  const t = getT(locale, 'about')
  return (
    // Figma: padding 24, text 16/28 from the tablet; padding 16, text 14/22 and a stacked formula on the phone.
    <section data-slot="consumer-methodology" className="border-site-divider flex flex-col gap-3 rounded-xs border p-4 tab:p-6">
      <h2 className="text-foreground text-base leading-6 font-semibold tab:text-lg tab:leading-[26px]">{methodology.title}</h2>
      {methodology.parts.map((part, index) => {
        const key = `${index}-${part.type}`
        if (part.type === 'formula') {
          return (
            <div
              key={key}
              data-slot="consumer-formula"
              className="bg-site-consumer-soft flex flex-col items-start gap-2 rounded-xs p-4 tab:w-fit tab:max-w-full tab:flex-row tab:items-center tab:gap-4 tab:px-5"
            >
              <span className="text-foreground text-base leading-6 font-semibold">{part.left}</span>
              <span className="text-foreground inline-flex flex-col items-center text-center text-base leading-[22px] font-medium">
                <span className="pb-1">{part.numerator}</span>
                <span className="sr-only"> {t('consumer.divided')} </span>
                <span aria-hidden="true" className="bg-foreground h-px w-full" />
                <span className="pt-1">{part.denominator}</span>
              </span>
            </div>
          )
        }
        return (
          <CmsContent
            key={key}
            html={part.html}
            variant="about"
            className={part.type === 'note' ? NOTE_TEXT : METHOD_TEXT}
          />
        )
      })}
    </section>
  )
}

export function ComplaintIndex({ block, locale, query }: Readonly<{ block: ComplaintIndexBlock; locale: Locale; query?: Query }>) {
  const t = getT(locale, 'about')
  const tab = selectComplaintTab(block, query?.[QUERY_PARAM.TAB])
  if (!tab) return null

  return (
    <div data-slot="complaint-index" className="flex flex-col gap-8">
      {block.tabs.length > 1 ? (
        <LinkTabs
          variant="underline"
          label={t('consumer.tabsLabel')}
          tabs={block.tabs.map((item) => ({
            key: item.key,
            label: t(`consumer.tabs.${item.key}`),
            href: queryHref({ [QUERY_PARAM.TAB]: item.key }),
            current: item.key === tab.key,
          }))}
        />
      ) : null}

      {tab.introHtml.trim() ? <CmsContent html={tab.introHtml} variant="about" /> : null}
      {tab.archive.latest ? <LatestCard file={tab.archive.latest.month.file} locale={locale} /> : null}

      <section className="flex flex-col">
        <div className="flex flex-col gap-1 pb-2">
          <h2 className="text-foreground text-xl leading-7 font-semibold">{t('consumer.archive')}</h2>
          <p className="text-site-consumer-muted text-sm leading-[22px]">{t('consumer.archiveHint')}</p>
        </div>
        <YearArchiveList archive={tab.archive} locale={locale} />
      </section>

      {tab.restHtml.trim() ? <CmsContent html={tab.restHtml} variant="about" /> : null}
      {tab.methodology ? <MethodologyBox methodology={tab.methodology} locale={locale} /> : null}
    </div>
  )
}
