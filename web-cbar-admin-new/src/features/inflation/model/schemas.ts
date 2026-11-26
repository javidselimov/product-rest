/** İnflyasiya DTO sxemləri (contracts/admin-api.md §8, data-model.md §5 InflationParam). */

import { z } from 'zod'

import { MONTHS_PER_YEAR } from '@/shared/constants/limits'

export const INFLATION_PARAMETERS = ['cpi_yoy', 'target'] as const
export type InflationParameterCode = (typeof INFLATION_PARAMETERS)[number]

export const MONTHS = Array.from({ length: MONTHS_PER_YEAR }, (_, i) => i + 1)

export const inflationItemSchema = z.looseObject({
  id: z.number(),
  year: z.number(),
  month: z.number(),
  parameterCode: z.string(),
  value: z.number(),
  updatedAt: z.string(),
})
export type InflationItem = z.infer<typeof inflationItemSchema>

/** `POST /inflation` cavabı (köhnə panel tipi ilə eyni). */
export const inflationUpsertResponseSchema = z.looseObject({
  id: z.number(),
  year: z.number(),
  month: z.number(),
  parameterCode: z.string(),
  value: z.number(),
})

export interface InflationUpsertPayload {
  year: number
  month: number
  parameterCode: string
  value: number
}

/**
 * Ana səhifə xülasəsi (köhnə paneldəki "Aylıq inflyasiya parametrləri"):
 * tək sətir — cari dəyər, hədəf (sərbəst mətn, məs. "4 (±2)"), yenilənmə tarixi.
 * Heç saxlanmayıbsa `GET /inflation/settings` `null` qaytarır.
 */
export const inflationSettingsSchema = z
  .looseObject({
    currentInflation: z.number(),
    targetInflation: z.string(),
    nextUpdateDate: z.string(),
  })
  .nullable()
export type InflationSettings = NonNullable<
  z.infer<typeof inflationSettingsSchema>
>

export interface InflationSettingsPayload {
  currentInflation: number
  targetInflation: string
  nextUpdateDate: string
}
