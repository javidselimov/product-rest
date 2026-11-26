/**
 * "Canlı yayımlar" bölməsi (spec 006) — API `/video-streams` (items). Prod
 * paneli (`product-host` VideosStreamsController) ilə eyni sahələr: başlıq
 * az/en, YouTube linki, tarix, aktiv (siyahıda klikləmə ilə dəyişir).
 * `isLive` = prod-un `active` bayrağı — ictimai sayt yalnız `isLive` yazıları
 * göstərir.
 */

import { createElement } from 'react'

import { firstTranslation } from '@/entities/content/model/types'
import { defineModule } from '@/shared/crud/types'
import { withYoutubeUrlRule } from '@/shared/crud/youtube-url'
import { LIVE_STREAMS_MODULE_ID } from '../api/live-streams.keys'
import { LiveStatusToggle } from '../components/live-status-toggle'
import { liveStreamRowSchema, type LiveStreamRow } from './schemas'

export const liveStreamsModule = defineModule<LiveStreamRow, '/live-streams'>({
  id: LIVE_STREAMS_MODULE_ID,
  ns: 'liveStreams',
  apiPath: '/video-streams',
  basePath: '/live-streams',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'items',
  rowSchema: liveStreamRowSchema,
  detailSchema: liveStreamRowSchema,
  columns: [
    {
      key: 'title',
      headerKey: 'columns.title',
      render: 'custom',
      renderCell: (row) => firstTranslation(row.translations, 'title'),
    },
    { key: 'startsAt', headerKey: 'columns.startsAt', render: 'date' },
    { key: 'createdAt', headerKey: 'columns.createdAt', render: 'date' },
    { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'date' },
    {
      // Prod-dakı kimi status düymədir — klik aktiv/qeyri-aktiv edir.
      key: 'isLive',
      headerKey: 'columns.isLive',
      render: 'custom',
      renderCell: (row) => createElement(LiveStatusToggle, { row }),
    },
  ],
  fields: [
    {
      name: 'title',
      labelKey: 'fields.title',
      type: 'text',
      perLocale: true,
      required: true,
    },
    {
      name: 'streamUrl',
      labelKey: 'fields.streamUrl',
      type: 'text',
      required: true,
      placeholderKey: 'placeholders.streamUrl',
    },
    { name: 'startsAt', labelKey: 'fields.startsAt', type: 'datetime' },
    {
      name: 'isLive',
      labelKey: 'fields.isLive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  schema: withYoutubeUrlRule('streamUrl', 'liveStreams:validation.url'),
  rowLabel: (row) => {
    const title = firstTranslation(row.translations, 'title')
    return title === '—' ? `#${row.id}` : title
  },
})
