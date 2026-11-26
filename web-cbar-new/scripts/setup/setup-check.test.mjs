// `setup:check` davranışının testi (SC-007).
//
// İki iddia: qalıq placeholder `fayl:sətir` siyahısı ilə sıfırdan fərqli kodla
// bitir; təmiz ağac isə sıfırla bitir.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PLACEHOLDER_REGEX, KNOWN_KEYS } from './registry.mjs'
import { report, findInText, scanDirectory } from './setup-check.mjs'

const SCRIPT_PATH = join(dirname(fileURLToPath(import.meta.url)), 'setup-check.mjs')

let root

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'setup-check-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

const writeFile = (relativePath, text) => {
  const fullPath = join(root, relativePath)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, text, 'utf8')
}

describe('findInText', () => {
  it('tanınan açarı sətir nömrəsi ilə tapır', () => {
    const findings = findInText('birinci\nname: <PROJECT_NAME>\nüçüncü\n')

    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({ line: 2, key: 'PROJECT_NAME', known: true })
  })

  it('registrdə olmayan açarı naməlum kimi işarələyir', () => {
    const [finding] = findInText('value: <SOME_UNKNOWN_KEY>')

    expect(finding.known).toBe(false)
    expect(finding.description).toContain('naməlum')
  })

  it('TypeScript generiklərini placeholder saymır', () => {
    expect(findInText('export function f<T>(x: T): T { return x }')).toEqual([])
    expect(findInText('const a: Map<K, V> = new Map()')).toEqual([])
  })

  it('JSX komponent adlarını placeholder saymır', () => {
    expect(findInText('return <Button><DataTable /></Button>')).toEqual([])
  })

  it('ignore işarəsi olan sətri ötürür', () => {
    expect(findInText('nümunə: <PROJECT_NAME>  // setup-check:ignore')).toEqual([])
  })

  it('bir sətirdəki bütün açarları tapır', () => {
    expect(findInText('<PROJECT_NAME> və <INGRESS_DOMAIN>')).toHaveLength(2)
  })
})

describe('scanDirectory', () => {
  it('qalıq placeholder tapır və file:sətir verir', () => {
    writeFile('src/config.ts', "export const name = '<PROJECT_DISPLAY_NAME>'\n")

    const findings = scanDirectory(root)

    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({
      file: 'src/config.ts',
      line: 1,
      key: 'PROJECT_DISPLAY_NAME',
    })
    expect(report(findings)).toContain('src/config.ts:1')
  })

  it('təmiz ağacda heç nə tapmır', () => {
    writeFile('src/config.ts', "export const name = 'nexus-next'\n")

    expect(scanDirectory(root)).toEqual([])
  })

  it('xaric qovluqları skan etmir', () => {
    writeFile('node_modules/pkg/index.js', "const x = '<PROJECT_NAME>'\n")
    writeFile('specs/001/spec.md', 'Registr: <PROJECT_NAME>\n')
    writeFile('coverage/report.json', '{"a":"<API_HOST_DEV>"}\n')

    expect(scanDirectory(root)).toEqual([])
  })

  it('binar uzantıları skan etmir', () => {
    writeFile('public/logo.png', '<PROJECT_NAME>')

    expect(scanDirectory(root)).toEqual([])
  })
})

describe('CLI', () => {
  it('qalıq varsa exit 1 və siyahı verir', () => {
    writeFile('.ci-cd/test.yaml', 'ingress:\n  hostname: <PROJECT_NAME>-test.<INGRESS_DOMAIN>\n')

    const r = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })

    expect(r.status).toBe(1)
    expect(r.stderr).toContain('.ci-cd/test.yaml:2')
    expect(r.stderr).toContain('<PROJECT_NAME>')
    expect(r.stderr).toContain('<INGRESS_DOMAIN>')
    expect(r.stderr).toContain('npm run setup')
  })

  it('təmiz ağacda exit 0', () => {
    writeFile('.ci-cd/test.yaml', 'ingress:\n  hostname: nexus-next-test.example.az\n')

    const r = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })

    expect(r.status).toBe(0)
    expect(r.stdout).toContain('placeholder yoxdur')
  })

  it('şablonun öz repo-sunda (package.json#name = next-template) exit 0, amma siyahılayır', () => {
    writeFile('package.json', JSON.stringify({ name: 'next-template' }))
    writeFile('.ci-cd/test.yaml', 'hostname: <PROJECT_NAME>-test.<INGRESS_DOMAIN>\n')

    const r = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })

    expect(r.status).toBe(0)
    expect(r.stdout).toContain('şablon rejimi')
    expect(r.stdout).toContain('<PROJECT_NAME>')
  })

  it('--strict şablon rejimini üstələyir', () => {
    writeFile('package.json', JSON.stringify({ name: 'next-template' }))
    writeFile('.ci-cd/test.yaml', 'hostname: <PROJECT_NAME>-test.<INGRESS_DOMAIN>\n')

    const r = spawnSync(process.execPath, [SCRIPT_PATH, root, '--strict'], { encoding: 'utf8' })

    expect(r.status).toBe(1)
    expect(r.stderr).toContain('əvəzlənməmiş placeholder')
  })

  it('adı dəyişdirilmiş layihədə sərt davranır', () => {
    writeFile('package.json', JSON.stringify({ name: 'nexus-next' }))
    writeFile('.ci-cd/test.yaml', 'hostname: <PROJECT_NAME>-test.example.az\n')

    const r = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })

    expect(r.status).toBe(1)
  })
})

describe('registr', () => {
  it('on açar var və hamısı UPPER_SNAKE formasındadır', () => {
    expect(KNOWN_KEYS).toHaveLength(10)
    for (const key of KNOWN_KEYS) {
      expect(key).toMatch(/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/)
      expect(`<${key}>`).toMatch(new RegExp(PLACEHOLDER_REGEX.source))
    }
  })
})
