import { describe, expect, it } from 'vitest'

import { INFO_LINE_ALIASES, statRows } from '../model/schemas'
import { getHomepage } from './homepage.api'

describe('homepage api', () => {
  it('paketi oxuyur və bütün blokları sxemə salır', async () => {
    const home = await getHomepage('az')

    expect(home.newsSlider).toHaveLength(3)
    expect(home.banners).toHaveLength(3)
    expect(home.infoLines.length).toBeGreaterThan(5)
  })

  it('statRows alias sırasını saxlayır və boş qrupu atlayır', async () => {
    const home = await getHomepage('az')

    expect(statRows(home.infoLines, INFO_LINE_ALIASES.corridor).map((r) => r.value)).toEqual([
      '6,25%',
      '8,25%',
      '7,25%',
    ])
    expect(statRows(home.infoLines, ['empty_group', 'yoxdur'])).toEqual([])
  })
})
