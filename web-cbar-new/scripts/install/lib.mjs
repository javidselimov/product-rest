// İki mərhələli install axınının paylaşılan modulu (FR-043…046).
// Yalnız Node built-in modulları — heç bir dependency yoxdur (Konstitusiya Maddə II).
//
// `react-template`-dən fərq: burada `.npmrc` credential sətri **saxlamır**.
// Registry və scope orada placeholder-dir, credential isə heç vaxt commit olunmur,
// ona görə `install:nexus` müvəqqəti bir `--userconfig` faylı qurur, npm-i onunla
// işlədir və faylı silir. Nə shell-ə, nə repo-ya heç nə sızmır (Maddə X.3).

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Nümunə fayldan köçürülüb doldurulmamış dəyərlər də «boş» sayılır. */
const PLACEHOLDER_VALUES = new Set(['', '**', 'istifadeci-adi', 'sifre', 'user', 'password'])

/** Quraşdırma kontekstləri. */
export const CONTEXTS = ['local', 'ci', 'docker']

export const KIT_NAME = '@cbar/lib-react-ui-kit'

// ── Saf funksiyalar ───────────────────────────────────────────────────────────

/**
 * `.env.nexus` mətnini KEY=VALUE cütlərinə çevirir: `#` ilə başlayan və boş
 * sətirlər şərhdir; dəyər ilk `=`-dən sonrakı hər şeydir; kənar boşluqlar kəsilir;
 * cüt dırnaqlar soyulur.
 */
export function parseEnvFile(text) {
  const result = {}

  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq <= 0) continue

    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()

    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}

/**
 * Credential-ları tapır: mühit dəyişənləri fayldan üstündür.
 * Nəticə: `{ username, password, source }` və ya `{ error, keys? }`.
 *
 * Boş string env dəyəri «set deyil» sayılır — Docker build-də `ARG NEXUS_USERNAME`
 * default-u boşdur və o halda secret mount ilə gələn fayl oxunmalıdır.
 */
export function resolveCredentials(env, filePath) {
  const envUser = env.NEXUS_USERNAME
  const envPass = env.NEXUS_PASSWORD

  if (envUser && envPass) {
    return { username: envUser, password: envPass, source: 'env' }
  }

  if (!existsSync(filePath)) {
    // İkisindən yalnız biri set olunub (tipik CI səhvi) — «fayl yoxdur» əvəzinə
    // hansı açarın boş olduğunu de.
    if (envUser || envPass) {
      return {
        error: 'credentials-empty',
        keys: [!envUser && 'NEXUS_USERNAME', !envPass && 'NEXUS_PASSWORD'].filter(Boolean),
      }
    }
    return { error: 'credentials-file-missing' }
  }

  const parsed = parseEnvFile(readFileSync(filePath, 'utf8'))
  const emptyKeys = ['NEXUS_USERNAME', 'NEXUS_PASSWORD'].filter((key) =>
    PLACEHOLDER_VALUES.has((parsed[key] ?? '').trim()),
  )

  if (emptyKeys.length > 0) {
    return { error: 'credentials-empty', keys: emptyKeys }
  }

  return {
    username: parsed.NEXUS_USERNAME,
    password: parsed.NEXUS_PASSWORD,
    source: 'file',
  }
}

/**
 * npm-in `_auth` sətri üçün dəyər: `user:password` → base64. Latin1 — npm klienti
 * və Nexus-un basic credential gözləntisi ilə uyğunluq üçün (non-ASCII şifrədə
 * UTF-8-dən fərqlənir). `toString('base64')` newline daxil etmir.
 */
export function buildNpmAuth(username, password) {
  return Buffer.from(`${username}:${password}`, 'latin1').toString('base64')
}

/** `.npmrc`-dən scope və registry sətrini oxuyur. */
export function parseNpmrc(text) {
  const match = /^\s*(@[^:\s]+|<[A-Z_]+>)\s*:\s*registry\s*=\s*(\S+)\s*$/m.exec(String(text))
  if (!match) return null
  return { scope: match[1], registry: match[2] }
}

const PLACEHOLDER_PATTERN = /^<[A-Z][A-Z0-9_]*>$/

