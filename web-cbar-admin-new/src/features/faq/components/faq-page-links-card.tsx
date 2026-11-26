/**
 * "Sual-cavab keçid kartı" on the page form (spec 051 US5): the FAQ topics linked to this page, whose link cards the
 * site shows after the page's text, each with a link to the topic's form. A page no topic links to gets no card; a
 * failed request shows none either, since the card is a pointer and the page form must still work.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { faqKeys } from '../api/faq.keys'
import { faqService } from '../api/faq.service'
import { FAQ_TOPICS_PATH } from '../model/constants'

export function FaqPageLinksCard({ pageId }: Readonly<{ pageId: number }>) {
  const { t } = useTranslation('faq')
  const topics = useQuery({ queryKey: faqKeys.topicsForPage(pageId), queryFn: () => faqService.topicsForPage(pageId) })
  if (!topics.data?.length) return null

  return (
    <Card data-testid="faq-page-links">
      <CardHeader>
        <CardTitle>{t('pageCard.title')}</CardTitle>
        <CardDescription>{t('pageCard.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {topics.data.map((topic) => (
            <li key={topic.id}>
              <Link
                to={`${FAQ_TOPICS_PATH}/$id`}
                params={{ id: String(topic.id) }}
                className="text-primary underline-offset-4 hover:underline"
              >
                {topic.name ?? `#${topic.id}`}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
