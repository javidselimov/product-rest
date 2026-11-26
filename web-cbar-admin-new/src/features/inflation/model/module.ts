/**
 * İnflyasiya modulu (tasks T106): `array` envelope, il filtri, yaratma/redaktə
 * yoxdur — dəyərlər upsert kartı ilə yazılır, siyahıdan yalnız silinir.
 */

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'
import { createElement } from 'react'

import { defineModule } from '@/shared/crud/types'
import { COLUMN_WIDTH } from './constants'
import { INFLATION_MODULE_ID } from '../api/inflation.keys'
import { MonthCell } from '../components/month-cell'
import { inflationItemSchema, type InflationItem } from './schemas'

const PARAMETER_PALETTE: Record<string, ColorPalette> = {
  cpi_yoy: 'primary',
  target: 'secondary',
}

const PARAMETER_LABEL_KEYS: Record<string, string> = {
  cpi_yoy: 'parameters.cpi_yoy',
  target: 'parameters.target',
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export const inflationModule = defineModule<InflationItem, '/inflation'>({
  id: INFLATION_MODULE_ID,
  ns: 'inflation',
  apiPath: '/inflation',
  basePath: '/inflation',
  titleKey: 'title',
  entityKey: 'entity',
  descriptionKey: 'description',
  emptyKey: 'empty',
  listEnvelope: 'array',
  rowSchema: inflationItemSchema,
  filters: [{ name: 'year', labelKey: 'filters.year', type: 'number' }],
  columns: [
    { key: 'year', headerKey: 'columns.year', width: COLUMN_WIDTH.YEAR },
    {
      key: 'month',
      headerKey: 'columns.month',
      render: 'custom',
      renderCell: (row) => createElement(MonthCell, { month: row.month }),
      width: COLUMN_WIDTH.MONTH,
    },
    {
      key: 'parameterCode',
      headerKey: 'columns.parameterCode',
      render: 'badge',
      badgePalette: PARAMETER_PALETTE,
      badgeLabelKey: PARAMETER_LABEL_KEYS,
      width: COLUMN_WIDTH.PARAMETER,
    },
    { key: 'value', headerKey: 'columns.value', align: 'right', width: COLUMN_WIDTH.VALUE },
    { key: 'updatedAt', headerKey: 'columns.updatedAt', render: 'datetime' },
  ],
  fields: [],
  canCreate: false,
  canEdit: false,
  deleteConfirmKey: 'deleteConfirm',
  rowLabel: (row) => `${row.year}-${pad2(row.month)} ${row.parameterCode}`,
})
