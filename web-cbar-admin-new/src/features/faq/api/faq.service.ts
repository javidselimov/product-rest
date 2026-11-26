/**
 * FAQ requests beyond the CRUD engine (spec 051, `contracts/admin-api.md`): full lists for choices and ordering, the three
 * reorder endpoints, and the page links of a topic. Every response is parsed (B13).
 */

import { z, ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { FAQ_FULL_LIST_SIZE } from '../model/constants'
import {
  faqQuestionRowSchema,
  faqTopicRowSchema,
  faqVideoRowSchema,
  pageListSchema,
  type FaqQuestionRow,
  type FaqTopicDetail,
  type FaqTopicRow,
  type FaqVideoRow,
} from '../model/schemas'

function parse<T>(schema: ZodType<T>, data: unknown, context: string): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) throw contractError(`${context}: ${error.issues[0]?.path.join('.') ?? ''}`)
    throw error
  }
}

const full = { pageSize: FAQ_FULL_LIST_SIZE }

/** Only what the page picker needs from `GET /pages/tree`; the pages feature owns the full node. */
export interface FaqPageNode {
  id: number
  title: string | null
  children: FaqPageNode[]
}
const pageNodeSchema: ZodType<FaqPageNode> = z.lazy(() =>
  z.looseObject({ id: z.number(), title: z.string().nullable(), children: z.array(pageNodeSchema).default([]) }),
)

export const faqService = {
  topics: async (): Promise<FaqTopicRow[]> =>
    parse(pageListSchema(faqTopicRowSchema), await apiClient.get('/faq/topics', { params: full }), 'faq.topics').items,

  topicsForPage: async (pageId: number): Promise<FaqTopicRow[]> =>
    parse(pageListSchema(faqTopicRowSchema), await apiClient.get('/faq/topics', { params: { pageId } }), 'faq.topicsForPage').items,

  topicQuestions: async (topicId: string | number): Promise<FaqQuestionRow[]> =>
    parse(
      pageListSchema(faqQuestionRowSchema),
      await apiClient.get('/faq/questions', { params: { ...full, topicId } }),
      'faq.topicQuestions',
    ).items,

  videos: async (): Promise<FaqVideoRow[]> =>
    parse(pageListSchema(faqVideoRowSchema), await apiClient.get('/faq/videos', { params: full }), 'faq.videos').items,

  pageTree: async (): Promise<FaqPageNode[]> =>
    parse(z.array(pageNodeSchema), await apiClient.get('/pages/tree', { params: { locale: 'az' } }), 'faq.pageTree'),

  reorderTopics: (ids: number[]) => apiClient.put<void>('/faq/topics/order', { ids }),
  reorderTopicQuestions: (topicId: string | number, ids: number[]) =>
    apiClient.put<void>(`/faq/topics/${topicId}/questions/order`, { ids }),
  reorderVideos: (ids: number[]) => apiClient.put<void>('/faq/videos/order', { ids }),

  /** Replaces a topic's linked pages; name and status are sent as stored, so the form's unsaved edits are not touched. */
  setTopicPages: (topic: FaqTopicDetail, pageIds: number[]) =>
    apiClient.put<unknown>(`/faq/topics/${topic.id}`, { status: topic.status, translations: topic.translations, pageIds }),
}
