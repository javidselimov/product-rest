#!/usr/bin/env node
// `npm run verify` step (spec 060, FR-019): the desktop org-chart layout code is copied byte for byte into the
// admin panel, like `Cbar.Domain` in the two APIs, so the panel's "Sxem" view places every card where the site does.
// A change here must be copied to `web-cbar-admin-new/src/features/org-chart/chart/` in the same change.
//
// Upstream each component is its own repository, so the other one is missing in its CI and the check is skipped
// there. It runs wherever both components are checked out side by side.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OTHER_COMPONENT = join(ROOT, '..', 'web-cbar-admin-new')

/** [this component's original, the panel's copy] */
const PAIRS = [
  ['src/entities/org-chart/constants.ts', 'src/features/org-chart/chart/constants.ts'],
  ['src/entities/org-chart/model/layout.ts', 'src/features/org-chart/chart/model/layout.ts'],
]

if (!existsSync(OTHER_COMPONENT)) {
  console.log('check:chart-layout: the other component is not checked out, skipped')
  process.exit(0)
}

const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8').replace(/\r\n/g, '\n') : null)

const problems = PAIRS.flatMap(([own, other]) => {
  const a = read(join(ROOT, own))
  const b = read(join(OTHER_COMPONENT, other))
  if (a === null) return [`${own}: missing`]
  if (b === null) return [`web-cbar-admin-new/${other}: missing`]
  return a === b ? [] : [`${own} differs from web-cbar-admin-new/${other}`]
})

if (problems.length > 0) {
  console.error('check:chart-layout failed (copy this file over the panel one):')
  problems.forEach((problem) => console.error(`  ${problem}`))
  process.exit(1)
}

console.log(`check:chart-layout: ${PAIRS.length} files match`)
