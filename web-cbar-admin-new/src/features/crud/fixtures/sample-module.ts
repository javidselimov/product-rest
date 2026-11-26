/**
 * Yalnız test üçün nümunə modul: paged envelope, az/en başlıq (məcburi), status
 * filtri, media və rəqəm sahələri. i18n açarları testdə `sample` namespace-i ilə
 * əlavə olunur.
 */

import { z } from 'zod'

import {
  CONTENT_STATUS_OPTIONS,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
} from '@/entities/content/model/types'
import { defineModule } from '@/shared/crud/types'
import {
  createCrudStore,
  type MockRow,
} from '@/shared/testing/handlers/lib/crud-store'

export interface SampleRow extends MockRow {
  status: string
  sortOrder: number
  isActive: boolean
  mediaId: number | null
  translations: { az?: { title: string }; en?: { title: string } }
}

export const sampleSeed: SampleRow[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  status: i % 3 === 0 ? 'published' : 'draft',
  sortOrder: i,
  isActive: true,
  mediaId: i === 0 ? 3 : null,
  translations: {
    az: { title: `Nümunə ${i + 1}` },
    ...(i % 2 === 0 ? { en: { title: `Sample ${i + 1}` } } : {}),
  },
}))

export const sampleRowSchema = z.looseObject({
  id: z.number(),
  status: z.string(),
  title: z.string(),
})

export const sampleModule = defineModule({
  id: 'samples',
  ns: 'sample',
  apiPath: '/samples',
  basePath: '/samples',
  titleKey: 'title',
  entityKey: 'entity',
  listEnvelope: 'paged',
  supportsSearch: true,
  rowSchema: sampleRowSchema,
  detailSchema: z.looseObject({ id: z.number(), status: z.string() }),
  filters: [
    {
      name: 'status',
      labelKey: 'fields.status',
      type: 'select',
      options: CONTENT_STATUS_OPTIONS,
    },
  ],
  columns: [
    { key: 'id', headerKey: 'columns.id', width: 60 },
    { key: 'title', headerKey: 'columns.title' },
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
      options: CONTENT_STATUS_OPTIONS,
    },
    {
      name: 'sortOrder',
      labelKey: 'fields.sortOrder',
      type: 'number',
      nullable: false,
    },
    {
      name: 'isActive',
      labelKey: 'fields.isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'mediaId',
      labelKey: 'fields.media',
      type: 'media',
      mediaNameKey: 'media.originalName',
    },
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
  ],
  rowLabel: (row) => String(row.title),
})

/**
 * The sample module with a computed "new" link (spec 052): the list's "Yeni" carries the status filter and a sort
 * order one past the first row's, as the monthly reports carry the month after the newest.
 */
export const nextModule = defineModule({
  ...sampleModule,
  id: 'next-samples',
  basePath: '/next-samples',
  prefillFromSearch: ['status', 'sortOrder'],
  newSearch: (rows): Record<string, string> => {
    const first = rows[0]
    return first ? { sortOrder: String(Number(first.sortOrder) + 1) } : {}
  },
})

export const itemsModule = defineModule({
  id: 'sample-items',
  ns: 'sample',
  apiPath: '/sample-items',
  basePath: '/sample-items',
  titleKey: 'title',
  listEnvelope: 'items',
  columns: [{ key: 'title', headerKey: 'columns.title' }],
  fields: [
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
  ],
})

export const sampleI18n = {
  az: {
    title: 'Nümunələr',
    entity: 'nümunə',
    columns: { id: 'ID', title: 'Başlıq', status: 'Status' },
    fields: {
      status: 'Status',
      sortOrder: 'Sıra',
      isActive: 'Aktiv',
      media: 'Fayl',
      title: 'Başlıq',
    },
  },
  en: {
    title: 'Samples',
    entity: 'sample',
    columns: { id: 'ID', title: 'Title', status: 'Status' },
    fields: {
      status: 'Status',
      sortOrder: 'Sort',
      isActive: 'Active',
      media: 'File',
      title: 'Title',
    },
  },
}

const listItem = (row: SampleRow) => ({
  id: row.id,
  status: row.status,
  sortOrder: row.sortOrder,
  title: row.translations.az?.title ?? row.translations.en?.title ?? '',
})

export const sampleStore = createCrudStore<SampleRow>({
  path: '/samples',
  envelope: 'paged',
  seed: sampleSeed,
  searchFields: ['translations.az.title', 'translations.en.title'],
  filterFields: ['status'],
  listItem,
})

export const itemsStore = createCrudStore<SampleRow>({
  path: '/sample-items',
  envelope: 'items',
  seed: sampleSeed.slice(0, 3),
  listItem,
})
