/**
 * Release schedule modules (spec 039): the rows of the "Information disclosure schedule" page and the
 * two lookups they pick from. Group and periodicity choices come from lookups, so
 * `buildReleaseScheduleItemsModule` takes them as arguments, as `buildEventsModule` does;
 * `releaseScheduleItemsModuleBase` is the variant without choices for the route tree.
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
import { defaultBuildPayload } from '@/shared/crud/form-model'
import {
  defineModule,
  type FieldConfig,
  type ModuleConfig,
  type SectionTabConfig,
} from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { isAllowedLink } from '@/shared/lib/site-link'
import {
  RELEASE_SCHEDULE_GROUPS_MODULE_ID,
  RELEASE_SCHEDULE_ITEMS_MODULE_ID,
  RELEASE_SCHEDULE_PERIODICITIES_MODULE_ID,
} from '../api/release-schedule.keys'
import { TIMING_MODE, TIMING_URL_MAX_LENGTH } from './constants'
import {
  RELEASE_SCHEDULE_STATUS_OPTIONS,
  TIMING_MODE_LABEL_KEYS,
  TIMING_MODE_OPTIONS,
  TIMING_MODE_PALETTE,
  releaseScheduleGroupDetailSchema,
  releaseScheduleGroupRowSchema,
  releaseScheduleItemDetailSchema,
  releaseScheduleItemRowSchema,
  releaseSchedulePeriodicityDetailSchema,
  releaseSchedulePeriodicityRowSchema,
  type ReleaseScheduleGroupRow,
  type ReleaseScheduleItemRow,
  type ReleaseSchedulePeriodicityRow,
} from './schemas'

export const RELEASE_SCHEDULE_PATH = '/release-schedule'

export const releaseScheduleSectionTabs: SectionTabConfig[] = [
  { to: RELEASE_SCHEDULE_PATH, labelKey: 'releaseSchedule:tabs.items' },
  { to: `${RELEASE_SCHEDULE_PATH}/groups`, labelKey: 'releaseSchedule:tabs.groups' },
  { to: `${RELEASE_SCHEDULE_PATH}/periodicities`, labelKey: 'releaseSchedule:tabs.periodicities' },
]

const TIMING_URL = 'timingUrl'
const TIMING_MODE_FIELD = 'timingMode'
/** A language that was started needs a title, otherwise the API refuses the whole save. */
const LOCALE_FIELDS = ['title', 'timing'] as const

function itemFields(groups: SelectOption[], periodicities: SelectOption[]): FieldConfig[] {
  return [
    {
      name: 'groupId',
      labelKey: 'fields.group',
      type: 'select',
      options: groups,
      valueAsNumber: true,
      required: true,
    },
    {
      name: 'periodicityId',
      labelKey: 'fields.periodicity',
      type: 'select',
      options: periodicities,
      valueAsNumber: true,
      nullable: true,
      helpKey: 'fields.periodicityHelp',
    },
    {
      name: TIMING_MODE_FIELD,
      labelKey: 'fields.timingMode',
      type: 'select',
      options: TIMING_MODE_OPTIONS,
      helpKey: 'fields.timingModeHelp',
    },
    {
      name: TIMING_URL,
      labelKey: 'fields.timingUrl',
      type: 'text',
      helpKey: 'fields.timingUrlHelp',
    },
    {
      name: 'status',
      labelKey: 'fields.status',
      type: 'select',
      options: RELEASE_SCHEDULE_STATUS_OPTIONS,
    },
    {
      name: 'sortOrder',
      labelKey: 'fields.sortOrder',
      type: 'number',
      nullable: false,
      defaultValue: '0',
      helpKey: 'fields.sortOrderHelp',
    },
    { name: 'showAz', labelKey: 'fields.showAz', type: 'checkbox', defaultValue: true },
    { name: 'showEn', labelKey: 'fields.showEn', type: 'checkbox', defaultValue: true },
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'timing',
      labelKey: 'fields.timing',
      type: 'text',
      perLocale: true,
      helpKey: 'fields.timingHelp',
    },
  ]
}

