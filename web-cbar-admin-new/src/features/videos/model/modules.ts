/**
 * Videolar bölməsi (contracts/admin-api.md §6): `/videos` (paged, YouTube
 * linki). Canlı yayımlar spec 006-dan ayrıca bölmədir: `features/live-streams`.
 */

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
} from '@/entities/content/model/types'
import type { FormSchema } from '@/shared/crud/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defineModule } from '@/shared/crud/types'
import { i18n } from '@/shared/i18n'
import { videoDetailSchema, videoRowSchema, type VideoRow } from './schemas'

/**
 * Link yalnız `http`/`https` ilə başlamalıdır — host yoxlanılmır ki, mövcud
 * YouTube-dan kənar video linkləri redaktədə bloklanmasın. Canlı yayımın
 * sərt YouTube qaydası ayrıdır: `shared/crud/youtube-url.ts` (spec 006).
 */
const withHttpUrlRule = (base: FormSchema): FormSchema =>
  base.superRefine((data, ctx) => {
    const url = data.values.youtubeUrl
    if (typeof url !== 'string' || url.trim() === '') return
    if (!/^https?:\/\//i.test(url.trim())) {
      ctx.addIssue({
        code: 'custom',
        path: ['values', 'youtubeUrl'],
        message: i18n.t('videos:validation.url'),
      })
    }
  })

export const videosModule = defineModule<VideoRow, '/videos'>({
  id: 'videos',
  ns: 'videos',
  apiPath: '/videos',
  basePath: '/videos',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  rowSchema: videoRowSchema,
  detailSchema: videoDetailSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'title', headerKey: 'columns.title' },
    { key: 'youtubeUrl', headerKey: 'columns.youtubeUrl' },
    {
      key: 'publishedAt',
      headerKey: 'columns.publishedAt',
      render: 'datetime',
    },
    {
      key: 'sortOrder',
      headerKey: 'columns.sortOrder',
      align: 'right',
      width: COLUMN_WIDTH.NUMBER_MD,
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
      name: 'youtubeUrl',
      labelKey: 'fields.youtubeUrl',
      type: 'text',
      required: true,
      placeholderKey: 'placeholders.youtubeUrl',
    },
    { name: 'publishedAt', labelKey: 'fields.publishedAt', type: 'datetime' },
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
  ],
  schema: withHttpUrlRule,
  rowLabel: (row) => row.title ?? `#${row.id}`,
})
