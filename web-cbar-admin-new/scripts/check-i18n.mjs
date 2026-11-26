// i18n tamlıq qapısı (spec 001-admin-template-migration, SC-008, FR-008):
//  1. `src/locales/az/<ns>.json` və `src/locales/en/<ns>.json` fayl dəstləri eynidir;
//  2. hər namespace-də açar dəstləri (dərin yollar) eynidir;
//  3. boş string dəyər yoxdur.
// Uğursuzluqda exit 1. İstifadə: npm run check:i18n

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

const ROOT = join(process.cwd(), 'src', 'locales')
const LANGS = ['az', 'en']

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object'
      ? flatten(v, `${prefix}${k}.`)
      : [[`${prefix}${k}`, v]],
  )

const problems = []
const files = Object.fromEntries(
  LANGS.map((l) => [
    l,
    new Set(readdirSync(join(ROOT, l)).filter((f) => f.endsWith('.json'))),
  ]),
)

for (const f of files.az) if (!files.en.has(f)) problems.push(`en/${f} yoxdur`)
for (const f of files.en) if (!files.az.has(f)) problems.push(`az/${f} yoxdur`)

for (const f of files.az) {
  if (!files.en.has(f)) continue
  const az = new Map(
    flatten(JSON.parse(readFileSync(join(ROOT, 'az', f), 'utf8'))),
  )
  const en = new Map(
    flatten(JSON.parse(readFileSync(join(ROOT, 'en', f), 'utf8'))),
  )
  for (const [k, v] of az) {
    if (!en.has(k)) problems.push(`en/${f}: "${k}" yoxdur`)
    if (typeof v === 'string' && v.trim() === '')
      problems.push(`az/${f}: "${k}" boşdur`)
  }
  for (const [k, v] of en) {
    if (!az.has(k)) problems.push(`az/${f}: "${k}" yoxdur`)
    if (typeof v === 'string' && v.trim() === '')
      problems.push(`en/${f}: "${k}" boşdur`)
  }
}

if (problems.length > 0) {
  console.error(`✗ check:i18n — ${problems.length} problem:`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
console.log(
  `✓ check:i18n — ${files.az.size} namespace, az/en açar dəstləri eynidir.`,
)
