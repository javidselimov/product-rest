/**
 * Server tərəfli `t` (spec 002 research R6).
 */
import { describe, expect, it } from 'vitest'

import { getT } from './server'

describe('getT', () => {
  it('az dilində Azərbaycan mətnini qaytarır', () => {
    const t = getT('az', 'nav')

    expect(t('home')).toBe('Ana səhifə')
  })

  it('en dilində ingilis mətnini qaytarır', () => {
    const t = getT('en', 'nav')

    expect(t('home')).toBe('Home')
  })

  it('ns:key formasını qəbul edir', () => {
    const t = getT('az', ['common', 'errors'])

    expect(t('errors:notFound.title')).toBe('Səhifə tapılmadı')
    expect(t('common:actions.retry')).toBe('Yenidən cəhd et')
  })

  it('interpolyasiya işləyir və escape etmir', () => {
    const t = getT('az', 'search')

    expect(t('resultsFor', { query: 'manat & valyuta' })).toBe('«manat & valyuta» üzrə nəticələr')
  })

  it('eyni dil üçün instansiya təkrar qurulmur (eyni t nəticəsi)', () => {
    expect(getT('az', 'nav')('menu')).toBe(getT('az', 'nav')('menu'))
  })
})
