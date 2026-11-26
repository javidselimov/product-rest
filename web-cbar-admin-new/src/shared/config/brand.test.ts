import { describe, expect, it } from 'vitest'

import { brand, templateInfo } from './brand'

describe('brend konfiqurasiyası', () => {
  it('brend adları boş deyil, repo keçidi https ilə başlayır', () => {
    expect(brand.shortName.trim()).not.toBe('')
    expect(brand.appName.trim()).not.toBe('')
    expect(templateInfo.repoUrl.startsWith('https://')).toBe(true)
  })

  it('template göstəricisi admin paneldə söndürülüb', () => {
    expect(templateInfo.enabled).toBe(false)
  })
})
