/**
 * İstifadəçilər modulu (contracts/admin-api.md §6 `/users`, data-model.md §6).
 * Siyahı mühərrikdəndir; forma xüsusidir (`pages/users#UserFormPage`) — ona görə
 * `fields: []`. Silmə: hesab deaktiv edilir və soft-delete olunur (`deleteConfirm`).
 */

import {
  ACTIVE_LABEL_KEYS,
  ACTIVE_PALETTE,
} from '@/entities/content/model/types'
import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { COLUMN_WIDTH } from '@/shared/constants/ui'
import { defineModule } from '@/shared/crud/types'
import { ResetPasswordAction } from '../components/reset-password-action'
import {
  ROLE_BADGE_LABEL_KEYS,
  ROLE_PALETTE,
  userDetailSchema,
  userRowSchema,
  type UserRow,
} from './schemas'

export const usersModule = defineModule<UserRow, '/users'>({
  id: 'users',
  ns: 'users',
  apiPath: '/users',
  basePath: '/users',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  listEnvelope: 'paged',
  pageSize: DEFAULT_PAGE_SIZE,
  supportsSearch: true,
  rowSchema: userRowSchema,
  detailSchema: userDetailSchema,
  columns: [
    { key: 'id', headerKey: 'columns.id', width: COLUMN_WIDTH.ID },
    { key: 'username', headerKey: 'columns.username' },
    { key: 'email', headerKey: 'columns.email' },
    {
      key: 'roleCode',
      headerKey: 'columns.role',
      render: 'badge',
      badgePalette: ROLE_PALETTE,
      badgeLabelKey: ROLE_BADGE_LABEL_KEYS,
    },
    {
      key: 'isActive',
      headerKey: 'columns.isActive',
      render: 'badge',
      badgePalette: ACTIVE_PALETTE,
      badgeLabelKey: ACTIVE_LABEL_KEYS,
    },
    { key: 'createdAt', headerKey: 'columns.createdAt', render: 'datetime' },
  ],
  fields: [],
  rowActions: ResetPasswordAction,
  deleteConfirmKey: 'deleteConfirm',
  rowLabel: (row) => row.username,
})
