/**
 * Membership dates of an organization (spec 044, `contracts/api.md`): a sub-resource of
 * `/ifi-organizations/{id}`. Create and update answer the membership, delete and reorder 204;
 * the caller refetches the organization's detail after each.
 */

import { apiClient } from '@/shared/api/api-client'
import type { IfiMembershipUpsert } from '../model/schemas'

const membershipsPath = (organizationId: string) =>
  `/ifi-organizations/${organizationId}/memberships`

export const membershipsService = {
  create: (organizationId: string, body: IfiMembershipUpsert) =>
    apiClient.post<unknown>(membershipsPath(organizationId), body),
  update: (organizationId: string, membershipId: number, body: IfiMembershipUpsert) =>
    apiClient.put<unknown>(`${membershipsPath(organizationId)}/${membershipId}`, body),
  remove: (organizationId: string, membershipId: number) =>
    apiClient.delete<void>(`${membershipsPath(organizationId)}/${membershipId}`),
  reorder: (organizationId: string, ids: number[]) =>
    apiClient.put<void>(`${membershipsPath(organizationId)}/order`, { ids }),
}
