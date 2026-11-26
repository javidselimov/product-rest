#!/usr/bin/env node
// Spec 053, T047: turns the legacy FinCERT CMS page (slug `fincert`, page 133) into structured JSON for the 0037 seed.
//
//   node extract.mjs [dir]       # dir holds fincert-az.json and fincert-en.json (GET /api/v1/pages/fincert?locale=…);
//                                # default: fetch both from the test API
//
// Legacy markup (research R10):
//   az  <p><strong>FinCERT-in missiyası</strong></p><p>mission … Bu məqsədlə …</p>, then one-item
//       <ol><li><strong> Title</strong></li></ol> per section (the strong may be split: "Y" + "üksək …"), body up to the next one
//   en  <h2>Mission of FinCERT</h2><p>mission … To this end …</p>, then <h3>N. Title</h3> per section
// The first four sections are the activity directions; then contacts, the portal and RFC-2350.
// Fails when the result does not match the SC-002 baseline (.tmp-053/baseline.json), so no item is lost silently.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TEST_API = 'https://api-cbar-test.cbar.az/api/v1/pages/fincert?locale='
const BASELINE = join(HERE, '../../../.tmp-053/baseline.json')
const DIRECTION_COUNT = 4

/** Figma texts of the portal card (az); en keeps the legacy translation (research R10). */
const PORTAL_AZ = {
  title: 'Vahid Elektron Hesabatlılıq Portalı',
  description: 'Yüksək kateqoriyalı insidentlər üzrə hesabatlar nəzarət subyektləri tərəfindən Mərkəzi Banka bu portal vasitəsilə göndərilir.',
}
const MISSION_CUT = { az: 'Bu məqsədlə', en: 'To this end' }
const MARKER = {
  az: /<ol><li>(?:<p>)?((?:<strong>[\s\S]*?<\/strong>)+)(?:<\/p>)?<\/li>\s*<\/ol>/g,
  en: /<h3>([\s\S]*?)<\/h3>/g,
}

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' }
function plainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? e)
    .replace(/[\s ]+/g, ' ')
    .trim()
}

/** `(+994 12) 437 00 97`, the Figma form, from the legacy digits. */
function figmaPhone(text) {
  const digits = text.replace(/\D/g, '')
  const m = /^994(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(digits)
  if (!m) throw new Error(`unexpected phone: ${text}`)
  return `(+994 ${m[1]}) ${m[2]} ${m[3]} ${m[4]}`
}

export function extract(locale, content) {
  const markers = [...content.matchAll(MARKER[locale])]
  if (markers.length < DIRECTION_COUNT) throw new Error(`${locale}: ${markers.length} section headings, ${DIRECTION_COUNT}+ expected`)

  // Mission: the paragraph before the first section heading, up to "To this end" / "Bu məqsədlə".
  const intro = content.slice(0, markers[0].index)
  const paragraphs = [...intro.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => plainText(m[1])).filter(Boolean)
  const missionParagraph = paragraphs.find((p) => p.includes(MISSION_CUT[locale]))
  if (!missionParagraph) throw new Error(`${locale}: mission paragraph not found`)
  const mission = missionParagraph.slice(0, missionParagraph.indexOf(MISSION_CUT[locale])).trim()

  const sections = markers.map((m, i) => ({
    title: plainText(m[1]).replace(/^\d+\.\s*/, ''),
    body: content.slice(m.index + m[0].length, markers[i + 1]?.index ?? content.length).trim(),
  }))
  const directions = sections.slice(0, DIRECTION_COUNT)
  for (const d of directions) if (!/<p>/.test(d.body)) throw new Error(`${locale}: direction "${d.title}" has no paragraph`)

  const rest = sections.slice(DIRECTION_COUNT).map((s) => s.body).join('\n')
  const email = /href="mailto:([^"]+)"/.exec(rest)?.[1]
  const phoneText = /\(\+994[\s ]12\)[\s\S]*?\d{7}/.exec(plainText(rest))?.[0]
  const portalUrl = /href="(https?:\/\/portal\.[^"]+)"/.exec(rest)?.[1]
  const rfcUrl = /href="(https?:\/\/[^"]+\.pdf)"/.exec(rest)?.[1]
  if (!email || !phoneText || !portalUrl || !rfcUrl) throw new Error(`${locale}: contacts, portal or RFC link missing`)

  // en portal card: the quoted name is the title, the sentence the description.
  const portalSection = sections.find((s) => s.body.includes(portalUrl))
  const portalSentence = plainText(/<p>([\s\S]*?)<\/p>/.exec(portalSection?.body ?? '')?.[1] ?? '')
  const portal =
    locale === 'az'
      ? { url: portalUrl, ...PORTAL_AZ }
      : { url: portalUrl, title: /["“]([^"”]+)["”]/.exec(portalSentence)?.[1] ?? '', description: portalSentence }
  if (!portal.title || !portal.description) throw new Error(`${locale}: portal text missing`)

  return {
    mission,
    directions,
    email,
    phone: figmaPhone(phoneText),
    portal,
    rfc: { legacyName: rfcUrl.split('/').pop(), url: rfcUrl },
  }
}

function checkBaseline(locale, data) {
  if (!existsSync(BASELINE)) {
    console.warn(`no baseline at ${BASELINE}; run .tmp-053/baseline.mjs first for the SC-002 check`)
    return
  }
  const base = JSON.parse(readFileSync(BASELINE, 'utf8'))[locale]
  const items = data.directions.map((d) => (d.body.match(/<li>/g) ?? []).length)
  const problems = []
  if (data.directions.length !== base.directions) problems.push(`directions ${data.directions.length} ≠ ${base.directions}`)
  if (items.join() !== base.directionItems.join()) problems.push(`list items ${items} ≠ ${base.directionItems}`)
  if (data.email !== base.email) problems.push(`email ${data.email} ≠ ${base.email}`)
  if (data.portal.url !== base.portal) problems.push(`portal ${data.portal.url} ≠ ${base.portal}`)
  if (data.rfc.url !== base.rfc) problems.push(`rfc ${data.rfc.url} ≠ ${base.rfc}`)
  if (data.phone.replace(/\D/g, '') !== base.phoneDigits) problems.push(`phone ${data.phone} ≠ ${base.phoneDigits}`)
  if (problems.length) throw new Error(`${locale}: baseline mismatch — ${problems.join('; ')}`)
}

async function load(locale, dir) {
  if (dir) return JSON.parse(readFileSync(join(dir, `fincert-${locale}.json`), 'utf8'))
  const res = await fetch(`${TEST_API}${locale}`)
  if (!res.ok) throw new Error(`${locale}: test API ${res.status}`)
  return res.json()
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2]
  for (const locale of ['az', 'en']) {
    const page = await load(locale, dir)
    const data = extract(locale, page.content)
    checkBaseline(locale, data)
    writeFileSync(join(HERE, `fincert-${locale}.json`), `${JSON.stringify(data, null, 2)}\n`)
    console.log(
      `${locale}: mission ok, directions ${data.directions.length}, email ${data.email}, phone ${data.phone}, rfc ${data.rfc.legacyName}`,
    )
  }
}
