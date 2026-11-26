/**
 * View A: the topic cards, Figma `FAQ / Mövzu` (spec 051 US1). Each card is a native `<details>` with the topic name,
 * its question count and a caret; open, it lists the numbered questions and links to the topic on its own (view B).
 * A search opens the cards that have matches (`topic.open`).
 */
import { ArrowRightIcon, CaretDownIcon } from '@cbar/lib-react-ui-kit/icons'
import Link from 'next/link'

import type { FaqTopicView } from '@/features/faq/model/select'
import type { Locale } from '@/shared/i18n'
import { getT } from '@/shared/i18n/server'
import { Reveal } from '@/shared/ui/reveal'

import { TOPIC_CARD_CLASS, TOPIC_COUNT_CLASS, TOPIC_LIST_CLASS, TOPIC_NAME_CLASS } from './constants'
import { FaqItem } from './faq-item'

type FaqTopicsProps = Readonly<{ topics: FaqTopicView[]; locale: Locale; topicHref: (slug: string) => string }>

export function FaqTopics({ topics, locale, topicHref }: FaqTopicsProps) {
  const t = getT(locale, 'faq')

  return (
    <ul data-slot="faq-topics" className={TOPIC_LIST_CLASS}>
      {topics.map((topic, index) => (
        <Reveal as="li" index={index} key={topic.slug}>
          <details data-accordion="" open={topic.open} className={`group/topic ${TOPIC_CARD_CLASS}`}>
            <summary className="focus-visible:outline-ring flex cursor-pointer list-none items-center gap-3 rounded-xs py-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
              <span className={TOPIC_NAME_CLASS}>{topic.name}</span>
              <span className={TOPIC_COUNT_CLASS}>{t('count', { count: topic.total })}</span>
              <CaretDownIcon aria-hidden="true" className="text-foreground size-5 shrink-0 transition-transform group-open/topic:rotate-180" />
            </summary>
            <div data-type="details-content" className="mt-4 flex flex-col gap-4">
              <ul className="border-border border-t">
                {topic.questions.map((question) => (
                  <FaqItem key={question.id} question={question} />
                ))}
              </ul>
              <Link
                href={topicHref(topic.slug)}
                className="text-primary inline-flex items-center gap-1.5 self-start text-sm leading-5 font-medium hover:underline"
              >
                {t('topic.openSeparately')}
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </details>
        </Reveal>
      ))}
    </ul>
  )
}
