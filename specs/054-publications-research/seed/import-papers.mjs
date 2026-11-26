// Spec 054 US6: writes seed/working-papers.json into an environment through the admin API, the same way an editor would
// (validation, audit log, content-addressed media), so no migration or deploy is needed. Replaces the T085/T086 seed SQL.
//
// For every paper: the az/en PDFs are downloaded from the old site's uploads host and sent to POST /media (the same bytes
// return the existing media row, so a rerun uploads nothing new), then POST /working-papers. A paper whose `NN-YYYY` already
// exists in the environment is skipped, so a paper an editor has entered by hand stays as it is.
//
//   node specs/054-publications-research/seed/import-papers.mjs                 # dry run: prints what it would do, writes nothing
//   CBAR_ADMIN_USER=… CBAR_ADMIN_PASSWORD=… node …/import-papers.mjs --apply    # writes
//   --api=https://api-cbar-admin-test.cbar.az/api/v1 (default)   --status=published|draft (default published)   --only=02-2025
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback
const API = arg('api', 'https://api-cbar-admin-test.cbar.az/api/v1').replace(/\/$/, '')
const STATUS = arg('status', 'published')
const ONLY = arg('only', null)
const APPLY = process.argv.includes('--apply')
const USER_AGENT = 'cbar-seed-import/1.0'
const PAGE_SIZE = 100
const JEL = /^[A-Z][0-9]{1,2}$/
const MAX_TITLE = 500

const { papers } = JSON.parse(fs.readFileSync(path.join(here, 'working-papers.json'), 'utf8'))
const code = (p) => `${String(p.number).padStart(2, '0')}-${p.year}`

let token = null
async function login() {
  const { CBAR_ADMIN_USER: username, CBAR_ADMIN_PASSWORD: password } = process.env
  if (!username || !password) throw new Error('CBAR_ADMIN_USER and CBAR_ADMIN_PASSWORD must be set')
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error(`login: ${res.status} ${await res.text()}`)
  token = (await res.json()).accessToken
}

/** An admin API call; logs in again once when the 15-minute access token has expired. */
async function api(method, url, body, retried = false) {
  const headers = { Authorization: `Bearer ${token}`, 'User-Agent': USER_AGENT }
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API}${url}`, { method, headers, body: body instanceof FormData ? body : body && JSON.stringify(body) })
  if (res.status === 401 && !retried) {
    await login()
    return api(method, url, body, true)
  }
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${text}`)
  return text ? JSON.parse(text) : null
}

async function existingCodes() {
  const codes = new Set()
  for (let page = 1; ; page++) {
    const { items, total } = await api('GET', `/working-papers?page=${page}&pageSize=${PAGE_SIZE}`)
    for (const item of items) codes.add(item.code ?? `${String(item.number).padStart(2, '0')}-${item.year}`)
    if (page * PAGE_SIZE >= total) return codes
  }
}

async function upload(file) {
  const res = await fetch(file.url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`download ${file.url}: ${res.status}`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: 'application/pdf' }), path.basename(new URL(file.url).pathname))
  const media = await api('POST', '/media', form)
  return { id: media.id, bytes: bytes.length }
}

function payload(paper, mediaIds) {
  const translations = {}
  for (const [locale, t] of Object.entries(paper.translations)) {
    translations[locale] = {
      title: t.title?.slice(0, MAX_TITLE) ?? null,
      authors: t.authors,
      abstract: t.abstract,
      keywords: t.keywords,
      mediaId: mediaIds[locale] ?? null,
    }
  }
  return {
    number: paper.number,
    year: paper.year,
    paperLanguage: paper.paperLanguage ?? 'other',
    status: STATUS,
    jelCodes: paper.jelCodes.filter((c) => JEL.test(c)),
    legacyPageId: paper.legacyPageId,
    translations,
  }
}

const todo = papers.filter((p) => !ONLY || code(p) === ONLY)
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} → ${API}, status ${STATUS}, ${todo.length} papers`)
if (APPLY) await login()
const existing = APPLY ? await existingCodes() : new Set()
if (APPLY) console.log(`${existing.size} papers already in the environment`)

const result = { created: [], skipped: [], failed: [] }
for (const paper of todo) {
  const key = code(paper)
  if (existing.has(key)) { result.skipped.push(key); continue }
  const files = Object.fromEntries(Object.entries(paper.translations).map(([l, t]) => [l, t.files[0]]).filter(([, f]) => f))
  if (!APPLY) {
    const titles = Object.entries(paper.translations).map(([l, t]) => `${l}: ${t.title.slice(0, 50)}`).join(' | ')
    console.log(`  ${key} page-${paper.legacyPageId} ${paper.paperLanguage} pdf ${Object.keys(files).join('+')} — ${titles}`)
    result.created.push(key)
    continue
  }
  try {
    const mediaIds = {}
    for (const [locale, file] of Object.entries(files)) mediaIds[locale] = (await upload(file)).id
    const created = await api('POST', '/working-papers', payload(paper, mediaIds))
    console.log(`  + ${key} id ${created.id} media ${JSON.stringify(mediaIds)}`)
    result.created.push(key)
  } catch (error) {
    console.log(`  ! ${key}: ${error.message.slice(0, 300)}`)
    result.failed.push({ key, error: error.message })
  }
}
console.log(`${APPLY ? 'created' : 'would create'} ${result.created.length}, skipped (exists) ${result.skipped.length}, failed ${result.failed.length}`)
if (result.failed.length) process.exitCode = 1
