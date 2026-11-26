#!/usr/bin/env node
// Spec 051, T001–T002: turns the legacy FAQ CMS page (slug `sual-cavab`) into structured JSON for the 0033 seed.
//
//   node extract-faq.mjs [page.json]        # default: fetch the az page from the test API
//
// Legacy markup (the old Yii2 editor, imported as is):
//   <details data-accordion=""><summary>Topic</summary><div data-type="details-content"> … </div></details>   one per topic
//   <ol><li><strong>Question</strong></li></ol>                                                               one per question
//   …everything up to the next question is the answer…
// Two variants exist and are handled: the question wrapped in <p> (<li><p><strong>), and an answer written in the same
// <li> after the question (<li><strong>Q<br/></strong>Answer</li>). A multi-item <ol> is answer content, not a question.
// After the last topic: <h2>Video sual-cavab</h2>, YouTube iframes and a "Playlist" link (dropped, spec 051 clarify).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TEST_API = 'https://api-cbar-test.cbar.az/api/v1/pages/sual-cavab?locale=az'
// Figma title of the only legacy video; used when YouTube oEmbed cannot be reached.
const FALLBACK_VIDEO_TITLE = 'Sığorta hadisəsi zamanı zərərlərin birbaşa tənzimlənməsi'
// Obvious typos in the legacy topic names, fixed as in the Figma design.
const NAME_FIXES = { 'Mərkəzi Banka müraciət və qəbul məsələlərina dair': 'Mərkəzi Banka müraciət və qəbul məsələlərinə dair' }

const AZ_MAP = { ə: 'e', Ə: 'e', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ü: 'u', Ü: 'u', ş: 's', Ş: 's', ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g' }

/** Same rule as Cbar.Domain `Slug.From`. */
export function slugFrom(title) {
  const mapped = [...title].map((ch) => AZ_MAP[ch] ?? ch.toLowerCase()).join('')
  return mapped.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-')
}

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' }
function plainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e] ?? e)
    .replace(/\s+/g, ' ')
    .trim()
}

const TOPIC = /<details[^>]*><summary>([\s\S]*?)<\/summary><div data-type="details-content">([\s\S]*?)<\/div><\/details>/g
// A one-item <ol> whose item starts with <strong> (optionally inside <p>): the question marker.
const QUESTION = /<ol><li>(?:<p>)?<strong>((?:(?!<\/strong>)[\s\S])*)<\/strong>((?:(?!<li[ >])[\s\S])*?)<\/li>\s*<\/ol>/g

function cleanAnswer(html) {
  return html
    .replace(/^(\s|<p>\s*<\/p>)+/, '')
    .replace(/(\s|<p>\s*<\/p>)+$/, '')
}

function parseTopic(rawName, body, warnings) {
  const legacyName = plainText(rawName)
  const name = NAME_FIXES[legacyName] ?? legacyName
  const markers = [...body.matchAll(QUESTION)]
  const intro = markers.length ? body.slice(0, markers[0].index).trim() : body.trim()
  // The model has no topic intro; legacy content has none. Fail loudly rather than drop text silently.
  if (intro) warnings.push(`"${name}": text before the first question is not migrated: ${plainText(intro).slice(0, 80)}…`)

  const questions = markers.map((m, i) => {
    const end = i + 1 < markers.length ? markers[i + 1].index : body.length
    const inline = plainText(m[2].replace(/<\/p>/g, ''))
    const rest = cleanAnswer(body.slice(m.index + m[0].length, end))
    const answer = cleanAnswer((inline ? `<p>${inline}</p>\n` : '') + rest)
    const question = plainText(m[1]).replace(/^\d+[.)]\s*/, '')
    if (!answer) warnings.push(`"${name}" #${i + 1}: empty answer`)
    return { question, answer }
  })
  return { slug: slugFrom(name), name, legacyName, questions }
}

async function videoTitle(url) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`)
    if (res.ok) return (await res.json()).title
  } catch {
    // offline or blocked — fall back below
  }
  return FALLBACK_VIDEO_TITLE
}

async function main() {
  const source = process.argv[2]
  const page = source ? JSON.parse(readFileSync(source, 'utf8')) : await (await fetch(TEST_API)).json()
  const html = page.content
  const warnings = []

  const topics = [...html.matchAll(TOPIC)].map(([, name, body]) => parseTopic(name, body, warnings))
  const tail = html.slice(html.lastIndexOf('</details>'))
  const ids = [...tail.matchAll(/youtube\.com\/embed\/([\w-]{6,})/g)].map((m) => m[1])
  const videos = []
  for (const id of [...new Set(ids)]) {
    const url = `https://www.youtube.com/watch?v=${id}`
    videos.push({ url, title: await videoTitle(url) })
  }

  // Independent count (T001 baseline): one-item <ol> starting with <strong>, any wrapper.
  const baseline = [...html.matchAll(TOPIC)].map(([, , body]) =>
    [...body.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/g)].filter(
      ([, inner]) => (inner.match(/<li[ >]/g) ?? []).length === 1 && /^\s*<li>\s*(<p>\s*)?<strong>/.test(inner),
    ).length,
  )
  const mismatch = topics.filter((t, i) => t.questions.length !== baseline[i])
  for (const t of topics) console.log(`${String(t.questions.length).padStart(3)}  ${t.name}  (${t.slug})`)
  console.log(`videos: ${videos.map((v) => v.title).join(' | ')}`)
  for (const w of warnings) console.warn(`warn: ${w}`)
  if (topics.length === 0 || mismatch.length) {
    console.error(`count mismatch: ${mismatch.map((t) => t.name).join(', ') || 'no topics'}`)
    process.exit(1)
  }

  writeFileSync(join(HERE, 'faq-az.json'), `${JSON.stringify({ topics, videos }, null, 2)}\n`, 'utf8')
  writeFileSync(
    join(HERE, 'counts.json'),
    `${JSON.stringify(Object.fromEntries(topics.map((t, i) => [t.slug, baseline[i]])), null, 2)}\n`,
    'utf8',
  )
  console.log(`written: faq-az.json (${topics.reduce((n, t) => n + t.questions.length, 0)} questions), counts.json`)
}

await main()
