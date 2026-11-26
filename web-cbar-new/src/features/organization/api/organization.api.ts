/**
 * Təşkilat — contracts/public-api.md #13–#16. 10 s keşlənir (spec 003 FR-015).
 */
import 'server-only'

import { z } from 'zod'

import { cachedJson, cachedJsonOrNull } from '@/server/cached'
import type { Locale } from '@/shared/i18n'

import {
  divisionSchema,
  officeSchema,
  orgChartNodeSchema,
  staffMemberSchema,
  type Division,
  type Office,
  type OrgChartNode,
  type StaffMember,
} from '../model/schemas'

const staffListSchema = z.array(staffMemberSchema)
const divisionListSchema = z.array(divisionSchema)
const officeListSchema = z.array(officeSchema)
const orgChartSchema = z.array(orgChartNodeSchema)

const fetchStaff = cachedJson(staffListSchema, { keyPrefix: 'staff-list', tag: 'organization' })
const fetchStaffMember = cachedJsonOrNull(staffMemberSchema, {
  keyPrefix: 'staff-member',
  tag: 'organization',
})
const fetchDivisions = cachedJson(divisionListSchema, { keyPrefix: 'divisions', tag: 'organization' })
const fetchOffices = cachedJson(officeListSchema, { keyPrefix: 'offices', tag: 'organization' })
const fetchOrgChart = cachedJson(orgChartSchema, { keyPrefix: 'org-chart', tag: 'organization' })

export function getStaff(locale: Locale, type?: number): Promise<StaffMember[]> {
  const typeParam = type != null ? `&type=${type}` : ''
  return fetchStaff(`/api/v1/organization/staff?locale=${locale}${typeParam}`)
}

export function getStaffMember(locale: Locale, id: number): Promise<StaffMember | null> {
  return fetchStaffMember(`/api/v1/organization/staff/${id}?locale=${locale}`)
}

export function getDivisions(locale: Locale): Promise<Division[]> {
  return fetchDivisions(`/api/v1/organization/divisions?locale=${locale}`)
}

export function getOffices(locale: Locale): Promise<Office[]> {
  return fetchOffices(`/api/v1/organization/offices?locale=${locale}`)
}

/** Təşkilati struktur sxemi (spec 027) — boş siyahı sxemin hələ qurulmadığı deməkdir. */
export function getOrgChart(locale: Locale): Promise<OrgChartNode[]> {
  return fetchOrgChart(`/api/v1/organization/chart?locale=${locale}`)
}
