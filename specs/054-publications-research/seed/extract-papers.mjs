// Spec 054 US6, T084: reads the legacy working papers from the old site and writes seed/working-papers.json.
//
// The list of papers is the legacy link list in the CMS page `isci-meqaleler-silsilesi` / `working-paper-series`
// (read from the test public API). Every `page-<id>` is then read from the old site in az and en. The old site is
// test.cbar.az by default (the test copy of the Yii2 site); `--source=https://www.cbar.az` reads production instead.
// Pages are cached in .tmp-pubs/wp-src/, so a rerun does not hit the site again (`--refresh` refetches).
//
//   node specs/054-publications-research/seed/extract-papers.mjs [--source=https://test.cbar.az] [--api=https://api-cbar-test.cbar.az] [--refresh]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../../..')
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback
const SOURCE = arg('source', 'https://test.cbar.az').replace(/\/$/, '')
const API = arg('api', 'https://api-cbar-test.cbar.az').replace(/\/$/, '')
const REFRESH = process.argv.includes('--refresh')
const CACHE = path.join(root, '.tmp-pubs', 'wp-src')
const OUT = path.join(here, 'working-papers.json')
const DELAY_MS = 600
const USER_AGENT = 'cbar-seed-extract/1.0'
const LIST_SLUG = { az: 'isci-meqaleler-silsilesi', en: 'working-paper-series' }

// Label (lower case, without the colon) → field. Both locales of the old site.
const LABELS = {
  'tədqiqatın adı': 'title', 'title': 'title', 'title of the research': 'title', 'research title': 'title', 'name of the research': 'title',
  'nömrə': 'number', 'number': 'number', 'no': 'number', 'serial number': 'number', 'seriya nömrəsi': 'number',
  'müəlliflər': 'authors', 'müəllif': 'authors', 'authors': 'authors', 'author': 'authors', 'author(s)': 'authors', 'müəllif(lər)': 'authors',
  'dil': 'language', 'language': 'language',
  'tarix': 'date', 'date': 'date', 'il': 'date', 'year': 'date',
  'xülasə': 'abstract', 'abstract': 'abstract', 'summary': 'abstract', 'annotasiya': 'abstract',
  'açar sözlər': 'keywords', 'keywords': 'keywords', 'key words': 'keywords',
  'jel təsnifatı': 'jel', 'jel classification': 'jel', 'jel': 'jel', 'jel codes': 'jel', 'jel kodları': 'jel',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ouml: 'ö', Ouml: 'Ö', uuml: 'ü', Uuml: 'Ü', ccedil: 'ç', Ccedil: 'Ç', laquo: '«', raquo: '»', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…' }
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n] ?? m)
const text = (html) => decode(html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').trim()

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

async function legacyLinks(locale) {
  const page = JSON.parse(await get(`${API}/api/v1/pages/${LIST_SLUG[locale]}?locale=${locale}`))
  const links = [...(page.content ?? '').matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]))
  return links.map((href) => ({ href, id: Number(href.match(/page-(\d+)/)?.[1]) })).filter((l) => l.id)
}

async function legacyPage(id, slug, locale) {
  fs.mkdirSync(CACHE, { recursive: true })
  const file = path.join(CACHE, `${id}-${locale}.html`)
  if (!REFRESH && fs.existsSync(file)) return fs.readFileSync(file, 'utf8')
  const html = await get(`${SOURCE}/page-${id}/${slug}?language=${locale}`)
  fs.writeFileSync(file, html)
  await sleep(DELAY_MS)
  return html
}

/** The content block (`#urlEncode`) up to the download block, and the download items. */
function parse(html) {
  const start = html.indexOf('id="urlEncode"')
  if (start < 0) return null
  const body = html.slice(html.indexOf('>', start) + 1)
  const end = body.search(/<div class="download_block|<footer/)
  const content = end < 0 ? body : body.slice(0, end)
  const fields = {}
  const unknown = []
  let current = null
  // Old pages hold the labels in one <p> per label, in <div>s, or in one <p> split by <br>: read lines, not elements.
  const lines = text(content.replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, '\n')).split('\n').map((l) => l.trim()).filter(Boolean)
  for (const line of lines) {
    const label = line.match(/^([^:：]{1,40}?)\s*[:：]\s*([\s\S]*)$/)
    const field = label && LABELS[label[1].toLowerCase()]
    if (field) { current = field; fields[field] = label[2].trim(); continue }
    if (current === 'abstract') fields.abstract = `${fields.abstract}\n${line}`.trim()
    // Two old pages (88, 91) open with the abstract and no label.
    else if (!fields.abstract && line.length > 200) fields.abstract = line
    else unknown.push(line.slice(0, 80))
  }
  const files = [...body.matchAll(/<a[^>]*href="([^"]+)"[^>]*class="download_item"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    url: decode(m[1]),
    name: text(m[2].match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? ''),
    size: text(m[2].match(/<span>([\s\S]*?)<\/span>/)?.[1] ?? ''),
  }))
  const ogTitle = decode(html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '')
  return { fields, files, unknown, ogTitle }
}

