/**
 * İstifadəçi sxemləri (data-model.md §6, contracts/admin-api.md §6 `/users`):
 * siyahı DTO `roleCode` ilə, detail əlavə `roleId` + `updatedAt`. Rol seçimləri
 * `GET /roles` olmadığından sabit xəritədən (`entities/user`) qurulur (§9).
 */

import type { ColorPalette } from '@cbar/lib-react-ui-kit/lib'
import { z } from 'zod'

import type { SelectOption } from '@/entities/content/model/types'
import {
  ROLE_CODES,
  ROLE_IDS,
  ROLE_LABEL_KEYS,
} from '@/entities/user/model/types'

export const userRowSchema = z.looseObject({
  id: z.number(),
  username: z.string(),
  email: z.string().nullable().default(''),
  roleCode: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
})

export type UserRow = z.infer<typeof userRowSchema>

export const userDetailSchema = userRowSchema.extend({
  roleId: z.number(),
  updatedAt: z.string().nullable().optional(),
})

export type UserDetail = z.infer<typeof userDetailSchema>

/** Rol seçimi: `value` = seed id, etiket `common:roles.*`. */
export const ROLE_OPTIONS: SelectOption[] = ROLE_CODES.map((code) => ({
  value: ROLE_IDS[code],
  labelKey: `common:${ROLE_LABEL_KEYS[code]}`,
}))

/** Yaratma formunun ilkin rolu — moderator (ən az imtiyazlı məzmun rolu; spec T113). */
export const DEFAULT_ROLE_ID = ROLE_IDS.moderator

export const ROLE_PALETTE: Record<string, ColorPalette> = {
  admin: 'primary',
  moderator: 'secondary',
  meas_manager: 'tertiary',
}

export const ROLE_BADGE_LABEL_KEYS: Record<string, string> = Object.fromEntries(
  ROLE_CODES.map((code) => [code, `common:${ROLE_LABEL_KEYS[code]}`]),
)

/** API şifrə siyasəti: ≥8 simvol, böyük, kiçik, rəqəm, xüsusi simvol. */
export const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export const passwordSchema = (message: string) =>
  z.string().regex(PASSWORD_POLICY, message)
