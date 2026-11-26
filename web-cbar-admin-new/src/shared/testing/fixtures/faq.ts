/** FAQ samples: the real contract (spec 051, `specs/051-faq-page/contracts/admin-api.md`). Stored as detail DTOs. */

import type { MockRow } from '../handlers/lib/crud-store'

export interface FaqTopicMockRow extends MockRow {
  slug: string
  sortOrder: number
  status: string
  translations: { az?: { name: string }; en?: { name: string } }
  pageIds: number[]
}

type QuestionTranslation = { question: string; answer: string }

export interface FaqQuestionMockRow extends MockRow {
  topicId: number
  sortOrder: number
  status: string
  translations: { az?: QuestionTranslation; en?: QuestionTranslation }
}

export interface FaqVideoMockRow extends MockRow {
  youtubeUrl: string
  youtubeId: string
  sortOrder: number
  status: string
  translations: { az?: { title: string }; en?: { title: string } }
}

export const faqTopicFixtures: FaqTopicMockRow[] = [
  {
    id: 1,
    slug: 'pul-siyaseti',
    sortOrder: 0,
    status: 'published',
    translations: { az: { name: 'Pul siyasəti' }, en: { name: 'Monetary policy' } },
    pageIds: [5],
  },
  {
    id: 2,
    slug: 'odenis-sistemleri',
    sortOrder: 1,
    status: 'published',
    translations: { az: { name: 'Ödəniş sistemləri' } },
    pageIds: [],
  },
  {
    id: 3,
    slug: 'maliyye-savadliligi',
    sortOrder: 2,
    status: 'draft',
    translations: { az: { name: 'Maliyyə savadlılığı' } },
    pageIds: [],
  },
]

export const faqQuestionFixtures: FaqQuestionMockRow[] = [
  {
    id: 1,
    topicId: 1,
    sortOrder: 0,
    status: 'published',
    translations: {
      az: { question: 'Pul siyasəti nədir?', answer: '<p>Qiymət sabitliyinə yönələn tədbirlər.</p>' },
      en: { question: 'What is monetary policy?', answer: '<p>Measures aimed at price stability.</p>' },
    },
  },
  {
    id: 2,
    topicId: 1,
    sortOrder: 1,
    status: 'published',
    translations: { az: { question: 'Uçot dərəcəsi nədir?', answer: '<p>Mərkəzi Bankın faiz dərəcəsi.</p>' } },
  },
  {
    id: 3,
    topicId: 1,
    sortOrder: 2,
    status: 'draft',
    translations: { az: { question: 'İnflyasiya necə ölçülür?', answer: '<p>İstehlak qiymətləri indeksi ilə.</p>' } },
  },
  {
    id: 4,
    topicId: 2,
    sortOrder: 0,
    status: 'published',
    translations: { az: { question: 'Ani ödəniş nədir?', answer: '<p>Saniyələr içində köçürmə.</p>' } },
  },
]

export const faqVideoFixtures: FaqVideoMockRow[] = [
  {
    id: 1,
    youtubeUrl: 'https://www.youtube.com/watch?v=abc123XYZ',
    youtubeId: 'abc123XYZ',
    sortOrder: 0,
    status: 'published',
    translations: { az: { title: 'İnflyasiya haqqında' } },
  },
  {
    id: 2,
    youtubeUrl: 'https://youtu.be/def456UVW',
    youtubeId: 'def456UVW',
    sortOrder: 1,
    status: 'published',
    translations: { az: { title: 'Ödəniş kartları' } },
  },
]
