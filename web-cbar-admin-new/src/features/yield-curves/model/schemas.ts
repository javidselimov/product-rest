/**
 * Gəlirlik əyrisi DTO sxemləri — köhnə admin kimi üç müstəqil, tarixə bağlı
 * data dəsti (api-cbar-admin openapi `paths/statistics.yaml` → yieldCurve*):
 * əyri nöqtələri, Nelson–Siegel parametrləri və 7 standart müddət.
 */

import { z } from 'zod'

export const YIELD_CURVE_DATASETS = ['yields', 'parameters', 'periods'] as const
export type YieldCurveDataset = (typeof YIELD_CURVE_DATASETS)[number]

/** `GET /yield-curves/yields` sətri — nöqtələri olan tarix. */
export const yieldCurveDateRowSchema = z.looseObject({
  curveDate: z.string(),
  pointsCount: z.number(),
  updatedAt: z.string(),
})
export type YieldCurveDateRow = z.infer<typeof yieldCurveDateRowSchema>

/** `GET /yield-curves/parameters` sətri. */
export const yieldCurveParametersRowSchema = z.looseObject({
  curveDate: z.string(),
  beta0: z.number(),
  beta1: z.number(),
  beta2: z.number(),
  lambda: z.number(),
  updatedAt: z.string(),
})
export type YieldCurveParametersRow = z.infer<
  typeof yieldCurveParametersRowSchema
>

export const PERIOD_KEYS = [
  'threeMonth',
  'sixMonth',
  'nineMonth',
  'oneYear',
  'twoYear',
  'threeYear',
  'fourYear',
] as const

/** `GET /yield-curves/periods` sətri. */
export const yieldCurvePeriodsRowSchema = z.looseObject({
  curveDate: z.string(),
  threeMonth: z.number(),
  sixMonth: z.number(),
  nineMonth: z.number(),
  oneYear: z.number(),
  twoYear: z.number(),
  threeYear: z.number(),
  fourYear: z.number(),
  updatedAt: z.string(),
})
export type YieldCurvePeriodsRow = z.infer<typeof yieldCurvePeriodsRowSchema>

/** `GET /yield-curves/yields/{date}`. */
export const yieldCurvePointsSchema = z.looseObject({
  curveDate: z.string(),
  points: z.array(z.looseObject({ period: z.number(), yield: z.number() })),
})
export type YieldCurvePoints = z.infer<typeof yieldCurvePointsSchema>

/** İmport cavabı — yalnız müvəffəqiyyət yoxlanılır, siyahı invalidasiya ilə yenilənir. */
export const yieldCurveImportResultSchema = z.looseObject({
  curveDate: z.string(),
})

/** İmport sorğusu — `overwrite` yalnız 409 `date_exists` təsdiqindən sonra. */
export interface YieldCurveImportPayload {
  date: string
  file: File
  overwrite?: boolean
}

/** İmport xətalarının `code`-ları; hər birinin `import.errors.<code>` mətni var. */
export const IMPORT_ERROR_CODES = [
  'date_required',
  'file_required',
  'not_xlsx',
  'file_too_large',
  'no_rows',
  'too_many_rows',
  'invalid_value',
  'duplicate_period',
] as const
