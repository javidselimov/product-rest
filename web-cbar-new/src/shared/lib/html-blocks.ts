/**
 * DOM-suz dayaz HTML ağacı (spec 024 research R3).
 *
 * Serverdə `DOMParser` yoxdur və HTML parser dependency-si gətirilmir (konstitusiya Maddə II).
 * Giriş redaktorun nəzarətindədir və TipTap tərəfindən normallaşdırılıb: hər element bağlanır,
 * atributlar dırnaq içindədir. Ona görə bir səviyyəni bölmək üçün teq dərinliyini saymaq kifayətdir.
 *
 * `parseBlocks` yalnız **birbaşa** uşaqları qaytarır; dərinə enmək üçün `parseBlocks(node.inner)`
 * çağırılır. Balanssız və ya gözlənilməz quruluş `null` qaytarır — çağıran tərəf o zaman
 * HTML-i olduğu kimi göstərir (spec 024 FR-008). Mətnə və atributlara toxunulmur.
 */

export type HtmlNode = {
  /** Kiçik hərfli teq adı; teqlər arasındakı boş olmayan mətn üçün `#text`. */
  tag: string
  /** Açılış teqinin xam atribut sətri (`#text` üçün boş). */
  attrs: string
  /** Açılış və bağlanış teqləri arasındakı HTML (void element üçün boş). */
  inner: string
  /** Elementin tam HTML-i. */
  outer: string
}

const VOID_TAGS: ReadonlySet<string> = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

// Şərh, ya da açılış/bağlanış teqi. Atribut dəyərindəki `>` dırnaq daxilində qəbul olunur.
const TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g

type Open = { tag: string; attrs: string; start: number; innerStart: number }

type Token =
  | { kind: 'comment'; start: number; end: number }
  | { kind: 'close'; tag: string; start: number; end: number }
  | { kind: 'void'; tag: string; attrs: string; start: number; end: number; outer: string }
  | { kind: 'open'; tag: string; attrs: string; start: number; end: number }

function toToken(match: RegExpExecArray): Token {
  const [whole, slash, rawName, attrs = '', selfClose] = match
  const start = match.index
  const end = start + whole.length
  if (!rawName) return { kind: 'comment', start, end }
  const tag = rawName.toLowerCase()
  if (slash) return { kind: 'close', tag, start, end }
  if (VOID_TAGS.has(tag) || selfClose) return { kind: 'void', tag, attrs, start, end, outer: whole }
  return { kind: 'open', tag, attrs, start, end }
}

function elementOf(html: string, open: Open, closeStart: number, closeEnd: number): HtmlNode {
  return {
    tag: open.tag,
    attrs: open.attrs,
    inner: html.slice(open.innerStart, closeStart),
    outer: html.slice(open.start, closeEnd),
  }
}

export function parseBlocks(html: string): HtmlNode[] | null {
  const nodes: HtmlNode[] = []
  const stack: Open[] = []
  let textStart = 0

  // Yuxarı səviyyədə teqlər arasındakı boş olmayan mətn `#text` node-u olur.
  const flushText = (end: number) => {
    const text = html.slice(textStart, end)
    if (text.trim()) nodes.push({ tag: '#text', attrs: '', inner: text, outer: text })
  }

  TAG.lastIndex = 0
  for (let match = TAG.exec(html); match; match = TAG.exec(html)) {
    const token = toToken(match)

    if (token.kind === 'close') {
      const open = stack.pop()
      if (open?.tag !== token.tag) return null
      if (stack.length === 0) {
        nodes.push(elementOf(html, open, token.start, token.end))
        textStart = token.end
      }
      continue
    }

    if (stack.length === 0) flushText(token.start)
    if (token.kind === 'open') {
      stack.push({ tag: token.tag, attrs: token.attrs, start: token.start, innerStart: token.end })
    } else if (stack.length === 0) {
      // Void element node olur; şərh yuxarı səviyyədə atılır.
      if (token.kind === 'void') nodes.push({ tag: token.tag, attrs: token.attrs, inner: '', outer: token.outer })
      textStart = token.end
    }
  }

  if (stack.length > 0) return null
  flushText(html.length)
  return nodes
}

/** Atributun dəyəri (entity-lər açılmış), yoxdursa `null`. Boolean atribut üçün boş sətir. */
export function attrOf(attrs: string, name: string): string | null {
  const re = new RegExp(`(?:^|\\s)${name}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+)))?(?=\\s|$|/)`, 'i')
  const match = re.exec(attrs)
  if (!match) return null
  return decodeEntities(match[1] ?? match[2] ?? match[3] ?? '')
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : entity
    }
    return NAMED_ENTITIES[body.toLowerCase()] ?? entity
  })
}

// Blok teqi sözləri ayırır (boşluq), inline teq ayırmır: `<strong>1983</strong>-cü` → `1983-cü`.
const BLOCK_TAG =
  /<\/?(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|blockquote|details|summary|br|hr|img|figure|figcaption|section|article)\b[^>]*>/gi

/** Düz mətn: teqlər atılır, entity-lər açılır, boşluqlar bir boşluğa endirilir. */
export function textOf(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(BLOCK_TAG, ' ')
      .replace(/<[^>]*>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim()
}