/**
 * Registry-ni həll edir: `.env.nexus` / mühit dəyişəni `.npmrc`-dən üstündür,
 * çünki şablonda `.npmrc` hələ placeholder saxlayır.
 */
export function resolveRegistry(env, envFileValues, npmrcText) {
  const npmrc = parseNpmrc(npmrcText ?? '') ?? {}
  const merged = { ...npmrc, ...pickRegistryKeys(envFileValues), ...pickRegistryKeys(env) }

  const scope = merged.NEXUS_SCOPE ?? merged.scope
  const registry = merged.NEXUS_REGISTRY_URL ?? merged.registry

  const remaining = [
    PLACEHOLDER_PATTERN.test(String(scope ?? '')) && 'NEXUS_SCOPE',
    PLACEHOLDER_PATTERN.test(String(registry ?? '')) && 'NEXUS_REGISTRY_URL',
  ].filter(Boolean)

  if (!scope || !registry || remaining.length > 0) {
    return {
      error: 'registry-placeholder',
      keys: remaining.length > 0 ? remaining : ['NEXUS_SCOPE', 'NEXUS_REGISTRY_URL'],
    }
  }

  return { scope, registry: registry.endsWith('/') ? registry : `${registry}/` }
}

function pickRegistryKeys(source) {
  const result = {}
  for (const key of ['NEXUS_SCOPE', 'NEXUS_REGISTRY_URL']) {
    const value = source?.[key]
    if (typeof value === 'string' && value.trim() !== '') result[key] = value.trim()
  }
  return result
}

/** `https://host/path/` → `//host/path/:_auth` — npm-in gözlədiyi açar forması. */
export function authKey(registry) {
  const withoutProtocol = String(registry).replace(/^https?:/, '')
  const withSlash = withoutProtocol.endsWith('/') ? withoutProtocol : `${withoutProtocol}/`
  return `${withSlash}:_auth`
}

/** Müvəqqəti `--userconfig` faylının məzmunu. */
export function npmrcContent({ scope, registry, auth }) {
  return [`${scope}:registry=${registry}`, `${authKey(registry)}=${auth}`, ''].join('\n')
}

/**
 * `--context=<dəyər>` arqumentini oxuyur. Yoxdursa `local`; tanınmayan dəyərdə
 * `{ error, value, allowed }`.
 */
export function parseContext(argv) {
  const arg = (argv ?? []).find((a) => a === '--context' || a.startsWith('--context='))
  if (!arg) return { context: 'local' }

  const value = arg.includes('=') ? arg.slice(arg.indexOf('=') + 1).trim() : ''
  if (!CONTEXTS.includes(value)) {
    return { error: 'context-invalid', value, allowed: CONTEXTS }
  }

  return { context: value }
}

/**
 * npm uğursuzluğunu siniflərə ayırır. Auth xətası şəbəkə xətası ilə
 * qarışdırılmır: 401 stderr-də şəbəkə kodu daşımır və əksinə. Versiya
 * tapılmaması auth və şəbəkədən **sonra** yoxlanılır.
 */
export function classifyFailure(stderr) {
  const s = String(stderr)
  if (/E401|Unable to authenticate|401 Unauthorized/i.test(s)) return 'auth-rejected'
  if (/ENOTFOUND|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|ERR_SOCKET_TIMEOUT|network/i.test(s)) {
    return 'network-unreachable'
  }
  if (/ETARGET|E404|No matching version|notarget/i.test(s)) return 'version-not-found'
  return 'unknown'
}

// ── Vendored arxiv: saf funksiyalar (spec 002) ───────────────────────────────
// Offline quraşdırma yolunun həqiqət mənbəyi `package-lock.json`-dur:
// yalnız o, bir versiya + bir `integrity` verir. `package.json`-dakı caret
// diapazonu (`^0.4.0`) bir neçə versiyaya uyğun gəlir və bütövlük dəyəri
// saxlamır, ona görə drift aşkarlaya bilmir — heç yerdə oxunmur.

/** Kit-in `package-lock.json#packages` içindəki açarı. */
export const KIT_LOCKFILE_KEY = `node_modules/${KIT_NAME}`

export const VENDOR_DIR = 'vendor'

