import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { DEFAULT_ROW_SCHEMA, listEnvelopeSchema } from './envelope-schema'

const row = z.looseObject({ id: z.number() })

describe('listEnvelopeSchema', () => {
  it('paged → items + total, əlavə sahələr keçir', () => {
    const parsed = listEnvelopeSchema('paged', row).parse({
      items: [{ id: 1, extra: 'x' }],
      total: 7,
      page: 1,
      pageSize: 20,
    })
    expect(parsed).toEqual({ items: [{ id: 1, extra: 'x' }], total: 7 })
  })

  it('items → yalnız items', () => {
    expect(
      listEnvelopeSchema('items', row).parse({ items: [{ id: 2 }] }),
    ).toEqual({ items: [{ id: 2 }] })
  })

  it('array → bare massiv', () => {
    expect(listEnvelopeSchema('array', row).parse([{ id: 3 }])).toEqual({
      items: [{ id: 3 }],
    })
  })

  it('yanlış forma xəta atır (paged üçün total yoxdur)', () => {
    expect(() =>
      listEnvelopeSchema('paged', row).parse({ items: [] }),
    ).toThrow()
    expect(() =>
      listEnvelopeSchema('array', row).parse({ items: [] }),
    ).toThrow()
  })

  it('default sətir sxemi istənilən obyekti qəbul edir', () => {
    expect(DEFAULT_ROW_SCHEMA.parse({ a: 1, b: null })).toEqual({
      a: 1,
      b: null,
    })
  })
})
