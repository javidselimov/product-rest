/**
 * AZIR modulu (tasks T105): paged 50, tarix aralığı + müddət filtrləri,
 * yaratma/redaktə yoxdur — dəyərlər yuxarıdakı upsert kartı ilə yazılır,
 * siyahıdan yalnız silinir. Spec 021: həcm, say, işarə, min/max sütunları və
 * sətri karta köçürən "Formaya yüklə" əməli (`canEdit: false` qalır).
 */

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'

import { LARGE_PAGE_SIZE } from '@/shared/constants/pagination'
import { defineModule } from '@/shared/crud/types'
import { AZIR_MODULE_ID } from '../api/azir.keys'
import { AzirPrefillAction } from '../components/azir-prefill-action'
import { COLUMN_WIDTH } from './constants'
import {
  AZIR_TERMS,
  AZIR_TERM_OPTIONS,
  azirItemSchema,
  azirRowLabel,
  type AzirItem,
} from './schemas'

const TERM_PALETTE: Record<string, ColorPalette> = Object.fromEntries(
  AZIR_TERMS.map((term) => [term, 'primary' as const]),
)

const RESERVE_PALETTE: Record<string, ColorPalette> = {
  true: 'yellow',
  false: 'black',
}

const RESERVE_LABEL_KEYS: Record<string, string> = {
  true: 'badge.reserve',
  false: 'badge.normal',
}

export const azirModule = defineModule<AzirItem, '/azir'>({
  id: AZIR_MODULE_ID,
  ns: 'azir',
  apiPath: '/azir',
  basePath: '/azir',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  emptyKey: 'empty',
  listEnvelope: 'paged',
  pageSize: LARGE_PAGE_SIZE,
  rowSchema: azirItemSchema,
  filters: [
    { name: 'from', labelKey: 'filters.from', type: 'date' },
    { name: 'to', labelKey: 'filters.to', type: 'date' },
    {
      name: 'term',
      labelKey: 'filters.term',
      type: 'select',
      options: AZIR_TERM_OPTIONS,
    },
  ],
  columns: [
    {
      key: 'valueDate',
      headerKey: 'columns.valueDate',
      render: 'date',
      width: COLUMN_WIDTH.VALUE_DATE,
    },
    {
      key: 'term',
      headerKey: 'columns.term',
      render: 'badge',
      badgePalette: TERM_PALETTE,
      width: 100,
    },
    { key: 'rate', headerKey: 'columns.rate', align: 'right', width: COLUMN_WIDTH.RATE },
    { key: 'dealVolume', headerKey: 'columns.dealVolume', align: 'right' },
    { key: 'dealCount', headerKey: 'columns.dealCount', align: 'right' },
    {
      key: 'isReservePlan',
      headerKey: 'columns.isReservePlan',
      render: 'badge',
      badgePalette: RESERVE_PALETTE,
      badgeLabelKey: RESERVE_LABEL_KEYS,
    },
    { key: 'minRate', headerKey: 'columns.minRate', align: 'right' },
    { key: 'maxRate', headerKey: 'columns.maxRate', align: 'right' },
    { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'datetime' },
  ],
  fields: [],
  canCreate: false,
  canEdit: false,
  rowActions: AzirPrefillAction,
  deleteConfirmKey: 'deleteConfirm',
  rowLabel: azirRowLabel,
})
