// Shared module of the git hooks (spec 006): branch name and commit subject
// rules, the message catalogue and the step runner. This is the SINGLE SOURCE of
// the rules — changing a list is one line; rejection messages and tests read the
// same constants. Node built-ins only — no dependencies (Constitution Article II).
//
// The file has two parts: pure functions (no I/O, covered by lib.test.mjs) and,
// at the end, I/O helpers (spawnSync, fs) — the hook scripts only call those.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

// ── Rules (pure) ──────────────────────────────────────────────────────────────

/** Allowed branch names (spec 006 FR-006, Q2): each is both an exact name and a prefix. */
export const BRANCH_NAMES = Object.freeze([
  'feat',
  'feature',
  'docs',
  'reconcile',
  'master',
  'develop',
  'hotfix',
  'bugfix',
  'test',
  'development',
  'main',
])

/** Allowed commit prefixes (spec 006 FR-010, Q1). */
export const COMMIT_PREFIXES = Object.freeze([
  'feat',
  'fix',
  'chore',
  'docs',
  'merge',
  'refactor',
  'test',
  'perf',
  'ci',
  'build',
  'style',
  'revert',
  'hotfix',
  'bugfix',
  'reconcile',
])

/**
 * Subjects git generates itself (FR-011, Q4) — exempt from the rule, otherwise
 * the `git merge`, `git revert` and `rebase -i` flows would break.
 */
export const GIT_GENERATED_SUBJECTS =
  /^(Merge |Revert |Reapply |fixup! |squash! |amend! )/

const BRANCH_REGEX = new RegExp(`^(${BRANCH_NAMES.join('|')})([/-].+)?$`)
const COMMIT_REGEX = new RegExp(
  `^(${COMMIT_PREFIXES.join('|')})(\\([a-z0-9._/-]+\\))?!?: \\S.*$`,
)

/**
 * Validates a branch name: an exact name (`main`, `test`) or `name/description` /
 * `name-description`. Lowercase only; `feat/` (empty description) and `feat_x` are rejected.
 */
export function validateBranchName(name) {
  if (typeof name !== 'string' || !BRANCH_REGEX.test(name)) {
    return { ok: false, reason: 'format' }
  }
  return { ok: true }
}

/**
 * Validates the commit subject (first line of the message).
 * `reason`: 'prefix' — the first word is not in the list (uppercase lands here too);
 * 'format' — the prefix is valid but the pattern is broken (`feat:x`, `feat: `, `feat(Auth): x`).
 */
export function validateCommitSubject(subject) {
  const s = typeof subject === 'string' ? subject : ''
  if (GIT_GENERATED_SUBJECTS.test(s)) return { ok: true, exempt: true }
  if (COMMIT_REGEX.test(s)) return { ok: true }
  const firstWord = /^[a-z]+/.exec(s)?.[0]
  const reason =
    firstWord && COMMIT_PREFIXES.includes(firstWord) ? 'format' : 'prefix'
  return { ok: false, reason }
}

/** Keeps only the staged files ESLint covers (`**\/*.{ts,tsx}`). */
export function lintableFiles(files) {
  return files.filter((f) => /\.tsx?$/.test(f))
}

/**
 * pre-push stdin: each line is `<local ref> <local sha> <remote ref> <remote sha>`.
 * If the local sha is all zeros on every line, the push only deletes branches —
 * there is no code to check. No lines → `false` (the checks run).
 */
