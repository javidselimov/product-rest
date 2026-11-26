/**
 * Pul nişanları bölməsinin CRUD modulları (contracts/module-config.md §5
 * naxışı): nişanlar (kateqoriya lookup-u ilə fabrik), kateqoriyalar, xəbərlər.
 * `moneyMarksModuleBase` — registry qeydiyyatı üçün seçimsiz statik konfiq;
 * səhifə `buildMoneyMarksModule(options)` ilə tam konfiqi qurur.
 */

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
  CONTENT_STATUS_OPTIONS,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
  firstTranslation,
  optionLabel,
  type SelectOption,
} from '@/entities/content/model/types'
import {
  defineModule,
  type CrumbConfig,
  type SectionTabConfig,
} from '@/shared/crud/types'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { i18n } from '@/shared/i18n'
import {
  moneyMarkCategorySchema,
  moneyMarkDetailSchema,
  moneyMarkListItemSchema,
  moneyMarkNewsDetailSchema,
  moneyMarkNewsListItemSchema,
} from './schemas'

/** Nişan tipi: 1 — əskinas, 2 — sikkə (contracts/admin-api.md §6). */
export const MONEY_MARK_TYPE_OPTIONS: SelectOption[] = [
  { value: 1, labelKey: 'type.banknote' },
  { value: 2, labelKey: 'type.coin' },
]

const sectionTabs: SectionTabConfig[] = [
  { to: '/money-marks', labelKey: 'moneyMarks:tabs.marks' },
  { to: '/money-marks/categories', labelKey: 'moneyMarks:tabs.categories' },
  { to: '/money-marks/news', labelKey: 'moneyMarks:tabs.news' },
]

const crumbs: CrumbConfig[] = [
  { labelKey: 'nav:moneyMarks.label', path: '/money-marks' },
]

/** Kateqoriya lookup-unun modul id-si — `[id, 'options']` açarı ilə invalidasiya. */
export const MONEY_MARK_CATEGORIES_ID = 'money-mark-categories'
export const MONEY_MARK_CATEGORIES_PATH = '/money-mark-categories'

/** Lookup seçimlərinin etiketi yalnız `label` daşıyır; `labelKey` olsa i18n ilə həll olunur. */
const translate = (key: string) => i18n.t(key)

export function buildMoneyMarksModule(categoryOptions: SelectOption[]) {
  return defineModule({
    id: 'money-marks',
    ns: 'moneyMarks',
    apiPath: '/money-marks',
    basePath: '/money-marks',
    titleKey: 'marks.title',
    entityKey: 'marks.entity',
    descriptionKey: 'marks.description',
    crumbs,
    sectionTabs,
    listEnvelope: 'paged',
    rowSchema: moneyMarkListItemSchema,
    detailSchema: moneyMarkDetailSchema,
    lookupSchema: moneyMarkCategorySchema,
    filters: [
      {
        name: 'categoryId',
        labelKey: 'fields.category',
        type: 'select',
        options: categoryOptions,
      },
      {
        name: 'type',
        labelKey: 'fields.type',
        type: 'select',
        options: MONEY_MARK_TYPE_OPTIONS,
      },
      {
        name: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: CONTENT_STATUS_OPTIONS,
      },
    ],
    columns: [
      { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID_WIDE },
      { key: 'title', headerKey: 'columns.title' },
      {
        key: 'type',
        headerKey: 'columns.type',
        render: 'badge',
        badgePalette: { 1: 'primary', 2: 'yellow' },
        badgeLabelKey: { 1: 'type.banknote', 2: 'type.coin' },
      },
      {
        key: 'categoryId',
        headerKey: 'columns.category',
        render: 'custom',
        renderCell: (row) =>
          optionLabel(categoryOptions, row.categoryId, translate),
      },
      { key: 'sortOrder', headerKey: 'columns.sortOrder', width: COLUMN_WIDTH.CODE },
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
        options: categoryOptions,
        valueAsNumber: true,
        required: true,
      },
      {
        name: 'type',
        labelKey: 'fields.type',
        type: 'select',
        options: MONEY_MARK_TYPE_OPTIONS,
        valueAsNumber: true,
      },
      { name: 'frontMediaId', labelKey: 'fields.frontMedia', type: 'media' },
      { name: 'rearMediaId', labelKey: 'fields.rearMedia', type: 'media' },
      {
        name: 'sortOrder',
        labelKey: 'fields.sortOrder',
        type: 'number',
        nullable: false,
        defaultValue: '0',
      },
      {
        name: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: CONTENT_STATUS_OPTIONS,
      },
      {
        name: 'title',
        labelKey: 'fields.title',
        type: 'text',
        perLocale: true,
        required: true,
      },
      {
        name: 'description',
        labelKey: 'fields.description',
        type: 'richtext',
        perLocale: true,
      },
      {
        name: 'securityFeatures',
        labelKey: 'fields.securityFeatures',
        type: 'richtext',
        perLocale: true,
      },
    ],
    rowLabel: (row) => row.title ?? `#${row.id}`,
  })
}

