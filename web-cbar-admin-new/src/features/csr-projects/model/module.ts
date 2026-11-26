/**
 * CSR project modules (spec 038). Category choices come from a lookup, so `buildCsrProjectsModule`
 * takes them as an argument, as `buildEventsModule` does; `csrProjectsModuleBase` is the variant
 * without choices for the route tree.
 */

import { z } from 'zod'

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
  LOCALES,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
  type SelectOption,
} from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import {
  defineModule,
  type ModuleConfig,
  type SectionTabConfig,
} from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import {
  CSR_CATEGORIES_MODULE_ID,
  CSR_PROJECTS_MODULE_ID,
} from '../api/csr-projects.keys'
import { CsrProjectImagesSection } from '../components/csr-project-images-section'
import {
  CSR_STATUS_OPTIONS,
  csrCategoryDetailSchema,
  csrCategoryRowSchema,
  csrProjectDetailSchema,
  csrProjectRowSchema,
  type CsrCategoryRow,
  type CsrProjectRow,
} from './schemas'

const csrSectionTabs: SectionTabConfig[] = [
  { to: '/csr-projects', labelKey: 'csrProjects:tabs.projects' },
  { to: '/csr-projects/categories', labelKey: 'csrProjects:tabs.categories' },
]

/** A language that was started needs all of these, otherwise the API refuses the whole save. */
const LOCALE_REQUIRED_FIELDS = ['cardTitle', 'summary', 'title'] as const
const LOCALE_FIELDS = [...LOCALE_REQUIRED_FIELDS, 'content'] as const

export function buildCsrProjectsModule(
  categories: SelectOption[],
): ModuleConfig<CsrProjectRow, '/csr-projects'> {
  return defineModule<CsrProjectRow, '/csr-projects'>({
    id: CSR_PROJECTS_MODULE_ID,
    ns: 'csrProjects',
    apiPath: '/csr-projects',
    basePath: '/csr-projects',
    titleKey: 'title',
    entityKey: 'entity',
    descriptionKey: 'description',
    sectionTabs: csrSectionTabs,
    listEnvelope: 'paged',
    pageSize: DEFAULT_PAGE_SIZE,
    supportsSearch: true,
    rowSchema: csrProjectRowSchema,
    detailSchema: csrProjectDetailSchema,
    filters: [
      {
        name: 'categoryId',
        labelKey: 'filters.category',
        type: 'select',
        options: categories,
      },
      {
        name: 'status',
        labelKey: 'filters.status',
        type: 'select',
        options: CSR_STATUS_OPTIONS,
      },
    ],
    columns: [
      { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
      { key: 'title', headerKey: 'columns.title' },
      { key: 'categoryName', headerKey: 'columns.category' },
      {
        key: 'sortOrder',
        headerKey: 'columns.sortOrder',
        align: 'right',
        width: COLUMN_WIDTH.NUMBER_MD,
      },
      {
        key: 'imageCount',
        headerKey: 'columns.images',
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
        name: 'categoryId',
        labelKey: 'fields.category',
        type: 'select',
        options: categories,
        valueAsNumber: true,
        required: true,
      },
      {
        name: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: CSR_STATUS_OPTIONS,
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
        name: 'coverMediaId',
        labelKey: 'fields.cover',
        type: 'media',
        helpKey: 'fields.coverHelp',
        mediaNameKey: 'cover.originalName',
      },
      {
        name: 'cardTitle',
        labelKey: 'fields.cardTitle',
        type: 'text',
        perLocale: true,
        required: true,
      },
      {
        name: 'summary',
        labelKey: 'fields.summary',
        type: 'textarea',
        perLocale: true,
        required: true,
      },
      {
        name: 'title',
        labelKey: 'fields.title',
        type: 'text',
        perLocale: true,
        required: true,
        helpKey: 'fields.titleHelp',
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
          const started = LOCALE_FIELDS.some((name) =>
            (values[name] ?? '').trim(),
          )
          if (!started) continue
          for (const name of LOCALE_REQUIRED_FIELDS) {
            if ((values[name] ?? '').trim()) continue
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['translations', locale, name],
              message: i18n.t('csrProjects:validation.localeIncomplete'),
            })
          }
        }
      }),
    editExtras: CsrProjectImagesSection,
    rowLabel: (row) => row.title ?? `#${row.id}`,
  })
}

export const csrProjectsModuleBase = buildCsrProjectsModule([])

export const csrCategoriesModule = defineModule<
  CsrCategoryRow,
  '/csr-projects/categories'
>({
  id: CSR_CATEGORIES_MODULE_ID,
  ns: 'csrProjects',
  apiPath: '/csr-categories',
  basePath: '/csr-projects/categories',
  titleKey: 'categories.title',
  entityKey: 'categories.entity',
  descriptionKey: 'categories.description',
  sectionTabs: csrSectionTabs,
  listEnvelope: 'items',
  rowSchema: csrCategoryRowSchema,
  detailSchema: csrCategoryDetailSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'name', headerKey: 'categories.columns.name' },
    {
      key: 'sortOrder',
      headerKey: 'categories.columns.sortOrder',
      align: 'right',
      width: COLUMN_WIDTH.NUMBER_MD,
    },
    {
      key: 'isActive',
      headerKey: 'categories.columns.isActive',
      render: 'badge',
      badgePalette: ACTIVE_PALETTE,
      badgeLabelKey: ACTIVE_LABEL_KEYS,
    },
  ],
  fields: [
    {
      name: 'name',
      labelKey: 'categories.fields.name',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'sortOrder',
      labelKey: 'categories.fields.sortOrder',
      type: 'number',
      nullable: false,
      defaultValue: '0',
    },
    {
      name: 'isActive',
      labelKey: 'categories.fields.isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  rowLabel: (row) => row.name ?? `#${row.id}`,
})
