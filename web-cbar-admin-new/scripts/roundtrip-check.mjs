// Canlı round-trip yoxlaması (research R11, T060): verilmiş kök səhifələrin
// bütün alt ağacındakı tərcümələri admin API-dən oxuyur, `RichTextEditor` ilə
// eyni extension dəsti (node view-suz) ilə TipTap-dan keçirir və struktur
// sayğaclarını (details/table/tr/data-media-link/img/iframe) müqayisə edir.
//
// `.mjs` TS import edə bilmədiyi üçün extension-lar burada
// `src/features/rich-text/model/extensions.ts` ilə eyni semantikada yenidən
// təyin olunur — oradakı dəyişiklik buraya da köçürülməlidir.
//
// İstifadə:  node scripts/roundtrip-check.mjs "Haqqımızda" "Pul siyasəti"
// Env:       API_URL (default http://localhost:5253/api/v1)
//            ADMIN_USER / ADMIN_PASSWORD (default lokal seed)
// Uğursuzluqda (mismatch və ya tapılmayan kök) exit 1.

import process from 'node:process'

import { JSDOM } from 'jsdom'

const API_URL = process.env.API_URL ?? 'http://localhost:5253/api/v1'
const ADMIN_USER = process.env.ADMIN_USER ?? 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!'

const ROOTS = process.argv.slice(2)
if (ROOTS.length === 0) {
  console.log(
    'İstifadə: node scripts/roundtrip-check.mjs "<kök səhifə başlığı>" [...]\n' +
      '  Env: API_URL, ADMIN_USER, ADMIN_PASSWORD',
  )
  process.exit(1)
}

// ---- jsdom bootstrap (TipTap DOM tələb edir) --------------------------------
const dom = new JSDOM('<!doctype html><html><body></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
})
for (const k of [
  'MutationObserver',
  'Node',
  'Element',
  'HTMLElement',
  'Document',
  'DocumentFragment',
  'Text',
  'DOMParser',
  'XMLSerializer',
  'getComputedStyle',
  'Range',
  'NodeFilter',
  'InputEvent',
  'KeyboardEvent',
  'MouseEvent',
  'CustomEvent',
]) {
  if (!(k in globalThis)) globalThis[k] = dom.window[k]
}

const { Editor, mergeAttributes, Node } = await import('@tiptap/core')
const { default: StarterKit } = await import('@tiptap/starter-kit')
const { Details, DetailsContent, DetailsSummary } =
  await import('@tiptap/extension-details')
const { default: Link } = await import('@tiptap/extension-link')
const { TableKit } = await import('@tiptap/extension-table')
const { default: Image } = await import('@tiptap/extension-image')
const { default: Youtube } = await import('@tiptap/extension-youtube')
const { default: TextAlign } = await import('@tiptap/extension-text-align')
const { TextStyleKit } = await import('@tiptap/extension-text-style')

// ---- extensions.ts ilə eyni semantika (node view-suz) ----------------------
const AccordionDetails = Details.configure({
  HTMLAttributes: { 'data-accordion': '' },
})
const AccordionContent = DetailsContent.extend({
  parseHTML() {
    return [
      { tag: 'div[data-type="details-content"]' },
      { tag: 'div[data-type="detailsContent"]' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'details-content',
      }),
      0,
    ]
  },
})
const MediaLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-media-link': {
        default: null,
        parseHTML: (element) =>
          element.hasAttribute('data-media-link') ? '' : null,
        renderHTML: (attributes) =>
          attributes['data-media-link'] == null
            ? {}
            : { 'data-media-link': '' },
      },
    }
  },
})
const EmbedFrame = Node.create({
  name: 'embedFrame',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return Object.fromEntries(
      [
        'src',
        'width',
        'height',
        'style',
        'title',
        'frameborder',
        'allow',
        'allowfullscreen',
        'loading',
        'referrerpolicy',
      ].map((a) => [a, { default: null }]),
    )
  },
  parseHTML() {
    return [{ tag: 'iframe', priority: 40 }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)]
  },
})

const buildExtensions = () => [
  StarterKit.configure({ link: false }),
  MediaLink.configure({ openOnClick: false, autolink: true }),
  AccordionDetails,
  DetailsSummary,
  AccordionContent,
  TableKit.configure({ table: { resizable: false } }),
  Image.configure({ inline: true }),
  Youtube.configure({ nocookie: true, width: 640, height: 360 }),
  EmbedFrame,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyleKit,
]

// ---- sayğaclar (fixtures/legacy-content.ts#countFeatures ilə eyni) ---------
const count = (html, re) => (html.match(re) ?? []).length
const features = (html) => ({
  details: count(html, /<details/g),
  tables: count(html, /<table/g),
  rows: count(html, /<tr/g),
  mediaLinks: count(html, /data-media-link/g),
  images: count(html, /<img/g),
  videos: count(html, /<iframe/g),
})

// ---- API ---------------------------------------------------------------------
async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} → HTTP ${response.status}`)
  }
  return response.json()
}

const login = await fetchJson(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASSWORD }),
})
const auth = { Authorization: `Bearer ${login.accessToken}` }

const tree = await fetchJson(`${API_URL}/pages/tree?locale=az`, {
  headers: auth,
})

const findNode = (nodes, title) => {
  for (const n of nodes) {
    if (n.title === title) return n
    const r = findNode(n.children ?? [], title)
    if (r) return r
  }
  return null
}
const collectIds = (n) => [n.id, ...(n.children ?? []).flatMap(collectIds)]

let rootsMissing = 0
const ids = ROOTS.flatMap((title) => {
  const node = findNode(tree, title)
  if (!node) {
    rootsMissing += 1
    console.log('KÖK TAPILMADI:', title)
    return []
  }
  return collectIds(node)
})

let pages = 0
let failures = 0
for (const id of ids) {
  const page = await fetchJson(`${API_URL}/pages/${id}`, { headers: auth })
  for (const [locale, tr] of Object.entries(page.translations ?? {})) {
    if (!tr?.content) continue
    pages += 1
    const editor = new Editor({
      extensions: buildExtensions(),
      content: tr.content,
    })
    const out = editor.getHTML()
    editor.destroy()
    const a = features(tr.content)
    const b = features(out)
    const diffs = Object.keys(a).filter((k) => a[k] !== b[k])
    if (diffs.length > 0) {
      failures += 1
      console.log(
        `MISMATCH səhifə ${id} (${locale}) ${tr.title ?? ''}:`,
        diffs.map((k) => `${k} ${a[k]}→${b[k]}`).join(', '),
      )
    }
  }
}

console.log(
  `round-trip: ${pages} tərcümə yoxlandı [${ROOTS.join(', ')}], mismatch: ${failures}`,
)
if (failures > 0 || rootsMissing > 0) process.exit(1)
