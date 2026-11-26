import { describe, expect, it } from 'vitest'

import { imagePopupSchema, toImagePopup } from './image-popup'

describe('imagePopupSchema', () => {
  it('link və altText null və ya olmaya bilər', () => {
    expect(imagePopupSchema.parse({ id: 1, imageUrl: '/media/1', link: null, altText: null })).toMatchObject({
      id: 1,
      imageUrl: '/media/1',
    })
    expect(imagePopupSchema.parse({ id: 2, imageUrl: '/media/2' })).toMatchObject({ id: 2 })
  })

  it('şəkil ünvanı olmayan cavab kontrakt xətasıdır', () => {
    expect(imagePopupSchema.safeParse({ id: 1, imageUrl: null }).success).toBe(false)
  })
})

describe('toImagePopup', () => {
  it('siyahının birincisini, boşdursa null qaytarır', () => {
    const a = { id: 3, imageUrl: '/media/3' }
    const b = { id: 1, imageUrl: '/media/1' }
    expect(toImagePopup([a, b])).toBe(a)
    expect(toImagePopup([])).toBeNull()
  })
})
