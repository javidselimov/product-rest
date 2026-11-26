// install/lib.mjs saf funksiyalarının testləri (FR-046).
//
// Yoxlanan: kontekst həlli (local | ci | docker), credential mənbəyinin seçimi,
// registry həlli və mesaj dəsti. Heç bir mesajda credential dəyəri olmamalıdır.

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  archiveName,
  authKey,
  buildNpmAuth,
  cachePath,
  classifyFailure,
  CONTEXTS,
  createUserconfig,
  ERROR_KINDS,
  findVendorArchive,
  integrityHex,
  lockfileKitEntry,
  message,
  npmrcContent,
  parseContext,
  parseEnvFile,
  parseNpmrc,
  protectLockfile,
  resolveCredentials,
  resolveRegistry,
  sha512Base64,
} from './lib.mjs'

let tempDir

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'install-lib-'))
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

const writeTemp = (name, text) => {
  const path = join(tempDir, name)
  writeFileSync(path, text, 'utf8')
  return path
}

describe('parseContext', () => {
  it('arqument yoxdursa local', () => {
    expect(parseContext([])).toEqual({ context: 'local' })
    expect(parseContext(undefined)).toEqual({ context: 'local' })
  })

  it.each(CONTEXTS)('--context=%s tanınır', (k) => {
    expect(parseContext([`--context=${k}`])).toEqual({ context: k })
  })

  it('npm-in ötürdüyü `--` prefiksinə mane olmur', () => {
    expect(parseContext(['--', '--context=ci'])).toEqual({ context: 'ci' })
  })

  it('tanınmayan dəyəri rədd edir', () => {
    const result = parseContext(['--context=staging'])

    expect(result.error).toBe('context-invalid')
    expect(result.value).toBe('staging')
    expect(message('context-invalid', 'local', result.value)).toContain('staging')
  })
})

describe('parseEnvFile', () => {
  it('şərh və boş sətirləri ötürür, dırnaqları soyur', () => {
    const result = parseEnvFile(
      ['# şərh', '', 'NEXUS_USERNAME=aysel', 'NEXUS_PASSWORD="p=a=s"', 'SEHV_SETIR'].join('\n'),
    )

    expect(result).toEqual({ NEXUS_USERNAME: 'aysel', NEXUS_PASSWORD: 'p=a=s' })
  })
})

describe('resolveCredentials', () => {
  it('mühit dəyişənləri fayldan üstündür', () => {
    const envFile = writeTemp('.env.nexus', 'NEXUS_USERNAME=fayldan\nNEXUS_PASSWORD=fayldan\n')

    const result = resolveCredentials(
      { NEXUS_USERNAME: 'envden', NEXUS_PASSWORD: 'envden' },
      envFile,
    )

    expect(result).toEqual({ username: 'envden', password: 'envden', source: 'env' })
  })

  it('env yoxdursa faylı oxuyur', () => {
    const envFile = writeTemp('.env.nexus', 'NEXUS_USERNAME=aysel\nNEXUS_PASSWORD=gizli\n')

    expect(resolveCredentials({}, envFile)).toEqual({
      username: 'aysel',
      password: 'gizli',
      source: 'file',
    })
  })

  it('fayl da, env də yoxdursa aydın xəta sinifi qaytarır', () => {
    expect(resolveCredentials({}, join(tempDir, 'yoxdur'))).toEqual({
      error: 'credentials-file-missing',
    })
  })

  it('env-də yalnız biri set olunubsa hansının boş olduğunu deyir', () => {
    const result = resolveCredentials({ NEXUS_USERNAME: 'aysel' }, join(tempDir, 'yoxdur'))

    expect(result.error).toBe('credentials-empty')
    expect(result.keys).toEqual(['NEXUS_PASSWORD'])
  })

  it('nümunə fayldan köçürülmüş doldurulmamış dəyəri boş sayır', () => {
    const envFile = writeTemp('.env.nexus', 'NEXUS_USERNAME=istifadeci-adi\nNEXUS_PASSWORD=sifre\n')

    const result = resolveCredentials({}, envFile)

    expect(result.error).toBe('credentials-empty')
    expect(result.keys).toEqual(['NEXUS_USERNAME', 'NEXUS_PASSWORD'])
  })
})

