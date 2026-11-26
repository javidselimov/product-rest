// build-image.mjs saf funksiyalarının testləri (spec 004, Maddə VI).
// Env direktivi yoxdur — lib.test.mjs-dəki eyni səbəb (qlobal setup window-a müraciət edir).

import { describe, expect, it } from 'vitest'

import {
  buildDockerArgs,
  DEFAULT_NEXUS_ENV_FILE,
  DEFAULT_TAG,
  hasTagArg,
  passthroughFromArgv,
  SECRET_ID,
  tagFromArgs,
} from './build-image.mjs'

// Secret mount source paths (files, not credentials) — named instead of inline literals.
const TMP_ENV_FILE = '/tmp/x/env'

describe('buildDockerArgs', () => {
  it('tag verilməyəndə default tag əlavə edir və secret-i dəqiq formada ötürür', () => {
    expect(buildDockerArgs({ secretSrc: DEFAULT_NEXUS_ENV_FILE })).toEqual([
      'build',
      '--secret',
      `id=${SECRET_ID},src=${DEFAULT_NEXUS_ENV_FILE}`,
      '-t',
      DEFAULT_TAG,
      '.',
    ])
  })

  it('mövcud -t qorunur, default tag əlavə olunmur, pass-through sırası dəyişmir', () => {
    const args = buildDockerArgs({
      secretSrc: TMP_ENV_FILE,
      passthrough: ['-t', 'reg/app:1.0', '--push', '--label', 'a=b'],
    })
    expect(args).toEqual([
      'build',
      '--secret',
      `id=nexus_env,src=${TMP_ENV_FILE}`,
      '-t',
      'reg/app:1.0',
      '--push',
      '--label',
      'a=b',
      '.',
    ])
    expect(args.filter((a) => a === '-t')).toHaveLength(1)
  })

  it('--tag və --tag= formaları da tag sayılır', () => {
    expect(hasTagArg(['--tag', 'x'])).toBe(true)
    expect(hasTagArg(['--tag=x'])).toBe(true)
    expect(hasTagArg(['-t=x'])).toBe(true)
    expect(hasTagArg(['--platform', 'linux/amd64'])).toBe(false)
  })

  it('kontekst nöqtəsi həmişə sonuncu elementdir', () => {
    const args = buildDockerArgs({
      secretSrc: DEFAULT_NEXUS_ENV_FILE,
      passthrough: ['--no-cache'],
    })
    expect(args.at(-1)).toBe('.')
  })
})

describe('tagFromArgs', () => {
  it('uğur mesajı üçün tag-ı oxuyur, yoxdursa default', () => {
    expect(tagFromArgs(['-t', 'a:1'])).toBe('a:1')
    expect(tagFromArgs(['--tag=b:2'])).toBe('b:2')
    expect(tagFromArgs([])).toBe(DEFAULT_TAG)
  })
})

describe('passthroughFromArgv', () => {
  it('birbaşa node çağırışında qalan -- ayırıcısını atır, npm-in təmizlədiyi halı olduğu kimi saxlayır', () => {
    expect(passthroughFromArgv(['--', '-t', 'x'])).toEqual(['-t', 'x'])
    expect(passthroughFromArgv(['-t', 'x'])).toEqual(['-t', 'x'])
  })
})
