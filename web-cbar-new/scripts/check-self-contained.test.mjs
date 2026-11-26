// Self-contained yoxlamasının testi (FR-001).

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { escapesRoot, relativePaths, scanDirectory } from './check-self-contained.mjs'

let root

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'self-contained-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

const writeFile = (relativePath, text) => {
  const fullPath = join(root, relativePath)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, text, 'utf8')
}

describe('relativePaths', () => {
  it('import, require, dinamik import və markdown linkini tutur', () => {
    const text = [
      "import { a } from '../lib'",
      "const b = require('../../b')",
      "await import('../c')",
      "@source '../../node_modules/x'",
      '[link](../docs/x.md)',
      "import { d } from '@/shared/d'",
      "import { e } from './e'",
    ].join('\n')

    expect(relativePaths(text).map((t) => t.path)).toEqual([
      '../lib',
      '../../b',
      '../c',
      '../../node_modules/x',
      '../docs/x.md',
    ])
  })
})

describe('escapesRoot', () => {
  it.each([
    ['src/shared/testing/handlers', '../factories', false],
    // `globals.css` `src/app/`-dədir: iki səviyyə yuxarı = kök.
    ['src/app', '../../node_modules/@cbar/lib-react-ui-kit/dist', false],
    ['docs', '../.specify/memory/constitution.md', false],
    ['src', '../../../qonshu-repo/x', true],
    ['', '../qonshu', true],
    // Bir səviyyə artıq: `src`-dən iki dəfə yuxarı kökü tərk edir.
    ['src', '../../qonshu', true],
  ])('%s + %s → %s', (dir, path, expected) => {
    expect(escapesRoot(dir, path)).toBe(expected)
  })
})

describe('scanDirectory', () => {
  it('kök daxilindəki `../` istinadına toxunmur', () => {
    writeFile('src/shared/testing/handlers/auth.ts', "import { x } from '../factories'\n")
    writeFile('src/app/globals.css', "@source '../../node_modules/@cbar/lib-react-ui-kit/dist';\n")

    expect(scanDirectory(root)).toEqual([])
  })

  it('kökü tərk edən istinadı tutur', () => {
    writeFile('src/shared/x.ts', "import { y } from '../../../react-template/src/y'\n")

    const findings = scanDirectory(root)

    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({ file: 'src/shared/x.ts', line: 1 })
  })

  it('xaric qovluqları skan etmir', () => {
    writeFile('node_modules/pkg/index.js', "require('../../../kenar')\n")
    writeFile('.specify/memory/constitution.md', '[qardaş](../../react-template/x.md)\n')

    expect(scanDirectory(root)).toEqual([])
  })
})