/**
 * Lockfile obyektindən kit qeydini çıxarır.
 * Nəticə: `{ version, integrity }` və ya `{ error: 'lockfile-entry-missing' }`.
 *
 * `integrity` yalnız sha512 qəbul edilir — npm keşinin content-address sxemi və
 * `sha512Base64()` hər ikisi bu alqoritm üzərindədir.
 */
export function lockfileKitEntry(lockfileObject) {
  const entry = lockfileObject?.packages?.[KIT_LOCKFILE_KEY]

  if (typeof entry?.version !== 'string' || typeof entry?.integrity !== 'string') {
    return { error: 'lockfile-entry-missing' }
  }
  if (!entry.integrity.startsWith('sha512-')) {
    return { error: 'lockfile-entry-missing' }
  }

  return { version: entry.version, integrity: entry.integrity }
}

/**
 * `sha512-<base64>` → hex sətri (npm keşinin content-v2 yolu üçün).
 * Format yanlışdırsa `null`.
 */
export function integrityHex(integrity) {
  if (typeof integrity !== 'string' || !integrity.startsWith('sha512-')) return null

  const buffer = Buffer.from(integrity.slice('sha512-'.length), 'base64')
  // sha512 = 64 bayt; qısa nəticə base64-ün korlandığını bildirir.
  if (buffer.length !== 64) return null

  return buffer.toString('hex')
}

/**
 * npm keşində (cacache) məzmunun yolu. Keş faylı **öz sha512-si ilə** ünvanlanır,
 * ona görə bu yolda tapılan fayl konstruksiyaya görə `integrity`-yə uyğundur —
 * repack riski yoxdur və şəbəkə lazım deyil.
 */
export function cachePath(cacheDir, integrity) {
  const hex = integrityHex(integrity)
  if (hex === null) return null

  return join(
    cacheDir,
    '_cacache',
    'content-v2',
    'sha512',
    hex.slice(0, 2),
    hex.slice(2, 4),
    hex.slice(4),
  )
}

/** `npm pack`-ın scoped paket üçün qurduğu ad: `@cbar/lib-react-ui-kit` → `cbar-lib-react-ui-kit-0.4.0.tgz`. */
export function archiveName(version) {
  return `${KIT_NAME.replace(/^@/, '').replace('/', '-')}-${version}.tgz`
}

/** Buferin sha512-si, lockfile `integrity` ilə birbaşa müqayisə oluna bilən formatda. */
export function sha512Base64(buffer) {
  return `sha512-${createHash('sha512').update(buffer).digest('base64')}`
}

// ── Mesajlar ──────────────────────────────────────────────────────────────────
// Hər sinif üçün kontekstə görə (local | ci | docker) növbəti addım fərqlənir.
// Mesaj MƏTNLƏRİ Azərbaycan dilindədir (Maddə I.1); açarlar isə kod daxili
// identifikatorlardır və ingiliscədir. Heç bir mesaj credential dəyəri, base64
// və ya auth sətri ehtiva etmir (Maddə X.3).

const GITLAB_VARIABLES = 'GitLab → Settings → CI/CD → Variables'

