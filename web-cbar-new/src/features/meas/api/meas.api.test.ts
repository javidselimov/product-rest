import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import { getMeas, getMeasEmitents, getMeasInfoTypes } from './meas.api'

describe('meas api', () => {
  it('optional filtrlər yalnız verildikdə göndərilir', async () => {
    const seen: string[] = []
    server.use(
      http.get(`${API}/api/v1/meas`, ({ request }) => {
        seen.push(new URL(request.url).search)
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 10 })
      }),
    )

    await getMeas('az')
    await getMeas('az', 2, 1, 10)

    expect(seen).toEqual([
      `?locale=az&page=1&pageSize=${DEFAULT_PAGE_SIZE}`,
      `?locale=az&page=2&pageSize=${DEFAULT_PAGE_SIZE}&emitentId=1&infoTypeId=10`,
    ])
  })

  it('siyahı və referans siyahıları', async () => {
    expect((await getMeas('az')).total).toBe(15)
    expect(await getMeasEmitents('az')).toHaveLength(2)
    expect(await getMeasInfoTypes('az')).toHaveLength(2)
  })
})
