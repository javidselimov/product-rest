/**
 * Məlumat sətirləri modulu (spec US2, tasks T073). `/info-lines` siyahısı
 * alias-a görə qruplu gəlir — `rowSchema` qrup formasını yoxlayır,
 * `transformItems` qrupları sətirlərə düzləşdirir; axtarış `alias` (like)
 * parametridir. Alias siyahısı sabitdir (contracts/admin-api.md §9).
 */

import type { ZodType } from 'zod'

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
  firstTranslation,
  type SelectOption,
} from '@/entities/content/model/types'
import {
  HOMEPAGE_CRUMBS,
  HOMEPAGE_SECTION_TABS,
} from '@/features/homepage/model/section'
import { LARGE_PAGE_SIZE } from '@/shared/constants/pagination'
import { defineModule } from '@/shared/crud/types'
import { COLUMN_WIDTH } from '../../homepage/model/constants'
import {
  infoLineGroupSchema,
  infoLineSchema,
  type InfoLineGroup,
  type InfoLineRow,
} from './schemas'

export const INFO_LINE_ALIASES = [
  'homepage_indicators',
  'corridor_min',
  'corridor_max',
  'corridor_percent',
  'money_reserve_usd',
  'money_base',
  'nots_volume',
  'nots_levels_28',
  'nots_levels_84',
  'nots_levels_168',
  'nots_levels_252',
  'bank_credit',
  'bank_nation',
] as const
export type InfoLineAlias = (typeof INFO_LINE_ALIASES)[number]

export const INFO_LINE_ALIAS_OPTIONS: SelectOption[] = INFO_LINE_ALIASES.map(
  (alias) => ({
    value: alias,
    labelKey: `aliases.${alias}`,
  }),
)

/** Qrupları sətirlərə açır (envelope açıldıqdan sonra çağırılır). */
export const flattenInfoLineGroups = (items: unknown[]): InfoLineRow[] =>
  (items as InfoLineGroup[]).flatMap((group) => group.lines)

export const infoLinesModule = defineModule<
  InfoLineRow,
  '/homepage-blocks/info-lines'
>({
  id: 'info-lines',
  ns: 'infoLines',
  apiPath: '/info-lines',
  basePath: '/homepage-blocks/info-lines',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  crumbs: HOMEPAGE_CRUMBS,
  sectionTabs: HOMEPAGE_SECTION_TABS,
  listEnvelope: 'paged',
  pageSize: LARGE_PAGE_SIZE,
  supportsSearch: true,
  searchParam: 'alias',
  // rowSchema xam siyahı elementini — yəni QRUPU — yoxlayır (transformItems-dən əvvəl),
  // buna görə tipi sətir tipi ilə üst-üstə düşmür və açıq cast lazımdır.
  rowSchema: infoLineGroupSchema as unknown as ZodType<InfoLineRow>,
  detailSchema: infoLineSchema,
  transformItems: flattenInfoLineGroups,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'alias', headerKey: 'columns.alias' },
    {
      key: 'translations.az.title',
      headerKey: 'columns.title',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'title'),
    },
    {
      key: 'translations.az.value',
      headerKey: 'columns.value',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'value'),
    },
    { key: 'year', headerKey: 'columns.year', width: COLUMN_WIDTH.YEAR },
    { key: 'sortOrder', headerKey: 'columns.sortOrder', width: COLUMN_WIDTH.SORT_ORDER },
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
      name: 'alias',
      labelKey: 'fields.alias',
      type: 'select',
      required: true,
      options: INFO_LINE_ALIAS_OPTIONS,
      defaultValue: INFO_LINE_ALIASES[0],
      helpKey: 'fields.aliasHelp',
    },
    {
      name: 'year',
      labelKey: 'fields.year',
      type: 'number',
      nullable: true,
      step: 1,
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
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
    { name: 'value', labelKey: 'fields.value', type: 'text', perLocale: true },
  ],
  rowLabel: (row) => {
    const label = firstTranslation(row.translations, 'title')
    return label === '—' ? row.alias : label
  },
})
