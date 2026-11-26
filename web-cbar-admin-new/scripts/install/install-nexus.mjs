// Nexus addımı (spec 003, US1+US3): credential-ları özü hazırlayır, kit-i
// Nexus-dan quraşdırır, kit-in real quraşdırıldığını təsdiqləyir.
//
// İstifadə:
//   npm run install:nexus                     # lokal: npm install (spec 003 kontraktı)
//   npm run install:nexus -- --context=ci     # GitLab runner: npm ci, CI mesajları
//   npm run install:nexus -- --context=docker # Dockerfile RUN: npm ci, secret mount mesajları
// Heç bir skripti source etmək lazım deyil. Kontekst yalnız npm əmrini (install | ci)
// və xəta mesajlarındakı növbəti addımı dəyişir (spec 004 data-model §5).

import process from 'node:process'

import {
  buildNpmAuth,
  classifyFailure,
  kitMovcuddur,
  mesaj,
  parseContext,
  resolveCredentials,
  runNpmInstall,
} from './lib.mjs'

const ROOT = process.cwd() // npm run həmişə package.json qovluğundan işlədir

// ── Kontekst ──────────────────────────────────────────────────────────────────
const ctx = parseContext(process.argv.slice(2))
if (ctx.error) {
  console.error(mesaj('kontekst-yanlis', 'lokal', ctx.value))
  process.exit(1)
}
const KONTEKST = ctx.context
const NPM_EMRI = KONTEKST === 'lokal' ? 'install' : 'ci'

// ── Pre-flight: network sorğusundan ƏVVƏL credential yoxlaması ────────────────
const creds = resolveCredentials(process.env, `${ROOT}/.env.nexus`)

if (creds.error === 'credential-fayl-yoxdur') {
  console.error(mesaj('credential-fayl-yoxdur', KONTEKST))
  process.exit(1)
}
if (creds.error === 'credential-bos') {
  console.error(mesaj('credential-bos', KONTEKST, creds.keys))
  process.exit(1)
}

if (KONTEKST !== 'lokal') console.log(`kontekst: ${KONTEKST}`)
console.log(
  `Nexus asılılıqları quraşdırılır (npm ${NPM_EMRI}; credential mənbəyi: ${
    creds.source === 'env' ? 'mühit dəyişənləri' : '.env.nexus faylı'
  })…`,
)

// ── Install: NPM_AUTH yalnız child prosesə verilir (Maddə X.3) ────────────────
const { status, stderr } = runNpmInstall(
  ['--no-audit', '--no-fund'],
  { NPM_AUTH: buildNpmAuth(creds.username, creds.password) },
  NPM_EMRI,
)

if (status !== 0) {
  console.error(mesaj(classifyFailure(stderr), KONTEKST))
  process.exit(status)
}

// ── Optional dep-in səssiz ötürülməsinə qarşı məcburi yoxlama ─────────────────
if (!kitMovcuddur(ROOT)) {
  console.error(mesaj('kit-yoxdur', KONTEKST))
  process.exit(1)
}

console.log('✓ kit: var — @cbar/lib-react-ui-kit quraşdırıldı. Mühit tamdır.')
