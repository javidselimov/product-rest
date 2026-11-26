// Git hook-larının paylaşılan modulu: branch adı və commit başlığı qaydaları,
// mesaj kataloqu və addım icraçısı. Qaydaların TƏK MƏNBƏYİ buradır (FR-042) —
// siyahını dəyişmək bir sətirdir, rədd mesajları və testlər eyni sabitləri oxuyur.
// Yalnız Node built-in modulları — heç bir dependency yoxdur (Konstitusiya Maddə II).
//
// Fayl iki hissədir: saf funksiyalar (I/O yoxdur, lib.test.mjs onları yoxlayır) və
// sonda I/O köməkçiləri (spawnSync, fs) — hook skriptləri yalnız onları çağırır.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

// ── Qaydalar (saf) ────────────────────────────────────────────────────────────

/** İcazəli branch adları: hər biri həm dəqiq ad, həm prefiks kimi işləyir. */
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

/** İcazəli commit prefiksləri. */
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
 * Git-in özünün yaratdığı başlıqlar — qaydadan azaddır, əks halda `git merge`,
 * `git revert` və `rebase -i` axınları qırılardı.
 */
export const GIT_OWN_SUBJECTS = /^(Merge |Revert |Reapply |fixup! |squash! |amend! )/

const BRANCH_REGEX = new RegExp(`^(${BRANCH_NAMES.join('|')})([/-].+)?$`)
const COMMIT_REGEX = new RegExp(`^(${COMMIT_PREFIXES.join('|')})(\\([a-z0-9._/-]+\\))?!?: \\S.*$`)

/**
 * Branch adını yoxlayır: dəqiq ad (`main`, `test`) və ya `ad/təsvir` / `ad-təsvir`.
 * Yalnız kiçik hərf; `feat/` (boş təsvir) və `feat_x` rədd olunur.
 */
export function checkBranchName(name) {
  if (typeof name !== 'string' || !BRANCH_REGEX.test(name)) {
    return { ok: false, reason: 'format' }
  }
  return { ok: true }
}

/**
 * Commit başlığını (mesajın 1-ci sətri) yoxlayır.
 * `reason`: 'prefix' — ilk söz siyahıda yoxdur (böyük hərf də buraya düşür);
 * 'format' — prefiks düzgündür, qəlib pozulub (`feat:x`, `feat: `, `feat(Auth): x`).
 */
export function checkCommitSubject(subject) {
  const value = typeof subject === 'string' ? subject : ''
  if (GIT_OWN_SUBJECTS.test(value)) return { ok: true, exempt: true }
  if (COMMIT_REGEX.test(value)) return { ok: true }
  const firstWord = /^[a-z]+/.exec(value)?.[0]
  const reason = firstWord && COMMIT_PREFIXES.includes(firstWord) ? 'format' : 'prefix'
  return { ok: false, reason }
}

/**
 * Stage siyahısından yalnız ESLint-in əhatə etdiyi faylları saxlayır.
 * `react-template`-dən fərq: burada `eslint-config-next` skriptləri də lint edir,
 * ona görə `.mjs` / `.cjs` / `.js` da siyahıya düşür.
 */
export function lintableFiles(list) {
  return list.filter((f) => /\.(c|m)?[jt]sx?$/.test(f))
}

/**
 * pre-push stdin-i: hər sətir `<local ref> <local sha> <remote ref> <remote sha>`.
 * Bütün sətirlərdə local sha sıfırlardan ibarətdirsə yalnız branch silinir —
 * silinən kodun yoxlanmasına ehtiyac yoxdur. Sətir yoxdursa `false`.
 */
