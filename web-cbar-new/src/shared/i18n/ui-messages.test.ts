/**
 * Kit etiketlərinin kataloqu (spec 002 FR-024).
 */
import { defaultUIMessages } from '@cbar/lib-react-ui-kit/i18n'
import { describe, expect, it } from 'vitest'

import { uiMessages } from './ui-messages'

describe('kit UI mesajları', () => {
  it('hər iki dildə kitin bütün açarlarını əhatə edir', () => {
    const kitKeys = Object.keys(defaultUIMessages).sort()

    expect(Object.keys(uiMessages.az).sort()).toEqual(kitKeys)
    expect(Object.keys(uiMessages.en).sort()).toEqual(kitKeys)
  })

  it('heç bir dəyər boş deyil', () => {
    for (const locale of ['az', 'en'] as const) {
      for (const [key, value] of Object.entries(uiMessages[locale])) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('')
      }
    }
  })

  it('az kataloqu Azərbaycan dilindədir', () => {
    expect(uiMessages.az['pagination.next']).toBe('Növbəti səhifəyə keç')
    expect(uiMessages.az['sheet.close']).toBe('Bağla')
  })
})