export function buildReleaseScheduleItemsModule(
  groups: SelectOption[],
  periodicities: SelectOption[],
): ModuleConfig<ReleaseScheduleItemRow, '/release-schedule'> {
  const fields = itemFields(groups, periodicities)
  return defineModule<ReleaseScheduleItemRow, '/release-schedule'>({
    id: RELEASE_SCHEDULE_ITEMS_MODULE_ID,
    ns: 'releaseSchedule',
    apiPath: '/release-schedule/items',
    basePath: RELEASE_SCHEDULE_PATH,
    titleKey: 'title',
    entityKey: 'entity',
    descriptionKey: 'description',
    sectionTabs: releaseScheduleSectionTabs,
    listEnvelope: 'paged',
    pageSize: DEFAULT_PAGE_SIZE,
    supportsSearch: true,
    rowSchema: releaseScheduleItemRowSchema,
    detailSchema: releaseScheduleItemDetailSchema,
    filters: [
      { name: 'groupId', labelKey: 'filters.group', type: 'select', options: groups },
      {
        name: 'periodicityId',
        labelKey: 'filters.periodicity',
        type: 'select',
        options: periodicities,
      },
      {
        name: 'status',
        labelKey: 'filters.status',
        type: 'select',
        options: RELEASE_SCHEDULE_STATUS_OPTIONS,
      },
    ],
    columns: [
      { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
      { key: 'title', headerKey: 'columns.title' },
      { key: 'group', headerKey: 'columns.group' },
      { key: 'periodicity', headerKey: 'columns.periodicity' },
      {
        key: TIMING_MODE_FIELD,
        headerKey: 'columns.timingMode',
        render: 'badge',
        badgePalette: TIMING_MODE_PALETTE,
        badgeLabelKey: TIMING_MODE_LABEL_KEYS,
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
    fields,
    schema: (base) =>
      base.superRefine((data, ctx) => {
        for (const locale of LOCALES) {
          const values = data.translations[locale] ?? {}
          const started = LOCALE_FIELDS.some((name) => (values[name] ?? '').trim())
          if (!started || (values.title ?? '').trim()) continue
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['translations', locale, 'title'],
            message: i18n.t('releaseSchedule:validation.titleRequired'),
          })
        }

        if (data.values[TIMING_MODE_FIELD] !== TIMING_MODE.LINK) return
        const link = String(data.values[TIMING_URL] ?? '').trim()
        const problem =
          link === ''
            ? 'linkRequired'
            : link.length > TIMING_URL_MAX_LENGTH || !isAllowedLink(link)
              ? 'linkInvalid'
              : null
        if (problem === null) return
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['values', TIMING_URL],
          message: i18n.t(`releaseSchedule:validation.${problem}`),
        })
      }),
    // The URL belongs to the link mode only: the API stores it as null otherwise (CHECK in 0022).
    buildPayload: (values, translations) => {
      const payload = defaultBuildPayload({ fields }, values, translations)
      const link = String(payload[TIMING_URL] ?? '').trim()
      payload[TIMING_URL] = payload[TIMING_MODE_FIELD] === TIMING_MODE.LINK && link ? link : null
      return payload
    },
    rowLabel: (row) => row.title ?? `#${row.id}`,
  })
}

export const releaseScheduleItemsModuleBase = buildReleaseScheduleItemsModule([], [])

const nameColumn = { key: 'name', headerKey: 'lookups.columns.name' }
const sortOrderColumn = {
  key: 'sortOrder',
  headerKey: 'lookups.columns.sortOrder',
  align: 'right' as const,
  width: COLUMN_WIDTH.NUMBER_MD,
}
const nameField: FieldConfig = {
  name: 'name',
  labelKey: 'lookups.fields.name',
  type: 'text',
  perLocale: true,
  required: true,
}
const sortOrderField: FieldConfig = {
  name: 'sortOrder',
  labelKey: 'lookups.fields.sortOrder',
  type: 'number',
  nullable: false,
  defaultValue: '0',
}

export const releaseScheduleGroupsModule = defineModule<
  ReleaseScheduleGroupRow,
  '/release-schedule/groups'
>({
  id: RELEASE_SCHEDULE_GROUPS_MODULE_ID,
  ns: 'releaseSchedule',
  apiPath: '/release-schedule/groups',
  basePath: '/release-schedule/groups',
  titleKey: 'groups.title',
  entityKey: 'groups.entity',
  descriptionKey: 'groups.description',
  sectionTabs: releaseScheduleSectionTabs,
  listEnvelope: 'items',
  rowSchema: releaseScheduleGroupRowSchema,
  detailSchema: releaseScheduleGroupDetailSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    nameColumn,
    sortOrderColumn,
    {
      key: 'isActive',
      headerKey: 'groups.columns.isActive',
      render: 'badge',
      badgePalette: ACTIVE_PALETTE,
      badgeLabelKey: ACTIVE_LABEL_KEYS,
    },
  ],
  fields: [
    nameField,
    sortOrderField,
    {
      name: 'isActive',
      labelKey: 'groups.fields.isActive',
      type: 'checkbox',
      defaultValue: true,
      helpKey: 'groups.fields.isActiveHelp',
    },
  ],
  rowLabel: (row) => row.name ?? `#${row.id}`,
})

export const releaseSchedulePeriodicitiesModule = defineModule<
  ReleaseSchedulePeriodicityRow,
  '/release-schedule/periodicities'
>({
  id: RELEASE_SCHEDULE_PERIODICITIES_MODULE_ID,
  ns: 'releaseSchedule',
  apiPath: '/release-schedule/periodicities',
  basePath: '/release-schedule/periodicities',
  titleKey: 'periodicities.title',
  entityKey: 'periodicities.entity',
  descriptionKey: 'periodicities.description',
  sectionTabs: releaseScheduleSectionTabs,
  listEnvelope: 'items',
  rowSchema: releaseSchedulePeriodicityRowSchema,
  detailSchema: releaseSchedulePeriodicityDetailSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    nameColumn,
    sortOrderColumn,
  ],
  fields: [nameField, sortOrderField],
  rowLabel: (row) => row.name ?? `#${row.id}`,
})
