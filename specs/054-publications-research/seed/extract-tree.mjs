// Spec 054 T067: reads today's titles and texts of the pages the tree seed touches from the test API and joins them with
// figma-texts.json into tree.json: for every new intro the legacy text's md5 (the seed writes only over it).
//
//   node specs/054-publications-research/seed/extract-tree.mjs [--api=https://api-cbar-test.cbar.az]
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const here = new URL('.', import.meta.url)
const api = (process.argv.find((a) => a.startsWith('--api=')) ?? '--api=https://api-cbar-test.cbar.az').slice('--api='.length)
const figma = JSON.parse(readFileSync(new URL('figma-texts.json', here), 'utf8'))

const md5 = (text) => createHash('md5').update(text ?? '', 'utf8').digest('hex')

/** en slug of an az page: the tree of the locale gives the page id, the id gives the en slug. */
async function tree(locale) {
  const res = await fetch(`${api}/api/v1/pages/tree?locale=${locale}`)
  if (!res.ok) throw new Error(`tree ${locale}: ${res.status}`)
  const flat = []
  const walk = (nodes) => nodes.forEach((n) => { flat.push(n); walk(n.children ?? []) })
  walk(await res.json())
  return flat
}

async function page(locale, slug) {
  const res = await fetch(`${api}/api/v1/pages/${encodeURIComponent(slug)}?locale=${locale}`)
  return res.ok ? res.json() : null
}

const [az, en] = await Promise.all([tree('az'), tree('en')])
const enSlug = (azSlug) => {
  const node = az.find((n) => n.slug === azSlug)
  return node ? en.find((n) => n.id === node.id)?.slug ?? null : null
}

const intros = []
for (const intro of figma.intros) {
  const out = { slug: intro.slug, node: intro.node, locales: {} }
  for (const [locale, slug, text] of [['az', intro.slug, intro.az], ['en', enSlug(intro.slug), intro.en]]) {
    if (!slug) continue
    const current = await page(locale, slug)
    if (!current) continue
    out.locales[locale] = { legacyMd5: md5(current.content), intro: text }
  }
  intros.push(out)
}

const result = { source: api, extractedAt: new Date().toISOString().slice(0, 10), ...figma, intros }
writeFileSync(new URL('tree.json', here), JSON.stringify(result, null, 2) + '\n')
for (const i of intros) console.log(i.slug, Object.entries(i.locales).map(([l, v]) => `${l}=${v.legacyMd5}`).join(' '))
