// Docker image build-i — lokal və CI üçün TƏK əmr (spec 004, D10).
//
//   npm run docker:build                          # lokal: .env.nexus → secret mount, tag nexus:local
//   npm run docker:build -- -t reg/app:1.2.3      # pass-through: -t/--push/--label/--platform …
//
// Credential-ı `docker build --secret id=nexus_env,src=<fayl>` ilə ötürür — secret
// yalnız Dockerfile-ın RUN addımında görünür, heç bir layer-ə, keşə və `docker
// history`-yə düşmür (D8). Mənbə:
//   • fayl (.env.nexus, lokal)      → src=.env.nexus, olduğu kimi
//   • env (NEXUS_USERNAME/PASSWORD, CI) → 0600 icazəli müvəqqəti fayl, proses bitəndə silinir
// Secret faylının məzmunu və yolu heç vaxt çap olunmur (Maddə X.3).
// Yalnız Node built-in modulları (Maddə II).

import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { mesaj, resolveCredentials } from '../install/lib.mjs'

export const SECRET_ID = 'nexus_env'
export const DEFAULT_TAG = 'nexus:local'
// Path to the local credential file (not the secret itself); overridable via NEXUS_ENV_FILE.
export const DEFAULT_NEXUS_ENV_FILE = '.env.nexus'
const NEXUS_ENV_FILE = process.env.NEXUS_ENV_FILE || DEFAULT_NEXUS_ENV_FILE

/** Pass-through arqumentlərdə image tag-ı varmı (-t x | -t=x | --tag x | --tag=x)? */
export function hasTagArg(args) {
  return args.some(
    (a) =>
      a === '-t' ||
      a === '--tag' ||
      a.startsWith('-t=') ||
      a.startsWith('--tag='),
  )
}

/** Pass-through-dan ilk tag dəyərini oxuyur (yalnız uğur mesajı üçün). */
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
 * `docker` üçün arqument siyahısını qurur (saf funksiya — contracts §docker:build):
 * ['build', '--secret', 'id=nexus_env,src=<…>', (-t nexus:local), ...passthrough, '.']
 * Pass-through sırası dəyişmir; `.` həmişə sonuncudur (cwd build kontekstidir).
 */
export function buildDockerArgs({ secretSrc, passthrough = [] }) {
  const tagArgs = hasTagArg(passthrough) ? [] : ['-t', DEFAULT_TAG]
  return [
    'build',
    '--secret',
    `id=${SECRET_ID},src=${secretSrc}`,
    ...tagArgs,
    ...passthrough,
    '.',
  ]
}

/** `npm run … -- args` npm-də `--` silinir; birbaşa node çağırışında qalır — hər ikisi dəstəklənir. */
export function passthroughFromArgv(argv) {
  const args = [...argv]
  if (args[0] === '--') args.shift()
  return args
}

function dockerMovcuddur() {
  const r = spawnSync('docker', ['--version'], { stdio: 'ignore' })
  return !r.error && r.status === 0
}

function main() {
  const passthrough = passthroughFromArgv(process.argv.slice(2))
  const root = process.cwd()

  // ── Pre-flight: docker-i çağırmazdan əvvəl credential ────────────────────────
  // resolve: NEXUS_ENV_FILE may be relative to cwd or absolute
  const envFile = resolve(root, NEXUS_ENV_FILE)
  const creds = resolveCredentials(process.env, envFile)
  if (creds.error === 'credential-fayl-yoxdur') {
    console.error(mesaj('credential-fayl-yoxdur', 'lokal'))
    return 1
  }
  if (creds.error === 'credential-bos') {
    console.error(mesaj('credential-bos', 'lokal', creds.keys))
    return 1
  }

  if (!dockerMovcuddur()) {
    console.error(
      '✗ `docker` tapılmadı və ya daemon işləmir. Docker Desktop / daemon-u işə sal və yenidən:  npm run docker:build',
    )
    return 1
  }

  // ── Secret mənbəyi ───────────────────────────────────────────────────────────
  let tmpDir = null
  let secretSrc
  if (creds.source === 'fayl') {
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

  const temizle = () => {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true })
      tmpDir = null
    }
  }
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      temizle()
      process.exit(130)
    })
  }

  try {
    const args = buildDockerArgs({ secretSrc, passthrough })
    console.log(
      `Docker image qurulur (credential mənbəyi: ${
        creds.source === 'env'
          ? 'mühit dəyişənləri → secret mount'
          : '.env.nexus → secret mount'
      })…`,
    )
    const result = spawnSync('docker', args, { stdio: 'inherit' })
    if (result.error) {
      console.error(`✗ docker işə salına bilmədi: ${result.error.message}`)
      return 1
    }
    const status = result.status ?? 1
    if (status !== 0) {
      console.error(
        '✗ Docker build alınmadı — səbəb üçün yuxarıdakı build log-una bax (Dockerfile daxilindəki install:nexus mesajı orada görünür).',
      )
      return status
    }
    console.log(`✓ image quruldu: ${tagFromArgs(passthrough)}`)
    return 0
  } finally {
    temizle()
  }
}

// Test faylı bu modulu import edir — main yalnız birbaşa icrada işləyir.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exit(main())
}
