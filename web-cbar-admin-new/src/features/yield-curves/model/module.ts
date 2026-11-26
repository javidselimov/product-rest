/**
 * Gəlirlik əyrisi modulları — köhnə admin kimi üç ayrı bölmə (Əyri | Parametrlər |
 * Müddətlər). Hər biri yalnız siyahı + tarixə görə silmədir: data Excel-dən
 * import olunur (səhifə başlığındakı düymə), əl ilə yaratma/redaktə yoxdur.
 * Sətir açarı tarixdir, ona görə silmə `DELETE {apiPath}/{curveDate}` olur.
 */

import { defineModule, type SectionTabConfig } from '@/shared/crud/types'
import { YIELD_CURVE_MODULE_IDS } from '../api/yield-curves.keys'
import { YieldPointsAction } from '../components/yield-points-sheet'
import { COLUMN_WIDTH } from './constants'
import {
  PERIOD_KEYS,
  yieldCurveDateRowSchema,
  yieldCurveParametersRowSchema,
  yieldCurvePeriodsRowSchema,
  type YieldCurveDateRow,
  type YieldCurveParametersRow,
  type YieldCurvePeriodsRow,
} from './schemas'

export const YIELD_CURVE_SECTION_TABS: SectionTabConfig[] = [
  { to: '/yield-curves', labelKey: 'yieldCurves:tabs.yields' },
  { to: '/yield-curves/parameters', labelKey: 'yieldCurves:tabs.parameters' },
  { to: '/yield-curves/periods', labelKey: 'yieldCurves:tabs.periods' },
]

const shared = {
  ns: 'yieldCurves',
  titleKey: 'title',
  listEnvelope: 'paged' as const,
  sectionTabs: YIELD_CURVE_SECTION_TABS,
  fields: [],
  canCreate: false,
  canEdit: false,
  canDelete: true,
  rowKey: (row: { curveDate: string }) => row.curveDate,
  rowLabel: (row: { curveDate: string }) => row.curveDate,
}

const curveDateColumn = {
  key: 'curveDate',
  headerKey: 'columns.curveDate',
  render: 'date' as const,
  width: COLUMN_WIDTH.CURVE_DATE,
}

const updatedAtColumn = {
  key: 'updatedAt',
  headerKey: 'columns.updatedAt',
  render: 'datetime' as const,
}

export const yieldCurveYieldsModule = defineModule<
  YieldCurveDateRow,
  '/yield-curves'
>({
  ...shared,
  id: YIELD_CURVE_MODULE_IDS.yields,
  apiPath: '/yield-curves/yields',
  basePath: '/yield-curves',
  entityKey: 'yields.entity',
  descriptionKey: 'yields.description',
  emptyKey: 'yields.empty',
  deleteConfirmKey: 'yields.deleteConfirm',
  rowSchema: yieldCurveDateRowSchema,
  rowActions: YieldPointsAction,
  columns: [
    curveDateColumn,
    {
      key: 'pointsCount',
      headerKey: 'columns.pointsCount',
      align: 'right',
      width: COLUMN_WIDTH.POINTS_COUNT,
    },
    updatedAtColumn,
  ],
})

export const yieldCurveParametersModule = defineModule<
  YieldCurveParametersRow,
  '/yield-curves/parameters'
>({
  ...shared,
  id: YIELD_CURVE_MODULE_IDS.parameters,
  apiPath: '/yield-curves/parameters',
  basePath: '/yield-curves/parameters',
  entityKey: 'parameters.entity',
  descriptionKey: 'parameters.description',
  emptyKey: 'parameters.empty',
  deleteConfirmKey: 'parameters.deleteConfirm',
  rowSchema: yieldCurveParametersRowSchema,
  columns: [
    curveDateColumn,
    ...(['beta0', 'beta1', 'beta2', 'lambda'] as const).map((key) => ({
      key,
      headerKey: `columns.${key}`,
      align: 'right' as const,
      width: COLUMN_WIDTH.RATE,
    })),
    updatedAtColumn,
  ],
})

export const yieldCurvePeriodsModule = defineModule<
  YieldCurvePeriodsRow,
  '/yield-curves/periods'
>({
  ...shared,
  id: YIELD_CURVE_MODULE_IDS.periods,
  apiPath: '/yield-curves/periods',
  basePath: '/yield-curves/periods',
  entityKey: 'periods.entity',
  descriptionKey: 'periods.description',
  emptyKey: 'periods.empty',
  deleteConfirmKey: 'periods.deleteConfirm',
  rowSchema: yieldCurvePeriodsRowSchema,
  columns: [
    curveDateColumn,
    ...PERIOD_KEYS.map((key) => ({
      key,
      headerKey: `columns.${key}`,
      align: 'right' as const,
      width: COLUMN_WIDTH.TERM,
    })),
    updatedAtColumn,
  ],
})
