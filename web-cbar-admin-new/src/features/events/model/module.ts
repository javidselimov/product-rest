/**
 * Events modules (spec 034, contracts/ui-contract.md §7). Category, gallery, press release and
 * page choices come from lookups, so `buildEventsModule` takes them as arguments, as
 * `buildLawsModule` does; `eventsModuleBase` is the variant without choices for the route tree.
 */

import { z } from 'zod'

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
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
  EVENT_CATEGORIES_MODULE_ID,
  EVENTS_MODULE_ID,
} from '../api/events.keys'
import {
  EVENT_STATUS_OPTIONS,
  EVENT_TYPE_LABEL_KEYS,
  EVENT_TYPE_OPTIONS,
  EVENT_TYPE_PALETTE,
  eventCategoryDetailSchema,
  eventCategoryRowSchema,
  eventDetailSchema,
  eventRowSchema,
  type EventCategoryRow,
  type EventRow,
} from './schemas'

export interface EventChoices {
  categories: SelectOption[]
  galleries: SelectOption[]
  pressReleases: SelectOption[]
  pages: SelectOption[]
}

const eventsSectionTabs: SectionTabConfig[] = [
  { to: '/events', labelKey: 'events:tabs.events' },
  { to: '/events/categories', labelKey: 'events:tabs.categories' },
]

/** An ISO date compares correctly as text. */
const endsBeforeStart = (values: Record<string, unknown>) =>
  typeof values.endsOn === 'string' &&
  values.endsOn !== '' &&
  typeof values.startsOn === 'string' &&
  values.endsOn < values.startsOn

export function buildEventsModule({
  categories,
  galleries,
  pressReleases,
  pages,
}: EventChoices): ModuleConfig<EventRow, '/events'> {
  return defineModule<EventRow, '/events'>({
    id: EVENTS_MODULE_ID,
    ns: 'events',
    apiPath: '/events',
    basePath: '/events',
    titleKey: 'title',
    entityKey: 'entity',
    descriptionKey: 'description',
    sectionTabs: eventsSectionTabs,
    listEnvelope: 'paged',
    pageSize: DEFAULT_PAGE_SIZE,
    supportsSearch: true,
    rowSchema: eventRowSchema,
    detailSchema: eventDetailSchema,
    filters: [
      {
        name: 'categoryId',
        labelKey: 'filters.category',
        type: 'select',
        options: categories,
      },
      {
        name: 'type',
        labelKey: 'filters.type',
        type: 'select',
        options: EVENT_TYPE_OPTIONS,
      },
      {
        name: 'status',
        labelKey: 'filters.status',
        type: 'select',
        options: EVENT_STATUS_OPTIONS,
      },
    ],
    columns: [
      { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
      { key: 'title', headerKey: 'columns.title' },
      { key: 'startsOn', headerKey: 'columns.startsOn', render: 'date' },
      { key: 'categoryName', headerKey: 'columns.category' },
      {
        key: 'type',
        headerKey: 'columns.type',
        render: 'badge',
        badgePalette: EVENT_TYPE_PALETTE,
        badgeLabelKey: EVENT_TYPE_LABEL_KEYS,
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
        name: 'type',
        labelKey: 'fields.type',
        type: 'select',
        options: EVENT_TYPE_OPTIONS,
        valueAsNumber: true,
        nullable: true,
      },
      {
        name: 'categoryId',
        labelKey: 'fields.category',
        type: 'select',
        options: categories,
        valueAsNumber: true,
        nullable: true,
      },
      {
        name: 'status',
        labelKey: 'fields.status',
        type: 'select',
        options: EVENT_STATUS_OPTIONS,
      },
      {
        name: 'startsOn',
        labelKey: 'fields.startsOn',
        type: 'date',
        required: true,
      },
      {
        name: 'endsOn',
        labelKey: 'fields.endsOn',
        type: 'date',
        helpKey: 'fields.endsOnHelp',
      },
      { name: 'startTime', labelKey: 'fields.startTime', type: 'time' },
      {
        name: 'galleryId',
        labelKey: 'fields.gallery',
        type: 'select',
        options: galleries,
        searchable: true,
        valueAsNumber: true,
        nullable: true,
        mediaNameKey: 'gallery.title',
      },
      {
        name: 'pressReleaseId',
        labelKey: 'fields.pressRelease',
        type: 'select',
        options: pressReleases,
        searchable: true,
        valueAsNumber: true,
        nullable: true,
        mediaNameKey: 'pressRelease.title',
      },
      {
        name: 'pageId',
        labelKey: 'fields.page',
        type: 'select',
        options: pages,
        searchable: true,
        valueAsNumber: true,
        nullable: true,
        helpKey: 'fields.pageHelp',
        mediaNameKey: 'page.title',
      },
      {
        name: 'title',
        labelKey: 'fields.title',
        type: 'text',
        perLocale: true,
        required: true,
      },
      {
        name: 'location',
        labelKey: 'fields.location',
        type: 'text',
        perLocale: true,
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
        if (endsBeforeStart(data.values)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['values', 'endsOn'],
            message: i18n.t('events:validation.endsBeforeStart'),
          })
        }
      }),
    rowLabel: (row) => row.title ?? `#${row.id}`,
  })
}

export const eventsModuleBase = buildEventsModule({
  categories: [],
  galleries: [],
  pressReleases: [],
  pages: [],
})

export const eventCategoriesModule = defineModule<
  EventCategoryRow,
  '/events/categories'
>({
  id: EVENT_CATEGORIES_MODULE_ID,
  ns: 'events',
  apiPath: '/event-categories',
  basePath: '/events/categories',
  titleKey: 'categories.title',
  entityKey: 'categories.entity',
  descriptionKey: 'categories.description',
  sectionTabs: eventsSectionTabs,
  listEnvelope: 'items',
  rowSchema: eventCategoryRowSchema,
  detailSchema: eventCategoryDetailSchema,
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
