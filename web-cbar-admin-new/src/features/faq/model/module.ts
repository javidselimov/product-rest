/**
 * FAQ modules (spec 051, `specs/051-faq-page/contracts/admin-ux.md`): questions, topics and videos of the
 * "Sual-cavab" page. Topic choices come from a lookup, so `buildFaqQuestionsModule` takes them as an argument,
 * as `buildReleaseScheduleItemsModule` does; `faqQuestionsModuleBase` is the variant without choices for the
 * route tree. Order is not a form field: questions are ordered on their topic's form, topics and videos in a
 * dialog over the list.
 */

import { createElement } from 'react'

import {
  LOCALES,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
  type SelectOption,
} from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defaultBuildPayload } from '@/shared/crud/form-model'
import {
  defineModule,
  type FieldConfig,
  type FormSchema,
  type ModuleConfig,
  type SectionTabConfig,
} from '@/shared/crud/types'
import { youtubeVideoId } from '@/shared/crud/youtube-url'
import { i18n } from '@/shared/i18n'
import { FAQ_QUESTIONS_MODULE_ID, FAQ_TOPICS_MODULE_ID, FAQ_VIDEOS_MODULE_ID } from '../api/faq.keys'
import { LocaleBadges } from '@/entities/content/ui/locale-badges'
import { TopicExtras } from '../components/topic-extras'
import { VideoPreview, VideoThumb } from '../components/video-preview'
import { isBlankHtml } from '@/shared/lib/blank-html'
import {
  CONTENT_STATUS,
  FAQ_PATH,
  FAQ_TOPICS_PATH,
  FAQ_VIDEOS_PATH,
  MISSING_LOCALE_EN,
  PREVIEW_THUMB,
  TOPIC_ID_PARAM,
} from './constants'
import {
  FAQ_STATUS_OPTIONS,
  faqQuestionDetailSchema,
  faqQuestionRowSchema,
  faqTopicDetailSchema,
  faqTopicRowSchema,
  faqVideoDetailSchema,
  faqVideoRowSchema,
  type FaqQuestionRow,
  type FaqTopicRow,
  type FaqVideoRow,
} from './schemas'

export const faqSectionTabs: SectionTabConfig[] = [
  { to: FAQ_PATH, labelKey: 'faq:tabs.questions' },
  { to: FAQ_TOPICS_PATH, labelKey: 'faq:tabs.topics' },
  { to: FAQ_VIDEOS_PATH, labelKey: 'faq:tabs.videos' },
]

const statusField: FieldConfig = {
  name: 'status',
  labelKey: 'fields.status',
  type: 'select',
  options: FAQ_STATUS_OPTIONS,
  // An editor adds a question to show it: published unless they choose otherwise.
  defaultValue: CONTENT_STATUS.PUBLISHED,
  helpKey: 'fields.statusHelp',
}

const statusColumn = {
  key: 'status',
  headerKey: 'columns.status',
  render: 'badge' as const,
  badgePalette: STATUS_PALETTE,
  badgeLabelKey: STATUS_LABEL_KEYS,
}

const statusFilter = { name: 'status', labelKey: 'filters.status', type: 'select' as const, options: FAQ_STATUS_OPTIONS }

const message = (key: string) => i18n.t(`faq:validation.${key}`)

/** At least one language must have a value in `field`; the API refuses the save otherwise. */
const oneLanguage =
  (field: string, key: string) =>
  (base: FormSchema): FormSchema =>
    base.superRefine((data, ctx) => {
      if (LOCALES.some((locale) => (data.translations[locale]?.[field] ?? '').trim())) return
      ctx.addIssue({ code: 'custom', path: ['translations'], message: message(key) })
    })

// ---- questions ----

const QUESTION = 'question'
const ANSWER = 'answer'

/** A language counts as started when it has a question or an answer with content (`<p></p>` is empty). */
const questionStarted = (values: Record<string, string> | undefined) =>
  Boolean((values?.[QUESTION] ?? '').trim()) || !isBlankHtml(values?.[ANSWER])

function questionFields(topics: SelectOption[]): FieldConfig[] {
  return [
    {
      name: TOPIC_ID_PARAM,
      labelKey: 'fields.topic',
      type: 'select',
      options: topics,
      searchable: true,
      valueAsNumber: true,
      required: true,
    },
    statusField,
    { name: QUESTION, labelKey: 'fields.question', type: 'textarea', perLocale: true, helpKey: 'fields.questionHelp' },
    { name: ANSWER, labelKey: 'fields.answer', type: 'richtext', perLocale: true },
  ]
}