describe('registry həlli', () => {
  it('.npmrc sətrini oxuyur', () => {
    expect(parseNpmrc('@cbar:registry=https://nexus.example.az/repository/npm-hosted/')).toEqual({
      scope: '@cbar',
      registry: 'https://nexus.example.az/repository/npm-hosted/',
    })
  })

  // Şablonun `.npmrc`-sindəki əvəzlənməmiş sətrin eynisi.
  const PLACEHOLDER_NPMRC = '<NEXUS_SCOPE>:registry=<NEXUS_REGISTRY_URL>' // setup-check:ignore

  it('placeholder qalıbsa aydın xəta sinifi qaytarır', () => {
    const result = resolveRegistry({}, {}, PLACEHOLDER_NPMRC)

    expect(result.error).toBe('registry-placeholder')
    expect(result.keys).toEqual(['NEXUS_SCOPE', 'NEXUS_REGISTRY_URL'])
  })

  it('.env.nexus dəyərləri .npmrc placeholder-ini üstələyir', () => {
    const result = resolveRegistry(
      {},
      { NEXUS_SCOPE: '@cbar', NEXUS_REGISTRY_URL: 'https://nexus.example.az/repository/npm-hosted' },
      PLACEHOLDER_NPMRC,
    )

    expect(result).toEqual({
      scope: '@cbar',
      // Sondakı kəsik əlavə olunur — npm auth açarı onu tələb edir.
      registry: 'https://nexus.example.az/repository/npm-hosted/',
    })
  })

  it('auth açarını protokolsuz formada qurur', () => {
    expect(authKey('https://nexus.example.az/repository/npm-hosted/')).toBe(
      '//nexus.example.az/repository/npm-hosted/:_auth',
    )
  })

  it('userconfig məzmununda scope, registry və auth var', () => {
    const text = npmrcContent({
      scope: '@cbar',
      registry: 'https://nexus.example.az/repository/npm-hosted/',
      auth: 'YWJj',
    })

    expect(text).toContain('@cbar:registry=https://nexus.example.az/repository/npm-hosted/')
    expect(text).toContain('//nexus.example.az/repository/npm-hosted/:_auth=YWJj')
  })
})

describe('createUserconfig', () => {
  it('müvəqqəti fayl yaradır və silə bilir', () => {
    const { path, cleanup } = createUserconfig({
      scope: '@cbar',
      registry: 'https://nexus.example.az/repository/npm-hosted/',
      auth: buildNpmAuth('aysel', 'gizli'),
    })

    expect(path).toContain('npmrc')
    cleanup()
  })
})

describe('buildNpmAuth', () => {
  it('user:password base64 verir, newline əlavə etmir', () => {
    const auth = buildNpmAuth('aysel', 'gizli')

    expect(Buffer.from(auth, 'base64').toString('latin1')).toBe('aysel:gizli')
    expect(auth).not.toContain('\n')
  })
})

describe('classifyFailure', () => {
  it.each([
    ['npm error code E401\nUnable to authenticate', 'auth-rejected'],
    ['npm error code ENOTFOUND nexus.example.az', 'network-unreachable'],
    ['npm error code ETARGET\nNo matching version found', 'version-not-found'],
    ['tamamilə başqa bir şey', 'unknown'],
  ])('%s → %s', (stderr, kind) => {
    expect(classifyFailure(stderr)).toBe(kind)
  })

  it('401 şəbəkə xətası ilə qarışmır', () => {
    expect(classifyFailure('401 Unauthorized while fetching from network')).toBe('auth-rejected')
  })
})

describe('mesaj dəsti', () => {
  it.each(ERROR_KINDS.filter((s) => s !== 'context-invalid'))(
    '%s hər üç kontekstdə mesaj verir',
    (kind) => {
      for (const context of CONTEXTS) {
        const m = message(kind, context, ['NEXUS_USERNAME'])
        expect(typeof m).toBe('string')
        expect(m.length).toBeGreaterThan(20)
      }
    },
  )

  it('heç bir mesaj credential dəyəri və ya base64 sızdırmır', () => {
    for (const kind of ERROR_KINDS) {
      for (const context of CONTEXTS) {
        const m = message(kind, context, ['NEXUS_PASSWORD'])
        expect(m).not.toContain(buildNpmAuth('aysel', 'gizli'))
        expect(m).not.toContain('_auth=')
      }
    }
  })

  it('kontekstə görə növbəti addım fərqlənir', () => {
    expect(message('credentials-file-missing', 'local')).toContain('.env.nexus.example')
    expect(message('credentials-file-missing', 'ci')).toContain('CI/CD → Variables')
    expect(message('credentials-file-missing', 'docker')).toContain('docker:build')
  })
})

