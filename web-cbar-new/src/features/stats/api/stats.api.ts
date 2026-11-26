/**
 * AZIR, inflyasiya, gəlirlik — contracts/public-api.md #26–#29 (`locale` yoxdur).
 * Hamısı 10 s keşlənir (spec 003 FR-015).
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'

import {
  azirSummarySchema,
  azirValueSchema,
  inflationParameterSchema,
  inflationSettingsSchema,
  yieldCurveSchema,
  type AzirSummary,
  type AzirValue,
  type InflationParameter,
  type InflationSettings,
  type YieldCurve,
} from '../model/schemas'

const azirListSchema = z.array(azirValueSchema)
const inflationListSchema = z.array(inflationParameterSchema)

const fetchAzir = cachedJson(azirListSchema, {
  keyPrefix: 'azir',
  tag: 'stats',
})
const fetchAzirSummary = cachedJson(azirSummarySchema, {
  keyPrefix: 'azir-summary',
  tag: 'stats',
})
const fetchInflation = cachedJson(inflationListSchema, {
  keyPrefix: 'inflation',
  tag: 'stats',
})
const fetchInflationSettings = cachedJsonOrNull(inflationSettingsSchema, {
  keyPrefix: 'inflation-settings',
  tag: 'stats',
})
const fetchYieldCurve = cachedJsonOrNull(yieldCurveSchema, {
  keyPrefix: 'yield-curve',
  tag: 'stats',
})

export type AzirQuery = { from?: string; to?: string; term?: string }

/** `from`/`to` daxil olmaqla; cavab tarix, sonra müddət üzrə artan sıradadır. */
export function getAzir({ from, to, term }: AzirQuery = {}): Promise<AzirValue[]> {
  const params = new URLSearchParams()
  if (from != null) params.set('from', from)
  if (to != null) params.set('to', to)
  if (term != null) params.set('term', term)
  const query = params.size > 0 ? `?${params}` : ''
  return fetchAzir(`/api/v1/azir${query}`)
}

/** 1D statistika bloku (spec 021) — filtrdən asılı deyil. */
export function getAzirSummary(): Promise<AzirSummary> {
  return fetchAzirSummary('/api/v1/azir/summary')
}

export function getInflation(year?: number): Promise<InflationParameter[]> {
  const query = year != null ? `?year=${year}` : ''
  return fetchInflation(`/api/v1/inflation${query}`)
}

/** Ana səhifə inflyasiya xülasəsi; admin hələ saxlamayıbsa (404) `null`. */
export function getInflationSettings(): Promise<InflationSettings | null> {
  return fetchInflationSettings('/api/v1/inflation/settings')
}

export function getYieldCurveLatest(): Promise<YieldCurve | null> {
  return fetchYieldCurve('/api/v1/yield-curves/latest')
}

export function getYieldCurve(date: string): Promise<YieldCurve | null> {
  return fetchYieldCurve(`/api/v1/yield-curves/${encodeURIComponent(date)}`)
}
