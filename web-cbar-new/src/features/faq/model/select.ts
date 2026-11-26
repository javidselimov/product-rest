/**
 * FAQ view model (spec 051 data-model "Saytdakı görünüş modeli"): one pure function from the API response and the URL
 * (`q`, `topic`) to what the page renders. Numbers, counts and open states are derived here once, not stored.
 *
 * - View A (`all`): every topic, closed; a search keeps only matching questions, opens them and their topics.
 * - View B (`topic`): one topic by its slug, with the search applied inside it; an unknown slug falls back to A.
 * A question keeps the number it has in its topic, so a search result reads the same as the full list.
 */
import { stripHtml } from '@/entities/content'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { foldForSearch } from '@/shared/lib/search-fold'

import type { FaqDto } from './schemas'

export type FaqQuestionView = { id: number; number: number; question: string; answerHtml: string; open: boolean }

export type FaqTopicView = { slug: string; name: string; total: number; open: boolean; questions: FaqQuestionView[] }

export type FaqTopicOption = { slug: string; name: string }

type Common = { query: string; matches: number }

export type FaqView =
  | (Common & { kind: 'all'; topics: FaqTopicView[] })
  | (Common & { kind: 'topic'; topic: FaqTopicView; options: FaqTopicOption[] })

export type FaqQuery = { q: string; topic: string }

type Indexed = { slug: string; name: string; questions: (FaqQuestionView & { haystack: string })[] }

function index(faq: FaqDto): Indexed[] {
  return faq.topics.map((topic) => ({
    slug: topic.slug,
    name: topic.name,
    questions: topic.questions.map((q, i) => ({
      id: q.id,
      number: i + 1,
      question: q.question,
      answerHtml: prepareCmsHtml(q.answer),
      open: false,
      haystack: foldForSearch(`${q.question} ${stripHtml(q.answer)}`),
    })),
  }))
}

function toView(topic: Indexed, needle: string): FaqTopicView {
  const matching = needle ? topic.questions.filter((q) => q.haystack.includes(needle)) : topic.questions
  const questions = matching.map(
    (q): FaqQuestionView => ({ id: q.id, number: q.number, question: q.question, answerHtml: q.answerHtml, open: needle !== '' }),
  )
  return { slug: topic.slug, name: topic.name, total: questions.length, open: needle !== '' && questions.length > 0, questions }
}

/** `null` when the FAQ has no topic: the page then shows the CMS page's own text. */
export function buildFaqView(faq: FaqDto, { q, topic }: FaqQuery): FaqView | null {
  if (faq.topics.length === 0) return null
  const query = q.trim()
  const needle = foldForSearch(query)
  const topics = index(faq)

  const chosen = topics.find((t) => t.slug === topic)
  if (chosen) {
    const view = toView(chosen, needle)
    return {
      kind: 'topic',
      query,
      matches: view.total,
      topic: view,
      options: topics.map(({ slug, name }) => ({ slug, name })),
    }
  }

  const views = topics.map((t) => toView(t, needle)).filter((t) => t.total > 0)
  return { kind: 'all', query, matches: views.reduce((n, t) => n + t.total, 0), topics: views }
}
