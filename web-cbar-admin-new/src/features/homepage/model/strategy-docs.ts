/**
 * The homepage "Strategiya və sənədlər" documents (spec 057, `specs/057-homepage-strategy-docs/contracts/admin-ux.md`).
 * The page choices come from the page tree, so `buildStrategyDocsModule` takes them as an argument, as the events module
 * does; `strategyDocsModuleBase` is the variant without choices for the route tree. Order is not a form field: the list
 * is ordered in a dialog over it.
 */

import { createElement } from 'react'
import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  LOCALES,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
  contentStatusSchema,
  translationsSchema,
  type SelectOption,
} from '@/entities/content/model/types'
import { LocaleBadges } from '@/entities/content/ui/locale-badges'
import { MediaPreview } from '@/features/media/components/media-preview'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { defaultBuildPayload } from '@/shared/crud/form-model'
import { defineModule, type FieldConfig, type FormSchema, type ModuleConfig } from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { isAllowedLink } from '@/shared/lib/site-link'
import { StrategyDocLinkCell } from '../components/strategy-doc-cells'
import {
  COLUMN_WIDTH,
  COVER_THUMB_WIDTH_PX,
  STRATEGY_DOC_LIMITS,
  STRATEGY_DOCS_MODULE_ID,
  STRATEGY_DOCS_PATH,
} from './constants'
import { HOMEPAGE_CRUMBS, HOMEPAGE_SECTION_TABS } from './section'

export { STRATEGY_DOCS_MODULE_ID, STRATEGY_DOCS_PATH }

// ---- schemas (contracts/admin-api.md) ----

/** A media file as the API names it (`AssetRef`); null when there is none or it is deleted. */
const assetRefSchema = z.looseObject({
  mediaId: z.number(),
  originalName: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
})

export const strategyDocRowSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  status: contentStatusSchema,
  title: z.string().nullable(),
  pageId: z.number().nullable(),
  pageTitle: z.string().nullable(),
  urls: z.record(z.string(), z.string()),
  cover: assetRefSchema.nullable(),
  locales: z.array(z.string()),
  linkBroken: z.boolean(),
  updatedAt: z.string(),
})
export type StrategyDocRow = z.infer<typeof strategyDocRowSchema>

export const strategyDocDetailSchema = z.looseObject({
  id: z.number(),
  sortOrder: z.number(),
  status: contentStatusSchema,
  pageId: z.number().nullable(),
  page: z.looseObject({ id: z.number(), title: z.string().nullable() }).nullable(),
  translations: translationsSchema(
    z.looseObject({
      title: z.string(),
      summary: z.string().nullable(),
      url: z.string().nullable(),
      coverMediaId: z.number().nullable(),
      cover: assetRefSchema.nullable(),
    }),
  ),
})

// ---- form ----

const PUBLISHED = 'published'
const DRAFT = 'draft'
/** The API takes only these two: a document has no planned or archived state. */
const STRATEGY_STATUS_OPTIONS: SelectOption[] = CONTENT_STATUS_OPTIONS.filter(
  (option) => option.value === PUBLISHED || option.value === DRAFT,
)

const TITLE = 'title'
const SUMMARY = 'summary'
const COVER = 'coverMediaId'
const URL_FIELD = 'url'
const PAGE = 'pageId'

/** The API's length limits of a language (`StrategyDocRules`). */
const TEXT_LIMITS = [
  [TITLE, STRATEGY_DOC_LIMITS.TITLE],
  [SUMMARY, STRATEGY_DOC_LIMITS.SUMMARY],
  [URL_FIELD, STRATEGY_DOC_LIMITS.URL],
] as const

/** A message of the `homepage:validation` namespace. */
const message = (key: string, options?: Record<string, unknown>) => i18n.t(`homepage:validation.${key}`, options)

/** The row's label in the list, the order dialog and the delete dialog: the title, or the id. */
export const strategyDocLabel = (row: Pick<StrategyDocRow, 'id' | 'title'>) => row.title ?? `#${row.id}`

const strategyDocFields = (pages: SelectOption[]): FieldConfig[] => [
  {
    name: 'status',
    labelKey: 'fields.status',
    type: 'select',
    options: STRATEGY_STATUS_OPTIONS,
    // An editor adds a document to show it: published unless they choose otherwise.
    defaultValue: PUBLISHED,
    helpKey: 'fields.statusHelp',
  },
  {
    name: PAGE,
    labelKey: 'fields.page',
    type: 'select',
    options: pages,
    searchable: true,
    valueAsNumber: true,
    nullable: true,
    helpKey: 'fields.pageHelp',
    mediaNameKey: 'page.title',
  },
  { name: TITLE, labelKey: 'fields.title', type: 'text', perLocale: true },
  { name: SUMMARY, labelKey: 'fields.summary', type: 'textarea', perLocale: true, helpKey: 'fields.summaryHelp' },
  {
    name: COVER,
    labelKey: 'fields.cover',
    type: 'media',
    perLocale: true,
    mediaAccept: 'image',
    helpKey: 'fields.coverHelp',
    mediaNameKey: 'translations.{locale}.cover.originalName',
  },
  {
    name: URL_FIELD,
    labelKey: 'fields.address',
    type: 'text',
    perLocale: true,
    placeholderKey: 'fields.addressPlaceholder',
    helpKey: 'fields.addressHelp',
  },
]

