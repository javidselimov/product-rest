import { describe, expect, it } from 'vitest'

import { buildFormSchema, listSearchSchema } from './schema'
import type { FieldConfig } from './types'

const fields: FieldConfig[] = [
  {
    name: 'categoryId',
    labelKey: 'common:roles.admin',
    type: 'select',
    required: true,
    valueAsNumber: true,
  },
  {
    name: 'sortOrder',
    labelKey: 'common:actions.save',
    type: 'number',
    min: 0,
  },
  { name: 'publishedAt', labelKey: 'common:actions.edit', type: 'datetime' },
  {
    name: 'title',
    labelKey: 'common:actions.add',
    type: 'text',
    perLocale: true,
    required: true,
  },
]

describe('buildFormSchema', () => {
  const schema = buildFormSchema({ ns: 'x', fields })

  it('məcburi select boş → xəta; per-locale başlıq heç bir dildə yoxdur → translations xətası', () => {
    const result = schema.safeParse({
      values: { categoryId: '', sortOrder: '', publishedAt: '' },
      translations: { az: { title: '' }, en: { title: '' } },
    })
    expect(result.success).toBe(false)
    const paths = result.error!.issues.map((i) => i.path.join('.'))
    expect(paths).toContain('values.categoryId')
    expect(paths).toContain('translations')
  })

  it('bir dildə başlıq kifayətdir; rəqəm və datetime formatı yoxlanır', () => {
    expect(
      schema.safeParse({
        values: {
          categoryId: '3',
          sortOrder: '5',
          publishedAt: '2025-09-07T10:00',
        },
        translations: { az: { title: 'Salam' }, en: { title: '' } },
      }).success,
    ).toBe(true)
    const bad = schema.safeParse({
      values: { categoryId: '3', sortOrder: 'abc', publishedAt: '07.09.2025' },
      translations: { az: { title: 'Salam' }, en: {} },
    })
    expect(bad.success).toBe(false)
    expect(bad.error!.issues.map((i) => i.path.join('.'))).toEqual(
      expect.arrayContaining(['values.sortOrder', 'values.publishedAt']),
    )
  })

  it('min qaydası', () => {
    const bad = schema.safeParse({
      values: { categoryId: '3', sortOrder: '-1', publishedAt: '' },
      translations: { az: { title: 'Salam' }, en: {} },
    })
    expect(bad.success).toBe(false)
  })
})

describe('time field', () => {
  const schema = buildFormSchema({
    ns: 'x',
    fields: [{ name: 'at', labelKey: 'common:actions.edit', type: 'time' }],
  })
  const parse = (at: string) =>
    schema.safeParse({ values: { at }, translations: { az: {}, en: {} } })
      .success

  it('accepts HH:mm and an empty value', () => {
    expect(parse('')).toBe(true)
    expect(parse('09:05')).toBe(true)
    expect(parse('23:59')).toBe(true)
  })

  it('refuses anything else', () => {
    expect(parse('24:00')).toBe(false)
    expect(parse('9:05')).toBe(false)
    expect(parse('11:60')).toBe(false)
  })
})

describe('listSearchSchema', () => {
  const schema = listSearchSchema({
    supportsSearch: true,
    filters: [{ name: 'status', labelKey: 'x', type: 'select' }],
  })

  it('rəqəm filtr dəyərini string-ə çevirir, yanlış page atılır', () => {
    expect(schema.parse({ page: 2, search: 'abc', status: 3 })).toEqual({
      page: 2,
      search: 'abc',
      status: '3',
    })
    expect(schema.parse({ page: 0 })).toEqual({})
    expect(schema.parse({ page: 'x', search: 5 })).toEqual({ search: '5' })
  })
})
