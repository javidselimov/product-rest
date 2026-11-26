// build-image.mjs saf funksiyalarının testləri (FR-045, SC-008).
// `docker` burada çağırılmır — yalnız arqument qurma və credential axtarışı.

import { describe, expect, it } from 'vitest'

import { buildNpmAuth } from '../install/lib.mjs'
import {
  buildDockerArgs,
  credentialTraces,
  DEFAULT_TAG,
  hasTagArg,
  passthroughFromArgv,
  SECRET_ID,
  tagFromArgs,
} from './build-image.mjs'

describe('buildDockerArgs', () => {
  it('secret mount-u həmişə əlavə edir', () => {
    const args = buildDockerArgs({ secretSrc: '.env.nexus' })

    expect(args).toContain('--secret')
    expect(args).toContain(`id=${SECRET_ID},src=.env.nexus`)
  })

  it('tag verilməyibsə defolt tag qoyur', () => {
    expect(buildDockerArgs({ secretSrc: '.env.nexus' })).toEqual([
      'build',
      '--secret',
      `id=${SECRET_ID},src=.env.nexus`,
      '-t',
      DEFAULT_TAG,
      '.',
    ])
  })

  it('tag verilibsə defolt tag qoymur və sıranı pozmur', () => {
    const args = buildDockerArgs({
      secretSrc: '/tmp/env',
      passthrough: ['-t', 'reg/app:1.2.3', '--platform', 'linux/amd64'],
    })

    expect(args.filter((a) => a === '-t')).toHaveLength(1)
    expect(args).not.toContain(DEFAULT_TAG)
    expect(args.slice(-4)).toEqual(['reg/app:1.2.3', '--platform', 'linux/amd64', '.'])
  })

  it('build konteksti həmişə sonuncudur', () => {
    const args = buildDockerArgs({ secretSrc: '.env.nexus', passthrough: ['--push'] })

    expect(args.at(-1)).toBe('.')
  })
})

describe('tag arqumentləri', () => {
  it.each([
    [['-t', 'a:1'], true],
    [['--tag', 'a:1'], true],
    [['-t=a:1'], true],
    [['--tag=a:1'], true],
    [['--push'], false],
  ])('hasTagArg(%j) → %s', (args, expected) => {
    expect(hasTagArg(args)).toBe(expected)
  })

  it.each([
    [['-t', 'reg/app:1'], 'reg/app:1'],
    [['--tag=reg/app:2'], 'reg/app:2'],
    [['--push'], DEFAULT_TAG],
  ])('tagFromArgs(%j) → %s', (args, expected) => {
    expect(tagFromArgs(args)).toBe(expected)
  })
})

describe('passthroughFromArgv', () => {
  it('npm-in ötürdüyü ilk `--` işarəsini atır', () => {
    expect(passthroughFromArgv(['--', '-t', 'a:1'])).toEqual(['-t', 'a:1'])
    expect(passthroughFromArgv(['-t', 'a:1'])).toEqual(['-t', 'a:1'])
  })
})

describe('credentialTraces (SC-008)', () => {
  const creds = { username: 'aysel.m', password: 'çox-gizli-şifrə' }

  it('təmiz log-da iz tapmır', () => {
    const log = ['#8 [deps 4/4] RUN npm run install:nexus', '✓ kit: var', 'DONE 12.3s'].join('\n')

    expect(credentialTraces(log, creds)).toEqual([])
  })

  it('şifrə sızıbsa tutur', () => {
    expect(credentialTraces(`NEXUS_PASSWORD=${creds.password}`, creds)).toContain('şifrə')
  })

  it('istifadəçi adı sızıbsa tutur', () => {
    expect(credentialTraces(`user: ${creds.username}`, creds)).toContain('istifadəçi adı')
  })

  it('base64 auth sızıbsa tutur', () => {
    const auth = buildNpmAuth(creds.username, creds.password)

    expect(credentialTraces(`_auth=${auth}`, creds)).toContain('base64 auth')
  })

  it('qısa istifadəçi adına görə yanlış müsbət vermir', () => {
    // `ci` hər docker log-unda təsadüf edir — 4 simvoldan qısa ad yoxlanmır.
    expect(credentialTraces('RUN npm ci', { username: 'ci', password: 'uzun-sifre' })).toEqual([])
  })
})
