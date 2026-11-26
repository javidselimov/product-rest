// lib.mjs saf funksiyalarının testləri (Maddə VI). Mock yoxdur; `run`/`runStep`
// (I/O) burada çağırılmır — hook axını real git ilə yoxlanılır (quickstart §11).

import { describe, expect, it } from 'vitest'

import {
  BRANCH_NAMES,
  checkBranchName,
  checkCommitSubject,
  COMMIT_PREFIXES,
  GIT_OWN_SUBJECTS,
  installDecision,
  isDeleteOnly,
  lintableFiles,
  MESSAGES,
} from './lib.mjs'

describe('checkBranchName', () => {
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
  ])('qəbul edir: %s', (name) => {
    expect(checkBranchName(name)).toEqual({ ok: true })
  })

  it.each(['my-work', 'fix/x', 'Feat/x', 'feat/', 'feat_x', 'release/1.0', '', undefined])(
    'rədd edir: %s',
    (name) => {
      expect(checkBranchName(name)).toEqual({ ok: false, reason: 'format' })
    },
  )
})

describe('checkCommitSubject', () => {
  it.each([
    'feat: istifadəçi siyahısı',
    'fix(auth): 401 loop',
    'chore!: node 22',
    'merge: develop → feat/x',
    'docs(readme): git qaydaları',
  ])('qəbul edir: %s', (b) => {
    expect(checkCommitSubject(b)).toEqual({ ok: true })
  })

  it.each([
    "Merge branch 'develop' into feat/x",
    'Revert "feat: x"',
    'fixup! feat: x',
    'squash! fix: y',
  ])('git-in öz başlığını azad edir: %s', (b) => {
    expect(checkCommitSubject(b)).toEqual({ ok: true, exempt: true })
    expect(GIT_OWN_SUBJECTS.test(b)).toBe(true)
  })

  it.each(['added changes', 'doc: x', 'Feat: x'])('prefiks səbəbilə rədd edir: %s', (b) => {
    expect(checkCommitSubject(b)).toEqual({ ok: false, reason: 'prefix' })
  })

  it.each(['feat:x', 'feat: ', 'feat(Auth): x', 'feat (x): y'])(
    'format səbəbilə rədd edir: %s',
    (b) => {
      expect(checkCommitSubject(b)).toEqual({ ok: false, reason: 'format' })
    },
  )
})

describe('siyahılar', () => {
  it('11 branch adı və 15 prefiks, hamısı kiçik hərf', () => {
    expect(BRANCH_NAMES).toHaveLength(11)
    expect(COMMIT_PREFIXES).toHaveLength(15)
    for (const name of [...BRANCH_NAMES, ...COMMIT_PREFIXES]) {
      expect(name).toMatch(/^[a-z]+$/)
    }
  })
})

describe('lintableFiles', () => {
  it('ESLint-in əhatə etdiyi uzantıları saxlayır (skript .mjs-ləri daxil)', () => {
    expect(
      lintableFiles([
        'src/a.ts',
        'src/b.tsx',
        'scripts/c.mjs',
        'eslint.config.mjs',
        'd.json',
        'README.md',
        'src/styles.css',
      ]),
    ).toEqual(['src/a.ts', 'src/b.tsx', 'scripts/c.mjs', 'eslint.config.mjs'])
  })
})

describe('isDeleteOnly', () => {
  const zeros = '0'.repeat(40)

  it('bütün sətirlər silmədirsə true', () => {
    expect(isDeleteOnly(`refs/heads/x ${zeros} refs/heads/x abc123\n`)).toBe(true)
  })

  it('silmə + adi sətir → false', () => {
    expect(
      isDeleteOnly(
        [
          `refs/heads/x ${zeros} refs/heads/x abc123`,
          'refs/heads/y def456 refs/heads/y abc123',
        ].join('\n'),
      ),
    ).toBe(false)
  })

  it('boş stdin → false (yoxlamalar işləyir)', () => {
    expect(isDeleteOnly('')).toBe(false)
    expect(isDeleteOnly(undefined)).toBe(false)
  })
})

describe('installDecision', () => {
  it.each([
    [{ HUSKY: '0' }, true, true, 'husky-0'],
    [{ CI: 'true' }, true, true, 'ci'],
    [{ CI: 'false' }, true, true, 'install'],
    [{}, false, true, 'git-missing'],
    [{}, true, false, 'husky-missing'],
    [{}, true, true, 'install'],
  ])('env=%o git=%s husky=%s → %s', (env, hasGit, hasHusky, decision) => {
    expect(installDecision(env, hasGit, hasHusky)).toBe(decision)
    expect(MESSAGES.install).toHaveProperty(decision === 'install' ? 'success' : decision)
  })
})

describe('MESSAGES', () => {
  it('branch rəddi cari adı, 11 adı və düzəliş əmrini göstərir', () => {
    const m = MESSAGES.branchRejected('my-work')
    expect(m).toContain('my-work')
    for (const name of BRANCH_NAMES) expect(m).toContain(name)
    expect(m).toContain('git branch -m')
    expect(m).toContain('--no-verify')
  })

  it('commit rəddi başlığı və 15 prefiksi göstərir', () => {
    const m = MESSAGES.commitRejected('added x')
    expect(m).toContain('added x')
    for (const p of COMMIT_PREFIXES) expect(m).toContain(p)
    expect(m).toContain('<prefiks>[(scope)][!]: <təsvir>')
  })
})
