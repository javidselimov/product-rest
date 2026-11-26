/**
 * MEAS modulları: sənədlər (iki lookup-lu forma, tərcüməsiz) və `measLookupModule`
 * fabriki ilə emitentlər / məlumat tipləri (array envelope, ★name).
 * `measDocumentsModuleBase` seçimsiz statik variantdır — `registerModule` üçün.
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
import {
  measDocumentDetailSchema,
  measDocumentListItemSchema,
  measLookupSchema,
  type MeasDocumentListItem,
  type MeasLookupItem,
} from './schemas'

const measSectionTabs: SectionTabConfig[] = [
  { to: '/meas', labelKey: 'meas:tabs.documents' },
  { to: '/meas/emitents', labelKey: 'meas:tabs.emitents' },
  { to: '/meas/info-types', labelKey: 'meas:tabs.infoTypes' },
]

const measCrumbs = [{ labelKey: 'nav:meas.label', path: '/meas' }]

/** Lookup seçimlərinin etiketi API mətnidir — `t` lazım deyil. */
const plainLabel = (key: string) => key

export function buildMeasDocumentsModule(
  emitentOptions: SelectOption[],
  infoTypeOptions: SelectOption[],
): ModuleConfig<MeasDocumentListItem, '/meas'> {
  return defineModule<MeasDocumentListItem, '/meas'>({
    id: 'meas-documents',
    ns: 'meas',
    apiPath: '/meas-documents',
    basePath: '/meas',
    titleKey: 'title',
    entityKey: 'entity',
    descriptionKey: 'description',
    sectionTabs: measSectionTabs,
    listEnvelope: 'paged',
    supportsSearch: true,
    rowSchema: measDocumentListItemSchema,
    detailSchema: measDocumentDetailSchema,
    filters: [
      {
        name: 'emitentId',
        labelKey: 'fields.emitent',
        type: 'select',
        options: emitentOptions,
      },
      {
        name: 'infoTypeId',
        labelKey: 'fields.infoType',
        type: 'select',
        options: infoTypeOptions,
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
      { key: 'dqn', headerKey: 'columns.dqn' },
      {
        key: 'emitentId',
        headerKey: 'columns.emitent',
        render: 'custom',
        renderCell: (row) =>
          optionLabel(emitentOptions, row.emitentId, plainLabel),
      },
      {
        key: 'infoTypeId',
        headerKey: 'columns.infoType',
        render: 'custom',
        renderCell: (row) =>
          optionLabel(infoTypeOptions, row.infoTypeId, plainLabel),
      },
      { key: 'regDate', headerKey: 'columns.registrationDate', render: 'date' },
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
        name: 'emitentId',
        labelKey: 'fields.emitent',
        type: 'select',
        options: emitentOptions,
        valueAsNumber: true,
        required: true,
        defaultValue: '',
        placeholderKey: 'fields.emitentPlaceholder',
      },
      {
        name: 'infoTypeId',
        labelKey: 'fields.infoType',
        type: 'select',
        options: infoTypeOptions,
        valueAsNumber: true,
        required: true,
        defaultValue: '',
        placeholderKey: 'fields.infoTypePlaceholder',
      },
      {
        name: 'regDate',
        labelKey: 'fields.registrationDate',
        type: 'date',
        required: true,
      },
      {
        name: 'dqn',
        labelKey: 'fields.dqn',
        type: 'text',
        placeholderKey: 'fields.dqnPlaceholder',
      },
      {
        name: 'mediaId',
        labelKey: 'fields.media',
        type: 'media',
        mediaNameKey: 'media.originalName',
      },
      {
        name: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: CONTENT_STATUS_OPTIONS,
      },
    ],
    rowLabel: (row) => String(row.dqn ?? `#${row.id}`),
  })
}

/** Seçimsiz statik konfiq — `registerModule(measDocumentsModuleBase)` üçün. */
export const measDocumentsModuleBase = buildMeasDocumentsModule([], [])

/**
 * Emitent / məlumat tipi lookup modulu. `group` i18n qrupudur:
 * `meas:<group>.title|entity|description|deleteConfirm`.
 */
export function measLookupModule<Path extends string>(
  id: string,
  basePath: Path,
  apiPath: string,
  group: 'emitents' | 'infoTypes',
): ModuleConfig<MeasLookupItem, Path> {
  return defineModule<MeasLookupItem, Path>({
    id,
    ns: 'meas',
    apiPath,
    basePath,
    titleKey: `${group}.title`,
    entityKey: `${group}.entity`,
    descriptionKey: `${group}.description`,
    crumbs: measCrumbs,
    sectionTabs: measSectionTabs,
    listEnvelope: 'array',
    rowSchema: measLookupSchema,
    detailSchema: measLookupSchema,
    columns: [
      { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID_WIDE },
      {
        key: 'name',
        headerKey: 'columns.name',
        render: 'custom',
        renderCell: (row) => firstTranslation(row.translations, 'name'),
      },
      {
        key: 'isActive',
        headerKey: 'columns.isActive',
        render: 'badge',
        badgePalette: ACTIVE_PALETTE,
        badgeLabelKey: ACTIVE_LABEL_KEYS,
      },
      { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'datetime' },
    ],
    fields: [
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
    deleteConfirmKey: `${group}.deleteConfirm`,
    rowLabel: (row) => firstTranslation(row.translations, 'name'),
  })
}

export const measEmitentsModule = measLookupModule(
  'meas-emitents',
  '/meas/emitents',
  '/meas-emitents',
  'emitents',
)

export const measInfoTypesModule = measLookupModule(
  'meas-info-types',
  '/meas/info-types',
  '/meas-info-types',
  'infoTypes',
)
