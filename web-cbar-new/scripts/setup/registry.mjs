// Placeholder registri — `contracts/placeholders.md`-in maşınla oxunan əkizi (R-012).
//
// Yeni placeholder əlavə edən hər dəyişiklik həm bu faylı, həm də sənədi yeniləyir.
// `setup.mjs` sualları buradan oxuyur, `setup-check.mjs` isə qalıqları buna görə
// tanıyır: registrdə olmayan `<UPPER_SNAKE>` forması «naməlum placeholder» kimi
// bildirilir.

/**
 * Forma: `<UPPER_SNAKE>` — **ən azı bir alt xətt** tələb olunur.
 * Bu, TypeScript generiklərini (`<T>`, `<K>`) yanlışlıqla tutmağın qarşısını alır.
 */
export const PLACEHOLDER_REGEX = /<([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)>/g

export const PLACEHOLDERS = Object.freeze([
  {
    key: 'PROJECT_NAME',
    description: 'Layihənin texniki adı (kebab-case): pkg adı, image adı, cookie adı, K8s resurs adı',
    example: 'nexus-next',
    question: 'Layihənin texniki adı (kebab-case)',
  },
  {
    key: 'PROJECT_DISPLAY_NAME',
    description: 'İstifadəçiyə görünən ad — sidebar, tab başlığı, giriş səhifəsi',
    example: 'CBAR Next Template',
    question: 'İstifadəçiyə görünən ad',
  },
  {
    key: 'INGRESS_DOMAIN',
    description: 'Ingress kök domeni',
    example: 'example.az',
    question: 'Ingress kök domeni',
  },
  {
    key: 'API_HOST_DEV',
    description: 'Dev mühitinin API ünvanı (sxemsiz host)',
    example: 'api-example-dev.example.az',
    question: 'Dev API host-u (sxemsiz)',
  },
  {
    key: 'API_HOST_TEST',
    description: 'Test mühitinin API ünvanı (sxemsiz host)',
    example: 'api-example-test.example.az',
    question: 'Test API host-u (sxemsiz)',
  },
  {
    key: 'API_HOST_PROD',
    description: 'Prod mühitinin API ünvanı (sxemsiz host)',
    example: 'api-example.example.az',
    question: 'Prod API host-u (sxemsiz)',
  },
  {
    key: 'NEXUS_REGISTRY_URL',
    description: 'Daxili npm registry ünvanı',
    example: 'https://nexus.example.az/repository/npm-hosted/',
    question: 'Daxili npm registry ünvanı',
  },
  {
    key: 'NEXUS_SCOPE',
    description: 'UI kit-in npm scope-u',
    example: '@cbar',
    question: 'UI kit-in scope-u (@ ilə)',
  },
  {
    key: 'GIT_REPO_URL',
    description: 'Layihənin GitLab ünvanı',
    example: 'https://gitlab.example.az/team/project',
    question: 'Layihənin git repo ünvanı',
  },
  {
    key: 'CI_TEMPLATE_REF',
    description: 'Paylaşılan pipeline şablonunun ref-i',
    example: '1.0.0',
    question: 'Paylaşılan CI şablonunun ref-i',
  },
])

export const KNOWN_KEYS = Object.freeze(PLACEHOLDERS.map((p) => p.key))

/**
 * Skan edilməyən qovluqlar (contracts/placeholders.md §setup:check davranışı).
 *
 * `.claude` və `.specify` əlavə olaraq kənardadır: onlar agent və idarəetmə
 * alətləridir, deploy identifikatoru saxlamırlar, amma placeholder **sintaksisini**
 * sənədləşdirirlər (konstitusiya Maddə VIII.4 nümunələri, skill şablonları) —
 * əks halda hər qayda izahı «qalıq placeholder» kimi görünərdi.
 */
export const EXCLUDED_DIRS = Object.freeze([
  'node_modules',
  '.next',
  '.git',
  '.claude',
  '.specify',
  'coverage',
  'specs',
  'dist',
  'out',
  '.husky/_',
])

/**
 * Skan edilməyən fayllar: registrin özü (burada açarlar qəsdən yazılıb) və
 * placeholder prosedurunu **sənədləşdirən** fayllar.
 */
export const EXCLUDED_FILES = Object.freeze([
  'scripts/setup/registry.mjs',
  'scripts/setup/setup.mjs',
  'scripts/setup/setup-check.mjs',
  'scripts/setup/setup-check.test.mjs',
  'package-lock.json',
])

/** Yalnız mətn faylları skan olunur. */
export const SCANNED_EXTENSIONS = Object.freeze([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.md',
  '.yml',
  '.yaml',
  '.env',
  '.example',
  '.npmrc',
  '.nvmrc',
  '.conf',
  '.html',
])

/** Bu işarəni daşıyan sətir skan edilmir — proseduru izah edən sənəd sətirləri üçün. */
export const IGNORE_MARKER = 'setup-check:ignore'

export function keyDescription(key) {
  return PLACEHOLDERS.find((p) => p.key === key)?.description ?? 'registrdə yoxdur — naməlum placeholder'
}
