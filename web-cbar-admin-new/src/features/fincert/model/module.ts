/**
 * FinCERT modules (spec 053, `specs/053-fincert-page/contracts/admin-ux.md` §2): the activity directions and the
 * international memberships of the FinCERT page. The general form ("Ümumi") is a single record and lives in
 * `components/settings-form.tsx`, not in the CRUD engine. Order is not a form field: both lists are ordered in a
 * dialog over the list.
 */

import { createElement } from 'react'

import { LOCALES, STATUS_LABEL_KEYS, STATUS_PALETTE } from '@/entities/content/model/types'
import { LocaleBadges } from '@/entities/content/ui/locale-badges'
import { MediaPreview } from '@/features/media/components/media-preview'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defaultBuildPayload } from '@/shared/crud/form-model'
import { defineModule, type FieldConfig, type FormSchema, type SectionTabConfig } from '@/shared/crud/types'
import { FINCERT_DIRECTIONS_MODULE_ID, FINCERT_MEMBERSHIPS_MODULE_ID } from '../api/fincert.keys'
import { isBlankHtml } from '@/shared/lib/blank-html'
import {
  CONTENT_STATUS,
  FINCERT_DIRECTIONS_PATH,
  FINCERT_LIMITS,
  FINCERT_MEMBERSHIPS_PATH,
  FINCERT_PATH,
  LOGO_THUMB_WIDTH_PX,
} from './constants'
import {
  FINCERT_STATUS_OPTIONS,
  fincertDirectionDetailSchema,
  fincertDirectionRowSchema,
  fincertMembershipDetailSchema,
  fincertMembershipRowSchema,
  type FincertDirectionRow,
  type FincertMembershipRow,
} from './schemas'
import { isWebUrl, message } from './validation'

export const fincertSectionTabs: SectionTabConfig[] = [
  { to: FINCERT_PATH, labelKey: 'fincert:tabs.general' },
  { to: FINCERT_DIRECTIONS_PATH, labelKey: 'fincert:tabs.directions' },
  { to: FINCERT_MEMBERSHIPS_PATH, labelKey: 'fincert:tabs.memberships' },
]

const statusField: FieldConfig = {
  name: 'status',
  labelKey: 'fields.status',
  type: 'select',
  options: FINCERT_STATUS_OPTIONS,
  // An editor adds an item to show it: published unless they choose otherwise.
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

const statusFilter = { name: 'status', labelKey: 'filters.status', type: 'select' as const, options: FINCERT_STATUS_OPTIONS }

/** The row's label in the list and in the order dialog: the title (name) in the panel's language, or the id. */
export const directionLabel = (row: Pick<FincertDirectionRow, 'id' | 'title'>) => row.title ?? `#${row.id}`
export const membershipLabel = (row: Pick<FincertMembershipRow, 'id' | 'name'>) => row.name ?? `#${row.id}`

// ---- directions ----

const TITLE = 'title'
const BODY = 'body'

/** A language counts as started when it has a title or a body with content (`<p></p>` is empty). */
const directionStarted = (values: Record<string, string> | undefined) =>
  Boolean((values?.[TITLE] ?? '').trim()) || !isBlankHtml(values?.[BODY])

const directionFields: FieldConfig[] = [
  statusField,
  { name: TITLE, labelKey: 'fields.title', type: 'text', perLocale: true },
  { name: BODY, labelKey: 'fields.body', type: 'richtext', perLocale: true },
]

export const fincertDirectionsModule = defineModule<FincertDirectionRow, typeof FINCERT_DIRECTIONS_PATH>({
  id: FINCERT_DIRECTIONS_MODULE_ID,
  ns: 'fincert',
  apiPath: '/fincert/directions',
  basePath: FINCERT_DIRECTIONS_PATH,
  titleKey: 'directions.title',
  entityKey: 'directions.entity',
  descriptionKey: 'directions.description',
  sectionTabs: fincertSectionTabs,
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  supportsSearch: true,
  rowSchema: fincertDirectionRowSchema,
  detailSchema: fincertDirectionDetailSchema,
  filters: [statusFilter],
  columns: [
    { key: 'number', headerKey: 'columns.number', align: 'right', width: COLUMN_WIDTH.ID },
    {
      key: TITLE,
      headerKey: 'columns.title',
      render: 'custom',
      renderCell: (row) => createElement('span', { className: 'line-clamp-2' }, directionLabel(row)),
    },
    {
      key: 'locales',
      headerKey: 'columns.languages',
      render: 'custom',
      renderCell: (row) => createElement(LocaleBadges, { locales: row.locales }),
    },
    statusColumn,
    { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'datetime' },
  ],
  fields: directionFields,
  schema: (base) =>
    base.superRefine((data, ctx) => {
      const started = LOCALES.filter((locale) => directionStarted(data.translations[locale]))
      // Only when nothing was written: an issue on `translations` itself would replace the field issues below.
      if (started.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['translations'], message: message('oneLanguage') })
        return
      }
      for (const locale of started) {
        const values = data.translations[locale]
        const title = (values?.[TITLE] ?? '').trim()
        const missing = !title ? TITLE : isBlankHtml(values?.[BODY]) ? BODY : null
        if (missing) ctx.addIssue({ code: 'custom', path: ['translations', locale, missing], message: message('pairRequired') })
        if (title.length > FINCERT_LIMITS.TITLE)
          ctx.addIssue({ code: 'custom', path: ['translations', locale, TITLE], message: message('tooLong', { max: FINCERT_LIMITS.TITLE }) })
      }
    }),
  // A language left empty is not sent, even when the editor put an empty paragraph in its body.
  buildPayload: (values, translations) => {
    const started = Object.fromEntries(Object.entries(translations).filter(([, localeValues]) => directionStarted(localeValues)))
    return defaultBuildPayload({ fields: directionFields }, values, started)
  },
  rowLabel: directionLabel,
})

