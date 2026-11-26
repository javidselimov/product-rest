/**
 * Təşkilat bölməsinin CRUD modulları (contracts/module-config.md): şöbələr,
 * ofislər, heyət. Hamısı `array` envelope; siyahı sətirində `translations`
 * olduğundan ad sütunları `firstTranslation` (az → en → "—") ilə oxunur.
 * Bütün etiketlər `organization` namespace-indən gəlir. Heyət redaktəsində
 * `StaffPhotosSection` mətbuat fotolarını (`/photos` alt-resursu) idarə edir.
 */

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
  firstTranslation,
  type SelectOption,
} from '@/entities/content/model/types'
import {
  defineModule,
  type CrumbConfig,
  type SectionTabConfig,
} from '@/shared/crud/types'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { StaffPhotosSection } from '../components/staff-photos-section'
import { STAFF_TYPE } from './constants'
import { divisionSchema, officeSchema, staffSchema } from './schemas'

/** Staff type select options — see `STAFF_TYPE` in `./constants`. */
export const STAFF_TYPE_OPTIONS: SelectOption[] = [
  { value: STAFF_TYPE.BOARD, labelKey: 'type.board' },
  { value: STAFF_TYPE.MANAGEMENT, labelKey: 'type.management' },
  { value: STAFF_TYPE.ADVISER, labelKey: 'type.adviser' },
]

const STAFF_TYPE_LABEL_KEYS = {
  [STAFF_TYPE.BOARD]: 'type.board',
  [STAFF_TYPE.MANAGEMENT]: 'type.management',
  [STAFF_TYPE.ADVISER]: 'type.adviser',
}

// The chart tab (spec 027) is a custom page, not a CRUD module — pages/org-chart.
const sectionTabs: SectionTabConfig[] = [
  { to: '/organization/staff', labelKey: 'organization:tabs.staff' },
  { to: '/organization/divisions', labelKey: 'organization:tabs.divisions' },
  { to: '/organization/offices', labelKey: 'organization:tabs.offices' },
  { to: '/organization/chart', labelKey: 'organization:tabs.chart' },
]

export const organizationSectionTabs = sectionTabs

const crumbs: CrumbConfig[] = [
  { labelKey: 'nav:organization.label', path: '/organization/staff' },
]

export const divisionsModule = defineModule({
  id: 'organization-divisions',
  ns: 'organization',
  apiPath: '/organization/divisions',
  basePath: '/organization/divisions',
  titleKey: 'divisions.title',
  entityKey: 'divisions.entity',
  descriptionKey: 'divisions.description',
  crumbs,
  sectionTabs,
  listEnvelope: 'array',
  rowSchema: divisionSchema,
  detailSchema: divisionSchema,
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
    { name: 'mediaId', labelKey: 'fields.media', type: 'media' },
    {
      name: 'name',
      labelKey: 'fields.name',
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
    // Əsasnamə hər dil üçün ayrı sənəddir (ofislərdəki kimi per-locale media).
    {
      name: 'regulationMediaId',
      labelKey: 'fields.regulation',
      helpKey: 'fields.divisionRegulationHelp',
      type: 'media',
      perLocale: true,
      mediaNameKey: 'translations.{locale}.regulationName',
    },
  ],
  rowLabel: (row) => firstTranslation(row.translations, 'name'),
})

export const officesModule = defineModule({
  id: 'organization-offices',
  ns: 'organization',
  apiPath: '/organization/offices',
  basePath: '/organization/offices',
  titleKey: 'offices.title',
  entityKey: 'offices.entity',
  descriptionKey: 'offices.description',
  crumbs,
  sectionTabs,
  listEnvelope: 'array',
  rowSchema: officeSchema,
  detailSchema: officeSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID_WIDE },
    {
      key: 'name',
      headerKey: 'columns.name',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'name'),
    },
    {
      key: 'address',
      headerKey: 'columns.address',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'address'),
    },
    {
      key: 'phone',
      headerKey: 'columns.phone',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'phone'),
    },
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
    {
      name: 'address',
      labelKey: 'fields.address',
      type: 'text',
      perLocale: true,
    },
    { name: 'phone', labelKey: 'fields.phone', type: 'text', perLocale: true },
    {
      name: 'directorName',
      labelKey: 'fields.directorName',
      type: 'text',
      perLocale: true,
    },
    // Əsasnamə hər dil üçün ayrı sənəddir (image-popups kimi per-locale media).
    {
      name: 'regulationMediaId',
      labelKey: 'fields.regulation',
      helpKey: 'fields.regulationHelp',
      type: 'media',
      perLocale: true,
      mediaNameKey: 'translations.{locale}.regulationName',
    },
    { name: 'photoMediaId', labelKey: 'fields.photo', type: 'media' },
  ],
  rowLabel: (row) => firstTranslation(row.translations, 'name'),
})

export const staffModule = defineModule({
  id: 'organization-staff',
  ns: 'organization',
  apiPath: '/organization/staff',
  basePath: '/organization/staff',
  titleKey: 'staff.title',
  entityKey: 'staff.entity',
  descriptionKey: 'staff.description',
  crumbs,
  sectionTabs,
  listEnvelope: 'array',
  rowSchema: staffSchema,
  detailSchema: staffSchema,
  // Tip filtri cədvəlin üstündə tablardır: Hamısı | İdarə heyəti | Baş direktor | Sədrin müşaviri.
  filters: [
    {
      name: 'type',
      labelKey: 'fields.type',
      type: 'tabs',
      options: STAFF_TYPE_OPTIONS,
    },
  ],
  columns: [
    { key: 'sortOrder', headerKey: 'columns.sortOrder', width: COLUMN_WIDTH.ICON },
    {
      key: 'fullName',
      headerKey: 'columns.fullName',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'fullName'),
    },
    {
      key: 'position',
      headerKey: 'columns.position',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'position'),
    },
    {
      key: 'type',
      headerKey: 'columns.type',
      render: 'badge',
      badgePalette: {
        [STAFF_TYPE.BOARD]: 'primary',
        [STAFF_TYPE.MANAGEMENT]: 'secondary',
        [STAFF_TYPE.ADVISER]: 'secondary',
      },
      badgeLabelKey: STAFF_TYPE_LABEL_KEYS,
    },
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
      name: 'type',
      labelKey: 'fields.type',
      type: 'select',
      options: STAFF_TYPE_OPTIONS,
      valueAsNumber: true,
    },
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
    { name: 'phone', labelKey: 'fields.phone', type: 'text' },
    { name: 'photoMediaId', labelKey: 'fields.photo', type: 'media' },
    {
      name: 'fullName',
      labelKey: 'fields.fullName',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'position',
      labelKey: 'fields.position',
      type: 'text',
      perLocale: true,
    },
    {
      name: 'receptionDays',
      labelKey: 'fields.receptionDays',
      type: 'text',
      perLocale: true,
    },
    { name: 'bio', labelKey: 'fields.bio', type: 'richtext', perLocale: true },
  ],
  editExtras: StaffPhotosSection,
  rowLabel: (row) => firstTranslation(row.translations, 'fullName'),
})
