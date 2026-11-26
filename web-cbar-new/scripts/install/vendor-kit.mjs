// Yerli arxivin yenilənməsi (spec 002, FR-076…078).
//
// İstifadə:  npm run vendor:kit
//
// ƏSAS YOL — npm keşi, şəbəkəsiz. Keş (cacache) məzmunu **öz sha512-si ilə**
// ünvanlayır, lockfile-dakı `integrity` isə elə həmin ünvandır. Deməli orada
// tapılan fayl konstruksiyaya görə registry-dəki baytların eynisidir: nə repack
// riski var, nə şəbəkə lazımdır (research R-001).
//
// FALLBACK — `npm pack`, keş soyuq olduqda. Bu yol şəbəkə və credential tələb
// edir; credential mövcud müvəqqəti `--userconfig` mexanizmi ilə verilir və heç
// bir izlənən fayla düşmür (FR-077).
//
// Hansı yolla gəlməsindən asılı olmayaraq bütövlük yoxlanılır (FR-078).

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

import {
  archiveName,
  buildNpmAuth,
  cachePath,
  classifyFailure,
  createUserconfig,
  KIT_NAME,
  lockfileKitEntry,
  message,
  npmCacheDir,
  parseEnvFile,
  readLockfile,
  resolveCredentials,
  resolveRegistry,
  runNpmPack,
  sha512Base64,
  VENDOR_DIR,
} from './lib.mjs'

const ROOT = process.cwd()
const ENV_FILE = join(ROOT, '.env.nexus')
const VENDOR_PATH = join(ROOT, VENDOR_DIR)

function fail(kind, extra) {
  console.error(message(kind, 'local', extra))
  process.exit(1)
}

// ── 1. Həqiqət mənbəyi: lockfile ─────────────────────────────────────────────
const kitEntry = lockfileKitEntry(readLockfile(ROOT))
if (kitEntry.error) fail(kitEntry.error)

const targetName = archiveName(kitEntry.version)

// ── 2. Əsas yol: npm keşi ────────────────────────────────────────────────────
let archiveBytes = null
let source = ''

const cacheDir = npmCacheDir()
const cacheFile = cacheDir === null ? null : cachePath(cacheDir, kitEntry.integrity)

if (cacheFile !== null && existsSync(cacheFile)) {
  console.log('Arxiv npm keşindən götürülür (şəbəkə tələb olunmur)…')
  archiveBytes = readFileSync(cacheFile)
  source = 'npm keşi'
}

// ── 3. Fallback: npm pack (şəbəkə + credential) ──────────────────────────────
if (archiveBytes === null) {
  const credentials = resolveCredentials(process.env, ENV_FILE)
  if (credentials.error) {
    // Keş də yoxdur, credential də — istifadəçiyə hər iki yolu bir mesajda izah et.
    fail('cache-missing')
  }

  const envValues = existsSync(ENV_FILE) ? parseEnvFile(readFileSync(ENV_FILE, 'utf8')) : {}
  const npmrcText = existsSync(join(ROOT, '.npmrc'))
    ? readFileSync(join(ROOT, '.npmrc'), 'utf8')
    : ''

  const registry = resolveRegistry(process.env, envValues, npmrcText)
  if (registry.error) fail('registry-placeholder', registry.keys)

  console.log(
    `Arxiv npm keşində yoxdur — registry-dən götürülür (credential mənbəyi: ${
      credentials.source === 'env' ? 'mühit dəyişənləri' : '.env.nexus faylı'
    })…`,
  )

  const userconfig = createUserconfig({
    scope: registry.scope,
    registry: registry.registry,
    auth: buildNpmAuth(credentials.username, credentials.password),
  })

  const tempDir = mkdtempSync(join(tmpdir(), 'nt-pack-'))

  let packResult
  try {
    packResult = runNpmPack([
      `${KIT_NAME}@${kitEntry.version}`,
      '--pack-destination',
      tempDir,
      '--userconfig',
      userconfig.path,
      '--no-audit',
      '--no-fund',
    ])
  } finally {
    userconfig.cleanup()
  }

  if (packResult.status !== 0) {
    rmSync(tempDir, { recursive: true, force: true })
    fail(classifyFailure(packResult.stderr))
  }

  const produced = readdirSync(tempDir).filter((name) => name.endsWith('.tgz'))
  if (produced.length !== 1) {
    rmSync(tempDir, { recursive: true, force: true })
    fail('archive-corrupt', `npm pack ${produced.length} fayl verdi, bir ədəd gözlənilirdi`)
  }

  archiveBytes = readFileSync(join(tempDir, produced[0]))
  rmSync(tempDir, { recursive: true, force: true })
  source = 'registry (npm pack)'
}

// ── 4. Bütövlük — yazmadan ƏVVƏL ─────────────────────────────────────────────
if (sha512Base64(archiveBytes) !== kitEntry.integrity) {
  if (source === 'npm keşi') {
    // Content-address sxeminə görə bu praktiki olaraq mümkün deyil — keşin
    // özü korlanıbsa baş verə bilər.
    fail('archive-mismatch', targetName)
  }

  console.error(
    [
      '✗ `npm pack`-ın verdiyi arxivin bütövlüyü lockfile dəyəri ilə uyğun gəlmir.',
      '  Bu, alətin arxivi yenidən paketlədiyini bildirir — fayl YAZILMADI.',
      '  Növbəti addım: kit-i bir dəfə `npm run install:nexus` ilə quraşdır —',
      '  orijinal arxiv npm keşinə düşəcək, sonra `npm run vendor:kit` onu oradan götürəcək.',
    ].join('\n'),
  )
  process.exit(1)
}

console.log('✓ bütövlük: sha512 lockfile dəyəri ilə uyğundur')

// ── 5. Yazılır — qovluqda yalnız cari versiya qalır (FR-062) ─────────────────
mkdirSync(VENDOR_PATH, { recursive: true })

for (const name of readdirSync(VENDOR_PATH).filter(
  (entry) => entry.endsWith('.tgz') && entry !== targetName,
)) {
  rmSync(join(VENDOR_PATH, name), { force: true })
  console.log(`  köhnə arxiv silindi: ${name}`)
}

writeFileSync(join(VENDOR_PATH, targetName), archiveBytes)

const sizeKb = Math.round(archiveBytes.length / 1024)
console.log(`✓ ${VENDOR_DIR}/${targetName} yazıldı (${sizeKb} KB, mənbə: ${source})`)
console.log(
  '  Növbəti addım: faylı commit et — şəbəkəsiz maşınlar `npm run install:offline` ilə istifadə edəcək.',
)