// ---- memberships ----

const NAME = 'name'
const DESCRIPTION = 'description'
const BADGE = 'badge'
const URL_FIELD = 'url'

/** The API's length limits of a membership language (`FincertMembershipsController`). */
const MEMBERSHIP_TEXT_LIMITS = [
  [NAME, FINCERT_LIMITS.NAME],
  [DESCRIPTION, FINCERT_LIMITS.DESCRIPTION],
  [BADGE, FINCERT_LIMITS.BADGE],
] as const

const membershipFields: FieldConfig[] = [
  statusField,
  {
    name: 'logoMediaId',
    labelKey: 'fields.logo',
    type: 'media',
    mediaAccept: 'image',
    helpKey: 'fields.logoHelp',
    mediaNameKey: 'logo.originalName',
  },
  { name: URL_FIELD, labelKey: 'fields.url', type: 'text', placeholderKey: 'fields.urlPlaceholder' },
  { name: NAME, labelKey: 'fields.name', type: 'text', perLocale: true },
  { name: DESCRIPTION, labelKey: 'fields.description', type: 'textarea', perLocale: true },
  { name: BADGE, labelKey: 'fields.badge', type: 'text', perLocale: true, helpKey: 'fields.badgeHelp' },
]

/**
 * Language checks of a membership: a name in one language at least, and in every language the editor wrote something in
 * (`buildPayload` does not send a language without a name, so its text would be lost silently); the API's length limits.
 */
const membershipSchema = (base: FormSchema): FormSchema =>
  base.superRefine((data, ctx) => {
    const text = (locale: string, name: string) => (data.translations[locale]?.[name] ?? '').trim()
    const named = (locale: string) => Boolean(text(locale, NAME))
    const started = (locale: string) => Object.keys(data.translations[locale] ?? {}).some((name) => text(locale, name))

    if (!LOCALES.some(named)) ctx.addIssue({ code: 'custom', path: ['translations'], message: message('nameRequired') })
    else
      for (const locale of LOCALES.filter((locale) => started(locale) && !named(locale)))
        ctx.addIssue({ code: 'custom', path: ['translations', locale, NAME], message: message('nameForLanguage') })

    for (const locale of LOCALES)
      for (const [name, max] of MEMBERSHIP_TEXT_LIMITS)
        if (text(locale, name).length > max)
          ctx.addIssue({ code: 'custom', path: ['translations', locale, name], message: message('tooLong', { max }) })

    const url = String(data.values[URL_FIELD] ?? '').trim()
    if (url && !isWebUrl(url)) ctx.addIssue({ code: 'custom', path: ['values', URL_FIELD], message: message('url') })
    if (url.length > FINCERT_LIMITS.URL)
      ctx.addIssue({ code: 'custom', path: ['values', URL_FIELD], message: message('tooLong', { max: FINCERT_LIMITS.URL }) })
  })

export const fincertMembershipsModule = defineModule<FincertMembershipRow, typeof FINCERT_MEMBERSHIPS_PATH>({
  id: FINCERT_MEMBERSHIPS_MODULE_ID,
  ns: 'fincert',
  apiPath: '/fincert/memberships',
  basePath: FINCERT_MEMBERSHIPS_PATH,
  titleKey: 'memberships.title',
  entityKey: 'memberships.entity',
  descriptionKey: 'memberships.description',
  sectionTabs: fincertSectionTabs,
  listEnvelope: 'paged',
  supportsSearch: true,
  rowSchema: fincertMembershipRowSchema,
  detailSchema: fincertMembershipDetailSchema,
  filters: [statusFilter],
  columns: [
    {
      key: 'logo',
      headerKey: 'columns.logo',
      render: 'custom',
      width: LOGO_THUMB_WIDTH_PX,
      renderCell: (row) =>
        row.logo
          ? createElement(MediaPreview, {
              mediaId: row.logo.mediaId,
              name: row.logo.originalName ?? undefined,
              mimeType: row.logo.mimeType,
              zoomable: false,
            })
          : null,
    },
    { key: NAME, headerKey: 'columns.name' },
    { key: BADGE, headerKey: 'columns.badge' },
    statusColumn,
  ],
  fields: membershipFields,
  schema: membershipSchema,
  buildPayload: (values, translations) => {
    const named = Object.fromEntries(Object.entries(translations).filter(([, localeValues]) => (localeValues[NAME] ?? '').trim()))
    return defaultBuildPayload({ fields: membershipFields }, values, named)
  },
  rowLabel: membershipLabel,
})