const MESSAGE_VARIANTS = {
  'credentials-file-missing': {
    local: [
      '✗ `.env.nexus` faylı tapılmadı — daxili registry credential-ları olmadan davam etmək mümkün deyil.',
      '  Yarat və doldur:',
      '    PowerShell:  Copy-Item .env.nexus.example .env.nexus',
      '    bash:        cp .env.nexus.example .env.nexus',
      '  Sonra yenidən işlət:  npm run install:nexus',
    ].join('\n'),
    ci: [
      '✗ Credential tapılmadı — CI mühitində `NEXUS_USERNAME` və `NEXUS_PASSWORD` set deyil.',
      `  ${GITLAB_VARIABLES}-də hər ikisini yarat (Masked: bəli; Protected: yalnız bu branch protected-dirsə,`,
      '  əks halda job dəyişəni görmür). Sonra pipeline-ı yenidən işlət.',
    ].join('\n'),
    docker: [
      '✗ Credential tapılmadı — build daxilində `/app/.env.nexus` secret mount-u yoxdur.',
      '  Image-i belə qur:  npm run docker:build',
      '  və ya:             docker build --secret id=nexus_env,src=.env.nexus .',
    ].join('\n'),
  },
  'credentials-empty': {
    local: (keys) =>
      [
        `✗ \`.env.nexus\`-da bu açar(lar) doldurulmayıb: ${keys.join(', ')}.`,
        '  Faylı aç, real dəyərləri yaz və yenidən işlət:  npm run install:nexus',
      ].join('\n'),
    ci: (keys) =>
      [
        `✗ CI mühitində bu dəyişən(lər) boşdur: ${keys.join(', ')}.`,
        `  ${GITLAB_VARIABLES}-də dəyəri yoxla; variable Protected-dirsə bu branch da protected olmalıdır.`,
      ].join('\n'),
    docker: (keys) =>
      [
        `✗ Secret mount ilə gələn \`.env.nexus\`-da bu açar(lar) doldurulmayıb: ${keys.join(', ')}.`,
        '  Lokal `.env.nexus` faylını doldur və yenidən:  npm run docker:build',
      ].join('\n'),
  },
  'registry-placeholder': {
    local: (keys) =>
      [
        `✗ Daxili registry ünvanı hələ placeholder-dir: ${keys.join(', ')}.`,
        '  İki yoldan biri:',
        '    npm run setup                       # `.npmrc`-dəki placeholder-ləri əvəzləyir',
        '    və ya `.env.nexus`-a əlavə et:  NEXUS_SCOPE=@cbar',
        '                                    NEXUS_REGISTRY_URL=https://…/repository/npm-hosted/',
      ].join('\n'),
    ci: (keys) =>
      [
        `✗ Daxili registry ünvanı hələ placeholder-dir: ${keys.join(', ')}.`,
        `  ${GITLAB_VARIABLES}-də \`NEXUS_SCOPE\` və \`NEXUS_REGISTRY_URL\` təyin et, ya da repo-da \`npm run setup\` icra olunsun.`,
      ].join('\n'),
    docker: (keys) =>
      [
        `✗ Daxili registry ünvanı hələ placeholder-dir: ${keys.join(', ')}.`,
        '  Build-dən əvvəl `npm run setup` icra et, ya da `.env.nexus`-a NEXUS_SCOPE / NEXUS_REGISTRY_URL əlavə et.',
      ].join('\n'),
  },
  'network-unreachable': {
    local: [
      '✗ Şəbəkə xətası — daxili registry əlçatmazdır.',
      '  VPN qoşulmasını yoxla və yenidən işlət:  npm run install:nexus',
    ].join('\n'),
    ci: [
      '✗ Şəbəkə xətası — runner daxili registry-yə çata bilmir.',
      '  Runner-in daxili şəbəkə/DNS çıxışını DevOps ilə yoxla (CI-də VPN anlayışı yoxdur).',
    ].join('\n'),
    docker: [
      '✗ Şəbəkə xətası — build daxilindən daxili registry əlçatmazdır.',
      '  Docker daemon-un şəbəkə/proxy çıxışını yoxla; lokalda VPN qoşulu olmalıdır.',
    ].join('\n'),
  },
  'auth-rejected': {
    local: [
      '✗ Registry autentifikasiyanı rədd etdi (401).',
      '  `.env.nexus`-dakı istifadəçi adı/şifrəni yoxla — şifrə rotasiya olunmuş ola bilər.',
    ].join('\n'),
    ci: [
      '✗ Registry autentifikasiyanı rədd etdi (401).',
      `  ${GITLAB_VARIABLES}-dəki \`NEXUS_PASSWORD\` dəyərini yenilə — şifrə rotasiya olunmuş ola bilər.`,
    ].join('\n'),
    docker: [
      '✗ Registry autentifikasiyanı rədd etdi (401).',
      '  Secret kimi verilən `.env.nexus`-dakı istifadəçi adı/şifrəni yoxla.',
    ].join('\n'),
  },
  'version-not-found': {
    local: [
      `✗ ${KIT_NAME} üçün package.json caret diapazonuna uyğun versiya tapılmadı.`,
      '  Registry-də bu diapazona düşən versiyanın olub-olmadığını yoxla — kit repo-su onu publish edibmi?',
      '  Bu, credential problemi DEYİL; şifrəni dəyişməyə ehtiyac yoxdur.',
    ].join('\n'),
    ci: [
      `✗ ${KIT_NAME} üçün package.json caret diapazonuna uyğun versiya tapılmadı.`,
      '  Registry-də bu diapazona düşən versiyanın olub-olmadığını yoxla.',
      '  Bu, credential problemi DEYİL; CI variable-larını dəyişməyə ehtiyac yoxdur.',
    ].join('\n'),
    docker: [
      `✗ ${KIT_NAME} üçün package.json caret diapazonuna uyğun versiya tapılmadı.`,
      '  Registry-də bu diapazona düşən versiyanın olub-olmadığını yoxla.',
      '  Bu, credential problemi DEYİL; secret mount düzgündür.',
    ].join('\n'),
  },
  'kit-missing': {
    local: [
      `✗ npm uğurla bitdi, amma ${KIT_NAME} quraşdırılmayıb`,
      '  (optional asılılıq səssiz ötürülüb). Yuxarıdakı çıxışda skip səbəbini axtar;',
      '  VPN və credential-ları yoxlayıb yenidən işlət:  npm run install:nexus',
    ].join('\n'),
    ci: [
      `✗ npm ci uğurla bitdi, amma ${KIT_NAME} quraşdırılmayıb`,
      '  (optional asılılıq səssiz ötürülüb). Job log-unda skip səbəbini axtar;',
      `  ${GITLAB_VARIABLES}-dəki credential-ları və registry-də caret-ə uyğun versiyanı yoxla.`,
    ].join('\n'),
    docker: [
      `✗ npm ci uğurla bitdi, amma ${KIT_NAME} quraşdırılmayıb`,
      '  (optional asılılıq səssiz ötürülüb). Build log-unda skip səbəbini axtar;',
      '  secret mount-un (`--secret id=nexus_env`) verildiyini və credential-ları yoxla.',
      '  Lokalda tək əmr:  npm run docker:build',
    ].join('\n'),
  },
  unknown: {
    local: [
      '✗ Sinifləndirilməmiş xəta — səbəb üçün yuxarıdakı npm çıxışına bax.',
      '  Problem davam edərsə README-nin «Quraşdırma» bölməsinə müraciət et.',
    ].join('\n'),
    ci: [
      '✗ Sinifləndirilməmiş xəta — səbəb üçün yuxarıdakı npm çıxışına bax.',
      '  README-nin «Yeni layihəyə uyğunlaşdırma» bölməsindəki CI cədvəlinə müraciət et.',
    ].join('\n'),
    docker: [
      '✗ Sinifləndirilməmiş xəta — səbəb üçün yuxarıdakı npm çıxışına bax.',
      '  README-nin «Docker image» bölməsinə müraciət et.',
    ].join('\n'),
  },
  'context-invalid': {
    local: (value) =>
      `✗ Tanınmayan --context dəyəri: \`${value}\`. İcazəli dəyərlər: ${CONTEXTS.join(', ')}.`,
  },

  // ── Vendored arxiv (spec 002) ───────────────────────────────────────────────
  // Offline yol yalnız lokal maşın üçündür (FR-071), ona görə hər sinif üçün
  // bir `local` variantı kifayətdir — `message()` başqa kontekstdə ona düşür.

  'lockfile-entry-missing': {
    local: [
      `✗ \`package-lock.json\`-da ${KIT_NAME} qeydi yoxdur, ya da onun \`integrity\` dəyəri sha512 formatında deyil.`,
      '  Offline quraşdırma həm versiyanı, həm bütövlük dəyərini məhz oradan oxuyur —',
      '  onlarsız hansı arxivin düzgün olduğunu təyin etmək mümkün deyil.',
      '  Növbəti addım: lockfile-ı kit ilə birlikdə yenidən yarat —  npm run install:nexus',
    ].join('\n'),
  },
  'archive-missing': {
    local: (expectedName) =>
      [
        `✗ Yerli arxiv tapılmadı: \`vendor/${expectedName}\`.`,
        '  Lockfile bu versiyanı tələb edir; başqa versiyanın arxivi qəbul edilmir.',
        '  Növbəti addım (daxili şəbəkəyə qoşulu halda, ya da keş isti olduqda):',
        '    npm run vendor:kit',
      ].join('\n'),
  },
  'archive-multiple': {
    local: (names) =>
      [
        `✗ \`vendor/\` qovluğunda birdən çox arxiv var: ${(Array.isArray(names) ? names : [names]).join(', ')}.`,
        '  Hansının istifadə olunduğu aydın olmadığı üçün quraşdırma dayandırıldı.',
        '  Növbəti addım: artıq faylları sil — qovluqda yalnız bir `.tgz` qalmalıdır.',
      ].join('\n'),
  },
  'archive-mismatch': {
    local: (name) =>
      [
        `✗ \`vendor/${name}\` faylının sha512 dəyəri lockfile-dakı \`integrity\` ilə uyğun gəlmir.`,
        '  Arxiv natamam yüklənib, əl ilə dəyişdirilib, ya da başqa məzmuna aiddir.',
        '  Kit QURAŞDIRILMADI — mövcud `node_modules` toxunulmadı.',
        '  Növbəti addım:  npm run vendor:kit',
      ].join('\n'),
  },
  'archive-corrupt': {
    local: (reason) =>
      [
        `✗ Arxiv açıla bilmədi: ${reason}`,
        '  Fayl gzip/tar strukturunu pozur, ya da hədəf qovluqdan kənara çıxan giriş saxlayır.',
        '  Növbəti addım: arxivi yenidən götür —  npm run vendor:kit',
      ].join('\n'),
  },
  'cache-missing': {
    local: [
      '✗ Arxiv npm keşində tapılmadı və registry-dən də götürülə bilmədi.',
      '  Keş bu paketi saxlamır (təmizlənib, ya da kit bu maşında heç vaxt quraşdırılmayıb).',
      '  Növbəti addım: daxili şəbəkəyə qoşul və bir dəfə  npm run install:nexus  işlət —',
      '  arxiv keşə düşəcək, sonra  npm run vendor:kit  şəbəkəsiz işləyəcək.',
    ].join('\n'),
  },
}

