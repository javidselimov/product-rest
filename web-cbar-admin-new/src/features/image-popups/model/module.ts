/**
 * "Şəkilli popup-lar" bölməsi (spec 009) — API `/image-popups` (items). Hər
 * dilin öz şəkli, linki və alt mətni var; ictimai sayt ziyarətçinin dilində
 * şəkli olan, ən son aktiv edilmiş popup-ı göstərir. Status siyahıda klikləmə
 * ilə dəyişir (canlı yayımlardakı kimi).
 */

import { createElement } from 'react'

import { defineModule } from '@/shared/crud/types'
import { IMAGE_POPUPS_MODULE_ID } from '../api/image-popups.keys'
import { ImagePopupLocales } from '../components/image-popup-locales'
import { ImagePopupStatusToggle } from '../components/image-popup-status-toggle'
import { withLinkRule } from './link-rule'
import { imagePopupRowSchema, type ImagePopupRow } from './schemas'

export const imagePopupsModule = defineModule<ImagePopupRow, '/image-popups'>({
  id: IMAGE_POPUPS_MODULE_ID,
  ns: 'imagePopups',
  apiPath: '/image-popups',
  basePath: '/image-popups',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'items',
  rowSchema: imagePopupRowSchema,
  detailSchema: imagePopupRowSchema,
  columns: [
    { key: 'title', headerKey: 'columns.title' },
    {
      key: 'image',
      headerKey: 'columns.image',
      render: 'custom',
      renderCell: (row) =>
        row.translations.az?.mediaName ?? row.translations.en?.mediaName ?? '—',
    },
    {
      key: 'languages',
      headerKey: 'columns.languages',
      render: 'custom',
      renderCell: (row) => createElement(ImagePopupLocales, { row }),
    },
    { key: 'createdAt', headerKey: 'columns.createdAt', render: 'date' },
    { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'date' },
    {
      key: 'isActive',
      headerKey: 'columns.isActive',
      render: 'custom',
      renderCell: (row) => createElement(ImagePopupStatusToggle, { row }),
    },
  ],
  fields: [
    { name: 'title', labelKey: 'fields.title', type: 'text', required: true },
    {
      name: 'mediaId',
      labelKey: 'fields.image',
      type: 'media',
      perLocale: true,
      required: true,
      mediaNameKey: 'translations.{locale}.mediaName',
    },
    {
      name: 'link',
      labelKey: 'fields.link',
      type: 'text',
      perLocale: true,
      placeholderKey: 'placeholders.link',
    },
    {
      name: 'altText',
      labelKey: 'fields.altText',
      type: 'text',
      perLocale: true,
      helpKey: 'help.altText',
    },
    {
      name: 'isActive',
      labelKey: 'fields.isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  schema: withLinkRule('link', 'imagePopups:validation.link'),
  rowLabel: (row) => row.title,
})
