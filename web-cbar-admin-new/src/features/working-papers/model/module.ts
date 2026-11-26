/**
 * Working papers module (spec 054 US2, `contracts/admin-ux.md` §2): the papers of the "İşçi məqalələr silsiləsi"
 * page, each with its own detail page on the site. A paper has a number within its year (`02/2025`), the language it
 * is written in, JEL codes, and per language a title, authors, an abstract, keywords and a PDF.
 */

import { createElement } from 'react'

import {
  LOCALES,
  PAGE_STATUS_OPTIONS,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
  type SelectOption,
} from '@/entities/content/model/types'
import { LocaleBadges } from '@/entities/content/ui/locale-badges'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defineModule, type FieldConfig } from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { WORKING_PAPERS_MODULE_ID } from '../api/working-papers.keys'
import {
  JEL_CODE_PATTERN,
  NUMBER_MAX,
  NUMBER_MIN,
  PAPER_LANGUAGES,
  TITLE_MAX_LENGTH,
  WORKING_PAPERS_PATH,
  YEAR_MIN,
  yearMax,
} from './constants'
import { buildWorkingPaperPayload, isLocaleStarted, parseWorkingPaperDetail, splitList } from './payload'
import { workingPaperDetailSchema, workingPaperRowSchema, type WorkingPaperRow } from './schemas'

const NS = 'workingPapers'

const message = (key: string, options?: Record<string, unknown>) => i18n.t(`${NS}:validation.${key}`, options)

const PAPER_LANGUAGE_OPTIONS: SelectOption[] = PAPER_LANGUAGES.map((language) => ({
  value: language,
  labelKey: `${NS}:paperLanguages.${language}`,
}))

const fields: FieldConfig[] = [
  {
    name: 'number',
    labelKey: 'fields.number',
    type: 'number',
    required: true,
    min: NUMBER_MIN,
    max: NUMBER_MAX,
    helpKey: 'fields.numberHelp',
  },
  { name: 'year', labelKey: 'fields.year', type: 'number', required: true, min: YEAR_MIN, max: yearMax() },
  { name: 'paperLanguage', labelKey: 'fields.paperLanguage', type: 'select', options: PAPER_LANGUAGE_OPTIONS },
  { name: 'jelCodes', labelKey: 'fields.jelCodes', type: 'text', helpKey: 'fields.jelCodesHelp' },
  // The API refuses `scheduled`: a paper has no planned publication.
  { name: 'status', labelKey: 'fields.status', type: 'select', options: PAGE_STATUS_OPTIONS },
  { name: 'title', labelKey: 'fields.title', type: 'text', perLocale: true, required: true },
  { name: 'authors', labelKey: 'fields.authors', type: 'text', perLocale: true, helpKey: 'fields.authorsHelp' },
  { name: 'abstract', labelKey: 'fields.abstract', type: 'textarea', perLocale: true, helpKey: 'fields.abstractHelp' },
  { name: 'keywords', labelKey: 'fields.keywords', type: 'textarea', perLocale: true, helpKey: 'fields.keywordsHelp' },
  {
    name: 'mediaId',
    labelKey: 'fields.file',
    type: 'media',
    perLocale: true,
    mediaAccept: 'document',
    mediaNameKey: 'translations.{locale}.media.originalName',
  },
]

export const workingPapersModule = defineModule<WorkingPaperRow, typeof WORKING_PAPERS_PATH>({
  id: WORKING_PAPERS_MODULE_ID,
  ns: NS,
  apiPath: WORKING_PAPERS_PATH,
  basePath: WORKING_PAPERS_PATH,
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  supportsSearch: true,
  rowSchema: workingPaperRowSchema,
  detailSchema: workingPaperDetailSchema,
  emptyKey: 'empty',
  filters: [
    { name: 'year', labelKey: 'filters.year', type: 'number' },
    { name: 'status', labelKey: 'filters.status', type: 'select', options: PAGE_STATUS_OPTIONS },
  ],
  columns: [
    { key: 'code', headerKey: 'columns.code', width: COLUMN_WIDTH.CODE },
    { key: 'title', headerKey: 'columns.title' },
    {
      key: 'locales',
      headerKey: 'columns.locales',
      render: 'custom',
      renderCell: (row) => createElement(LocaleBadges, { locales: row.locales }),
    },
    {
      key: 'status',
      headerKey: 'columns.status',
      render: 'badge',
      badgePalette: STATUS_PALETTE,
      badgeLabelKey: STATUS_LABEL_KEYS,
    },
    { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'date', width: COLUMN_WIDTH.ACTIONS },
  ],
  fields,
  prefillFromSearch: ['year'],
  // A 409 is the number taken in its year.
  conflictField: 'number',
  buildPayload: buildWorkingPaperPayload,
  parseDetail: parseWorkingPaperDetail,
  // FR-004: a title in at least one language (the `required` title field), authors for a language with a title,
  // a title for a language started otherwise (the API would drop it silently), JEL codes in their format.
  schema: (base) =>
    base.superRefine((data, ctx) => {
      for (const locale of LOCALES) {
        const tr = data.translations[locale] ?? {}
        const title = (tr.title ?? '').trim()
        if (!isLocaleStarted(tr)) continue
        if (!title) {
          ctx.addIssue({ code: 'custom', path: ['translations', locale, 'title'], message: message('titleRequired') })
          continue
        }
        if (title.length > TITLE_MAX_LENGTH)
          ctx.addIssue({
            code: 'custom',
            path: ['translations', locale, 'title'],
            message: message('titleTooLong', { max: TITLE_MAX_LENGTH }),
          })
        if (splitList(tr.authors).length === 0)
          ctx.addIssue({ code: 'custom', path: ['translations', locale, 'authors'], message: message('authorsRequired') })
      }
      const jelCodes = typeof data.values.jelCodes === 'string' ? data.values.jelCodes : ''
      const badCode = splitList(jelCodes).find((code) => !JEL_CODE_PATTERN.test(code))
      if (badCode !== undefined)
        ctx.addIssue({ code: 'custom', path: ['values', 'jelCodes'], message: message('jelCode', { code: badCode }) })
    }),
  rowLabel: (row) => (row.title ? `${row.code} ${row.title}` : row.code),
})