/**
 * Sinif + kontekst üçün mesajı qaytarır. `extra` — `credentials-empty` və
 * `registry-placeholder` üçün açar siyahısı, `context-invalid` üçün verilən dəyər.
 * Kontekst üçün variant yoxdursa `local` variantına düşür.
 */
export function message(kind, context = 'local', extra) {
  const variants = MESSAGE_VARIANTS[kind] ?? MESSAGE_VARIANTS.unknown
  const variant = variants[context] ?? variants.local
  return typeof variant === 'function' ? variant(extra) : variant
}

export const ERROR_KINDS = Object.freeze(Object.keys(MESSAGE_VARIANTS))

// ── I/O ───────────────────────────────────────────────────────────────────────

/** Kit-in **real** quraşdırıldığını yoxlayır — optional dep-in səssiz ötürülməsinə qarşı. */
export function isKitInstalled(rootDir) {
  return existsSync(join(rootDir, 'node_modules', '@cbar', 'lib-react-ui-kit', 'package.json'))
}

/** `package-lock.json`-u oxuyub parse edir. Yoxdursa və ya korlanmışsa `null`. */
export function readLockfile(rootDir) {
  try {
    return JSON.parse(readFileSync(join(rootDir, 'package-lock.json'), 'utf8'))
  } catch {
    return null
  }
}

