/**
 * International financial institutions module (spec 044): the accordion cards of the cooperation
 * page. The membership dates are a sub-resource and live in `editExtras`, like the photos of a CSR
 * project, so they are added after the first save.
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
import { IFI_ORGANIZATIONS_MODULE_ID } from '../api/ifi-organizations.keys'
import { IfiMembershipsSection } from '../components/ifi-memberships-section'
import { MEMBER_SINCE_MAX, MEMBER_SINCE_MIN } from './constants'
import {
  IFI_STATUS_OPTIONS,
  ifiOrganizationDetailSchema,
  ifiOrganizationRowSchema,
  type IfiOrganizationRow,
} from './schemas'

/** A language that was started needs a name, otherwise the API refuses the whole save. */
const LOCALE_FIELDS = ['name', 'mission', 'membershipIntro', 'content'] as const

export const ifiOrganizationsModule = defineModule<
  IfiOrganizationRow,
  '/ifi-organizations'
>({
  id: IFI_ORGANIZATIONS_MODULE_ID,
  ns: 'ifiOrganizations',
  apiPath: '/ifi-organizations',
  basePath: '/ifi-organizations',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  supportsSearch: true,
  rowSchema: ifiOrganizationRowSchema,
  detailSchema: ifiOrganizationDetailSchema,
  filters: [
    {
      name: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: IFI_STATUS_OPTIONS,
    },
  ],
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'name', headerKey: 'columns.name' },
    {
      key: 'memberSince',
      headerKey: 'columns.memberSince',
      align: 'right',
      width: COLUMN_WIDTH.NUMBER_MD,
    },
    {
      key: 'membershipCount',
      headerKey: 'columns.memberships',
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
      options: IFI_STATUS_OPTIONS,
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
      name: 'logoMediaId',
      labelKey: 'fields.logo',
      type: 'media',
      helpKey: 'fields.logoHelp',
      mediaNameKey: 'logo.originalName',
    },
    {
      name: 'memberSince',
      labelKey: 'fields.memberSince',
      type: 'number',
      min: MEMBER_SINCE_MIN,
      max: MEMBER_SINCE_MAX,
      helpKey: 'fields.memberSinceHelp',
    },
    {
      name: 'websiteUrl',
      labelKey: 'fields.websiteUrl',
      type: 'text',
      placeholderKey: 'fields.websiteUrlPlaceholder',
    },
    {
      name: 'name',
      labelKey: 'fields.name',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'mission',
      labelKey: 'fields.mission',
      type: 'textarea',
      perLocale: true,
      helpKey: 'fields.missionHelp',
    },
    {
      name: 'membershipIntro',
      labelKey: 'fields.membershipIntro',
      type: 'text',
      perLocale: true,
      helpKey: 'fields.membershipIntroHelp',
    },
    {
      name: 'content',
      labelKey: 'fields.content',
      type: 'richtext',
      perLocale: true,
    },
  ],
  schema: (base) =>
    base.superRefine((data, ctx) => {
      for (const locale of LOCALES) {
        const values = data.translations[locale] ?? {}
        const started = LOCALE_FIELDS.some((name) => (values[name] ?? '').trim())
        if (started && !(values.name ?? '').trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['translations', locale, 'name'],
            message: i18n.t('ifiOrganizations:validation.nameRequired'),
          })
        }
      }
      const url = String(data.values.websiteUrl ?? '').trim()
      if (url && !/^https?:\/\/\S+$/i.test(url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['values', 'websiteUrl'],
          message: i18n.t('ifiOrganizations:validation.websiteUrl'),
        })
      }
    }),
  editExtras: IfiMembershipsSection,
  rowLabel: (row) => row.name ?? `#${row.id}`,
})