export function isDeleteOnly(stdin) {
  const lines = String(stdin ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (lines.length === 0) return false
  return lines.every((s) => /^0+$/.test(s.split(/\s+/)[1] ?? ''))
}

/**
 * `prepare` sarğısının qərarı — ilk uyğun gələn qalib.
 * `install` istisna olmaqla hər kod "ötür, exit 0" deməkdir (FR-041).
 */
export function installDecision(env, hasGit, hasHusky) {
  if (env.HUSKY === '0') return 'husky-0'
  if (env.CI && !['false', '0'].includes(String(env.CI))) return 'ci'
  if (!hasGit) return 'git-missing'
  if (!hasHusky) return 'husky-missing'
  return 'install'
}

// ── Mesaj kataloqu (saf) ──────────────────────────────────────────────────────
// Mesaj MƏTNLƏRİ Azərbaycan dilindədir (Maddə I.1); açarlar ingiliscədir.

const SKIP_HINT =
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
      SKIP_HINT,
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
      SKIP_HINT,
      '',
    ].join('\n'),
  commitFileMissing: '✖ commit-msg: mesaj faylı verilməyib',
  skipped: Object.freeze({
    depsMissing: 'node_modules yoxdur — CI yoxlayacaq',
    filesMissing: 'yoxlanılacaq fayl yoxdur',
    deleteOnly: 'yalnız branch silinir',
  }),
  install: Object.freeze({
    'husky-0': 'hook-lar: HUSKY=0 — quraşdırılmadı',
    ci: 'hook-lar: CI mühiti — quraşdırılmadı',
    'git-missing': 'hook-lar: bu qovluq git repo kökü deyil — quraşdırılmadı',
    'husky-missing': 'hook-lar: husky quraşdırılmayıb — ötürüldü (CI hər halda yoxlayır)',
    error: (m) => `hook-lar: quraşdırılmadı — ${m}`,
    success: '✓ git hook-ları quraşdırıldı (.husky/)',
  }),
  passed: (hook, s) => `✓ ${hook} keçdi ${s}s`,
  stepFailed: (name) => `✖ ${name} uğursuz`,
})

// ── I/O köməkçiləri ───────────────────────────────────────────────────────────

/** Saniyə, bir onluq — hook-un yekun müddət sətri üçün. */
export const seconds = (t0) => ((performance.now() - t0) / 1000).toFixed(1)

/** `node_modules` varmı — yoxdursa lint/test/typecheck addımları ötürülür. */
export const hasDeps = () => existsSync('node_modules')

/**
 * `npm` / `npx`-in CLI faylı — hook-u işlədən Node-un öz npm-i. PATH-dən götürülmür:
 * husky-nin şimi PATH-in önünə nisbi `node_modules/.bin` yazır və Windows-da
 * `npx.cmd` bundan sonra öz yolunu səhv hesablayır (`npm-prefix.js` tapılmır).
 * Node-un yanındakı `npm-cli.js` isə həmişə eyni yerdədir.
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
 * Uşaq prosesi işlədir, çıxışı buferləyir. `npm`/`npx` birbaşa Node ilə
 * (`process.execPath <cli.js>`) çağırılır — shell yoxdur, PATH yoxdur, platforma
 * fərqi yoxdur.
 */
export function run(command, args = []) {
  const isWindows = process.platform === 'win32'
  const options = {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: process.env,
  }
  const cli = command === 'npm' || command === 'npx' ? npmCli(command) : null

  let result
  if (cli) {
    result = spawnSync(process.execPath, [cli, ...args], options)
  } else if (isWindows) {
    result = spawnSync([command, ...args].map((a) => `"${a}"`).join(' '), {
      ...options,
      shell: true,
    })
  } else {
    result = spawnSync(command, args, options)
  }

  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  }
}

/** `git <args>` — status 0 deyilsə `null`, əks halda trim-lənmiş stdout. */
export function gitOutput(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  if (result.status !== 0) return null
  return String(result.stdout ?? '').trim()
}

/**
 * Nömrəli addım: `[n/N] ad … ` yazılır, iş bitəndə eyni sətir `ok 3.1s`,
 * `⚠ ötürüldü (səbəb)` və ya `✖ uğursuz` alır. Uşaq prosesin çıxışı yalnız
 * uğursuzluqda göstərilir.
 */
export function runStep({ index, total, name, command, args, skipReason }) {
  process.stdout.write(`[${index}/${total}] ${name} … `)
  if (skipReason) {
    process.stdout.write(`⚠ ötürüldü (${skipReason})\n`)
    return { outcome: 'skipped' }
  }
  const t0 = performance.now()
  const { status, output } = run(command, args)
  if (status === 0) {
    process.stdout.write(`ok ${seconds(t0)}s\n`)
    return { outcome: 'passed' }
  }
  process.stdout.write('✖ uğursuz\n')
  process.stderr.write(`\n${output}\n`)
  return { outcome: 'failed', output }
}
