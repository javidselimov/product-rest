import { describe, expect, it } from 'vitest'

import { buildFormSchema } from '@/shared/crud/schema'
import type { FieldConfig } from '@/shared/crud/types'
import { isAllowedLink, withLinkRule } from './link-rule'

const fields: FieldConfig[] = [
  { name: 'link', labelKey: 'fields.link', type: 'text', perLocale: true },
]

const schema = buildFormSchema({
  ns: 'imagePopups',
  fields,
  schema: withLinkRule('link', 'imagePopups:validation.link'),
})

const linkIssues = (az: string, en: string) => {
  const result = schema.safeParse({
    values: {},
    translations: { az: { link: az }, en: { link: en } },
  })
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'))
}

describe('isAllowedLink', () => {
  it.each([
    ['', true],
    ['   ', true],
    ['https://www.cbar.az/az/page-40', true],
    ['HTTP://example.com', true],
    ['/az/page-40', true],
    ['/', true],
    ['javascript:alert(1)', false],
    ['//evil.example', false],
    ['www.cbar.az', false],
    ['mailto:info@cbar.az', false],
  ])('%j → %s', (value, expected) => {
    expect(isAllowedLink(value)).toBe(expected)
  })
})

describe('withLinkRule', () => {
  it('düzgün və boş linklər keçir', () => {
    expect(linkIssues('https://x.az', '')).toEqual([])
    expect(linkIssues('/az', '/en')).toEqual([])
  })

  it('xəta yalnız səhv linkin dilinə yazılır', () => {
    expect(linkIssues('javascript:alert(1)', '/en')).toEqual([
      'translations.az.link',
    ])
    expect(linkIssues('/az', '//x')).toEqual(['translations.en.link'])
  })
})
