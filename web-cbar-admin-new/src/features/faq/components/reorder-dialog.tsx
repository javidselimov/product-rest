/** "Sıranı dəyiş" over the FAQ topics and videos lists (spec 051), on the shared CRUD reorder dialog (spec 053). */

import { useTranslation } from 'react-i18next'

import { ReorderDialog } from '@/features/crud/components/reorder-dialog'
import { FAQ_TOPICS_MODULE_ID, FAQ_VIDEOS_MODULE_ID, faqKeys } from '../api/faq.keys'
import { faqService } from '../api/faq.service'
import type { FaqTopicRow, FaqVideoRow } from '../model/schemas'

export function TopicsReorderDialog() {
  const { t } = useTranslation('faq')
  return (
    <ReorderDialog<FaqTopicRow>
      title={t('reorder.topicsTitle')}
      queryKey={faqKeys.topicOptions()}
      load={faqService.topics}
      save={faqService.reorderTopics}
      getLabel={(topic) => topic.name ?? `#${topic.id}`}
      moduleId={FAQ_TOPICS_MODULE_ID}
    />
  )
}

export function VideosReorderDialog() {
  const { t } = useTranslation('faq')
  return (
    <ReorderDialog<FaqVideoRow>
      title={t('reorder.videosTitle')}
      queryKey={faqKeys.allVideos()}
      load={faqService.videos}
      save={faqService.reorderVideos}
      getLabel={(video) => video.title ?? `#${video.id}`}
      moduleId={FAQ_VIDEOS_MODULE_ID}
    />
  )
}
