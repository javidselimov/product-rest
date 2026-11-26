// `prepare` wrapper (spec 006, D1): npm install / npm ci / install:public /
// install:nexus call this every time and it activates the git hooks (.husky/).
//
// ALWAYS exit 0 — hook installation never breaks the install (FR-002):
//   HUSKY=0             → the developer disabled it on purpose
//   CI set              → GitLab runner / Docker build (ENV CI=true) — hooks are pointless
//   no .git (cwd)       → Docker build context, a folder unpacked from an archive
//   no husky module     → after `--omit=dev` or `--ignore-scripts`
// The decision is made by the pure `installDecision` (covered by lib.test.mjs); only I/O here.

import { existsSync } from 'node:fs'

import { installDecision, MESSAGES } from './lib.mjs'

try {
  const hasHusky = existsSync('node_modules/husky/index.js')
  const code = installDecision(process.env, existsSync('.git'), hasHusky)

  if (code !== 'install') {
    console.log(MESSAGES.install[code])
    process.exit(0)
  }

  const { default: husky } = await import('husky')
  const m = husky() // '' — success; a non-empty string — husky's own explanation
  console.log(
    m ? MESSAGES.install.error(String(m).trim()) : MESSAGES.install.success,
  )
} catch (err) {
  console.log(MESSAGES.install.error(err?.message ?? String(err)))
}
process.exit(0)