// ── Vendored arxiv (spec 002) ────────────────────────────────────────────────

// sha512("") — RFC-də sabit dəyər; hesablamanı testin özündə təkrarlamaq
// dairəvi olardı, ona görə xaricdən məlum sabit istifadə olunur.
const EMPTY_SHA512 =
  'sha512-z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg=='

const lockfile = (entry) => ({ packages: { 'node_modules/@cbar/lib-react-ui-kit': entry } })

describe('lockfileKitEntry', () => {
  it('versiya və integrity qaytarır', () => {
    expect(lockfileKitEntry(lockfile({ version: '0.4.0', integrity: EMPTY_SHA512 }))).toEqual({
      version: '0.4.0',
      integrity: EMPTY_SHA512,
    })
  })

  it.each([
    ['qeyd yoxdur', { packages: {} }],
    ['packages yoxdur', {}],
    ['lockfile yoxdur', null],
    ['versiya yoxdur', lockfile({ integrity: EMPTY_SHA512 })],
    ['integrity yoxdur', lockfile({ version: '0.4.0' })],
    ['sha1 alqoritmi', lockfile({ version: '0.4.0', integrity: 'sha1-abc' })],
  ])('%s → lockfile-entry-missing', (_label, input) => {
    expect(lockfileKitEntry(input)).toEqual({ error: 'lockfile-entry-missing' })
  })
})

describe('integrityHex', () => {
  it('sha512 base64-ünü 128 simvolluq hex-ə çevirir', () => {
    const hex = integrityHex(EMPTY_SHA512)

    expect(hex).toHaveLength(128) // 64 bayt × 2
    expect(hex.startsWith('cf83e1357eefb8bd')).toBe(true)
  })

  it.each([
    ['prefiks yoxdur', 'z4PhNX7vuL3x'],
    ['başqa alqoritm', 'sha256-abc'],
    ['qısa base64 — 64 baytdan az', 'sha512-YWJj'],
    ['sətir deyil', undefined],
  ])('%s → null', (_label, input) => {
    expect(integrityHex(input)).toBeNull()
  })
})

describe('cachePath', () => {
  it('content-v2 yol formulunu qurur', () => {
    const segments = cachePath('/keş', EMPTY_SHA512).split(/[\\/]/)
    const hex = integrityHex(EMPTY_SHA512)

    // …/_cacache/content-v2/sha512/cf/83/e1357eef…
    expect(segments.slice(-6, -1)).toEqual([
      '_cacache',
      'content-v2',
      'sha512',
      hex.slice(0, 2),
      hex.slice(2, 4),
    ])
    expect(segments.at(-1)).toBe(hex.slice(4))
  })

  it('integrity formatı yanlışdırsa null', () => {
    expect(cachePath('/keş', 'sha1-abc')).toBeNull()
  })
})

describe('archiveName', () => {
  it('scoped adı npm pack formatına çevirir', () => {
    expect(archiveName('0.4.0')).toBe('cbar-lib-react-ui-kit-0.4.0.tgz')
  })
})

describe('sha512Base64', () => {
  it('lockfile integrity ilə birbaşa müqayisə oluna bilən format verir', () => {
    expect(sha512Base64(Buffer.alloc(0))).toBe(EMPTY_SHA512)
  })

  it('bir baytlıq fərq nəticəni dəyişir', () => {
    expect(sha512Base64(Buffer.from('a'))).not.toBe(sha512Base64(Buffer.from('b')))
  })
})

