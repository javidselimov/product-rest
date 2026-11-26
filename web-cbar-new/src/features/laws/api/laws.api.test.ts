import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import { getLaw, getLawCategories, getLaws } from './laws.api'

describe('laws api', () => {
  it('optional parametrlər yalnız verildikdə göndərilir', async () => {
    const seen: string[] = []
    server.use(
      http.get(`${API}/api/v1/laws`, ({ request }) => {
        seen.push(new URL(request.url).search)
        return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: 10 })
      }),
    )

    await getLaws('az')
    await getLaws('az', 2, 3, 1)

    expect(seen).toEqual([
      `?locale=az&page=1&pageSize=${DEFAULT_PAGE_SIZE}`,
      `?locale=az&page=2&pageSize=${DEFAULT_PAGE_SIZE}&categoryId=3&type=1`,
    ])
  })

  it('siyahı, kateqoriyalar və detal; 404 → null', async () => {
    expect((await getLaws('az')).total).toBe(12)
    expect(await getLawCategories('az')).toHaveLength(2)
    expect((await getLaw('az', 'merkezi-bank-haqqinda'))?.assets).toHaveLength(1)
    await expect(getLaw('az', 'yoxdur')).resolves.toBeNull()
  })
})
