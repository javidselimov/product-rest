// İki mərhələli install axınının paylaşılan saf funksiyaları (spec 003) və
// CI/Docker konteksti genişləndirməsi (spec 004).
// Yalnız Node built-in modulları — heç bir dependency yoxdur (Konstitusiya Maddə II).

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

// Nümunə fayldan köçürülüb doldurulmamış dəyərlər də "boş" sayılır.
const PLACEHOLDER_DEYERLER = new Set(['', '**', 'istifadeci-adi', 'sifre'])

/** Quraşdırma kontekstləri (spec 004 data-model §5). */
export const KONTEKSTLER = ['lokal', 'ci', 'docker']

/**
 * `.env.nexus` mətnini KEY=VALUE cütlərinə çevirir (data-model §1):
 * `#` ilə başlayan və boş sətirlər şərhdir; dəyər ilk `=`-dən sonrakı hər şeydir
 * (dəyərdə `=` ola bilər); kənar boşluqlar kəsilir; cüt dırnaqlar soyulur.
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
 * Credential-ları tapır: mühit dəyişənləri fayldan üstündür (research D2).
 * Nəticə: { username, password, source } və ya { error, keys? }.
 * Xəta kodları data-model §3 sinifləri ilə üst-üstə düşür.
 *
 * Boş string env dəyəri "set deyil" sayılır — Docker build-də `ARG NEXUS_USERNAME`
 * default-u boşdur və bu halda secret mount ilə gələn fayl oxunmalıdır (spec 004 D8).
 */
export function resolveCredentials(env, filePath) {
  const envUser = env.NEXUS_USERNAME
  const envPass = env.NEXUS_PASSWORD
  if (envUser && envPass) {
    return { username: envUser, password: envPass, source: 'env' }
  }

  if (!existsSync(filePath)) {
    // İkisindən yalnız biri set olunub (tipik CI səhvi: bir variable yaradılıb,
    // o biri unudulub) — "fayl yoxdur" əvəzinə hansı açarın boş olduğunu de.
    if (envUser || envPass) {
      return {
        error: 'credential-bos',
        keys: [
          !envUser && 'NEXUS_USERNAME',
          !envPass && 'NEXUS_PASSWORD',
        ].filter(Boolean),
      }
    }
    return { error: 'credential-fayl-yoxdur' }
  }

  const parsed = parseEnvFile(readFileSync(filePath, 'utf8'))
  const bosAcarlar = ['NEXUS_USERNAME', 'NEXUS_PASSWORD'].filter((key) =>
    PLACEHOLDER_DEYERLER.has((parsed[key] ?? '').trim()),
  )
  if (bosAcarlar.length > 0) {
    return { error: 'credential-bos', keys: bosAcarlar }
  }

  return {
    username: parsed.NEXUS_USERNAME,
    password: parsed.NEXUS_PASSWORD,
    source: 'fayl',
  }
}

/**
 * npm-in `.npmrc`-dəki `_auth=${NPM_AUTH}` sətri üçün dəyər qurur: npm dəyəri
 * verbatim göndərir, kodlaşdırmanı biz qururuq. Latin1 — npm klienti və Nexus-un
 * basic credential gözləntisi ilə uyğunluq üçün (non-ASCII şifrədə UTF-8-dən
 * fərqlənir). Buffer.toString('base64') newline daxil etmir (research D4).
 */
export function buildNpmAuth(username, password) {
  return Buffer.from(`${username}:${password}`, 'latin1').toString('base64')
}

/**
 * `--context=<dəyər>` arqumentini oxuyur (spec 004 data-model §5).
 * Yoxdursa `lokal`; tanınmayan dəyərdə { error, value, allowed }.
 * `npm run install:nexus -- --context=ci` formasında npm `--`-dan sonrakı
 * arqumentləri olduğu kimi ötürür; birbaşa `node …mjs -- --context=ci`
 * çağırışında qalan `--` də nəzərə alınır.
 */
