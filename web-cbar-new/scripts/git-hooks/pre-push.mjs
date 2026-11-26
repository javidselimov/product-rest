// pre-push: CI-nin ucuz yarısı push-dan ƏVVƏL — bütün repo üzərində lint,
// typecheck və tam test dəsti (Maddə VI.3 gate-inin ilk üç pilləsi). Build
// yoxdur: dəqiqələrlə çəkir və `.next/` yaradır — CI-nin işidir.
// CI həlledici orqandır; bu, onun lokal əks-sədasıdır.
//
// Git stdin-lə `<local ref> <local sha> <remote ref> <remote sha>` sətirləri verir;
// hamısı silmədirsə (local sha sıfırlar) yoxlanacaq kod yoxdur və addımlar ötürülür.
//
// Ötürmə (yalnız təcili hal): `git push --no-verify` və ya `HUSKY=0`.

import { readFileSync } from 'node:fs'

import { runStep, hasDeps, MESSAGES, seconds, isDeleteOnly } from './lib.mjs'

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

const skipReason = (() => {
  if (isDeleteOnly(stdin)) return MESSAGES.skipped.isDeleteOnly
  if (!hasDeps()) return MESSAGES.skipped.depsMissing
  return undefined
})()

const STEPS = [
  { name: 'lint', command: 'npm', args: ['run', '--silent', 'lint'] },
  { name: 'typecheck', command: 'npm', args: ['run', '--silent', 'typecheck'] },
  { name: 'test', command: 'npm', args: ['run', '--silent', 'test:run'] },
]

STEPS.forEach((step, i) => {
  const result = runStep({
    index: i + 1,
    total: STEPS.length,
    name: step.name,
    command: step.command,
    args: step.args,
    skipReason,
  })
  if (result.outcome === 'failed') {
    console.error(MESSAGES.stepFailed(step.name))
    process.exit(1)
  }
})

console.log(`\n${MESSAGES.passed('pre-push', seconds(t0))}`)
