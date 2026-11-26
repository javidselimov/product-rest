/**
 * Qalereyalar modulu (contracts/admin-api.md §6 `/galleries`, paged 20).
 * Siyahı DTO-su düzdür: `title` (az → ilk mövcud), `imageCount`; forma detail
 * DTO-suna görə; redaktədə `GalleryImagesSection` şəkilləri idarə edir.
 */

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
} from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defineModule } from '@/shared/crud/types'
import { GALLERIES_MODULE_ID } from '../api/galleries.keys'
import { GalleryImagesSection } from '../components/gallery-images-section'
import {
  galleryDetailSchema,
  galleryRowSchema,
  type GalleryRow,
} from './schemas'

export const galleriesModule = defineModule<GalleryRow, '/galleries'>({
  id: GALLERIES_MODULE_ID,
  ns: 'galleries',
  apiPath: '/galleries',
  basePath: '/galleries',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  rowSchema: galleryRowSchema,
  detailSchema: galleryDetailSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'title', headerKey: 'columns.title' },
    { key: 'eventDate', headerKey: 'columns.eventDate', render: 'date' },
    {
      key: 'imageCount',
      headerKey: 'columns.imageCount',
      align: 'right',
      width: COLUMN_WIDTH.COUNT,
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
    { name: 'eventDate', labelKey: 'fields.eventDate', type: 'date' },
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
  editExtras: GalleryImagesSection,
  rowLabel: (row) => row.title ?? `#${row.id}`,
})
