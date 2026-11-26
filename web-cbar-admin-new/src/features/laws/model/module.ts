/**
 * Qanunlar modulları (contracts/module-config.md §5 nümunəsi). `buildLawsModule`
 * kateqoriya seçimlərini lookup-dan alır; `lawsModuleBase` seçimsiz statik
 * variantdır — `registerModule` və route tree üçün.
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
  type ModuleConfig,
  type SectionTabConfig,
} from '@/shared/crud/types'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { LawAttachmentsSection } from '../components/law-attachments-section'
import {
  lawCategorySchema,
  lawDetailSchema,
  lawListItemSchema,
  type LawCategory,
  type LawListItem,
} from './schemas'

/** API `type` xəritəsi: 1 qanun / 2 qayda (contracts/admin-api.md §6). */
export const LAW_TYPE_OPTIONS: SelectOption[] = [
  { value: 1, labelKey: 'type.law' },
  { value: 2, labelKey: 'type.regulation' },
]

const LAW_TYPE_LABEL_KEYS: Record<string, string> = {
  '1': 'type.law',
  '2': 'type.regulation',
}

const lawSectionTabs: SectionTabConfig[] = [
  { to: '/laws', labelKey: 'laws:tabs.laws' },
  { to: '/laws/categories', labelKey: 'laws:tabs.categories' },
]

/** Lookup seçimlərinin etiketi API mətnidir — `t` lazım deyil. */
const plainLabel = (key: string) => key

export function buildLawsModule(
  categoryOptions: SelectOption[],
): ModuleConfig<LawListItem, '/laws'> {
  return defineModule<LawListItem, '/laws'>({
    id: 'laws',
    ns: 'laws',
    apiPath: '/laws',
    basePath: '/laws',
    titleKey: 'title',
    entityKey: 'entity',
    descriptionKey: 'description',
    sectionTabs: lawSectionTabs,
    listEnvelope: 'paged',
    supportsSearch: true,
    rowSchema: lawListItemSchema,
    detailSchema: lawDetailSchema,
    filters: [
      {
        name: 'categoryId',
        labelKey: 'fields.category',
        type: 'select',
        options: categoryOptions,
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
        key: 'categoryId',
        headerKey: 'columns.category',
        render: 'custom',
        renderCell: (row) =>
          optionLabel(categoryOptions, row.categoryId, plainLabel),
      },
      {
        key: 'type',
        headerKey: 'columns.type',
        render: 'badge',
        badgeLabelKey: LAW_TYPE_LABEL_KEYS,
        badgePalette: { '1': 'primary', '2': 'secondary' },
      },
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
        name: 'categoryId',
        labelKey: 'fields.category',
        type: 'select',
        options: categoryOptions,
        valueAsNumber: true,
        required: true,
        // Boş başlanğıc — məcburi sahə istifadəçi seçənə qədər dolu görünməsin.
        defaultValue: '',
        placeholderKey: 'fields.categoryPlaceholder',
      },
      {
        name: 'type',
        labelKey: 'fields.type',
        type: 'select',
        options: LAW_TYPE_OPTIONS,
        valueAsNumber: true,
      },
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
        name: 'description',
        labelKey: 'fields.description',
        type: 'richtext',
        perLocale: true,
      },
    ],
    editExtras: LawAttachmentsSection,
    rowLabel: (row) => String(row.title ?? `#${row.id}`),
  })
}

/** Seçimsiz statik konfiq — `registerModule(lawsModuleBase)` üçün. */
export const lawsModuleBase = buildLawsModule([])

export const lawCategoriesModule = defineModule<
  LawCategory,
  '/laws/categories'
>({
  id: 'law-categories',
  ns: 'laws',
  apiPath: '/law-categories',
  basePath: '/laws/categories',
  titleKey: 'categories.title',
  entityKey: 'categories.entity',
  descriptionKey: 'categories.description',
  crumbs: [{ labelKey: 'nav:laws.label', path: '/laws' }],
  sectionTabs: lawSectionTabs,
  listEnvelope: 'array',
  rowSchema: lawCategorySchema,
  detailSchema: lawCategorySchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID_WIDE },
    {
      key: 'name',
      headerKey: 'columns.name',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'name'),
    },
    { key: 'sortOrder', headerKey: 'columns.sortOrder', width: 100 },
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
      step: 1,
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
  deleteConfirmKey: 'deleteCategoryConfirm',
  rowLabel: (row) => firstTranslation(row.translations, 'name'),
})
