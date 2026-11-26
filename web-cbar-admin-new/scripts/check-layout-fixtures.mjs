#!/usr/bin/env node
// `npm run verify` step: the structured layout fixtures must be identical in the public site and in
// the admin panel, like `Cbar.Domain` in the two APIs. The site parses them, the editor must not
// change them (`specs/024-about-us-redesign/contracts/cms-markup.md` §7).
//
// Upstream each component is its own repository, so the other one is missing in its CI and the
// check is skipped there. It runs wherever both components are checked out side by side.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OWN_FIXTURES = join(ROOT, 'src/features/rich-text/fixtures/layouts')
const OTHER_COMPONENT = join(ROOT, '..', 'web-cbar-new')
const OTHER_FIXTURES = join(OTHER_COMPONENT, 'src/features/about-content/fixtures')

if (!existsSync(OTHER_COMPONENT)) {
  console.log('check:layout-fixtures: the other component is not checked out, skipped')
  process.exit(0)
}

const list = (dir) => (existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.html')) : [])
const read = (dir, file) => readFileSync(join(dir, file), 'utf8').replace(/\r\n/g, '\n')

const own = list(OWN_FIXTURES)
const other = list(OTHER_FIXTURES)
const problems = [
  ...own.filter((file) => !other.includes(file)).map((file) => `${file}: missing in ${OTHER_FIXTURES}`),
  ...other.filter((file) => !own.includes(file)).map((file) => `${file}: missing in ${OWN_FIXTURES}`),
  ...own
    .filter((file) => other.includes(file) && read(OWN_FIXTURES, file) !== read(OTHER_FIXTURES, file))
    .map((file) => `${file}: differs between the two components`),
]

if (own.length === 0) problems.push(`no fixtures in ${OWN_FIXTURES}`)

if (problems.length > 0) {
  console.error('check:layout-fixtures failed:')
  problems.forEach((problem) => console.error(`  ${problem}`))
  process.exit(1)
}

console.log(`check:layout-fixtures: ${own.length} fixtures match`)
