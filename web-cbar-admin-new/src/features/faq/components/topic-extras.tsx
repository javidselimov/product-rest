/**
 * `editExtras` of the topic form (spec 051): the topic's address on the site, its questions in order, and the pages
 * that show a link card to it. Shown after the first save, since all three need the topic's id.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@cbar/lib-react-ui-kit/card'
import { useTranslation } from 'react-i18next'

import type { AnyRow } from '@/shared/crud/types'
import { SITE_FAQ_PATH } from '../model/constants'
import { faqTopicDetailSchema } from '../model/schemas'
import { TopicPagesSection } from './topic-pages-section'
import { TopicQuestionsSection } from './topic-questions-section'

export function TopicExtras({ id, detail }: Readonly<{ id: string; detail: AnyRow }>) {
  const { t } = useTranslation('faq')
  // The engine has parsed the detail with the same schema already (`detailSchema`).
  const topic = faqTopicDetailSchema.parse(detail)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('address.title')}</CardTitle>
          <CardDescription>{t('address.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="bg-muted rounded px-2 py-1 text-sm">{`${SITE_FAQ_PATH}?topic=${topic.slug}`}</code>
        </CardContent>
      </Card>
      <TopicQuestionsSection topicId={id} />
      <TopicPagesSection topic={topic} />
    </>
  )
}
