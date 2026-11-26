import { describe, expect, it } from 'vitest'

import { configLocales, getByPath, getRowKey, nsKey } from './path'

describe('path köməkçiləri', () => {
  it('getByPath iç-içə açarları oxuyur, olmayanda undefined', () => {
    const row = { translations: { az: { title: 'Salam' } }, id: 3 }
    expect(getByPath(row, 'translations.az.title')).toBe('Salam')
    expect(getByPath(row, 'translations.en.title')).toBeUndefined()
    expect(getByPath(row, 'id')).toBe(3)
  })

  it('getRowKey default id, override rowKey', () => {
    expect(getRowKey({}, { id: 5 })).toBe(5)
    expect(getRowKey({ rowKey: (r) => String(r.code) }, { code: 'USD' })).toBe(
      'USD',
    )
  })

  it('configLocales default az/en; nsKey namespace-i tamamlayır', () => {
    expect(configLocales({})).toEqual(['az', 'en'])
    expect(configLocales({ locales: ['az'] })).toEqual(['az'])
    expect(nsKey('laws', 'fields.title')).toBe('laws:fields.title')
    expect(nsKey('laws', 'common:status.draft')).toBe('common:status.draft')
  })
})
