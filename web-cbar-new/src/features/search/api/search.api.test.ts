import { describe, expect, it } from 'vitest'

import { groupByType } from '../model/schemas'
import { searchSite } from './search.api'

describe('search api', () => {
  it('sorğunu kodlayıb nəticələri oxuyur', async () => {
    const data = await searchSite('az', 'manat & valyuta')

    expect(data.results).toHaveLength(3)
  })

  it('groupByType məlum tipləri sırada, naməlumu other-də verir', async () => {
    const data = await searchSite('az', 'manat')
    const groups = groupByType(data.results)

    expect(groups.map((g) => g.type)).toEqual(['page', 'press-release', 'other'])
    expect(groups[2].items[0].type).toBe('video')
  })
})
