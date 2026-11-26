import { describe, expect, it } from 'vitest'

import { getMoneyMarkNews, getMoneyMarkNewsItem } from './money-mark-news.api'

describe('money mark news api', () => {
  it('siyahı və səhifələmə', async () => {
    const page2 = await getMoneyMarkNews('az', 2)

    expect(page2.total).toBe(11)
    expect(page2.items).toHaveLength(1)
  })

  it('detal; 404 → null', async () => {
    expect((await getMoneyMarkNewsItem('az', 'yeni-200-manat'))?.content).toContain('/media/71')
    await expect(getMoneyMarkNewsItem('en', 'yoxdur')).resolves.toBeNull()
  })
})