describe('findVendorArchive', () => {
  // `tempDir` — bu faylın mövcud, testlər arası yaradılan müvəqqəti qovluğu.
  const createVendor = (...names) => {
    mkdirSync(join(tempDir, 'vendor'), { recursive: true })
    for (const name of names) writeFileSync(join(tempDir, 'vendor', name), 'x')
  }

  it('tempDir yoxdursa boş nəticə verir', () => {
    const result = findVendorArchive(tempDir, '0.4.0')

    expect(result.path).toBeNull()
    expect(result.all).toEqual([])
    expect(result.expected).toBe('cbar-lib-react-ui-kit-0.4.0.tgz')
  })

  it('gözlənilən adı tapır', () => {
    createVendor('cbar-lib-react-ui-kit-0.4.0.tgz')

    const result = findVendorArchive(tempDir, '0.4.0')

    expect(result.path).not.toBeNull()
    expect(result.all).toHaveLength(1)
  })

  it('başqa versiyanın arxivini gözlənilən kimi qəbul etmir', () => {
    createVendor('cbar-lib-react-ui-kit-0.5.0.tgz')

    const result = findVendorArchive(tempDir, '0.4.0')

    expect(result.path).toBeNull()
    expect(result.all).toEqual(['cbar-lib-react-ui-kit-0.5.0.tgz'])
  })

  it('birdən çox arxivi sayır — səssiz drift mənbəyi', () => {
    createVendor('cbar-lib-react-ui-kit-0.4.0.tgz', 'cbar-lib-react-ui-kit-0.3.0.tgz')

    expect(findVendorArchive(tempDir, '0.4.0').all).toHaveLength(2)
  })

  it('`.tgz` olmayan faylları saymır', () => {
    createVendor('cbar-lib-react-ui-kit-0.4.0.tgz')
    writeFileSync(join(tempDir, 'vendor', 'README.md'), '# vendor')

    expect(findVendorArchive(tempDir, '0.4.0').all).toEqual(['cbar-lib-react-ui-kit-0.4.0.tgz'])
  })
})

describe('protectLockfile', () => {
  const writeLockfile = (text) => writeFileSync(join(tempDir, 'package-lock.json'), text)

  it('dəyişiklik olmayanda bərpa etmir', () => {
    writeLockfile('{"a":1}')

    expect(protectLockfile(tempDir).restore()).toBe(false)
  })

  it('npm-in yazdığı dəyişikliyi geri qaytarır', () => {
    writeLockfile('{"orijinal":true}')
    const guard = protectLockfile(tempDir)

    writeLockfile('{"npm-yenidən-yazdı":true}') // npm-in lockfile artefaktı

    expect(guard.restore()).toBe(true)
    expect(readFileSync(join(tempDir, 'package-lock.json'), 'utf8')).toBe('{"orijinal":true}')
  })

  it('baytları olduğu kimi saxlayır — sətir sonları dəyişmir', () => {
    writeLockfile('{\n  "a": 1\n}\n')
    const guard = protectLockfile(tempDir)

    writeLockfile('{\r\n  "a": 1\r\n}\r\n')
    guard.restore()

    expect(readFileSync(join(tempDir, 'package-lock.json'), 'utf8')).toBe('{\n  "a": 1\n}\n')
  })

  it('lockfile yoxdursa təhlükəsiz davranır', () => {
    expect(protectLockfile(tempDir).restore()).toBe(false)
  })
})

describe('vendored arxiv mesajları', () => {
  const NEW_KINDS = [
    'lockfile-entry-missing',
    'archive-missing',
    'archive-multiple',
    'archive-mismatch',
    'archive-corrupt',
    'cache-missing',
  ]

  it.each(NEW_KINDS)('%s ERROR_KINDS siyahısındadır', (kind) => {
    expect(ERROR_KINDS).toContain(kind)
  })

  it.each(NEW_KINDS)('%s səbəb və növbəti addım göstərir', (kind) => {
    const m = message(kind, 'local', ['a.tgz', 'b.tgz'])

    expect(m.length).toBeGreaterThan(20)
    expect(m.startsWith('✗')).toBe(true)
    expect(m).toContain('Növbəti addım')
  })

  it('archive-multiple tapılan faylları sadalayır', () => {
    expect(message('archive-multiple', 'local', ['a.tgz', 'b.tgz'])).toContain('a.tgz, b.tgz')
  })

  it('archive-mismatch kit-in quraşdırılmadığını açıq deyir', () => {
    expect(message('archive-mismatch', 'local', 'x.tgz')).toContain('QURAŞDIRILMADI')
  })
})
