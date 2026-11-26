// Docker image build-i — lokal və CI üçün TƏK əmr (FR-045, SC-008).
//
//   npm run docker:build                          # lokal: .env.nexus → secret mount
//   npm run docker:build -- -t reg/app:1.2.3      # pass-through: -t/--push/--label/--platform …
//
// Credential-ı `docker build --secret id=nexus_env,src=<fayl>` ilə ötürür — secret
// yalnız Dockerfile-ın RUN addımında görünür, heç bir layer-ə, keşə və
// `docker history`-yə düşmür. Mənbə:
//   • fayl (.env.nexus və ya NEXUS_ENV_FILE, lokal) → src=<fayl>, olduğu kimi
//   • env (NEXUS_USERNAME/PASSWORD, CI)   → 0600 icazəli müvəqqəti fayl, sonra silinir
//
// Build bitəndən sonra image layer-ləri, konfiqurasiyası və build log-u credential
// üçün yoxlanılır; tapılarsa build uğursuz sayılır (SC-008).
// Yalnız Node built-in modulları (Maddə II).

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { buildNpmAuth, message, resolveCredentials } from '../install/lib.mjs'

export const SECRET_ID = 'nexus_env'
export const DEFAULT_TAG = 'next-template:local'
/** Lokal credential faylı; `NEXUS_ENV_FILE` ilə dəyişir (nisbi yol cwd-yə görədir). */
export const DEFAULT_ENV_FILE = process.env.NEXUS_ENV_FILE || '.env.nexus'

/** Pass-through arqumentlərdə image tag-ı varmı (-t x | -t=x | --tag x | --tag=x)? */
export function hasTagArg(args) {
  return args.some(
    (a) => a === '-t' || a === '--tag' || a.startsWith('-t=') || a.startsWith('--tag='),
  )
}

/** Pass-through-dan ilk tag dəyərini oxuyur. */
export function tagFromArgs(args) {
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]
    if ((a === '-t' || a === '--tag') && args[i + 1]) return args[i + 1]
    if (a.startsWith('-t=')) return a.slice(3)
    if (a.startsWith('--tag=')) return a.slice(6)
  }
  return DEFAULT_TAG
}

/**
 * `docker` üçün arqument siyahısı (saf funksiya):
 * ['build', '--secret', 'id=nexus_env,src=<…>', (-t <default>), ...passthrough, '.']
 * Pass-through sırası dəyişmir; `.` həmişə sonuncudur (cwd build kontekstidir).
 */
export function buildDockerArgs({ secretSrc, passthrough = [] }) {
  const tagArgs = hasTagArg(passthrough) ? [] : ['-t', DEFAULT_TAG]
  return ['build', '--secret', `id=${SECRET_ID},src=${secretSrc}`, ...tagArgs, ...passthrough, '.']
}

/** `npm run … -- args` npm-də `--` silinir; birbaşa node çağırışında qalır. */
export function passthroughFromArgv(argv) {
  const args = [...argv]
  if (args[0] === '--') args.shift()
  return args
}

/**
 * Verilmiş mətndə credential izi axtarır (saf funksiya — SC-008).
 *
 * Şifrənin özü, istifadəçi adı və base64 `user:password` — üçü də. Çox qısa
 * istifadəçi adları («ci», «npm») yanlış müsbət verə bilər, ona görə ad üçün
 * minimum uzunluq şərti var.
 */
export function credentialTraces(text, { username, password }) {
  const s = String(text)
  const auth = buildNpmAuth(username, password)

  return [
    password && s.includes(password) && 'şifrə',
    username && username.length >= 4 && s.includes(username) && 'istifadəçi adı',
    s.includes(auth) && 'base64 auth',
  ].filter(Boolean)
}

function isDockerAvailable() {
  const r = spawnSync('docker', ['--version'], { stdio: 'ignore' })
  return !r.error && r.status === 0
}