/**
 * `vendor/` qovluğunda arxivi axtarır.
 *
 * Qovluqdakı **bütün** `.tgz`-ləri sayır: birdən çox arxiv qalması səssiz drift
 * mənbəyidir (hansının istifadə olunduğu aydın olmur), ona görə çağıran tərəf
 * bunu xəta kimi işləyir.
 */
export function findVendorArchive(rootDir, version) {
  const dir = join(rootDir, VENDOR_DIR)
  const expected = archiveName(version)

  let all
  try {
    all = readdirSync(dir).filter((name) => name.endsWith('.tgz'))
  } catch {
    all = []
  }

  return {
    dir,
    expected,
    all,
    path: all.includes(expected) ? join(dir, expected) : null,
  }
}

/**
 * `package-lock.json`-u qoruyur: cari baytları yadda saxlayır və onları bərpa
 * edən funksiya qaytarır. `restore()` dəyişiklik olub-olmadığını qaytarır.
 *
 * Niyə lazımdır: npm quraşdırma zamanı lockfile-ı **yenidən yaza bilir** —
 * məsələn seçimli paketlərin platforma metadata-sını (`libc`) atır. Bu, real
 * resolve dəyişikliyi deyil; lockfile isə CI üçün **tam** ağacın (optional
 * daxil) həqiqət mənbəyi olaraq qalmalıdır. Ona görə offline yol icradan sonra
 * faylı olduğu kimi geri qoyur (FR-066).
 */
