#!/usr/bin/env node
// `npm run verify` addımı — şablonun **self-contained** olduğunu yoxlayır (FR-001).
//
// `next-template/` başqa repo-ya kök qovluq kimi köçürülür: kökdən kənara çıxan
// hər istinad köçürmədən sonra səssizcə qırılır. Bu skript hər mətn faylındakı
// nisbi yolu həll edir və kökdən kənara düşəni xəta kimi bildirir.
//
// Qeyd: kök **daxilində** `../` normaldır (`../factories`, `../../node_modules/…`) —
// yalnız kökü tərk edən yol qadağandır.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const toPosixPath = (p) => p.split(sep).join('/')

/** Skan edilməyən qovluqlar. */
export const EXCLUDED_DIRS = Object.freeze([
  'node_modules',
  '.next',
  '.git',
  'coverage',
  'dist',
  'out',
  '.husky/_',
  // Governance və agent alətləri: qardaş şablona istinadları sənəd mətnidir,
  // kod deyil, və köçürmədə heç nə qırmır.
  '.specify',
  '.claude',
  'specs',
  // Vendor surətləri (spec 007): minify olunmuş üçüncü tərəf kodu, redaktə edilmir.
  'public/vendor',
])

/**
 * Test faylları skan edilmir: onlardakı `../` yolları **fixture-dır** (qaydanın
 * özünü yoxlayan nümunələr), real istinad deyil və image-ə düşmür.
 */
const TEST_FILE_PATTERN = /\.test\.[cm]?[jt]sx?$/

export const SCANNED_EXTENSIONS = Object.freeze([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.yml',
  '.yaml',
  '.md',
])

/** `import … from '…'`, `require('…')`, `@source '…'`, `@import '…'` və markdown linkləri. */
const PATH_PATTERNS = [
  /\bfrom\s+['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /@(?:source|import)\s+['"]([^'"]+)['"]/g,
  /\]\(([^)\s]+)\)/g,
]

/**
 * Bir faylın mətnindəki `../` ilə başlayan bütün nisbi yolları tapır (saf funksiya).
 * Kökü tərk edib-etmədiyini `escapesRoot` ayrıca həll edir.
 */
export function relativePaths(text) {
  const findings = []

  String(text)
    .split(/\r?\n/)
    .forEach((line, index) => {
      for (const basePattern of PATH_PATTERNS) {
        const regex = new RegExp(basePattern.source, 'g')
        let match = regex.exec(line)

        while (match !== null) {
          const path = match[1]
          if (path.startsWith('../')) findings.push({ line: index + 1, path })
          match = regex.exec(line)
        }
      }
    })

  return findings
}

/**
 * Nisbi yolun kökü tərk edib-etmədiyini seqment sayaraq yoxlayır.
 *
 * `path.resolve` burada yararsızdır: `/`-dən yuxarı çıxa bilmədiyi üçün
 * `resolve('/', 'src', '../../x')` → `/x` verir və pozuntunu udur.
 */
export function escapesRoot(fileDir, path) {
  const segments = [
    ...toPosixPath(fileDir).split('/').filter(Boolean),
    ...path.split('/'),
  ]

  let depth = 0
  for (const s of segments) {
    if (s === '..') {
      depth -= 1
      if (depth < 0) return true
    } else if (s !== '.' && s !== '') {
      depth += 1
    }
  }

  return false
}

/** Qovluğu skan edir; `{ file, line, path }` siyahısı qaytarır. */
export function scanDirectory(root) {
  const findings = []

  const walk = (dir) => {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const relativePath = toPosixPath(relative(root, fullPath))

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRS.some((q) => relativePath === q || relativePath.startsWith(`${q}/`))) continue
        walk(fullPath)
        continue
      }

      if (!SCANNED_EXTENSIONS.includes(extname(relativePath))) continue
      if (TEST_FILE_PATTERN.test(relativePath)) continue

      try {
        if (statSync(fullPath).size > 1_000_000) continue
      } catch {
        continue
      }

      let text
      try {
        text = readFileSync(fullPath, 'utf8')
      } catch {
        continue
      }

      const fileDir = relativePath.includes('/') ? relativePath.slice(0, relativePath.lastIndexOf('/')) : ''

      for (const t of relativePaths(text)) {
        if (escapesRoot(fileDir, t.path)) {
          findings.push({ ...t, file: relativePath })
        }
      }
    }
  }

  walk(root)
  return findings
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const thisFile = fileURLToPath(import.meta.url)

if (process.argv[1] && toPosixPath(process.argv[1]) === toPosixPath(thisFile)) {
  const root = process.argv[2] ?? process.cwd()
  const findings = scanDirectory(root)

  if (findings.length === 0) {
    console.log('✓ self-contained — kökdən kənara istinad yoxdur')
    process.exit(0)
  }

  console.error(`\n✖ self-contained pozulub — ${findings.length} istinad kökdən kənara çıxır:\n`)
  for (const t of findings) {
    console.error(`  ${t.file}:${t.line}  ${t.path}`)
  }
  console.error(
    '\n  Şablon başqa repo-ya kök qovluq kimi köçürülür (FR-001) — belə istinad köçürmədən sonra qırılır.\n',
  )
  process.exit(1)
}
