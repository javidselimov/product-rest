/**
 * One row of the working paper list (spec 054 ui-contract §3, Figma `2825:23800`): number and year, title and authors, the
 * paper's language. The whole row is one link to the paper's page (spec decision 3; Figma draws no link cue).
 */
import type { PaperRow as PaperRowData } from '@/features/working-papers/model/select'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { PAPER_ROW_CLASS } from './constants'

export function PaperRow({ paper, locale }: Readonly<{ paper: PaperRowData; locale: Locale }>) {
  const t = getT(locale, 'workingPapers')
  return (
    <a href={paper.href} data-slot="paper-row" className={PAPER_ROW_CLASS}>
      <span className="flex w-[110px] shrink-0 flex-col gap-0.5 max-tab:w-auto max-tab:flex-row max-tab:items-baseline max-tab:gap-3">
        <span className="text-primary text-base leading-6 font-semibold">{t('list.number', { code: paper.code })}</span>
        <span className="text-site-faint text-[13px] leading-5">{t('list.date', { year: paper.year })}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-foreground text-base leading-6 font-semibold">{paper.title}</span>
        {paper.authors.length > 0 ? <span className="text-site-faint text-sm leading-[22px]">{paper.authors.join(', ')}</span> : null}
      </span>
      <span className="text-site-faint w-[130px] shrink-0 text-right text-sm leading-6 max-desk:w-[110px] max-tab:w-auto max-tab:text-left">
        {t(`language.${paper.language}`)}
      </span>
    </a>
  )
}
