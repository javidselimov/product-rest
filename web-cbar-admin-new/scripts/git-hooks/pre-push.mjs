// pre-push (spec 006, D6): the cheap half of CI BEFORE the push — lint, typecheck and
// the full test suite over the whole repo (the first three tiers of the Article VI.3
// gate). Measured baseline ~3s + ~3s + ~6s; target < 30s. No build: it takes minutes
// and creates `dist/` — that's CI's job (FR-019). CI is the authority; this is its local echo.
//
// Git passes `<local ref> <local sha> <remote ref> <remote sha>` lines on stdin;
// if all of them are deletions (local sha all zeros) there is no code to check and
// the steps are skipped.
//
// Bypass (emergencies only): `git push --no-verify` or `HUSKY=0`.

import { readFileSync } from 'node:fs'

import {
  hasDeps,
  isDeleteOnlyPush,
  MESSAGES,
  runStep,
  seconds,
} from './lib.mjs'

const stdin = process.stdin.isTTY
  ? ''
  : (() => {
      try {
        return readFileSync(0, 'utf8')
      } catch {
        return ''
      }
    })()

const t0 = performance.now()
console.log('\n  pre-push · 3 yoxlama\n')

const skipReason = isDeleteOnlyPush(stdin)
  ? MESSAGES.skipped.deleteOnly
  : !hasDeps()
    ? MESSAGES.skipped.noDeps
    : undefined

const STEPS = [
  { name: 'lint', cmd: 'npm', args: ['run', '--silent', 'lint'] },
  { name: 'typecheck', cmd: 'npx', args: ['tsc', '-b'] },
  { name: 'test', cmd: 'npm', args: ['run', '--silent', 'test:run'] },
]

STEPS.forEach((step, i) => {
  const { result } = runStep({
    index: i + 1,
    total: STEPS.length,
    ...step,
    skipReason,
  })
  if (result === 'failed') {
    console.error(MESSAGES.stepFailed(step.name))
    process.exit(1)
  }
})

console.log(`\n${MESSAGES.passed('pre-push', seconds(t0))}`)
