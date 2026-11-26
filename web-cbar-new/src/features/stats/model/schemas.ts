/**
 * AZIR, inflyasiya, gəlirlik əyrisi (spec 002 data-model.md §5).
 */
import { z } from 'zod'

/** Spec 021: həcm, say, min/max detal cədvəlindən gəlir; detal yoxdursa `null` / `false`. */
export const azirValueSchema = z
  .object({
    valueDate: z.string(),
    term: z.string(),
    rate: z.number(),
    dealVolume: z.number().nullable().optional(),
    dealCount: z.number().nullable().optional(),
    minRate: z.number().nullable().optional(),
    maxRate: z.number().nullable().optional(),
    isReservePlan: z.boolean().default(false),
  })
  .passthrough()

/** `GET /api/v1/azir/summary` — 11 göstərici, hər biri ayrıca `null` ola bilər (spec 021 data-model §4). */
export const azirSummarySchema = z
  .object({
    lastDate: z.string().nullable(),
    lastRate: z.number().nullable(),
    rateChangeSinceMonthEnd: z.number().nullable(),
    rateChangeSinceYearEnd: z.number().nullable(),
    lastMinRate: z.number().nullable(),
    lastMaxRate: z.number().nullable(),
    lastVolume: z.number().nullable(),
    volumeChangeSinceMonthEnd: z.number().nullable(),
    volumeMinSincePrevYearStart: z.number().nullable(),
    volumeMaxSincePrevYearStart: z.number().nullable(),
    lastVolumeUsd: z.number().nullable(),
  })
  .passthrough()

export const inflationParameterSchema = z
  .object({
    year: z.number(),
    month: z.number(),
    parameterCode: z.string(),
    value: z.number(),
  })
  .passthrough()

/** Ana səhifə xülasəsi — köhnə `monthly_inflation_parameters` sətri; hədəf sərbəst mətndir (`4 (±2)`). */
export const inflationSettingsSchema = z
  .object({
    currentInflation: z.number(),
    targetInflation: z.string(),
    nextUpdateDate: z.string(),
  })
  .passthrough()

export const yieldCurveSchema = z
  .object({
    curveDate: z.string(),
    parameters: z
      .object({
        beta0: z.number(),
        beta1: z.number(),
        beta2: z.number(),
        lambda: z.number(),
      })
      .passthrough()
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    yields: z.array(
      z.object({ period: z.string(), yield: z.number() }).passthrough(),
    ),
  })
  .passthrough()

export type AzirValue = z.infer<typeof azirValueSchema>
export type AzirSummary = z.infer<typeof azirSummarySchema>
export type InflationParameter = z.infer<typeof inflationParameterSchema>
export type InflationSettings = z.infer<typeof inflationSettingsSchema>
export type YieldCurve = z.infer<typeof yieldCurveSchema>

/** Ana səhifə pul bazarı kartındakı müddət qutuları (köhnə `AZIR_TERMS`). */
export const HOME_AZIR_TERMS = ['30D', '90D', '180D'] as const
