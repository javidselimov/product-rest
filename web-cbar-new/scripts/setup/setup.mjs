#!/usr/bin/env node
// `npm run setup` — şablonu yeni layihəyə uyğunlaşdırır (FR-053, R-012).
//
// Registrdəki hər açar üçün bir sual verir, sonra bütün mətn fayllarını gəzib
// `<ACAR>` formasını cavabla əvəzləyir. Fayllar **UTF-8 qoruyaraq** yazılır
// (Maddə I.5) — shell redirection istifadə edilmir.
//
// `package.json#name` də yenilənir: o, placeholder deyil (əks halda `npm ci`
// heç kimin maşınında işləməzdi), amma layihə adı dəyişəndə o da dəyişməlidir.

import { readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { join } from 'node:path'
import { stdin, stdout } from 'node:process'

import { PLACEHOLDERS } from './registry.mjs'
import { scanDirectory } from './setup-check.mjs'

const root = process.argv[2] ?? process.cwd()

/** Skan mərhələsi hansı açarların həqiqətən mövcud olduğunu deyir. */
function existingKeys() {
  return new Set(scanDirectory(root).map((t) => t.key))
}

function updatePackageName(newName) {
  const path = join(root, 'package.json')
  const text = readFileSync(path, 'utf8')
  const pkg = JSON.parse(text)

  if (pkg.name === newName) return false

  pkg.name = newName
  // Sondakı sətir sonu saxlanılır ki, diff yalnız bir sətir olsun.
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  return true
}

function applyReplacements(answers) {
  const findings = scanDirectory(root)
  const files = [...new Set(findings.map((t) => t.file))]
  let count = 0

  for (const relativePath of files) {
    const path = join(root, relativePath)
    const text = readFileSync(path, 'utf8')
    let updated = text

    for (const [key, value] of Object.entries(answers)) {
      const parts = updated.split(`<${key}>`)
      if (parts.length > 1) {
        count += parts.length - 1
        updated = parts.join(value)
      }
    }

    if (updated !== text) writeFileSync(path, updated, 'utf8')
  }

  return { files: files.length, count }
}

async function main() {
  const existing = existingKeys()
  const toAsk = PLACEHOLDERS.filter((p) => existing.has(p.key))

  if (toAsk.length === 0) {
    console.log('✓ Əvəzlənəcək placeholder qalmayıb — setup artıq icra olunub.')
    return
  }

  console.log('\nŞablonu updated layihəyə uyğunlaşdırırıq.')
  console.log('Boş buraxsanız nümunə dəyər götürülür; ləğv etmək üçün Ctrl+C.\n')

  const rl = createInterface({ input: stdin, output: stdout })
  const answers = {}

  try {
    for (const p of toAsk) {
      const answer = (await rl.question(`  ${p.question} [${p.example}]: `)).trim()
      answers[p.key] = answer === '' ? p.example : answer
    }
  } finally {
    rl.close()
  }

  const result = applyReplacements(answers)
  const nameChanged = answers.PROJECT_NAME ? updatePackageName(answers.PROJECT_NAME) : false

  console.log(`\n✓ ${result.count} əvəzləmə, ${result.files} fayl.`)
  if (nameChanged) console.log(`✓ package.json#name → ${answers.PROJECT_NAME}`)

  console.log('\nSonrakı addımlar:')
  console.log('  npm run setup:check   # qalıq qalmadığını təsdiqlə')
  console.log('  npm run verify        # tam gate\n')
}

await main()
