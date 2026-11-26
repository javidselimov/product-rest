// pre-commit: branch adı → stage olunmuş faylların lint-i → tam test dəsti.
// Commit gündə onlarla dəfə olur, ona görə build burada yoxdur — o, CI-nin işidir.
//
// Branch adı hər şeydən ƏVVƏL yoxlanılır ki, səhv ad heç bir lint saniyəsi
// xərclətməsin. Commit mesajı burada yoxlanıla bilməz — bu anda hələ yoxdur;
// onu `commit-msg.mjs` edir.
//
// Ötürmə (yalnız təcili hal): `git commit --no-verify` və ya `HUSKY=0`.

import {
  runStep,
  checkBranchName,
  hasDeps,
  gitOutput,
  lintableFiles,
  MESSAGES,
  seconds,
} from './lib.mjs'

const t0 = performance.now()

// 0. Branch adı. `symbolic-ref` detached HEAD-də (rebase, bisect, hash checkout)
//    uğursuz olur — o halda ad yoxdur və yoxlama ötürülür.
let branch = gitOutput(['symbolic-ref', '--quiet', '--short', 'HEAD'])
if (branch === null) {
  branch = 'HEAD'
} else if (!checkBranchName(branch).ok) {
  console.error(MESSAGES.branchRejected(branch))
  process.exit(1)
}

// Stage siyahısı: silinmiş yol linter-ə verilmir (--diff-filter=ACMR).
const staged = (gitOutput(['diff', '--cached', '--name-only', '--diff-filter=ACMR']) ?? '')
  .split(/\r?\n/)
  .filter(Boolean)
const lintFiles = lintableFiles(staged)
const deps = hasDeps()

console.log(`  branch ${branch} · ${staged.length} staged fayl · 2 yoxlama\n`)

// 1. Lint — yalnız stage olunmuş lintFiles. `--no-warn-ignored`: ESLint-in ignore
//    etdiyi fayl (.next/) əks halda bütün çağırışı yıxardı.
const lintSkipReason = (() => {
  if (!deps) return MESSAGES.skipped.depsMissing
  if (lintFiles.length === 0) return MESSAGES.skipped.filesMissing
  return undefined
})()

const lint = runStep({
  index: 1,
  total: 2,
  name: 'lint',
  command: 'npx',
  args: ['eslint', '--no-warn-ignored', ...lintFiles],
  skipReason: lintSkipReason,
})
if (lint.outcome === 'failed') {
  console.error(MESSAGES.stepFailed('lint'))
  process.exit(1)
}

// 2. Tam test dəsti. npm skripti seçilib ki, package.json-dakı test əmri
//    dəyişəndə hook onu avtomatik izləsin.
const test = runStep({
  index: 2,
  total: 2,
  name: 'test',
  command: 'npm',
  args: ['run', '--silent', 'test:run'],
  skipReason: deps ? undefined : MESSAGES.skipped.depsMissing,
})
if (test.outcome === 'failed') {
  console.error(MESSAGES.stepFailed('test'))
  process.exit(1)
}

console.log(`\n${MESSAGES.passed('pre-commit', seconds(t0))}`)
