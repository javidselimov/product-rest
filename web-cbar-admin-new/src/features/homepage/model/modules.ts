/**
 * Ana səhifə bloklarının deklarativ CRUD konfiqləri (spec US2, tasks T070).
 * Beş resurs da `items` envelope ilə gəlir (səhifələmə yoxdur), hamısı eyni
 * `homepage` namespace-ini, bölmə tablarını və breadcrumb zəncirini paylaşır.
 * Sütun/sahə pariteti köhnə `web-cbar-admin/src/modules/homepage.ts`-dəndir.
 */

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
  firstTranslation,
  type Translations,
} from '@/entities/content/model/types'
import {
  defineModule,
  type AnyRow,
  type ColumnConfig,
  type FieldConfig,
} from '@/shared/crud/types'
import { COLUMN_WIDTH } from './constants'
import {
  bannerRowSchema,
  homepageLinkRowSchema,
  newsSlideRowSchema,
  publicationRowSchema,
  runningLineRowSchema,
  type BannerRow,
  type HomepageLinkRow,
  type NewsSlideRow,
  type PublicationRow,
  type RunningLineRow,
} from './schemas'
import { HOMEPAGE_CRUMBS, HOMEPAGE_SECTION_TABS } from './section'

type TranslatedRow = AnyRow & {
  translations?: Translations<Record<string, unknown>>
}

/** Tərcümə sütunu: az → en → "—" (siyahı DTO-su tam `translations` daşıyır). */
const translatedColumn = <Row extends TranslatedRow>(
  field: string,
  headerKey: string,
): ColumnConfig<Row> => ({
  key: `translations.az.${field}`,
  headerKey,
  render: 'custom',
  renderCell: (row) => firstTranslation(row.translations, field),
})

/** Dialoq/toast üçün sətir adı: tərcümə, yoxdursa `#id`. */
const translatedLabel = (row: TranslatedRow, field: string): string => {
  const label = firstTranslation(row.translations, field)
  return label === '—' ? `#${String(row.id)}` : label
}

const idColumn: ColumnConfig = { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID }
const sortColumn: ColumnConfig = {
  key: 'sortOrder',
  headerKey: 'columns.sortOrder',
  width: COLUMN_WIDTH.SORT_ORDER,
}
const activeColumn: ColumnConfig = {
  key: 'isActive',
  headerKey: 'columns.isActive',
  render: 'badge',
  badgePalette: ACTIVE_PALETTE,
  badgeLabelKey: ACTIVE_LABEL_KEYS,
}

const sortField: FieldConfig = {
  name: 'sortOrder',
  labelKey: 'fields.sortOrder',
  type: 'number',
  nullable: false,
  defaultValue: '0',
}
const activeField: FieldConfig = {
  name: 'isActive',
  labelKey: 'fields.isActive',
  type: 'checkbox',
  defaultValue: true,
}
const startsAtField: FieldConfig = {
  name: 'startsAt',
  labelKey: 'fields.startsAt',
  type: 'datetime',
}
const endsAtField: FieldConfig = {
  name: 'endsAt',
  labelKey: 'fields.endsAt',
  type: 'datetime',
}

const shared = {
  ns: 'homepage',
  crumbs: HOMEPAGE_CRUMBS,
  sectionTabs: HOMEPAGE_SECTION_TABS,
  listEnvelope: 'items',
} as const

/** Bannerlər — tərcümə sahələri məcburi deyil: banner yalnız şəkildən ibarət ola bilər. */
export const bannersModule = defineModule<
  BannerRow,
  '/homepage-blocks/banners'
>({
  ...shared,
  id: 'banners',
  apiPath: '/banners',
  basePath: '/homepage-blocks/banners',
  titleKey: 'banners.title',
  entityKey: 'banners.entity',
  descriptionKey: 'banners.description',
  rowSchema: bannerRowSchema,
  detailSchema: bannerRowSchema,
  columns: [
    idColumn,
    translatedColumn('title', 'columns.title'),
    sortColumn,
    activeColumn,
    { key: 'startsAt', headerKey: 'columns.startsAt', render: 'datetime' },
    { key: 'endsAt', headerKey: 'columns.endsAt', render: 'datetime' },
  ],
  fields: [
    { name: 'mediaId', labelKey: 'fields.image', type: 'media' },
    sortField,
    activeField,
    startsAtField,
    endsAtField,
    { name: 'title', labelKey: 'fields.title', type: 'text', perLocale: true },
    { name: 'link', labelKey: 'fields.link', type: 'text', perLocale: true },
  ],
  rowLabel: (row) => translatedLabel(row, 'title'),
})

