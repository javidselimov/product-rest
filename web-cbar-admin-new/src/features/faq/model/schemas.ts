/** FAQ schemas (spec 051, `specs/051-faq-page/contracts/admin-api.md`). List DTOs are flat; details carry the translations. */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  translationsSchema,
  type ContentStatus,
  type SelectOption,
} from '@/entities/content/model/types'

/** The API refuses `scheduled`: FAQ items have no planned publication. */
const SCHEDULED: ContentStatus = 'scheduled'
export const FAQ_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUS_OPTIONS.filter((option) => option.value !== SCHEDULED)

const localesSchema = z.array(z.string())

export const faqTopicRowSchema = z.looseObject({
  id: z.number(),
  slug: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  name: z.string().nullable(),
  questionCount: z.number(),
  locales: localesSchema,
  pages: z.array(z.object({ id: z.number(), title: z.string() })),
})
export type FaqTopicRow = z.infer<typeof faqTopicRowSchema>

export const faqTopicDetailSchema = z.looseObject({
  id: z.number(),
  slug: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  translations: translationsSchema(z.looseObject({ name: z.string() })),
  pageIds: z.array(z.number()),
  pages: z.array(z.object({ id: z.number(), title: z.string() })),
})
export type FaqTopicDetail = z.infer<typeof faqTopicDetailSchema>

export const faqQuestionRowSchema = z.looseObject({
  id: z.number(),
  topicId: z.number(),
  topicName: z.string().nullable(),
  sortOrder: z.number(),
  number: z.number(),
  status: z.string(),
  question: z.string().nullable(),
  locales: localesSchema,
  incompleteLocales: localesSchema,
})
export type FaqQuestionRow = z.infer<typeof faqQuestionRowSchema>

export const faqQuestionDetailSchema = z.looseObject({
  id: z.number(),
  topicId: z.number(),
  sortOrder: z.number(),
  status: z.string(),
  translations: translationsSchema(z.looseObject({ question: z.string(), answer: z.string() })),
})

export const faqVideoRowSchema = z.looseObject({
  id: z.number(),
  youtubeUrl: z.string(),
  youtubeId: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  title: z.string().nullable(),
})
export type FaqVideoRow = z.infer<typeof faqVideoRowSchema>

export const faqVideoDetailSchema = z.looseObject({
  id: z.number(),
  youtubeUrl: z.string(),
  youtubeId: z.string(),
  sortOrder: z.number(),
  status: z.string(),
  translations: translationsSchema(z.looseObject({ title: z.string() })),
})

export const pageListSchema = <T extends z.ZodTypeAny>(row: T) =>
  z.object({ items: z.array(row), total: z.number(), page: z.number(), pageSize: z.number() })
