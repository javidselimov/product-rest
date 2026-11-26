/**
 * Server API client-i (spec 002 research R2, R3).
 *
 * MSW node server-i sorğuları tutur; iddialar **davranış** üzərindədir: parse,
 * `passthrough`, 404 → null, sxem uyğunsuzluğu → `schema`, 500 → `server`.
 */
import { HttpResponse, http } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { AppError } from '@/shared/api/app-error'
import { server } from '@/shared/testing/server'

import { getJson, getJsonOrNull, resetApiClient } from './api-client'

const API = 'http://localhost:5139'

const itemSchema = z.object({ id: z.number(), title: z.string() }).passthrough()

afterEach(() => {
  resetApiClient()
})

describe('getJson', () => {
  it('cavabı sxem ilə parse edir və əlavə sahəni saxlayır', async () => {
    server.use(
      http.get(`${API}/api/v1/things/1`, () =>
        HttpResponse.json({ id: 1, title: 'Manat', extra: 'yeni sahə' }),
      ),
    )

    const data = await getJson('/api/v1/things/1', itemSchema)

    expect(data.title).toBe('Manat')
    expect(data).toHaveProperty('extra', 'yeni sahə')
  })

  it('sxem uyğunsuzluğunda AppError(schema) atır', async () => {
    server.use(
      http.get(`${API}/api/v1/things/2`, () => HttpResponse.json({ id: 'iki', title: 5 })),
    )

    const error = await getJson('/api/v1/things/2', itemSchema).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AppError)
    expect((error as AppError).kind).toBe('schema')
  })

  it('404-də AppError(notFound) atır', async () => {
    server.use(http.get(`${API}/api/v1/things/3`, () => new HttpResponse(null, { status: 404 })))

    const error = await getJson('/api/v1/things/3', itemSchema).catch((e: unknown) => e)

    expect((error as AppError).kind).toBe('notFound')
  })

  it('500-də AppError(server) atır və texniki detal mesaja düşmür', async () => {
    server.use(
      http.get(`${API}/api/v1/things/4`, () =>
        HttpResponse.text('<html>stack trace burada</html>', { status: 500 }),
      ),
    )

    const error = (await getJson('/api/v1/things/4', itemSchema).catch((e: unknown) => e)) as AppError

    expect(error.kind).toBe('server')
    expect(error.message).not.toContain('stack trace')
  })

  it('şəbəkə xətasında AppError(network) atır', async () => {
    server.use(http.get(`${API}/api/v1/things/5`, () => HttpResponse.error()))

    const error = (await getJson('/api/v1/things/5', itemSchema).catch((e: unknown) => e)) as AppError

    expect(error).toBeInstanceOf(AppError)
    expect(['network', 'unknown']).toContain(error.kind)
  })
})

describe('getJsonOrNull', () => {
  it('404-də null qaytarır', async () => {
    server.use(http.get(`${API}/api/v1/things/9`, () => new HttpResponse(null, { status: 404 })))

    await expect(getJsonOrNull('/api/v1/things/9', itemSchema)).resolves.toBeNull()
  })

  it('digər xətaları olduğu kimi atır', async () => {
    server.use(http.get(`${API}/api/v1/things/8`, () => new HttpResponse(null, { status: 503 })))

    await expect(getJsonOrNull('/api/v1/things/8', itemSchema)).rejects.toBeInstanceOf(AppError)
  })
})