export const newsSliderModule = defineModule<
  NewsSlideRow,
  '/homepage-blocks/news-slider'
>({
  ...shared,
  id: 'news-slider',
  apiPath: '/news-slider',
  basePath: '/homepage-blocks/news-slider',
  titleKey: 'newsSlider.title',
  entityKey: 'newsSlider.entity',
  descriptionKey: 'newsSlider.description',
  rowSchema: newsSlideRowSchema,
  detailSchema: newsSlideRowSchema,
  columns: [
    idColumn,
    translatedColumn('title', 'columns.title'),
    { key: 'newsDate', headerKey: 'columns.newsDate', render: 'date' },
    sortColumn,
    activeColumn,
  ],
  fields: [
    {
      name: 'newsDate',
      labelKey: 'fields.newsDate',
      type: 'date',
      required: true,
    },
    { name: 'mediaId', labelKey: 'fields.image', type: 'media' },
    sortField,
    activeField,
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
      type: 'text',
      perLocale: true,
    },
    { name: 'link', labelKey: 'fields.link', type: 'text', perLocale: true },
  ],
  rowLabel: (row) => translatedLabel(row, 'title'),
})

export const runningLinesModule = defineModule<
  RunningLineRow,
  '/homepage-blocks/running-lines'
>({
  ...shared,
  id: 'running-lines',
  apiPath: '/running-lines',
  basePath: '/homepage-blocks/running-lines',
  titleKey: 'runningLines.title',
  entityKey: 'runningLines.entity',
  descriptionKey: 'runningLines.description',
  rowSchema: runningLineRowSchema,
  detailSchema: runningLineRowSchema,
  columns: [
    idColumn,
    translatedColumn('text', 'columns.text'),
    activeColumn,
    { key: 'startsAt', headerKey: 'columns.startsAt', render: 'datetime' },
    { key: 'endsAt', headerKey: 'columns.endsAt', render: 'datetime' },
  ],
  fields: [
    activeField,
    startsAtField,
    endsAtField,
    {
      name: 'text',
      labelKey: 'fields.text',
      type: 'text',
      perLocale: true,
      required: true,
    },
  ],
  rowLabel: (row) => translatedLabel(row, 'text'),
})

export const homepageLinksModule = defineModule<
  HomepageLinkRow,
  '/homepage-blocks/links'
>({
  ...shared,
  id: 'homepage-links',
  apiPath: '/homepage-links',
  basePath: '/homepage-blocks/links',
  titleKey: 'links.title',
  entityKey: 'links.entity',
  descriptionKey: 'links.description',
  rowSchema: homepageLinkRowSchema,
  detailSchema: homepageLinkRowSchema,
  columns: [
    idColumn,
    translatedColumn('title', 'columns.title'),
    translatedColumn('url', 'columns.url'),
    sortColumn,
    activeColumn,
  ],
  fields: [
    sortField,
    activeField,
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'url',
      labelKey: 'fields.url',
      type: 'text',
      perLocale: true,
      required: true,
    },
  ],
  rowLabel: (row) => translatedLabel(row, 'title'),
})

export const publicationsModule = defineModule<
  PublicationRow,
  '/homepage-blocks/publications'
>({
  ...shared,
  id: 'homepage-publications',
  apiPath: '/homepage-publications',
  basePath: '/homepage-blocks/publications',
  titleKey: 'publications.title',
  entityKey: 'publications.entity',
  descriptionKey: 'publications.description',
  rowSchema: publicationRowSchema,
  detailSchema: publicationRowSchema,
  columns: [
    idColumn,
    translatedColumn('title', 'columns.title'),
    {
      key: 'publishedAt',
      headerKey: 'columns.publishedAt',
      render: 'datetime',
    },
    sortColumn,
    activeColumn,
  ],
  fields: [
    { name: 'mediaId', labelKey: 'fields.file', type: 'media' },
    { name: 'publishedAt', labelKey: 'fields.publishedAt', type: 'datetime' },
    sortField,
    activeField,
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
    { name: 'url', labelKey: 'fields.url', type: 'text', perLocale: true },
  ],
  rowLabel: (row) => translatedLabel(row, 'title'),
})

export const homepageModules = [
  bannersModule,
  newsSliderModule,
  runningLinesModule,
  homepageLinksModule,
  publicationsModule,
] as const
