/**
 * FAQ link cards under a CMS page's text (spec 051 US5, `contracts/ui-contract.md` "Bölmə bloku"): one card per topic
 * linked to the page, in the frame of the FAQ topic card. The whole card is one link to the topic on the FAQ page, so
 * it is one focus stop; there are no questions in it.
 */
import { ArrowRightIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'

import { TOPIC_CARD_CLASS, TOPIC_COUNT_CLASS, TOPIC_LIST_CLASS, TOPIC_NAME_CLASS } from './constants'

export type FaqTopicLink = { slug: string; name: string; questionCount: number; href: string }

type FaqTopicLinksProps = Readonly<{ topics: FaqTopicLink[]; locale: Locale }>

export function FaqTopicLinks({ topics, locale }: FaqTopicLinksProps) {
  if (topics.length === 0) return null
  const t = getT(locale, 'faq')

  return (
    <ul data-slot="faq-topic-links" aria-label={t('link.list')} className={`mt-10 ${TOPIC_LIST_CLASS}`}>
      {topics.map((topic) => (
        <li key={topic.slug}>
          <Link
            href={topic.href}
            className={`${TOPIC_CARD_CLASS} hover:border-primary focus-visible:outline-ring flex flex-wrap items-center gap-x-4 gap-y-2 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2`}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={TOPIC_NAME_CLASS}>{t('link.title', { topic: topic.name })}</span>
              <span className={TOPIC_COUNT_CLASS}>{t('count', { count: topic.questionCount })}</span>
            </span>
            <span className="text-primary inline-flex shrink-0 items-center gap-1.5 text-sm leading-5 font-medium">
              {t('link.more')}
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
