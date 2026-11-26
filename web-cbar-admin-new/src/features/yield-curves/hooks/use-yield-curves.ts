/** Gəlirlik əyrisi hook-ları: import (uğurda həmin data dəstinin siyahısı yenilənir) və nöqtələr. */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { yieldCurveKeys, yieldCurvePointsKey } from '../api/yield-curves.keys'
import { yieldCurvesService } from '../api/yield-curves.service'
import type {
  YieldCurveDataset,
  YieldCurveImportPayload,
} from '../model/schemas'

export function useYieldCurveImport(dataset: YieldCurveDataset) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: YieldCurveImportPayload) =>
      yieldCurvesService.importFile(dataset, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: yieldCurveKeys(dataset).all }),
  })
}

export function useYieldCurvePoints(date: string, enabled: boolean) {
  return useQuery({
    queryKey: yieldCurvePointsKey(date),
    queryFn: () => yieldCurvesService.points(date),
    enabled,
  })
}