export function parseContext(argv) {
  const arg = (argv ?? []).find(
    (a) => a === '--context' || a.startsWith('--context='),
  )
  if (!arg) return { context: 'lokal' }
  const value = arg.includes('=') ? arg.slice(arg.indexOf('=') + 1).trim() : ''
  if (!KONTEKSTLER.includes(value)) {
    return { error: 'kontekst-yanlis', value, allowed: KONTEKSTLER }
  }
  return { context: value }
}

/**
 * `npm install` / `npm ci`-ni child proses kimi işlədir. `extraEnv` (o cümlədən
 * NPM_AUTH) yalnız child-a verilir — parent shell-ə və çıxışa heç nə sızmır
 * (Maddə X.3). stdout canlı axır; stderr həm istifadəçiyə ötürülür, həm
 * klassifikasiya üçün qaytarılır.
 *
 * `command`: `'install'` (lokal, spec 003) və ya `'ci'` (CI/Docker — committed
 * lockfile-a ciddi uyğunluq, lockfile heç vaxt dəyişmir; spec 004 D11).
 */
export function runNpmInstall(args, extraEnv = {}, command = 'install') {
  if (command !== 'install' && command !== 'ci') {
    throw new Error(
      `runNpmInstall: dəstəklənməyən əmr "${command}" (install | ci)`,
    )
  }
  const options = {
    stdio: ['inherit', 'inherit', 'pipe'],
    env: { ...process.env, ...extraEnv },
    encoding: 'utf8',
  }
  // Windows-da npm `.cmd` faylıdır və yalnız shell vasitəsilə çağırıla bilir
  // (Node CVE düzəlişi). DEP0190-dan qaçmaq üçün əmr tam sətir kimi verilir —
  // arqumentlər sabit literallardır, istifadəçi girişi yoxdur.
  const result =
    process.platform === 'win32'
      ? spawnSync(['npm', command, ...args].join(' '), {
          ...options,
          shell: true,
        })
      : spawnSync('npm', [command, ...args], options)
  const stderr = result.stderr ?? ''
  if (stderr.trim() !== '') process.stderr.write(stderr)
  return { status: result.status ?? 1, stderr }
}

/** Kit-in real quraşdırıldığını yoxlayır — optional dep-in səssiz ötürülməsinə qarşı. */
export function kitMovcuddur(rootDir) {
  return existsSync(
    `${rootDir}/node_modules/@cbar/lib-react-ui-kit/package.json`,
  )
}

// ── Mesajlar ──────────────────────────────────────────────────────────────────
// Hər sinif üçün kontekstə görə (lokal | ci | docker) növbəti addım fərqlənir
// (spec 004 data-model §3). Hamısı Azərbaycan dilində; heç biri credential
// dəyəri, base64 və ya NPM_AUTH ehtiva etmir (Maddə I, X.3).
// `lokal` variantları spec 003-ün mətnləri ilə birəbir eynidir (geriyə uyğunluq).

const GITLAB_VARIABLES = 'GitLab → Settings → CI/CD → Variables'