export function buildFaqQuestionsModule(topics: SelectOption[]): ModuleConfig<FaqQuestionRow, typeof FAQ_PATH> {
  const fields = questionFields(topics)
  return defineModule<FaqQuestionRow, typeof FAQ_PATH>({
    id: FAQ_QUESTIONS_MODULE_ID,
    ns: 'faq',
    apiPath: '/faq/questions',
    basePath: FAQ_PATH,
    titleKey: 'questions.title',
    entityKey: 'questions.entity',
    descriptionKey: 'questions.description',
    sectionTabs: faqSectionTabs,
    listEnvelope: 'paged',
    pageSize: DEFAULT_PAGE_SIZE,
    supportsSearch: true,
    rowSchema: faqQuestionRowSchema,
    detailSchema: faqQuestionDetailSchema,
    filters: [
      { name: TOPIC_ID_PARAM, labelKey: 'filters.topic', type: 'tabs', options: topics },
      statusFilter,
      {
        name: 'missingLocale',
        labelKey: 'filters.translation',
        type: 'select',
        options: [{ value: MISSING_LOCALE_EN, labelKey: 'filters.missingEn' }],
      },
    ],
    columns: [
      { key: 'number', headerKey: 'columns.number', align: 'right', width: COLUMN_WIDTH.ID },
      {
        key: QUESTION,
        headerKey: 'columns.question',
        render: 'custom',
        renderCell: (row) =>
          createElement('span', { className: 'line-clamp-2' }, row.question ?? `#${row.id}`),
      },
      { key: 'topicName', headerKey: 'columns.topic' },
      {
        key: 'locales',
        headerKey: 'columns.languages',
        render: 'custom',
        renderCell: (row) => createElement(LocaleBadges, { locales: row.locales }),
      },
      statusColumn,
    ],
    fields,
    prefillFromSearch: [TOPIC_ID_PARAM],
    schema: (base) =>
      base.superRefine((data, ctx) => {
        const started = LOCALES.filter((locale) => questionStarted(data.translations[locale]))
        // Only when nothing was written: an issue on `translations` itself would replace the field issues below.
        if (started.length === 0) {
          ctx.addIssue({ code: 'custom', path: ['translations'], message: message('oneLanguage') })
          return
        }
        for (const locale of started) {
          const values = data.translations[locale]
          const missing = !(values?.[QUESTION] ?? '').trim() ? QUESTION : isBlankHtml(values?.[ANSWER]) ? ANSWER : null
          if (missing) ctx.addIssue({ code: 'custom', path: ['translations', locale, missing], message: message('pairRequired') })
        }
      }),
    // A language left empty is not sent, even when the editor put an empty paragraph in its answer.
    buildPayload: (values, translations) => {
      const started = Object.fromEntries(
        Object.entries(translations).filter(([, localeValues]) => questionStarted(localeValues)),
      )
      return defaultBuildPayload({ fields }, values, started)
    },
    rowLabel: (row) => row.question ?? `#${row.id}`,
  })
}

export const faqQuestionsModuleBase = buildFaqQuestionsModule([])

// ---- topics ----

export const faqTopicsModule = defineModule<FaqTopicRow, typeof FAQ_TOPICS_PATH>({
  id: FAQ_TOPICS_MODULE_ID,
  ns: 'faq',
  apiPath: '/faq/topics',
  basePath: FAQ_TOPICS_PATH,
  titleKey: 'topics.title',
  entityKey: 'topics.entity',
  descriptionKey: 'topics.description',
  sectionTabs: faqSectionTabs,
  listEnvelope: 'paged',
  supportsSearch: true,
  rowSchema: faqTopicRowSchema,
  detailSchema: faqTopicDetailSchema,
  filters: [statusFilter],
  columns: [
    { key: 'name', headerKey: 'columns.name' },
    { key: 'questionCount', headerKey: 'columns.questionCount', align: 'right', width: COLUMN_WIDTH.NUMBER_MD },
    {
      key: 'locales',
      headerKey: 'columns.languages',
      render: 'custom',
      renderCell: (row) => createElement(LocaleBadges, { locales: row.locales }),
    },
    {
      key: 'pages',
      headerKey: 'columns.pages',
      render: 'custom',
      renderCell: (row) => row.pages.map((page) => page.title).join(', '),
    },
    statusColumn,
  ],
  fields: [{ name: 'name', labelKey: 'fields.name', type: 'text', perLocale: true }, statusField],
  schema: oneLanguage('name', 'nameRequired'),
  editExtras: TopicExtras,
  rowLabel: (row) => row.name ?? `#${row.id}`,
})

// ---- videos ----

const YOUTUBE_URL = 'youtubeUrl'

export const faqVideosModule = defineModule<FaqVideoRow, typeof FAQ_VIDEOS_PATH>({
  id: FAQ_VIDEOS_MODULE_ID,
  ns: 'faq',
  apiPath: '/faq/videos',
  basePath: FAQ_VIDEOS_PATH,
  titleKey: 'videos.title',
  entityKey: 'videos.entity',
  descriptionKey: 'videos.description',
  sectionTabs: faqSectionTabs,
  listEnvelope: 'paged',
  rowSchema: faqVideoRowSchema,
  detailSchema: faqVideoDetailSchema,
  filters: [statusFilter],
  columns: [
    {
      key: 'youtubeId',
      headerKey: 'columns.preview',
      render: 'custom',
      width: PREVIEW_THUMB.WIDTH_PX,
      renderCell: (row) => createElement(VideoThumb, { youtubeId: row.youtubeId }),
    },
    { key: 'title', headerKey: 'columns.title' },
    statusColumn,
  ],
  fields: [
    {
      name: YOUTUBE_URL,
      labelKey: 'fields.youtubeUrl',
      type: 'text',
      required: true,
      placeholderKey: 'fields.youtubeUrlPlaceholder',
      helpKey: 'fields.youtubeUrlHelp',
    },
    statusField,
    { name: 'title', labelKey: 'fields.title', type: 'text', perLocale: true },
  ],
  schema: (base) =>
    oneLanguage('title', 'titleRequired')(base).superRefine((data, ctx) => {
      const url = String(data.values[YOUTUBE_URL] ?? '')
      if (url.trim() === '' || youtubeVideoId(url)) return
      ctx.addIssue({ code: 'custom', path: ['values', YOUTUBE_URL], message: message('youtubeUrl') })
    }),
  editExtras: VideoPreview,
  rowLabel: (row) => row.title ?? `#${row.id}`,
})
