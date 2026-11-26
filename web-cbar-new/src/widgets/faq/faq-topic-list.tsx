/**
 * View B: one topic, Figma "Category · Valyuta ehtiyatları" `2647:6969` (spec 051 US3) — the topic name as a heading
 * (24/32, 20/28 on mobile) and its numbered questions as a flat list with a top rule.
 */
import type { FaqTopicView } from '@/features/faq/model/select'

import { FaqItem } from './faq-item'

type FaqTopicListProps = Readonly<{ topic: FaqTopicView }>

export function FaqTopicList({ topic }: FaqTopicListProps) {
  return (
    <section data-slot="faq-topic-list" aria-labelledby="faq-topic-heading" className="flex flex-col gap-4">
      <h2 id="faq-topic-heading" className="text-foreground text-xl leading-7 font-semibold tab:text-2xl tab:leading-8">
        {topic.name}
      </h2>
      {topic.questions.length > 0 ? (
        <ul className="border-border border-t">
          {topic.questions.map((question) => (
            <FaqItem key={question.id} question={question} />
          ))}
        </ul>
      ) : null}
    </section>
  )
}
