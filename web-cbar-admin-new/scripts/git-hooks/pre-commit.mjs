// pre-commit (spec 006, D4): branch name → lint of staged ts/tsx → full test suite.
// Commits happen dozens of times a day — target < 15s on a warm machine (lint ~3s + test ~6s).
// No build here: it takes minutes and is CI's job (FR-019).
//
// The branch name is checked BEFORE anything else so a wrong name doesn't cost a
// single second of lint (FR-007). The commit message cannot be checked here — it
// doesn't exist yet; `commit-msg.mjs` does that.
//
// Bypass (emergencies only): `git commit --no-verify` or `HUSKY=0` — CI checks anyway.

import {
  gitOutput,
  hasDeps,
  lintableFiles,
  MESSAGES,
  runStep,
  seconds,
  validateBranchName,
} from './lib.mjs'

const t0 = performance.now()

// 0. Branch name. `symbolic-ref` fails on a detached HEAD (rebase, bisect, hash
//    checkout) — there is no name then and the check is skipped (FR-008).
let branch = gitOutput(['symbolic-ref', '--quiet', '--short', 'HEAD'])
if (branch === null) {
  branch = 'HEAD'
} else if (!validateBranchName(branch).ok) {
  console.error(MESSAGES.branchRejected(branch))
  process.exit(1)
}

// Staged list: deleted paths are not passed to the linter (--diff-filter=ACMR).
const staged = (
  gitOutput(['diff', '--cached', '--name-only', '--diff-filter=ACMR']) ?? ''
)
  .split(/\r?\n/)
  .filter(Boolean)
const files = lintableFiles(staged)
const deps = hasDeps()

console.log(`  branch ${branch} · ${staged.length} staged fayl · 2 yoxlama\n`)

// 1. Lint — staged ts/tsx only (eslint.config.js scope). `--no-warn-ignored`:
//    a file ESLint ignores (dist/) would otherwise fail the whole call.
const lint = runStep({
  index: 1,
  total: 2,
  name: 'lint',
  cmd: 'npx',
  args: ['eslint', '--no-warn-ignored', ...files],
  skipReason: !deps
    ? MESSAGES.skipped.noDeps
    : files.length === 0
      ? MESSAGES.skipped.noFiles
      : undefined,
})
if (lint.result === 'failed') {
  console.error(MESSAGES.stepFailed('lint'))
  process.exit(1)
}

// 2. Full test suite (Q3). The npm script is used so the hook automatically
//    follows changes to the test command in package.json.
const test = runStep({
  index: 2,
  total: 2,
  name: 'test',
  cmd: 'npm',
  args: ['run', '--silent', 'test:run'],
  skipReason: !deps ? MESSAGES.skipped.noDeps : undefined,
})
if (test.result === 'failed') {
  console.error(MESSAGES.stepFailed('test'))
  process.exit(1)
}

console.log(`\n${MESSAGES.passed('pre-commit', seconds(t0))}`)
