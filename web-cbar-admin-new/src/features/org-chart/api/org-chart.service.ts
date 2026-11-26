/**
 * Org chart API (spec 027, api-cbar-admin openapi `paths/organization.yaml#/chart*`):
 * flat `array` list; create 201 + node; update 200 + node (leaves the position alone);
 * delete 204 (409 while the node has children); `PUT /order` reorders one node's children (204,
 * spec 060). Staff and division lists for the link pickers are read here too.
 */

import { divisionSchema, staffSchema } from '@/features/organization/model/schemas'
import { apiClient } from '@/shared/api/api-client'
import { contractError } from '@/shared/api/types'
import { z } from 'zod'

import {
  orgChartListSchema,
  orgChartNodeSchema,
  type OrgChartNode,
  type OrgChartNodeUpsert,
} from '../model/schemas'

const BASE = '/organization/chart'

function parse<T>(schema: z.ZodType<T>, raw: unknown, where: string): T {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) throw contractError(where)
  return parsed.data
}

export const orgChartKeys = {
  all: ['org-chart'] as const,
  list: () => ['org-chart', 'list'] as const,
  links: () => ['org-chart', 'links'] as const,
  children: (parentId: number | null) => ['org-chart', 'children', parentId] as const,
}

export const orgChartService = {
  async list(): Promise<OrgChartNode[]> {
    return parse(orgChartListSchema, await apiClient.get<unknown>(BASE), 'organization.chart.list')
  },

  async create(body: OrgChartNodeUpsert): Promise<OrgChartNode> {
    return parse(orgChartNodeSchema, await apiClient.post<unknown>(BASE, body), 'organization.chart.create')
  },

  async update(id: number, body: OrgChartNodeUpsert): Promise<OrgChartNode> {
    return parse(orgChartNodeSchema, await apiClient.put<unknown>(`${BASE}/${id}`, body), 'organization.chart.update')
  },

  remove(id: number) {
    return apiClient.delete<void>(`${BASE}/${id}`)
  },

  /** Every child of `parentId` (the roots when null), inactive ones included, in the new order. */
  reorder(parentId: number | null, ids: number[]) {
    return apiClient.put<void>(`${BASE}/order`, { parentId, ids })
  },

  /** The children of one node in their saved order, for the "Sıranı dəyiş" dialog. */
  async children(parentId: number | null): Promise<OrgChartNode[]> {
    return (await orgChartService.list()).filter((n) => n.parentId === parentId)
  },

  /** Link options — staff and divisions, active and inactive alike. */
  async links() {
    const [staff, divisions] = await Promise.all([
      apiClient.get<unknown>('/organization/staff'),
      apiClient.get<unknown>('/organization/divisions'),
    ])
    return {
      staff: parse(z.array(staffSchema), staff, 'organization.staff.list'),
      divisions: parse(z.array(divisionSchema), divisions, 'organization.divisions.list'),
    }
  },
}