const split = (s) => (s ?? '').split(/[,;]/).map((x) => x.trim().replace(/\.$/, '')).filter(Boolean)
// `İ` does not match /i/ case-insensitively, and the old site has the typo "Endlish".
const LANGUAGE = [[/az[əe]rbaycan|azerbaijani/i, 'az'], [/[İI]ngilis|ingilis|english|endlish/i, 'en']]
function paperLanguage(value) {
  if (!value) return null
  return LANGUAGE.find(([re]) => re.test(value))?.[1] ?? 'other'
}
/** "02/2025", "№ 2/2025", "2025/02" → { number, year }. */
function numberYear(numberField, dateField) {
  const m = (numberField ?? '').match(/(\d{1,2})\s*[/\-.]\s*(\d{4})/) ?? (numberField ?? '').match(/(\d{4})\s*[/\-.]\s*(\d{1,2})(?!\d)/)?.slice(0, 3).reverse()
  const year = m ? Number(m.at(-1) ?? m[2]) : Number((dateField ?? '').match(/\d{4}/)?.[0]) || null
  const number = m ? Number(m[1]) : null
  return { number, year }
}

const lists = { az: await legacyLinks('az'), en: await legacyLinks('en') }
const order = [...new Set([...lists.az, ...lists.en].map((l) => l.id))]
const slugOf = (id) => [...lists.az, ...lists.en].find((l) => l.id === id).href.match(/page-\d+\/([^?#"]*)/)?.[1] ?? 'x'
console.log(`az ${lists.az.length} links / ${new Set(lists.az.map((l) => l.id)).size} ids, en ${lists.en.length} / ${new Set(lists.en.map((l) => l.id)).size}`)

const papers = []
const problems = []
for (const id of order) {
  const paper = { legacyPageId: id, number: null, year: null, paperLanguage: null, jelCodes: [], translations: {} }
  for (const locale of ['az', 'en']) {
    const html = await legacyPage(id, slugOf(id), locale)
    const parsed = parse(html)
    if (!parsed) { problems.push({ id, locale, problem: 'no content block' }); continue }
    const { fields, files, unknown } = parsed
    if (unknown.length) problems.push({ id, locale, problem: 'unknown labels', unknown })
    const { number, year } = numberYear(fields.number, fields.date)
    paper.number ??= number
    paper.year ??= year
    if (!paper.paperLanguage || paper.paperLanguage === 'other') paper.paperLanguage = paperLanguage(fields.language) ?? paper.paperLanguage
    if (!paper.jelCodes.length) paper.jelCodes = split(fields.jel).flatMap((c) => c.split(/\s+/)).filter((c) => /^[A-Z]\d{0,2}$/.test(c))
    paper.translations[locale] = {
      title: (fields.title || parsed.ogTitle || '').trim() || null,
      titleFromLabel: Boolean(fields.title),
      authors: split(fields.authors),
      abstract: fields.abstract ?? null,
      keywords: split(fields.keywords),
      files,
    }
  }
  const { az, en } = paper.translations
  // An en page the old site never translated repeats the az text: leave en out.
  if (en && az && (!en.title || en.title === az.title)) {
    problems.push({ id, locale: 'en', problem: 'en title missing or same as az: en left out' })
    delete paper.translations.en
  }
  for (const [locale, t] of Object.entries(paper.translations)) {
    if (!t.title) problems.push({ id, locale, problem: 'no title' })
    if (!t.files.length) problems.push({ id, locale, problem: 'no PDF' })
    if (t.files.length > 1) problems.push({ id, locale, problem: `${t.files.length} files, first one used` })
  }
  if (!paper.number || !paper.year) problems.push({ id, problem: 'number/year not found', raw: paper })
  papers.push(paper)
}

const keys = new Map()
for (const p of papers) {
  if (!p.number || !p.year) continue
  const key = `${String(p.number).padStart(2, '0')}-${p.year}`
  if (keys.has(key)) problems.push({ id: p.legacyPageId, problem: `duplicate key ${key} (also ${keys.get(key)})` })
  else keys.set(key, p.legacyPageId)
}

fs.writeFileSync(OUT, `${JSON.stringify({ source: SOURCE, papers, problems }, null, 2)}\n`)
console.log(`${papers.length} papers, ${keys.size} unique keys, en ${papers.filter((p) => p.translations.en).length}, problems ${problems.length} → ${path.relative(root, OUT)}`)