export function protectLockfile(rootDir) {
  const path = join(rootDir, 'package-lock.json')

  let original
  try {
    original = readFileSync(path)
  } catch {
    return { restore: () => false }
  }

  return {
    restore() {
      let current
      try {
        current = readFileSync(path)
      } catch {
        return false
      }

      if (current.equals(original)) return false

      writeFileSync(path, original)
      return true
    },
  }
}

/** npm-in keş qovluğu (`npm config get cache`). Müəyyən edilə bilmirsə `null`. */
export function npmCacheDir() {
  const options = { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }

  // Windows-da npm `.cmd` faylıdır və yalnız shell vasitəsilə çağırıla bilir.
  const result =
    process.platform === 'win32'
      ? spawnSync('npm config get cache', { ...options, shell: true })
      : spawnSync('npm', ['config', 'get', 'cache'], options)

  const output = String(result.stdout ?? '').trim()
  if (result.status !== 0 || output === '' || output === 'undefined' || output === 'null') {
    return null
  }

  return output
}

/**
 * Müvəqqəti `--userconfig` faylı qurur (0600) və onu silən funksiya qaytarır.
 * Credential nə repo-ya, nə shell-ə düşür.
 */
export function createUserconfig({ scope, registry, auth }) {
  const dir = mkdtempSync(join(tmpdir(), 'nt-npmrc-'))
  const path = join(dir, 'npmrc')

  writeFileSync(path, npmrcContent({ scope, registry, auth }), { mode: 0o600 })

  return {
    path,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  }
}

/**
 * `npm pack <spec>` — arxivi registry-dən endirir. `runNpmInstall` ilə eyni
 * win32 qaydası (npm `.cmd` faylıdır və shell tələb edir).
 *
 * Yalnız `vendor:kit`-in fallback yolunda işlədilir: əsas yol npm keşidir və
 * şəbəkə tələb etmir.
 */
export function runNpmPack(args) {
  const options = { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }

  const result =
    process.platform === 'win32'
      ? spawnSync(['npm', 'pack', ...args].join(' '), { ...options, shell: true })
      : spawnSync('npm', ['pack', ...args], options)

  const stderr = String(result.stderr ?? '')
  if (stderr.trim() !== '') process.stderr.write(stderr)

  return { status: result.status ?? 1, stdout: String(result.stdout ?? ''), stderr }
}

/**
 * `npm install` / `npm ci`-ni child proses kimi işlədir. stdout canlı axır;
 * stderr həm istifadəçiyə ötürülür, həm klassifikasiya üçün qaytarılır.
 *
 * `command`: `'install'` (lokal) və ya `'ci'` (CI/Docker — committed lockfile-a
 * ciddi uyğunluq, lockfile heç vaxt dəyişmir).
 */
export function runNpmInstall(args, extraEnv = {}, command = 'install') {
  if (command !== 'install' && command !== 'ci') {
    throw new Error(`runNpmInstall: dəstəklənməyən əmr "${command}" (install | ci)`)
  }

  const options = {
    stdio: ['inherit', 'inherit', 'pipe'],
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  }

  // Windows-da npm `.cmd` faylıdır və yalnız shell vasitəsilə çağırıla bilir.
  const result =
    process.platform === 'win32'
      ? spawnSync(['npm', command, ...args].join(' '), { ...options, shell: true })
      : spawnSync('npm', [command, ...args], options)

  const stderr = result.stderr ?? ''
  if (String(stderr).trim() !== '') process.stderr.write(stderr)

  return { status: result.status ?? 1, stderr }
}