export function isDeleteOnlyPush(stdin) {
  const lines = String(stdin ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return false
  return lines.every((l) => /^0+$/.test(l.split(/\s+/)[1] ?? ''))
}

/**
 * Decision of the `prepare` wrapper (data-model §5) — the first match wins.
 * Every code except `install` means "skip, exit 0".
 */
export function installDecision(env, hasGit, hasHusky) {
  if (env.HUSKY === '0') return 'husky-0'
  if (env.CI && !['false', '0'].includes(String(env.CI))) return 'ci'
  if (!hasGit) return 'no-git'
  if (!hasHusky) return 'no-husky'
  return 'install'
}

// ── Message catalogue (pure) ──────────────────────────────────────────────────

const BYPASS_HINT =
  '  Ötürmə (yalnız təcili hal): git commit --no-verify — CI hər halda yoxlayır'

export const MESSAGES = Object.freeze({
  branchRejected: (name) =>
    [
      '',
      `✖ Branch adı konvensiyaya uymur: ${name}`,
      '',
      '  Format:   <ad>/<təsvir>   (və ya <ad>-<təsvir>, ya da dəqiq ad)',
      `  Adlar:    ${BRANCH_NAMES.join(' ')}`,
      '',
      '  Nümunə:   feat/istifadeci-siyahisi   hotfix/login-401',
      '  Yenidən adlandır:   git branch -m <yeni-ad>',
      '',
      BYPASS_HINT,
      '',
    ].join('\n'),
  commitRejected: (subject) =>
    [
      '',
      '✖ Commit mesajı konvensiyaya uymur:',
      `    ${subject}`,
      '',
      '  Format:   <prefiks>[(scope)][!]: <təsvir>',
      `  Prefikslər: ${COMMIT_PREFIXES.join(' ')}`,
      '',
      '  Nümunə:   feat: istifadəçi siyahısı',
      '            fix(auth): 401 dövrü',
      '            chore!: node 22-yə keçid',
      '',
      BYPASS_HINT,
      '',
    ].join('\n'),
  commitFileMissing: '✖ commit-msg: mesaj faylı verilməyib',
  commitFileOutsideGitDir:
    '✖ commit-msg: mesaj faylı git qovluğundan kənardadır',
  skipped: Object.freeze({
    noDeps: 'node_modules yoxdur — CI yoxlayacaq',
    noFiles: 'yoxlanılacaq fayl yoxdur',
    deleteOnly: 'yalnız branch silinir',
  }),
  install: Object.freeze({
    'husky-0': 'hook-lar: HUSKY=0 — quraşdırılmadı',
    ci: 'hook-lar: CI mühiti — quraşdırılmadı',
    'no-git': 'hook-lar: bu qovluq git repo kökü deyil — quraşdırılmadı',
    'no-husky':
      'hook-lar: husky quraşdırılmayıb — ötürüldü (CI hər halda yoxlayır)',
    error: (m) => `hook-lar: quraşdırılmadı — ${m}`,
    success: '✓ git hook-ları quraşdırıldı (.husky/)',
  }),
  passed: (hook, s) => `✓ ${hook} keçdi ${s}s`,
  stepFailed: (name) => `✖ ${name} uğursuz`,
})

// ── I/O helpers ───────────────────────────────────────────────────────────────

/** Seconds, one decimal — for the hook's final duration line (FR-022). */
export const seconds = (t0) => ((performance.now() - t0) / 1000).toFixed(1)

/** Whether `node_modules` exists — if not, the lint/test/typecheck steps are skipped (FR-004). */
export const hasDeps = () => existsSync('node_modules')

/**
 * CLI file of `npm` / `npx` — the npm bundled with the Node running the hook. Not
 * taken from PATH: husky's shim prepends a relative `node_modules/.bin` to PATH and
 * on Windows `npx.cmd` then miscomputes its own location (`npm-prefix.js` not found).
 * The `npm-cli.js` next to Node is always in the same place: on Windows
 * `<node>/node_modules/npm/bin/`, on Unix `<node>/../lib/node_modules/npm/bin/`.
 */
function npmCli(name) {
  const dir = dirname(process.execPath)
  return (
    [
      join(dir, 'node_modules', 'npm', 'bin', `${name}-cli.js`),
      join(dir, '..', 'lib', 'node_modules', 'npm', 'bin', `${name}-cli.js`),
    ].find((p) => existsSync(p)) ?? null
  )
}

/**
 * Runs a child process and buffers its output. `npm`/`npx` are invoked directly via
 * Node (`process.execPath <cli.js>`) — no shell, no PATH, no platform differences.
 * Fallback for other commands: a shell on Windows (`.cmd` only works that way; every
 * argument is quoted), a direct spawn otherwise.
 */
export function run(cmd, args = []) {
  const win = process.platform === 'win32'
  const options = {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: process.env,
  }
  const cli = cmd === 'npm' || cmd === 'npx' ? npmCli(cmd) : null
  const r = cli
    ? spawnSync(process.execPath, [cli, ...args], options)
    : win
      ? spawnSync([cmd, ...args].map((a) => `"${a}"`).join(' '), {
          ...options,
          shell: true,
        })
      : spawnSync(cmd, args, options)
  return {
    status: r.status ?? 1,
    output: `${r.stdout ?? ''}${r.stderr ?? ''}`,
  }
}

/** `git <args>` — `null` if the status is non-zero, otherwise the trimmed stdout. */
export function gitOutput(args) {
  const r = spawnSync('git', args, { encoding: 'utf8' })
  if (r.status !== 0) return null
  return String(r.stdout ?? '').trim()
}

/**
 * Numbered step: writes `[n/N] name … `, and when the work finishes the same line
 * gets `ok 3.1s`, `⚠ ötürüldü (reason)` or `✖ uğursuz`. The child's output is shown
 * only on failure — so a passing vitest's eight lines don't break the step line.
 */
export function runStep({ index, total, name, cmd, args, skipReason }) {
  process.stdout.write(`[${index}/${total}] ${name} … `)
  if (skipReason) {
    process.stdout.write(`⚠ ötürüldü (${skipReason})\n`)
    return { result: 'skipped' }
  }
  const t0 = performance.now()
  const { status, output } = run(cmd, args)
  if (status === 0) {
    process.stdout.write(`ok ${seconds(t0)}s\n`)
    return { result: 'passed' }
  }
  process.stdout.write('✖ uğursuz\n')
  process.stderr.write(`\n${output}\n`)
  return { result: 'failed', output }
}
