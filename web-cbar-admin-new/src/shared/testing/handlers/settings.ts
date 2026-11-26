/**
 * Parametr mock-ları — real kontrakt (contracts/admin-api.md §8): `GET /settings`
 * → `{ items }` açara görə sıralı; `PUT /settings/{key} { value }` → 200 upsert
 * `{ key, value, updatedAt }`; gövdədə `value` yoxdursa 400 `{message}`.
 */

import { HttpResponse, http } from 'msw'

import { settingFixtures, type SettingMockItem } from '../fixtures/settings'
import { message } from './lib/errors'

let items: SettingMockItem[] = structuredClone(settingFixtures)

export const settingsStore = {
  all: () => items,
  get: (key: string) => items.find((s) => s.key === key) ?? null,
  upsert: (item: SettingMockItem) => {
    items = [...items.filter((s) => s.key !== item.key), structuredClone(item)]
  },
  reset: () => {
    items = structuredClone(settingFixtures)
  },
}

export const settingsHandlers = [
  http.get('/api/v1/settings', () =>
    HttpResponse.json({
      items: [...items].sort((a, b) => a.key.localeCompare(b.key)),
    }),
  ),

  http.put('/api/v1/settings/:key', async ({ params, request }) => {
    const key = decodeURIComponent(String(params.key))
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null
    if (!body || !('value' in body) || body.value === undefined) {
      return message(400, 'Value is required.')
    }
    const item: SettingMockItem = {
      key,
      value: body.value,
      updatedAt: new Date().toISOString(),
    }
    items = items.some((s) => s.key === key)
      ? items.map((s) => (s.key === key ? item : s))
      : [...items, item]
    return HttpResponse.json(item)
  }),
]
