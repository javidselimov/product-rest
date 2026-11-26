// audit-check.mjs saf funksiyalarının testləri (konstitusiya X.4).
// `npm audit` burada çağırılmır — yalnız hesabatın təhlili və istisna qaydaları.

import { describe, expect, it } from 'vitest'

import { collectAdvisories, evaluate, staleExceptions } from './audit-check.mjs'

const BRACES_URL = 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm'

const report = {
  vulnerabilities: {
    braces: {
      nodes: ['node_modules/braces'],
      via: [
        { name: 'braces', url: BRACES_URL, severity: 'high', title: 'DoS' },
      ],
    },
    micromatch: { nodes: ['node_modules/micromatch'], via: ['braces'] },
    lodash: {
      nodes: ['node_modules/lodash'],
      via: [
        {
          name: 'lodash',
          url: 'https://github.com/advisories/GHSA-low',
          severity: 'moderate',
        },
      ],
    },
  },
}

const exception = {
  id: 'GHSA-vfj7-8cjw-p6xm',
  package: 'braces',
  reviewBy: '2027-01-08',
}
const devLock = { 'node_modules/braces': { version: '3.0.3', dev: true } }

describe('collectAdvisories', () => {
  it('yalnız birbaşa high/critical advisory-ləri götürür', () => {
    expect(collectAdvisories(report)).toEqual([
      {
        id: 'GHSA-vfj7-8cjw-p6xm',
        package: 'braces',
        severity: 'high',
        title: 'DoS',
        nodes: ['node_modules/braces'],
      },
    ])
  })

  it('boş hesabatda boş siyahı qaytarır', () => {
    expect(collectAdvisories({})).toEqual([])
  })
})

describe('evaluate', () => {
  const [advisory] = collectAdvisories(report)

  it('dev-only və müddəti keçməmiş istisnanı buraxır', () => {
    expect(
      evaluate(advisory, {
        exceptions: [exception],
        lockPackages: devLock,
        today: '2026-10-08',
      }).allowed,
    ).toBe(true)
  })

  it('siyahıda olmayan advisory-ni bloklayır', () => {
    expect(
      evaluate(advisory, {
        exceptions: [],
        lockPackages: devLock,
        today: '2026-10-08',
      }).allowed,
    ).toBe(false)
  })

  it('müddəti bitmiş istisnanı bloklayır', () => {
    expect(
      evaluate(advisory, {
        exceptions: [exception],
        lockPackages: devLock,
        today: '2027-01-09',
      }).allowed,
    ).toBe(false)
  })

  it('paket production-a düşürsə bloklayır', () => {
    const prodLock = { 'node_modules/braces': { version: '3.0.3' } }
    const result = evaluate(advisory, {
      exceptions: [exception],
      lockPackages: prodLock,
      today: '2026-10-08',
    })

    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('node_modules/braces')
  })
})

describe('staleExceptions', () => {
  it('tapıntısı qalmayan istisnanı qaytarır', () => {
    expect(staleExceptions([exception], [])).toEqual([exception])
    expect(staleExceptions([exception], collectAdvisories(report))).toEqual([])
  })
})
