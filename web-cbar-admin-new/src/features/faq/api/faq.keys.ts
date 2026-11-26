/** FAQ module ids and query keys (spec 051): the module ids are the engine's key roots (B1). */

import { crudKeys } from '@/features/crud/api/crud.keys'

export const FAQ_QUESTIONS_MODULE_ID = 'faq-questions'
export const FAQ_TOPICS_MODULE_ID = 'faq-topics'
export const FAQ_VIDEOS_MODULE_ID = 'faq-videos'

export const faqQuestionsKeys = crudKeys(FAQ_QUESTIONS_MODULE_ID)
export const faqTopicsKeys = crudKeys(FAQ_TOPICS_MODULE_ID)
export const faqVideosKeys = crudKeys(FAQ_VIDEOS_MODULE_ID)

export const faqKeys = {
  /** Under the topics root, so a topic change refreshes it. */
  topicOptions: () => [FAQ_TOPICS_MODULE_ID, 'faq-options'] as const,
  /** Under the questions root, so a question change refreshes the topic's list. */
  topicQuestions: (topicId: string | number) => [FAQ_QUESTIONS_MODULE_ID, 'by-topic', String(topicId)] as const,
  topicsForPage: (pageId: string | number) => [FAQ_TOPICS_MODULE_ID, 'by-page', String(pageId)] as const,
  allVideos: () => [FAQ_VIDEOS_MODULE_ID, 'all'] as const,
  pageOptions: () => ['faq', 'page-options'] as const,
}