/**
 * The API's rules before the request: a title in one language at least, and in every language the editor wrote something
 * in (`buildPayload` does not send an untitled language, so its text would be lost silently); a page or an address in a
 * titled language; the address rule and the length limits.
 */
const strategyDocSchema = (base: FormSchema): FormSchema =>
  base.superRefine((data, ctx) => {
    const text = (locale: string, name: string) => String(data.translations[locale]?.[name] ?? '').trim()
    const titled = (locale: string) => Boolean(text(locale, TITLE))
    const started = (locale: string) => Object.keys(data.translations[locale] ?? {}).some((name) => text(locale, name))

    if (!LOCALES.some(titled)) ctx.addIssue({ code: 'custom', path: ['translations', 'az', TITLE], message: message('titleRequired') })
    for (const locale of LOCALES.filter((locale) => started(locale) && !titled(locale)))
      ctx.addIssue({ code: 'custom', path: ['translations', locale, TITLE], message: message('titleForLanguage') })

    for (const locale of LOCALES) {
      for (const [name, max] of TEXT_LIMITS)
        if (text(locale, name).length > max)
          ctx.addIssue({ code: 'custom', path: ['translations', locale, name], message: message('tooLong', { max }) })
      const url = text(locale, URL_FIELD)
      if (url && !isAllowedLink(url))
        ctx.addIssue({ code: 'custom', path: ['translations', locale, URL_FIELD], message: message('address') })
    }

    const page = String(data.values[PAGE] ?? '').trim()
    const titledAddress = LOCALES.some((locale) => titled(locale) && text(locale, URL_FIELD))
    if (!page && !titledAddress) ctx.addIssue({ code: 'custom', path: ['values', PAGE], message: message('linkRequired') })
  })

export function buildStrategyDocsModule({ pages }: { pages: SelectOption[] }): ModuleConfig<StrategyDocRow, typeof STRATEGY_DOCS_PATH> {
  const fields = strategyDocFields(pages)
  return defineModule<StrategyDocRow, typeof STRATEGY_DOCS_PATH>({
    id: STRATEGY_DOCS_MODULE_ID,
    ns: 'homepage',
    apiPath: '/homepage-strategy-docs',
    basePath: STRATEGY_DOCS_PATH,
    titleKey: 'strategyDocs.title',
    entityKey: 'strategyDocs.entity',
    descriptionKey: 'strategyDocs.description',
    crumbs: HOMEPAGE_CRUMBS,
    sectionTabs: HOMEPAGE_SECTION_TABS,
    listEnvelope: 'paged',
    pageSize: DEFAULT_PAGE_SIZE,
    supportsSearch: true,
    rowSchema: strategyDocRowSchema,
    detailSchema: strategyDocDetailSchema,
    filters: [{ name: 'status', labelKey: 'filters.status', type: 'select', options: STRATEGY_STATUS_OPTIONS }],
    columns: [
      { key: 'sortOrder', headerKey: 'columns.sortOrder', align: 'right', width: COLUMN_WIDTH.SORT_ORDER },
      {
        key: 'cover',
        headerKey: 'columns.cover',
        render: 'custom',
        width: COVER_THUMB_WIDTH_PX,
        renderCell: (row) =>
          row.cover
            ? createElement(MediaPreview, {
                mediaId: row.cover.mediaId,
                name: row.cover.originalName ?? undefined,
                mimeType: row.cover.mimeType,
                zoomable: false,
              })
            : null,
      },
      {
        key: TITLE,
        headerKey: 'columns.title',
        render: 'custom',
        renderCell: (row) => createElement('span', { className: 'line-clamp-2' }, strategyDocLabel(row)),
      },
      { key: 'link', headerKey: 'columns.link', render: 'custom', renderCell: (row) => createElement(StrategyDocLinkCell, { row }) },
      {
        key: 'locales',
        headerKey: 'columns.languages',
        render: 'custom',
        renderCell: (row) => createElement(LocaleBadges, { locales: row.locales }),
      },
      { key: 'status', headerKey: 'columns.status', render: 'badge', badgePalette: STATUS_PALETTE, badgeLabelKey: STATUS_LABEL_KEYS },
    ],
    fields,
    schema: strategyDocSchema,
    // A language without a title is not sent: the API would drop it anyway (the schema refuses one with other text).
    buildPayload: (values, translations) => {
      const titledTranslations = Object.fromEntries(
        Object.entries(translations).filter(([, localeValues]) => (localeValues[TITLE] ?? '').trim()),
      )
      return defaultBuildPayload({ fields }, values, titledTranslations)
    },
    rowLabel: strategyDocLabel,
  })
}

export const strategyDocsModuleBase = buildStrategyDocsModule({ pages: [] })
