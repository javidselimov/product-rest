#!/usr/bin/env node
// `npm run setup:check` — əvəzlənməmiş placeholder axtarır (FR-054, SC-007).
//
// `npm run verify`-ın **birinci** addımıdır: şablondan yaranan layihə deploy
// edilməzdən əvvəl heç bir `<UPPER_SNAKE>` qalmamalıdır.
//
// Tapıntı formatı:  fayl:sətir  <ACAR>  — izah
// Tapıntı varsa exit kodu 1.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  IGNORE_MARKER,
  PLACEHOLDER_REGEX,
  SCANNED_EXTENSIONS,
  KNOWN_KEYS,
  EXCLUDED_FILES,
  EXCLUDED_DIRS,
  keyDescription,
} from './registry.mjs'

/** Mətn faylının sətirlərində placeholder axtarır. */
export function findInText(text) {
  const findings = []

  text.split(/\r?\n/).forEach((line, index) => {
    if (line.includes(IGNORE_MARKER)) return

    // `lastIndex` paylaşılmasın deyə hər sətir üçün yeni regex.
    const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g')
    let match = regex.exec(line)

    while (match !== null) {
      const key = match[1]
      findings.push({
        line: index + 1,
        key,
        known: KNOWN_KEYS.includes(key),
        description: keyDescription(key),
      })
      match = regex.exec(line)
    }
  })

  return findings
}

const toPosixPath = (p) => p.split(sep).join('/')

function isScanned(relativePath) {
  const path = toPosixPath(relativePath)
  if (EXCLUDED_FILES.includes(path)) return false
  if (EXCLUDED_DIRS.some((q) => path === q || path.startsWith(`${q}/`))) return false

  const extension = extname(path)
  // Uzantısız fayllar (LICENSE, Dockerfile, .husky/pre-commit) da skan olunur.
  return extension === '' || SCANNED_EXTENSIONS.includes(extension)
}

/** Qovluğu rekursiv skan edir; `root`-ə nisbi yollarla tapıntı qaytarır. */
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

      if (!isScanned(relativePath)) continue

      // Böyük binar fayla düşməmək üçün ölçü hədd-i (1 MB).
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

      for (const t of findInText(text)) {
        findings.push({ ...t, file: relativePath })
      }
    }
  }

  walk(root)
  return findings
}

/** `fayl:sətir  <ACAR>  — izah` sətirləri. */
export function report(findings) {
  return findings
    .map((t) => `  ${t.file}:${t.line}  <${t.key}>  — ${t.description}`)
    .join('\n')
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const thisFile = fileURLToPath(import.meta.url)
const isDirectRun = process.argv[1] && toPosixPath(process.argv[1]) === toPosixPath(thisFile)

/**
 * Şablonun **öz** repo-sundayıqmı?
 *
 * `package.json#name` hələ `next-template`-dirsə, placeholder-lər qəsdən yerindədir:
 * bu, şablonun normal vəziyyətidir və `npm run verify` bunun ucbatından qırılmamalıdır
 * (T122 ↔ FR-054 gərginliyinin həlli). `npm run setup` adı dəyişən kimi yoxlama
 * sərtləşir. `--strict` bunu üstələyir — quickstart §9 məhz onunla nümayiş etdirilir.
 */
export function isTemplateMode(root) {
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    return pkg.name === 'next-template'
  } catch {
    return false
  }
}

if (isDirectRun) {
  const argv = process.argv.slice(2)
  const strict = argv.includes('--strict')
  const root = argv.find((a) => !a.startsWith('--')) ?? process.cwd()

  const findings = scanDirectory(root)

  if (findings.length === 0) {
    console.log('✓ setup:check — əvəzlənməmiş placeholder yoxdur')
    process.exit(0)
  }

  const unknownCount = findings.filter((t) => !t.known).length
  const isTemplate = !strict && isTemplateMode(root)

  const head = isTemplate
    ? `\n• setup:check — şablon rejimi: ${findings.length} placeholder gözlənildiyi kimi yerindədir:\n`
    : `\n✖ setup:check — ${findings.length} əvəzlənməmiş placeholder tapıldı:\n`

  const output = isTemplate ? console.log : console.error
  output(head)
  output(report(findings))
  output('\n  Əvəzləmək üçün:  npm run setup')

  if (unknownCount > 0) {
    output(
      `  Qeyd: ${unknownCount} açar registrdə yoxdur — ya səhv yazılıb, ya da scripts/setup/registry.mjs yenilənməlidir.`,
    )
  }

  if (isTemplate) {
    output('  (package.json#name hələ `next-template`-dir — sərt yoxlama üçün: --strict)\n')
    process.exit(0)
  }

  output('')
  process.exit(1)
}
