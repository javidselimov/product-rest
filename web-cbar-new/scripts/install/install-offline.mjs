// Offline addımı (spec 002, FR-065…070): kit repo daxilindəki arxivdən
// quraşdırılır. Daxili registry-yə çıxış və credential **tələb olunmur** —
// şəbəkədən kənar developer maşını üçün yol budur.
//
// İstifadə:  npm run install:offline
//
// `--context` arqumenti QƏBUL EDİLMİR (FR-071): CI və konteyner build-i
// `install:nexus` ilə registry-dən quraşdırmağa davam edir. Pipeline-ın real
// quraşdırma etdiyini təsdiqləmək dəyərlidir — vendored arxivə düşsəydi,
// köhnəlmiş kit ilə yaşıl keçə bilərdi.

import { readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

import {
  classifyFailure,
  findVendorArchive,
  isKitInstalled,
  KIT_NAME,
  lockfileKitEntry,
  message,
  protectLockfile,
  readLockfile,
  runNpmInstall,
  sha512Base64,
} from './lib.mjs'
import { extractArchive } from './tar.mjs'

const ROOT = process.cwd() // `npm run` həmişə package.json qovluğundan işlədir
const KIT_DIR = join(ROOT, 'node_modules', '@cbar', 'lib-react-ui-kit')

function fail(kind, extra) {
  console.error(message(kind, 'local', extra))
  process.exit(1)
}

// ── Kontekst arqumenti qəbul edilmir ─────────────────────────────────────────
if (process.argv.slice(2).some((arg) => arg.startsWith('--context'))) {
  console.error(
    [
      '✗ `install:offline` `--context` arqumentini qəbul etmir — yalnız lokal maşın üçündür.',
      '  CI və konteyner üçün:  npm run install:nexus -- --context=ci|docker',
    ].join('\n'),
  )
  process.exit(1)
}

// ── 1. Həqiqət mənbəyi: lockfile ─────────────────────────────────────────────
const kitEntry = lockfileKitEntry(readLockfile(ROOT))
if (kitEntry.error) fail(kitEntry.error)

// ── 2. Yerli arxiv ───────────────────────────────────────────────────────────
const archive = findVendorArchive(ROOT, kitEntry.version)

if (archive.all.length > 1) fail('archive-multiple', archive.all)
if (archive.path === null) fail('archive-missing', archive.expected)

// ── 3. Bütövlük — `node_modules`-a TOXUNMADAN ƏVVƏL ──────────────────────────
// Uğursuz icra mühiti yarımçıq qoymamalıdır: uyğunsuz arxivdə artıq
// quraşdırılmış kit olduğu kimi qalır (FR-073).
let archiveBytes
try {
  archiveBytes = readFileSync(archive.path)
} catch (error) {
  fail('archive-corrupt', error.message)
}

if (sha512Base64(archiveBytes) !== kitEntry.integrity) {
  fail('archive-mismatch', archive.expected)
}

console.log(`✓ arxiv: vendor/${archive.expected} — bütövlük lockfile ilə uyğundur`)

// ── 4. Asılılıqlar ───────────────────────────────────────────────────────────
// `--omit=optional` İSTİFADƏ EDİLMİR. O, kit-i ötürərdi, amma **bütün** digər
// seçimli asılılıqları da atardı — `@next/swc-*`, `@tailwindcss/oxide-*`,
// `@rolldown/binding-*`, `sharp` platforma binarları məhz optional qrupdadır.
// Onlarsız build, dev və test işləmir, yəni «Mühit tamdır» vədi pozulardı.
//
// Əvəzinə adi quraşdırma işlədilir: kit optional olduğu üçün daxili registry
// əlçatmaz olanda npm onu **tez ötürür** (VPN-siz mühitdə ölçülüb: ~1.6 s) və
// yaşıl davam edir. `--fetch-retries=0` təkrar cəhdləri, `--fetch-timeout` isə
// DNS cavab verib host susduğu halda gözləməni məhdudlaşdırır.
//
// Sıralama məcburidir: npm kit-i ya ötürür, ya keşdən qoyur — hər iki halda
// arxiv yalnız BUNDAN SONRA açılmalıdır (FR-067).
console.log('Asılılıqlar quraşdırılır (daxili registry / credential tələb olunmur)…')

// npm `package-lock.json`-u yenidən yaza bilir (seçimli paketlərin `libc`
// metadata-sı atılır). Bu, real resolve dəyişikliyi deyil və lockfile CI üçün
// tam ağacın həqiqət mənbəyi olmalıdır — icradan sonra fayl olduğu kimi geri
// qoyulur (FR-066).
const lockfileGuard = protectLockfile(ROOT)

const installResult = runNpmInstall([
  '--no-audit',
  '--no-fund',
  '--fetch-retries=0',
  '--fetch-timeout=15000',
])

if (lockfileGuard.restore()) {
  console.log('  (npm `package-lock.json`-u dəyişmişdi — əvvəlki məzmun bərpa olundu)')
}

if (installResult.status !== 0) {
  console.error(message(classifyFailure(installResult.stderr), 'local'))
  process.exit(installResult.status)
}

// ── 5–6. Köhnə qalıq silinir, arxiv açılır ───────────────────────────────────
rmSync(KIT_DIR, { recursive: true, force: true })

let fileCount
try {
  fileCount = extractArchive(archiveBytes, KIT_DIR)
} catch (error) {
  // Yarımçıq açılmış qovluq qalmasın — «yaşıl, amma natamam» vəziyyət qadağandır.
  rmSync(KIT_DIR, { recursive: true, force: true })
  fail('archive-corrupt', error.message)
}

// ── 7. Təsdiq ────────────────────────────────────────────────────────────────
if (!isKitInstalled(ROOT)) fail('kit-missing')

const installedVersion = JSON.parse(readFileSync(join(KIT_DIR, 'package.json'), 'utf8')).version
if (installedVersion !== kitEntry.version) {
  fail('archive-mismatch', archive.expected)
}

console.log(
  `✓ kit: var — ${KIT_NAME}@${installedVersion} yerli arxivdən quraşdırıldı (${fileCount} fayl). Mühit tamdır.`,
)
