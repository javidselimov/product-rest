/**
 * FAQ page "Sual-cavab" (spec 051), Figma A `2642:3479` and B `2647:6937`. Sizes: `specs/051-faq-page/contracts/ui-contract.md`.
 *
 * Breadcrumb and share row, the title, the search (with the topic choice in view B), the topics or the chosen topic,
 * an empty state for a search without matches, and the videos. Full width: the FAQ has no section menu.
 */
import { cn } from '@cbar/lib-react-ui-kit/lib'
import Link from 'next/link'

import { getT } from '@/shared/i18n/server'
import { buildHref } from '@/shared/lib/search-params'
import { FaqHashOpener, FaqSearchForm, FaqTopicList, FaqTopics, FaqVideos } from '@/widgets/faq'
import { PageTools, SHELL_CLASS } from '@/widgets/section-shell'

import type { FaqViewData } from './loader'

type FaqViewProps = Readonly<{ data: FaqViewData }>

export function FaqView({ data }: FaqViewProps) {
  const { locale, title, basePath, view, videos, shell } = data
  const t = getT(locale, 'faq')
  const topicSlug = view.kind === 'topic' ? view.topic.slug : ''
  const empty = view.query !== '' && view.matches === 0

  return (
    <div data-slot="faq-page" className={cn(SHELL_CLASS, 'pb-16 tab:pb-20 desk:pb-30')}>
      <PageTools shell={shell} />

      <div className="mt-8 tab:mt-6 desk:mt-0">
        <h1 className="text-foreground mb-6 text-2xl leading-8 font-semibold tab:mb-9 tab:text-[32px] tab:leading-11">{title}</h1>

        <div className="flex flex-col gap-8 tab:gap-10">
          <FaqSearchForm
            action={basePath}
            q={view.query}
            labels={{
              form: t('search.label'),
              search: t('search.label'),
              placeholder: t('search.placeholder'),
              topic: t('topic.label'),
              allTopics: t('topic.all'),
              apply: t('topic.apply'),
            }}
            topics={view.kind === 'topic' ? { value: topicSlug, options: view.options } : undefined}
          />

          {view.query ? (
            <p role="status" className="sr-only">
              {t('results', { count: view.matches })}
            </p>
          ) : null}

          {empty ? (
            <div data-slot="faq-empty" className="flex flex-col items-start gap-2">
              <p className="text-foreground text-lg leading-6 font-semibold">{t('empty.title', { query: view.query })}</p>
              <Link href={buildHref(basePath, { topic: topicSlug })} className="text-primary text-sm leading-5 font-medium underline">
                {t('empty.clear')}
              </Link>
            </div>
          ) : view.kind === 'topic' ? (
            <FaqTopicList topic={view.topic} />
          ) : (
            <FaqTopics topics={view.topics} locale={locale} topicHref={(slug) => buildHref(basePath, { q: view.query, topic: slug })} />
          )}

          <FaqVideos videos={videos} locale={locale} />
        </div>
      </div>

      <FaqHashOpener />
    </div>
  )
}
