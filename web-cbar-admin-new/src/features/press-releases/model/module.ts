/**
 * Press releases module (contracts/admin-api.md §6 `/press-releases`, paged 20, `search`,
 * `status` and `type` filters). The list DTO is flat (`title`); the form follows the detail
 * DTO (type, status, publish date, az/en title + rich text); when editing, documents are
 * attached/detached through `PressReleaseAttachmentsSection`.
 *
 * `type` is always sent (spec 029): news is the default, and editing keeps the stored type
 * because the form is filled from the detail.
 */

import {
  CONTENT_STATUS_OPTIONS,
  STATUS_LABEL_KEYS,
  STATUS_PALETTE,
} from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { defineModule } from '@/shared/crud/types'
import { PRESS_RELEASES_MODULE_ID } from '../api/press-releases.keys'
import { PressReleaseAttachmentsSection } from '../components/press-release-attachments-section'
import { COLUMN_WIDTH } from './constants'
import {
  PRESS_RELEASE_TYPE_LABEL_KEYS,
  PRESS_RELEASE_TYPE_OPTIONS,
  PRESS_RELEASE_TYPE_PALETTE,
  pressReleaseDetailSchema,
  pressReleaseRowSchema,
  type PressReleaseRow,
} from './schemas'

export const pressReleasesModule = defineModule<
  PressReleaseRow,
  '/press-releases'
>({
  id: PRESS_RELEASES_MODULE_ID,
  ns: 'pressReleases',
  apiPath: '/press-releases',
  basePath: '/press-releases',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  supportsSearch: true,
  rowSchema: pressReleaseRowSchema,
  detailSchema: pressReleaseDetailSchema,
  filters: [
    {
      name: 'type',
      labelKey: 'filters.type',
      type: 'select',
      options: PRESS_RELEASE_TYPE_OPTIONS,
    },
    {
      name: 'status',
      labelKey: 'filters.status',
      type: 'select',
      options: CONTENT_STATUS_OPTIONS,
    },
  ],
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    {
      key: 'type',
      headerKey: 'columns.type',
      render: 'badge',
      badgePalette: PRESS_RELEASE_TYPE_PALETTE,
      badgeLabelKey: PRESS_RELEASE_TYPE_LABEL_KEYS,
    },
    { key: 'title', headerKey: 'columns.title' },
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
      name: 'type',
      labelKey: 'fields.type',
      type: 'select',
      options: PRESS_RELEASE_TYPE_OPTIONS,
      valueAsNumber: true,
      defaultValue: '1',
      required: true,
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
      name: 'content',
      labelKey: 'fields.content',
      type: 'richtext',
      perLocale: true,
    },
  ],
  editExtras: PressReleaseAttachmentsSection,
  rowLabel: (row) => row.title ?? `#${row.id}`,
})
