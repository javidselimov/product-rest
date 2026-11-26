/**
 * Gəlirlik əyrisi servisi — import (hər data dəsti öz `.xlsx`-i ilə) və bir
 * tarixin nöqtələri. Siyahı və silmə `crudService` ilə gedir. Cavablar Zod ilə
 * parse olunur (B13).
 */

import { ZodError, type ZodType } from 'zod'

import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import {
  yieldCurveImportResultSchema,
  yieldCurvePointsSchema,
  type YieldCurveDataset,
  type YieldCurveImportPayload,
  type YieldCurvePoints,
} from '../model/schemas'

function parseOr<T>(schema: ZodType<T>, raw: unknown, where: string): T {
  try {
    return schema.parse(raw)
  } catch (error) {
    if (error instanceof ZodError) throw contractError(where)
    throw error
  }
}

export const yieldCurvesService = {
  /** Server faylı oxuyub həmin tarix üçün dərhal yazır (legacy kimi, baxış addımı yoxdur). */
  async importFile(
    dataset: YieldCurveDataset,
    payload: YieldCurveImportPayload,
  ) {
    const form = new FormData()
    form.append('date', payload.date)
    form.append('file', payload.file, payload.file.name)
    if (payload.overwrite) form.append('overwrite', 'true')
    const raw = await apiClient.post<unknown>(
      `/yield-curves/${dataset}/import`,
      form,
    )
    return parseOr(yieldCurveImportResultSchema, raw, `yieldCurves.import.${dataset}`)
  },

  async points(date: string): Promise<YieldCurvePoints> {
    const raw = await apiClient.get<unknown>(`/yield-curves/yields/${date}`)
    return parseOr(yieldCurvePointsSchema, raw, 'yieldCurves.points')
  },
}
