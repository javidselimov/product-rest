// Kit-only qapısı (spec 001-admin-template-migration, FR-004/FR-005, SC-004).
// `src/**` içində kit-dən kənar rəng dəyəri, barrel import və qadağan UI
// kitabxanası tapılarsa exit 1. `src/index.css` (route B bloku), testlər və
// fixture-lar (legacy HTML nümunələri inline style daşıya bilər) yoxlanmır.
//
// İstifadə: npm run check:kit

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const SRC = join(ROOT, 'src')

const RULES = [
  { re: /#[0-9a-fA-F]{3,8}\b(?![\w-])/g, name: 'hex rəng' },
  { re: /\brgba?\(/g, name: 'rgb()/rgba()' },
  { re: /\boklch\(/g, name: 'oklch()' },
  { re: /\bhsla?\(/g, name: 'hsl()/hsla()' },
  {
    re: /\b(bg|text|border|from|to|via|ring|outline|fill|stroke)-(red|blue|green|gray|grey|slate|zinc|neutral|stone|orange|amber|yellow|lime|emerald|teal|cyan|sky|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g,
    name: 'Tailwind palitra utiliti',
  },
  { re: /from ['"]@cbar\/lib-react-ui-kit['"]/g, name: 'kit barrel import' },
  {
    re: /@chakra-ui|react-icons|lucide-react|@mui\/|antd/g,
    name: 'qadağan UI kitabxanası',
  },
]

const SKIP_DIR = new Set(['node_modules'])
const isSkipped = (rel) =>
  rel === 'index.css' ||
  /\.test\.(ts|tsx)$/.test(rel) ||
  rel.split(sep).includes('fixtures') ||
  rel.split(sep).includes('testing')

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR.has(name)) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (/\.(ts|tsx|css)$/.test(name)) yield full
  }
}

const findings = []
for (const file of walk(SRC)) {
  const rel = relative(SRC, file)
  if (isSkipped(rel)) continue
  const text = readFileSync(file, 'utf8')
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    // Şərh sətirləri yoxlanmır (izahlarda nümunə hex ola bilər).
    const trimmed = line.trim()
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*')
    )
      return
    for (const rule of RULES) {
      rule.re.lastIndex = 0
      if (rule.re.test(line)) {
        findings.push(
          `${rel}:${i + 1}  [${rule.name}]  ${trimmed.slice(0, 120)}`,
        )
      }
    }
  })
}

if (findings.length > 0) {
  console.error(`✗ check:kit — ${findings.length} tapıntı:`)
  for (const f of findings) console.error('  ' + f)
  process.exit(1)
}
console.log('✓ check:kit — kit-dən kənar rəng/import tapılmadı.')
