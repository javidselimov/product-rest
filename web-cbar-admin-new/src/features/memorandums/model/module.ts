/**
 * Memorandums module (spec 045): the rows of the table on the "Mərkəzi banklarla əməkdaşlıq" page.
 * A row is an organization and a country per language, and the year of signing.
 */

import { z } from 'zod'

import {
  LOCALES,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
} from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defineModule } from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { MEMORANDUMS_MODULE_ID } from '../api/memorandums.keys'
import { SIGNED_YEAR_MIN, signedYearMax } from './constants'
import {
  MEMORANDUM_STATUS_OPTIONS,
  memorandumDetailSchema,
  memorandumRowSchema,
  type MemorandumRow,
} from './schemas'

/** A language that was started needs both, otherwise the API refuses the whole save. */
const LOCALE_FIELDS = ['organization', 'country'] as const

export const memorandumsModule = defineModule<MemorandumRow, '/memorandums'>({
  id: MEMORANDUMS_MODULE_ID,
  ns: 'memorandums',
  apiPath: '/memorandums',
  basePath: '/memorandums',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  supportsSearch: true,
  rowSchema: memorandumRowSchema,
  detailSchema: memorandumDetailSchema,
  filters: [
    {
      name: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: MEMORANDUM_STATUS_OPTIONS,
    },
  ],
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'organization', headerKey: 'columns.organization' },
    { key: 'country', headerKey: 'columns.country' },
    {
      key: 'signedYear',
      headerKey: 'columns.signedYear',
      align: 'right',
      width: COLUMN_WIDTH.NUMBER_MD,
    },
    {
      key: 'sortOrder',
      headerKey: 'columns.sortOrder',
      align: 'right',
      width: COLUMN_WIDTH.NUMBER_MD,
    },
    {
      key: 'status',
      headerKey: 'columns.status',
      render: 'badge',
      badgePalette: STATUS_PALETTE,
      badgeLabelKey: STATUS_LABEL_KEYS,
    },
  ],
  fields: [
    {
      name: 'status',
      labelKey: 'fields.status',
      type: 'select',
      options: MEMORANDUM_STATUS_OPTIONS,
    },
    {
      name: 'signedYear',
      labelKey: 'fields.signedYear',
      type: 'number',
      required: true,
      min: SIGNED_YEAR_MIN,
      max: signedYearMax(),
      helpKey: 'fields.signedYearHelp',
    },
    {
      name: 'sortOrder',
      labelKey: 'fields.sortOrder',
      type: 'number',
      nullable: false,
      defaultValue: '0',
      helpKey: 'fields.sortOrderHelp',
    },
    {
      name: 'showAz',
      labelKey: 'fields.showAz',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showEn',
      labelKey: 'fields.showEn',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'organization',
      labelKey: 'fields.organization',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'country',
      labelKey: 'fields.country',
      type: 'text',
      perLocale: true,
      helpKey: 'fields.countryHelp',
    },
  ],
  schema: (base) =>
    base.superRefine((data, ctx) => {
      for (const locale of LOCALES) {
        const values = data.translations[locale] ?? {}
        const started = LOCALE_FIELDS.some((name) => (values[name] ?? '').trim())
        if (!started) continue
        for (const name of LOCALE_FIELDS) {
          if ((values[name] ?? '').trim()) continue
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['translations', locale, name],
            message: i18n.t(`memorandums:validation.${name}Required`),
          })
        }
      }
    }),
  rowLabel: (row) => row.organization ?? `#${row.id}`,
})
