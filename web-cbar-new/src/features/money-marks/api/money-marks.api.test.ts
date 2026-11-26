import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { server } from '@/shared/testing/server'

import { getMoneyMark, getMoneyMarkCategories, getMoneyMarks } from './money-marks.api'

describe('money marks api', () => {
  it('type və categoryId yalnız verildikdə göndərilir', async () => {
    const seen: string[] = []
    server.use(
      http.get(`${API}/api/v1/money-marks`, ({ request }) => {
        seen.push(new URL(request.url).search)
        return HttpResponse.json([])
      }),
    )

    await getMoneyMarks('az')
    await getMoneyMarks('az', 2, 1)

    expect(seen).toEqual(['?locale=az', '?locale=az&type=2&categoryId=1'])
  })

  it('kataloq, kateqoriyalar, detal; 404 → null', async () => {
    expect(await getMoneyMarks('az', 1)).toHaveLength(2)
    expect(await getMoneyMarkCategories('az')).toHaveLength(2)
    expect((await getMoneyMark('az', '50-qepik'))?.type).toBe(2)
    await expect(getMoneyMark('az', 'yoxdur')).resolves.toBeNull()
  })
})