/** `docker build`-i canlı çıxışla işlədir və eyni zamanda log-u toplayır. */
function dockerBuild(args) {
  return new Promise((resolve) => {
    const child = spawn('docker', args, { stdio: ['inherit', 'pipe', 'pipe'] })
    let log = ''

    for (const [stream, target] of [
      [child.stdout, process.stdout],
      [child.stderr, process.stderr],
    ]) {
      stream.setEncoding('utf8')
      stream.on('data', (chunk) => {
        log += chunk
        target.write(chunk)
      })
    }

    child.on('error', (error) => resolve({ status: 1, log, error }))
    child.on('close', (code) => resolve({ status: code ?? 1, log }))
  })
}

/** Image-in layer tarixçəsi və konfiqurasiyası — mətn kimi. */
function imageMetadata(tag) {
  const parts = [
    spawnSync('docker', ['history', '--no-trunc', tag], { encoding: 'utf8' }),
    spawnSync('docker', ['image', 'inspect', tag], { encoding: 'utf8' }),
  ]

  return parts.map((r) => `${r.stdout ?? ''}${r.stderr ?? ''}`).join('\n')
}

async function main() {
  const passthrough = passthroughFromArgv(process.argv.slice(2))
  const root = process.cwd()
  const envFile = resolve(root, DEFAULT_ENV_FILE)

  // ── Pre-flight: docker-i çağırmazdan əvvəl credential ──────────────────────
  const creds = resolveCredentials(process.env, envFile)
  if (creds.error === 'credentials-file-missing') {
    console.error(message('credentials-file-missing', 'local'))
    return 1
  }
  if (creds.error === 'credentials-empty') {
    console.error(message('credentials-empty', 'local', creds.keys))
    return 1
  }

  if (!isDockerAvailable()) {
    console.error(
      '✗ `docker` tapılmadı və ya daemon işləmir. Docker Desktop / daemon-u işə sal və yenidən:  npm run docker:build',
    )
    return 1
  }

  // ── Secret mənbəyi ─────────────────────────────────────────────────────────
  let tmpDir = null
  let secretSrc

  if (creds.source === 'file') {
    secretSrc = envFile
  } else {
    // CI: dəyərlər env-dədir — Dockerfile eyni fayl formatını gözləyir.
    tmpDir = mkdtempSync(join(tmpdir(), 'nexus-env-'))
    secretSrc = join(tmpDir, 'env')
    writeFileSync(
      secretSrc,
      `NEXUS_USERNAME=${creds.username}\nNEXUS_PASSWORD=${creds.password}\n`,
      { mode: 0o600 },
    )
  }

  const cleanup = () => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true })
      tmpDir = null
    }
  }

  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      cleanup()
      process.exit(130)
    })
  }

  try {
    const args = buildDockerArgs({ secretSrc, passthrough })
    const source =
      creds.source === 'env' ? 'mühit dəyişənləri → secret mount' : `${DEFAULT_ENV_FILE} → secret mount`

    console.log(`Docker image qurulur (credential mənbəyi: ${source})…`)

    const result = await dockerBuild(args)
    if (result.error) {
      console.error(`✗ docker işə salına bilmədi: ${result.error.message}`)
      return 1
    }
    if (result.status !== 0) {
      console.error(
        '✗ Docker build alınmadı — səbəb üçün yuxarıdakı build log-una bax (Dockerfile daxilindəki install:nexus mesajı orada görünür).',
      )
      return result.status
    }

    // ── SC-008: credential nə log-da, nə layer-lərdə qalmamalıdır ────────────
    const tag = tagFromArgs(passthrough)
    const traces = credentialTraces(`${result.log}\n${imageMetadata(tag)}`, creds)

    if (traces.length > 0) {
      console.error(
        [
          `✗ TƏHLÜKƏSİZLİK: credential izi tapıldı (${traces.join(', ')}).`,
          '  Image push EDİLMƏMƏLİDİR. Dockerfile-da credential-ın `--mount=type=secret`',
          '  xaricində (ARG/ENV/COPY) işlədilmədiyini yoxla.',
        ].join('\n'),
      )
      return 1
    }

    console.log(`✓ image quruldu: ${tag}`)
    console.log('✓ credential izi yoxdur (log + layer tarixçəsi + image konfiqurasiyası)')
    return 0
  } finally {
    cleanup()
  }
}

// Test faylı bu modulu import edir — main yalnız birbaşa icrada işləyir.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main())
}