/** Registry üçün seçimsiz konfiq — route komponentləri `pages/money-marks` override-larıdır. */
export const moneyMarksModuleBase = buildMoneyMarksModule([])

export const moneyMarkCategoriesModule = defineModule({
  id: MONEY_MARK_CATEGORIES_ID,
  ns: 'moneyMarks',
  apiPath: MONEY_MARK_CATEGORIES_PATH,
  basePath: '/money-marks/categories',
  titleKey: 'categories.title',
  entityKey: 'categories.entity',
  descriptionKey: 'categories.description',
  crumbs,
  sectionTabs,
  listEnvelope: 'array',
  rowSchema: moneyMarkCategorySchema,
  detailSchema: moneyMarkCategorySchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID_WIDE },
    {
      key: 'name',
      headerKey: 'columns.name',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'name'),
    },
    { key: 'sortOrder', headerKey: 'columns.sortOrder', width: COLUMN_WIDTH.CODE },
    {
      key: 'isActive',
      headerKey: 'columns.isActive',
      render: 'badge',
      badgePalette: ACTIVE_PALETTE,
      badgeLabelKey: ACTIVE_LABEL_KEYS,
    },
  ],
  fields: [
    {
      name: 'sortOrder',
      labelKey: 'fields.sortOrder',
      type: 'number',
      nullable: false,
      defaultValue: '0',
    },
    {
      name: 'isActive',
      labelKey: 'fields.isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'name',
      labelKey: 'fields.name',
      type: 'text',
      perLocale: true,
      required: true,
    },
  ],
  deleteConfirmKey: 'categories.deleteConfirm',
  rowLabel: (row) => firstTranslation(row.translations, 'name'),
})

export const moneyMarkNewsModule = defineModule({
  id: 'money-mark-news',
  ns: 'moneyMarks',
  apiPath: '/money-mark-news',
  basePath: '/money-marks/news',
  titleKey: 'news.title',
  entityKey: 'news.entity',
  descriptionKey: 'news.description',
  crumbs,
  sectionTabs,
  listEnvelope: 'paged',
  supportsSearch: true,
  rowSchema: moneyMarkNewsListItemSchema,
  detailSchema: moneyMarkNewsDetailSchema,
  filters: [
    {
      name: 'status',
      labelKey: 'fields.status',
      type: 'select',
      options: CONTENT_STATUS_OPTIONS,
    },
  ],
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID_WIDE },
    { key: 'title', headerKey: 'columns.title' },
    {
      key: 'status',
      headerKey: 'columns.status',
      render: 'badge',
      badgePalette: STATUS_PALETTE,
      badgeLabelKey: STATUS_LABEL_KEYS,
    },
    {
      key: 'publishedAt',
      headerKey: 'columns.publishedAt',
      render: 'datetime',
    },
  ],
  fields: [
    {
      name: 'status',
      labelKey: 'fields.status',
      type: 'select',
      options: CONTENT_STATUS_OPTIONS,
    },
    { name: 'publishedAt', labelKey: 'fields.publishedAt', type: 'datetime' },
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'content',
      labelKey: 'fields.content',
      type: 'richtext',
      perLocale: true,
    },
  ],
  rowLabel: (row) => row.title ?? `#${row.id}`,
})
