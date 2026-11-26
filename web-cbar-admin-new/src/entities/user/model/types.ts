/**
 * İstifadəçi domain modeli (data-model.md §2). Permission yoxlaması string
 * müqayisəsi ilə deyil, yalnız `hasPermission` / `<Can>` ilə aparılır
 * (guideline §5.8: `user.role === "admin"` qadağandır). Cari istifadəçi JWT
 * payload-undan çıxarılır — API `/auth/me` vermir (research R4).
 */

import { z } from 'zod'

import { MS_PER_SECOND } from '@/shared/constants/timing'
import { decodeJwtPayload } from '@/shared/lib/jwt'
import { ROLE_IDS } from './constants'

export { ROLE_IDS }

export const ROLE_CODES = ['admin', 'moderator', 'meas_manager'] as const
export type RoleCode = (typeof ROLE_CODES)[number]

export type Permission =
  | 'content.manage'
  | 'media.manage'
  | 'finance.manage'
  | 'users.manage'
  | 'settings.manage'

export interface AuthUser {
  id: string
  username: string
  /** Göstərilən ad — API ad vermir, istifadəçi adı göstərilir. */
  name: string
  roleCode: RoleCode
  permissions: Permission[]
}

export const ROLE_LABEL_KEYS: Record<RoleCode, string> = {
  admin: 'roles.admin',
  moderator: 'roles.moderator',
  meas_manager: 'roles.measManager',
}

export const roleCodeFromId = (id: number): RoleCode | undefined =>
  (Object.keys(ROLE_IDS) as RoleCode[]).find((code) => ROLE_IDS[code] === id)

const ALL_PERMISSIONS: Permission[] = [
  'content.manage',
  'media.manage',
  'finance.manage',
  'users.manage',
  'settings.manage',
]

/** Rol → icazə dəsti. Bu spec-də heç bir ekran gizlədilmir; xəritə gələcək üçün hazırdır. */
export const permissionsForRole = (role: RoleCode): Permission[] =>
  role === 'admin'
    ? [...ALL_PERMISSIONS]
    : ALL_PERMISSIONS.filter((p) => p !== 'users.manage')

export const hasPermission = (
  user: Pick<AuthUser, 'permissions'> | null,
  permission: Permission,
): boolean => user?.permissions.includes(permission) ?? false

/** ASP.NET Core rol claim-i tam URI ilə yazılır; ehtiyat olaraq `role` də oxunur. */
export const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'

const roleSchema = z.enum(ROLE_CODES)

export const jwtPayloadSchema = z.looseObject({
  sub: z.union([z.string(), z.number()]),
  preferred_username: z.string().min(1),
  [ROLE_CLAIM]: roleSchema.optional(),
  role: roleSchema.optional(),
  exp: z.number(),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

/** Token payload-undan `AuthUser`; forma uyğun deyilsə `null` (giriş rədd edilir). */
export function userFromToken(token: string): AuthUser | null {
  const parsed = jwtPayloadSchema.safeParse(decodeJwtPayload(token))
  if (!parsed.success) return null
  const payload = parsed.data
  const roleCode = payload[ROLE_CLAIM] ?? payload.role
  if (!roleCode) return null
  return {
    id: String(payload.sub),
    username: payload.preferred_username,
    name: payload.preferred_username,
    roleCode,
    permissions: permissionsForRole(roleCode),
  }
}

/** Token-in `exp` (saniyə) dəyərindən ISO vaxt. */
export function tokenExpiry(token: string): string | null {
  const parsed = jwtPayloadSchema.safeParse(decodeJwtPayload(token))
  return parsed.success ? new Date(parsed.data.exp * MS_PER_SECOND).toISOString() : null
}

/** Avatar fallback üçün inisiallar ("admin" → "AD", "Aysel Məmmədova" → "AM"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
