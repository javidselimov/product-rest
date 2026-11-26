/** `GET /api/v1/faq` and `GET /api/v1/faq/topics`, `specs/051-faq-page/contracts/public-api.md`. */
import { z } from 'zod'

export const faqQuestionSchema = z.object({ id: z.number(), question: z.string(), answer: z.string() })

export const faqTopicSchema = z.object({ slug: z.string(), name: z.string(), questions: z.array(faqQuestionSchema) })

export const faqVideoSchema = z.object({ id: z.number(), youtubeUrl: z.string(), title: z.string() })

export const faqSchema = z.object({ topics: z.array(faqTopicSchema), videos: z.array(faqVideoSchema) })

export const faqTopicLinkSchema = z.object({ slug: z.string(), name: z.string(), questionCount: z.number() })

export const faqTopicLinkListSchema = z.array(faqTopicLinkSchema)

export type FaqDto = z.infer<typeof faqSchema>
export type FaqTopicDto = z.infer<typeof faqTopicSchema>
export type FaqVideoDto = z.infer<typeof faqVideoSchema>
export type FaqTopicLinkDto = z.infer<typeof faqTopicLinkSchema>
