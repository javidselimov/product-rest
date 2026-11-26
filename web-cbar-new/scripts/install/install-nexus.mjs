// Nexus addımı (US4, FR-044): credential-ları özü hazırlayır, kit-i daxili
// registry-dən quraşdırır və kit-in **real** quraşdırıldığını təsdiqləyir.
//
// İstifadə:
//   npm run install:nexus                     # lokal: npm install
//   npm run install:nexus -- --context=ci     # GitLab runner: npm ci, CI mesajları
//   npm run install:nexus -- --context=docker # Dockerfile RUN: npm ci, secret mount mesajları
//
// Credential heç vaxt shell-ə source edilmir və repo-ya düşmür: müvəqqəti,
// 0600 icazəli `--userconfig` faylına yazılır və proses bitəndə silinir (Maddə X.3).

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

import {
  buildNpmAuth,
  classifyFailure,
  createUserconfig,
  isKitInstalled,
  KIT_NAME,
  message,
  parseContext,
  parseEnvFile,
  resolveCredentials,
  resolveRegistry,
  runNpmInstall,
} from './lib.mjs'

const ROOT = process.cwd() // `npm run` həmişə package.json qovluğundan işlədir
const ENV_FILE = join(ROOT, '.env.nexus')

// ── Kontekst ──────────────────────────────────────────────────────────────────
const ctx = parseContext(process.argv.slice(2))
if (ctx.error) {
  console.error(message('context-invalid', 'local', ctx.value))
  process.exit(1)
}

const CONTEXT = ctx.context
const NPM_COMMAND = CONTEXT === 'local' ? 'install' : 'ci'

// ── Pre-flight: şəbəkə sorğusundan ƏVVƏL credential ───────────────────────────
const credentials = resolveCredentials(process.env, ENV_FILE)

if (credentials.error === 'credentials-file-missing') {
  console.error(message('credentials-file-missing', CONTEXT))
  process.exit(1)
}
if (credentials.error === 'credentials-empty') {
  console.error(message('credentials-empty', CONTEXT, credentials.keys))
  process.exit(1)
}

// ── Registry: `.env.nexus` / mühit dəyişəni `.npmrc`-dən üstündür ─────────────
const envValues = existsSync(ENV_FILE) ? parseEnvFile(readFileSync(ENV_FILE, 'utf8')) : {}
const npmrcText = existsSync(join(ROOT, '.npmrc'))
  ? readFileSync(join(ROOT, '.npmrc'), 'utf8')
  : ''

const registry = resolveRegistry(process.env, envValues, npmrcText)
if (registry.error) {
  console.error(message('registry-placeholder', CONTEXT, registry.keys))
  process.exit(1)
}

if (CONTEXT !== 'local') console.log(`kontekst: ${CONTEXT}`)
console.log(
  `Daxili registry asılılıqları quraşdırılır (npm ${NPM_COMMAND}; credential mənbəyi: ${
    credentials.source === 'env' ? 'mühit dəyişənləri' : '.env.nexus faylı'
  })…`,
)

// ── Install ───────────────────────────────────────────────────────────────────
const userconfig = createUserconfig({
  scope: registry.scope,
  registry: registry.registry,
  auth: buildNpmAuth(credentials.username, credentials.password),
})

let result
try {
  result = runNpmInstall(
    ['--userconfig', userconfig.path, '--no-audit', '--no-fund'],
    {},
    NPM_COMMAND,
  )
} finally {
  userconfig.cleanup()
}

if (result.status !== 0) {
  console.error(message(classifyFailure(result.stderr), CONTEXT))
  process.exit(result.status)
}

// ── Optional dep-in səssiz ötürülməsinə qarşı məcburi yoxlama ─────────────────
if (!isKitInstalled(ROOT)) {
  console.error(message('kit-missing', CONTEXT))
  process.exit(1)
}

console.log(`✓ kit: var — ${KIT_NAME} quraşdırıldı. Mühit tamdır.`)