const MESAJ_VARIANTLARI = {
  'credential-fayl-yoxdur': {
    lokal: [
      '✗ `.env.nexus` faylı tapılmadı — Nexus credential-ları olmadan davam etmək mümkün deyil.',
      '  Yarat və doldur:',
      '    PowerShell:  Copy-Item .env.nexus.example .env.nexus',
      '    bash:        cp .env.nexus.example .env.nexus',
      '  Sonra yenidən işlət:  npm run install:nexus',
    ].join('\n'),
    ci: [
      '✗ Nexus credential-ları tapılmadı — CI mühitində `NEXUS_USERNAME` və `NEXUS_PASSWORD` set deyil.',
      `  ${GITLAB_VARIABLES}-də hər ikisini yarat (Masked: bəli; Protected: yalnız bu branch protected-dirsə,`,
      '  əks halda job dəyişəni görmür). Sonra pipeline-ı yenidən işlət.',
    ].join('\n'),
    docker: [
      '✗ Nexus credential-ları tapılmadı — build daxilində `/app/.env.nexus` secret mount-u yoxdur.',
      '  Image-i belə qur:  npm run docker:build',
      '  və ya:             docker build --secret id=nexus_env,src=.env.nexus .',
    ].join('\n'),
  },
  'credential-bos': {
    lokal: (keys) =>
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
  'sebeke-vpn': {
    lokal: [
      '✗ Şəbəkə xətası — Nexus (nexus.cbar.az) əlçatmazdır.',
      '  VPN qoşulmasını yoxla və yenidən işlət:  npm run install:nexus',
    ].join('\n'),
    ci: [
      '✗ Şəbəkə xətası — runner Nexus-a (nexus.cbar.az) çata bilmir.',
      '  Runner-in daxili şəbəkə/DNS çıxışını DevOps ilə yoxla (CI-də VPN anlayışı yoxdur).',
    ].join('\n'),
    docker: [
      '✗ Şəbəkə xətası — build daxilindən Nexus (nexus.cbar.az) əlçatmazdır.',
      '  Docker daemon-un şəbəkə/proxy çıxışını yoxla; lokalda VPN qoşulu olmalıdır.',
    ].join('\n'),
  },
  'auth-redd': {
    lokal: [
      '✗ Nexus autentifikasiyanı rədd etdi (401).',
      '  `.env.nexus`-dakı istifadəçi adı/şifrəni yoxla — şifrə rotasiya olunmuş ola bilər.',
    ].join('\n'),
    ci: [
      '✗ Nexus autentifikasiyanı rədd etdi (401).',
      `  ${GITLAB_VARIABLES}-dəki \`NEXUS_PASSWORD\` dəyərini yenilə — şifrə rotasiya olunmuş ola bilər.`,
    ].join('\n'),
    docker: [
      '✗ Nexus autentifikasiyanı rədd etdi (401).',
      '  Secret kimi verilən `.env.nexus`-dakı istifadəçi adı/şifrəni yoxla.',
    ].join('\n'),
  },
  'versiya-tapilmadi': {
    lokal: [
      '✗ @cbar/lib-react-ui-kit üçün package.json caret diapazonuna uyğun versiya tapılmadı.',
      '  Nexus-da (npm-hosted) bu diapazona düşən versiyanın olub-olmadığını yoxla — kit repo-su onu publish edibmi?',
      '  Bu, credential problemi DEYİL; şifrəni dəyişməyə ehtiyac yoxdur.',
    ].join('\n'),
    ci: [
      '✗ @cbar/lib-react-ui-kit üçün package.json caret diapazonuna uyğun versiya tapılmadı.',
      '  Nexus-da (npm-hosted) bu diapazona düşən versiyanın olub-olmadığını yoxla — kit repo-su onu publish edibmi?',
      '  Bu, credential problemi DEYİL; CI variable-larını dəyişməyə ehtiyac yoxdur.',
    ].join('\n'),
    docker: [
      '✗ @cbar/lib-react-ui-kit üçün package.json caret diapazonuna uyğun versiya tapılmadı.',
      '  Nexus-da (npm-hosted) bu diapazona düşən versiyanın olub-olmadığını yoxla — kit repo-su onu publish edibmi?',
      '  Bu, credential problemi DEYİL; secret mount düzgündür.',
    ].join('\n'),
  },
  'kit-yoxdur': {
    lokal: [
      '✗ npm uğurla bitdi, amma @cbar/lib-react-ui-kit quraşdırılmayıb',
      '  (optional asılılıq səssiz ötürülüb). Yuxarıdakı çıxışda skip səbəbini axtar;',
      '  VPN və credential-ları yoxlayıb yenidən işlət:  npm run install:nexus',
    ].join('\n'),
    ci: [
      '✗ npm ci uğurla bitdi, amma @cbar/lib-react-ui-kit quraşdırılmayıb',
      '  (optional asılılıq səssiz ötürülüb). Job log-unda skip səbəbini axtar;',
      `  ${GITLAB_VARIABLES}-dəki credential-ları və Nexus-da caret-ə uyğun versiyanın mövcudluğunu yoxla.`,
    ].join('\n'),
    docker: [
      '✗ npm ci uğurla bitdi, amma @cbar/lib-react-ui-kit quraşdırılmayıb',
      '  (optional asılılıq səssiz ötürülüb). Build log-unda skip səbəbini axtar;',
      '  secret mount-un (`--secret id=nexus_env`) verildiyini, credential-ları və Nexus-da versiyanı yoxla.',
      '  Lokalda tək əmr:  npm run docker:build',
    ].join('\n'),
  },
  naməlum: {
    lokal: [
      '✗ Sinifləndirilməmiş xəta — səbəb üçün yuxarıdakı npm çıxışına bax.',
      '  Problem davam edərsə README-nin "Quraşdırma" bölməsindəki cədvələ müraciət et.',
    ].join('\n'),
    ci: [
      '✗ Sinifləndirilməmiş xəta — səbəb üçün yuxarıdakı npm çıxışına bax.',
      '  README-nin "Yeni layihəyə uyğunlaşdırma" bölməsindəki CI cədvəlinə müraciət et.',
    ].join('\n'),
    docker: [
      '✗ Sinifləndirilməmiş xəta — səbəb üçün yuxarıdakı npm çıxışına bax.',
      '  README-nin "Docker image (lokal)" bölməsinə müraciət et.',
    ].join('\n'),
  },
  'kontekst-yanlis': {
    lokal: (value) =>
      `✗ Tanınmayan --context dəyəri: \`${value}\`. İcazəli dəyərlər: ${KONTEKSTLER.join(', ')}.`,
  },
}

/**
 * Sinif + kontekst üçün mesajı qaytarır. `extra` — `credential-bos` üçün boş
 * açarların siyahısı, `kontekst-yanlis` üçün verilən dəyər. Kontekst üçün
 * variant yoxdursa `lokal` variantına düşür.
 */
export function mesaj(sinif, kontekst = 'lokal', extra) {
  const variantlar = MESAJ_VARIANTLARI[sinif] ?? MESAJ_VARIANTLARI.naməlum
  const variant = variantlar[kontekst] ?? variantlar.lokal
  return typeof variant === 'function' ? variant(extra) : variant
}

/**
 * Spec 003 interfeysi (geriyə uyğunluq): hər sinfin `lokal` variantı.
 * Yeni kod `mesaj(sinif, kontekst, extra)` işlədir.
 */
export const XETA_MESAJLARI = Object.fromEntries(
  Object.entries(MESAJ_VARIANTLARI)
    .filter(([sinif]) => sinif !== 'kontekst-yanlis')
    .map(([sinif, variantlar]) => [sinif, variantlar.lokal]),
)

/**
 * npm uğursuzluğunu data-model §3 siniflərinə ayırır. Auth xətası şəbəkə
 * xətası ilə qarışdırılmır: 401 stderr-də şəbəkə kodu daşımır və əksinə.
 * Versiya tapılmaması (ETARGET/E404) auth və şəbəkədən SONRA yoxlanılır —
 * 401 alan sorğu heç vaxt versiya siyahısına çatmır.
 */
export function classifyFailure(stderr) {
  const s = String(stderr)
  if (/E401|Unable to authenticate|401 Unauthorized/i.test(s)) {
    return 'auth-redd'
  }
  if (
    /ENOTFOUND|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|ERR_SOCKET_TIMEOUT|network/i.test(
      s,
    )
  ) {
    return 'sebeke-vpn'
  }
  if (/ETARGET|E404|No matching version|notarget/i.test(s)) {
    return 'versiya-tapilmadi'
  }
  return 'naməlum'
}
