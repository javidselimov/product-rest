import { describe, expect, it } from 'vitest'

describe('test infrastrukturu', () => {
  it('vitest + jsdom işləyir', () => {
    document.body.innerHTML = '<p>salam</p>'
    expect(document.querySelector('p')?.textContent).toBe('salam')
  })
})
