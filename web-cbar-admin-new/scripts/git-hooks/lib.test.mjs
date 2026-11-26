// Tests of the pure functions in lib.mjs (spec 006, Article VI). The tables map
// one-to-one to data-model.md §1–§2 and §5. No mocks; `run`/`runStep` (I/O) are
// not called here — the hook flow is verified in a sandbox repo with real git.
// No env directive: the global setup runs in jsdom, harmless for pure functions.

import { describe, expect, it } from 'vitest'

import {
  BRANCH_NAMES,
  COMMIT_PREFIXES,
  GIT_GENERATED_SUBJECTS,
  installDecision,
  isDeleteOnlyPush,
  lintableFiles,
  MESSAGES,
  validateBranchName,
  validateCommitSubject,
} from './lib.mjs'

describe('validateBranchName', () => {
  it.each([
    'main',
    'master',
    'develop',
    'development',
    'test',
    'feat',
    'docs',
    'feat/user-list',
    'feature-export',
    'hotfix/login-401',
    'docs/readme',
    'test/e2e',
    'reconcile-q3',
  ])('accepts: %s', (name) => {
    expect(validateBranchName(name)).toEqual({ ok: true })
  })

  it.each([
    'my-work',
    'fix/x',
    'Feat/x',
    'feat/',
    'feat_x',
    'release/1.0',
    '',
    undefined,
  ])('rejects: %s', (name) => {
    expect(validateBranchName(name)).toEqual({ ok: false, reason: 'format' })
  })
})

describe('validateCommitSubject', () => {
  it.each([
    'feat: istifadəçi siyahısı',
    'fix(auth): 401 loop',
    'chore!: node 22',
    'merge: develop → feat/x',
    'docs(readme): git qaydaları',
  ])('accepts: %s', (s) => {
    expect(validateCommitSubject(s)).toEqual({ ok: true })
  })

  it.each([
    "Merge branch 'develop' into feat/x",
    'Revert "feat: x"',
    'fixup! feat: x',
    'squash! fix: y',
  ])('exempts a git-generated subject: %s', (s) => {
    expect(validateCommitSubject(s)).toEqual({ ok: true, exempt: true })
    expect(GIT_GENERATED_SUBJECTS.test(s)).toBe(true)
  })

  it.each(['added changes', 'doc: x', 'Feat: x'])(
    'rejects with reason prefix: %s',
    (s) => {
      expect(validateCommitSubject(s)).toEqual({ ok: false, reason: 'prefix' })
    },
  )

  it.each(['feat:x', 'feat: ', 'feat(Auth): x', 'feat (x): y'])(
    'rejects with reason format: %s',
    (s) => {
      expect(validateCommitSubject(s)).toEqual({ ok: false, reason: 'format' })
    },
  )
})

describe('lists', () => {
  it('11 branch names and 15 prefixes, all lowercase', () => {
    expect(BRANCH_NAMES).toHaveLength(11)
    expect(COMMIT_PREFIXES).toHaveLength(15)
    for (const name of [...BRANCH_NAMES, ...COMMIT_PREFIXES]) {
      expect(name).toMatch(/^[a-z]+$/)
    }
  })
})

describe('lintableFiles', () => {
  it('keeps only ts/tsx', () => {
    expect(
      lintableFiles(['a.ts', 'b.tsx', 'c.mjs', 'd.json', 'README.md']),
    ).toEqual(['a.ts', 'b.tsx'])
  })
})

describe('isDeleteOnlyPush', () => {
  const zeros = '0'.repeat(40)
  it('true when every line is a deletion', () => {
    expect(
      isDeleteOnlyPush(`refs/heads/x ${zeros} refs/heads/x abc123\n`),
    ).toBe(true)
  })
  it('deletion + regular line → false', () => {
    expect(
      isDeleteOnlyPush(
        [
          `refs/heads/x ${zeros} refs/heads/x abc123`,
          'refs/heads/y def456 refs/heads/y abc123',
        ].join('\n'),
      ),
    ).toBe(false)
  })
  it('empty stdin → false (the checks run)', () => {
    expect(isDeleteOnlyPush('')).toBe(false)
    expect(isDeleteOnlyPush(undefined)).toBe(false)
  })
})

describe('installDecision', () => {
  it.each([
    [{ HUSKY: '0' }, true, true, 'husky-0'],
    [{ CI: 'true' }, true, true, 'ci'],
    [{ CI: 'false' }, true, true, 'install'],
    [{}, false, true, 'no-git'],
    [{}, true, false, 'no-husky'],
    [{}, true, true, 'install'],
  ])('env=%o git=%s husky=%s → %s', (env, hasGit, hasHusky, code) => {
    expect(installDecision(env, hasGit, hasHusky)).toBe(code)
    expect(MESSAGES.install).toHaveProperty(
      code === 'install' ? 'success' : code,
    )
  })
})

describe('MESSAGES', () => {
  it('branch rejection shows the current name, the 11 names and the fix command', () => {
    const m = MESSAGES.branchRejected('my-work')
    expect(m).toContain('my-work')
    for (const name of BRANCH_NAMES) expect(m).toContain(name)
    expect(m).toContain('git branch -m')
    expect(m).toContain('--no-verify')
  })
  it('commit rejection shows the subject and the 15 prefixes', () => {
    const m = MESSAGES.commitRejected('added x')
    expect(m).toContain('added x')
    for (const p of COMMIT_PREFIXES) expect(m).toContain(p)
    expect(m).toContain('<prefiks>[(scope)][!]: <təsvir>')
  })
})
