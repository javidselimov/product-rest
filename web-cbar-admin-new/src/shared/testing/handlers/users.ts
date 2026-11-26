/**
 * İstifadəçi mock-ları — real kontrakt (contracts/admin-api.md §6 `/users`, §8):
 * paged siyahı (search: username/email), list DTO `roleId`-siz, POST 201 (409
 * username/email məşğul, 400 şifrə siyasəti), PUT `{email, roleId, isActive}`
 * merge, `PUT /{id}/password` 204/400, DELETE 204 (id 1 → 409 öz hesabı).
 * 403 (admin-only) simulyasiya olunmur.
 */

import { HttpResponse, http } from 'msw'

import { roleCodeFromId } from '@/entities/user/model/types'
import { userFixtures, type UserMockRow } from '../fixtures/users'
import { createCrudStore } from './lib/crud-store'
import { message, noContent, problem404 } from './lib/errors'

const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const POLICY_MESSAGE =
  'Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a digit and a special character.'

const now = () => new Date().toISOString()

type UserBase = Pick<
  UserMockRow,
  'id' | 'username' | 'email' | 'isActive' | 'createdAt' | 'updatedAt'
>

const withRole = (row: UserBase, roleId: number): UserMockRow => ({
  ...row,
  roleId,
  roleCode: roleCodeFromId(roleId) ?? 'moderator',
})

const listItem = ({
  id,
  username,
  email,
  roleCode,
  isActive,
  createdAt,
}: UserMockRow) => ({
  id,
  username,
  email,
  roleCode,
  isActive,
  createdAt,
})

const crud = createCrudStore<UserMockRow>({
  path: '/users',
  envelope: 'paged',
  seed: userFixtures,
  searchFields: ['username', 'email'],
  listItem,
  // Yalnız PUT bura düşür (POST aşağıda öz handler-i ilə): `{email, roleId, isActive}` merge.
  applyBody: (body, existing, id) => {
    const base = existing ?? userFixtures[0]
    return withRole(
      {
        ...base,
        id,
        email: typeof body.email === 'string' ? body.email : base.email,
        isActive:
          typeof body.isActive === 'boolean' ? body.isActive : base.isActive,
        updatedAt: now(),
      },
      Number(body.roleId ?? base.roleId),
    )
  },
})

export const usersStore = crud.store

const same = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase()

export const usersHandlers = [
  http.post(crud.base, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const username =
      typeof body.username === 'string' ? body.username.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const roleId = Number(body.roleId)
    if (!username || !email || !password || !Number.isInteger(roleId)) {
      return message(400, 'Username, email, password and roleId are required.')
    }
    if (!PASSWORD_POLICY.test(password)) return message(400, POLICY_MESSAGE)
    if (usersStore.all().some((u) => same(u.username, username))) {
      return message(409, 'Username is already in use.')
    }
    if (usersStore.all().some((u) => same(u.email, email))) {
      return message(409, 'Email is already in use.')
    }
    const stamp = now()
    const row = usersStore.insert(
      withRole(
        {
          id: usersStore.nextId(),
          username,
          email,
          isActive: true,
          createdAt: stamp,
          updatedAt: stamp,
        },
        roleId,
      ),
    )
    return HttpResponse.json(row, { status: 201 })
  }),

  http.put(`${crud.base}/:id/password`, async ({ params, request }) => {
    if (!usersStore.get(Number(params.id))) return problem404()
    const body = (await request.json()) as { newPassword?: unknown }
    if (
      typeof body.newPassword !== 'string' ||
      !PASSWORD_POLICY.test(body.newPassword)
    ) {
      return message(400, POLICY_MESSAGE)
    }
    return noContent()
  }),

  http.delete(`${crud.base}/:id`, ({ params }) => {
    const id = Number(params.id)
    if (id === 1) return message(409, 'You cannot delete your own account.')
    if (!usersStore.get(id)) return problem404()
    // API hesabı deaktiv edib soft-delete edir — siyahıdan çıxır.
    usersStore.remove(id)
    return noContent()
  }),

  ...crud.handlers,
]
