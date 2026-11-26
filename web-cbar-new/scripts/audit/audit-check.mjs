#!/usr/bin/env node
// `npm run audit` və CI gate-i — `npm audit --audit-level=high` + sənədləşdirilmiş istisnalar
// (konstitusiya X.4, D-qeyd: docs/audit-exceptions.md).
//
// npm-in öz "ignore" mexanizmi yoxdur. Bu skript `npm audit --json`-u oxuyur və yalnız
// `exceptions.json`-dakı advisory-ni buraxır — o da üç şərtlə:
//   * advisory id-si və paket adı qeydlə üst-üstə düşür;
//   * paketin lockfile-dakı **bütün** surətləri `dev: true`-dur (image-ə düşmür);
//   * `reviewBy` tarixi keçməyib.
// Qalan istənilən high/critical tapıntı exit 1 verir. Əlavə arqumentlər (`--omit=optional`)
// `npm audit`-ə ötürülür.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Gate-i qıran severity-lər (`--audit-level=high` ilə eyni). */
export const BLOCKING_SEVERITIES = Object.freeze(['high', 'critical'])

const advisoryId = (url) => url?.match(/GHSA-[\w-]+$/)?.[0] ?? url

/**
 * `npm audit --json` hesabatından birbaşa advisory-ləri çıxarır. Transitiv qeydlər
 * (`via` sətir olanda) ayrıca sayılmır — onlar kök advisory həll olunanda öz-özünə düşür.
 */
export function collectAdvisories(report) {
  const byKey = new Map()
  for (const vuln of Object.values(report.vulnerabilities ?? {})) {
    for (const via of vuln.via ?? []) {
      if (
        typeof via !== 'object' ||
        !BLOCKING_SEVERITIES.includes(via.severity)
      )
        continue
      const id = advisoryId(via.url)
      const key = `${via.name}:${id}`
      if (!byKey.has(key)) {
        byKey.set(key, {
          id,
          package: via.name,
          severity: via.severity,
          title: via.title,
          nodes: vuln.nodes ?? [],
        })
      }
    }
  }
  return [...byKey.values()]
}

/** Advisory-ni istisnalara qarşı yoxlayır; `{ allowed, reason }` qaytarır. */
export function evaluate(advisory, { exceptions, lockPackages, today }) {
  const entry = exceptions.find(
    (e) => e.id === advisory.id && e.package === advisory.package,
  )
  if (!entry) return { allowed: false, reason: 'istisna siyahısında yoxdur' }
  if (today > entry.reviewBy) {
    return {
      allowed: false,
      reason: `istisnanın müddəti bitib (reviewBy ${entry.reviewBy}) — yenidən baxın`,
    }
  }
  const prodNodes = advisory.nodes.filter((node) => !lockPackages[node]?.dev)
  if (advisory.nodes.length === 0 || prodNodes.length > 0) {
    return {
      allowed: false,
      reason: `production asılılığıdır: ${prodNodes.join(', ') || '(node yoxdur)'}`,
    }
  }
  return {
    allowed: true,
    reason: `istisna (dev-only, reviewBy ${entry.reviewBy})`,
  }
}

/** Artıq heç bir tapıntıya uyğun gəlməyən istisnalar — silinməlidir. */
export function staleExceptions(exceptions, advisories) {
  return exceptions.filter(
    (e) => !advisories.some((a) => a.id === e.id && a.package === e.package),
  )
}

function runNpmAudit(extraArgs) {
  const args = ['audit', '--json', ...extraArgs]
  const npmCli = process.env.npm_execpath
  const r = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
      })
    : spawnSync('npm', args, {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        shell: process.platform === 'win32',
      })
  if (r.error) throw r.error
  const report = JSON.parse(r.stdout)
  if (report.error)
    throw new Error(
      `npm audit xətası: ${report.error.summary ?? JSON.stringify(report.error)}`,
    )
  return report
}

function main() {
  const root = process.cwd()
  const { exceptions } = JSON.parse(
    readFileSync(join(import.meta.dirname, 'exceptions.json'), 'utf8'),
  )
  const lockPackages =
    JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
      .packages ?? {}
  const today = new Date().toISOString().slice(0, 10)

  let report
  try {
    report = runNpmAudit(process.argv.slice(2))
  } catch (error) {
    console.error(`✗ npm audit icra olunmadı: ${error.message}`)
    return 1
  }

  const advisories = collectAdvisories(report)
  let blocked = 0
  for (const advisory of advisories) {
    const { allowed, reason } = evaluate(advisory, {
      exceptions,
      lockPackages,
      today,
    })
    if (!allowed) blocked += 1
    console.log(
      `${allowed ? '~' : '✗'} ${advisory.severity} ${advisory.package} ${advisory.id} — ${reason}`,
    )
  }
  for (const entry of staleExceptions(exceptions, advisories)) {
    console.log(
      `ℹ ${entry.package} ${entry.id} artıq tapılmır — exceptions.json-dan silin`,
    )
  }

  if (blocked > 0) {
    console.error(
      `✗ ${blocked} high/critical tapıntı. Düzəldin və ya docs/audit-exceptions.md üzrə sənədləşdirin.`,
    )
    return 1
  }
  console.log('✓ npm audit: bloklayan high/critical tapıntı yoxdur')
  return 0
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exit(main())
}
