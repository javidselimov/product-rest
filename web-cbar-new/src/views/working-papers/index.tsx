/**
 * Working paper list (spec 054 US1, ui-contract §3; Figma Variant B `2825:22947`, tablet `2828:23647`, mobile `2828:24595`):
 * the section template with the CMS page's title and intro, the search and year filter, "Bütün məqalələr" (desktop only:
 * the tablet and mobile frames hide it), the rows and the pagination. Every choice is a search parameter, so the page
 * works without JavaScript (FR-014).
 */
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { Reveal } from '@/shared/ui/reveal'
import { CmsContent } from '@/widgets/cms-content/cms-content'
import { ListPagination } from '@/widgets/list-pagination/list-pagination'
import { SectionShell } from '@/widgets/section-shell'
import { PaperFilter, PaperRow } from '@/widgets/working-papers'

import type { WorkingPapersViewData } from './loader'

export function WorkingPapersView({ data }: Readonly<{ data: WorkingPapersViewData }>) {
  const { locale } = data
  const t = getT(locale, 'workingPapers')

  return (
    <SectionShell shell={data.shell} title={data.title}>
      <div className="flex flex-col gap-8">
        {data.introHtml ? <CmsContent html={data.introHtml} variant="about" /> : null}
        <PaperFilter locale={locale} basePath={data.basePath} q={data.q} year={data.year} years={data.years} />
        <h2 className="text-foreground text-xl leading-7 font-semibold max-tab:sr-only">{t('list.heading')}</h2>
        {data.rows.length === 0 ? (
          <div data-slot="paper-empty" className="flex flex-col items-start gap-2">
            <p className="text-foreground text-base leading-6">{t('list.empty')}</p>
            <Link href={data.basePath} className="text-primary text-sm leading-5 font-medium underline underline-offset-2">
              {t('search.clear')}
            </Link>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {data.rows.map((paper, index) => (
              <Reveal as="li" key={paper.id} index={index}>
                <PaperRow paper={paper} locale={locale} />
              </Reveal>
            ))}
          </ol>
        )}
        <ListPagination
          basePath={data.basePath}
          params={{ q: data.q, year: data.year }}
          page={data.page}
          total={data.total}
          pageSize={data.pageSize}
          className="desk:justify-end"
        />
      </div>
    </SectionShell>
  )
}
