/**
 * Org chart server state (spec 027). Every write invalidates the whole chart — the list is
 * small. Sibling order is saved by the "Sıranı dəyiş" dialog itself (spec 060).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { orgChartKeys, orgChartService } from '../api/org-chart.service'
import type { OrgChartNodeUpsert } from '../model/schemas'

export function useOrgChart() {
  return useQuery({ queryKey: orgChartKeys.list(), queryFn: orgChartService.list })
}

export function useOrgChartLinks() {
  return useQuery({ queryKey: orgChartKeys.links(), queryFn: orgChartService.links })
}

function useInvalidateChart() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: orgChartKeys.list() })
}

export function useSaveOrgChartNode() {
  const invalidate = useInvalidateChart()
  return useMutation({
    mutationFn: ({ id, body }: { id: number | null; body: OrgChartNodeUpsert }) =>
      id === null ? orgChartService.create(body) : orgChartService.update(id, body),
    onSuccess: invalidate,
  })
}

export function useDeleteOrgChartNode() {
  const invalidate = useInvalidateChart()
  return useMutation({ mutationFn: (id: number) => orgChartService.remove(id), onSuccess: invalidate })
}
