// Spec 060 T017/T018/T022: measure the desktop org chart in headless Edge (raw CDP) against the Figma points of
// contracts/layout-rules.md. DOM coordinates are mapped to Figma: the chart's inner box top-left = (14392, 657).
// Usage: node measure-chart.mjs [baseUrl]   (default http://localhost:3012)
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:3012'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9333
// Output (report.md, cards.txt, chart.png, Edge profiles) goes to the git-excluded .tmp-060 at the repo root.
const DIR = path.resolve(import.meta.dirname, '../../../.tmp-060')
fs.mkdirSync(DIR, { recursive: true })
const WIDTH = 1728
const OX = 14392
const OY = 657

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function launch() {
  const profile = path.join(DIR, `edge-profile-${Date.now()}`)
  const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], {
    stdio: 'ignore',
  })
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      const page = list.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension://'))
      if (page) return { proc, ws: page.webSocketDebuggerUrl }
    } catch {}
    await sleep(200)
  }
  throw new Error('edge did not start')
}

function client(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let id = 0
  const pending = new Map()
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
    }
  }
  const ready = new Promise((r) => (ws.onopen = r))
  const send = (method, params = {}) =>
    ready.then(
      () =>
        new Promise((resolve, reject) => {
          const n = ++id
          pending.set(n, { resolve, reject })
          ws.send(JSON.stringify({ id: n, method, params }))
        }),
    )
  return { send, close: () => ws.close() }
}

async function evaluate(cdp, fn, arg) {
  const expr = `(${fn})(${JSON.stringify(arg ?? null)})`
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails))
  return r.result.value
}

async function open(cdp, url) {
  await cdp.send('Page.navigate', { url })
  for (let i = 0; i < 100; i++) {
    await sleep(200)
    const state = await evaluate(cdp, () => document.readyState + '|' + !!document.querySelector('section[tabindex="0"] > div'))
    if (state === 'complete|true') return
  }
  throw new Error('page did not load: ' + url)
}

/** In-page: every card and line in Figma coordinates. */
function collect({ ox, oy }) {
  // Live-broadcast popup etc. would cover the chart.
  document.querySelectorAll('[role=dialog]').forEach((d) => d.remove())
  const root = document.querySelector('section[tabindex="0"] > div')
  const o = root.getBoundingClientRect()
  const r1 = (v) => Math.round(v * 10) / 10
  const box = (el) => {
    const r = el.getBoundingClientRect()
    return { x: r1(r.left - o.left + ox), y: r1(r.top - o.top + oy), w: r1(r.width), h: r1(r.height) }
  }
  const isCard = (el) => el.classList.contains('flex-col') && ['p-1', 'p-2', 'p-4', 'p-[3px]'].some((c) => el.classList.contains(c))
  const cards = [...root.querySelectorAll('a, div, summary')]
    .filter(isCard)
    // A closed <details> still lays its content out for getBoundingClientRect; it is not on screen.
    .filter((el) => el.tagName === 'SUMMARY' || !el.closest('details:not([open])'))
    .filter((el) => el.getBoundingClientRect().height > 0)
    .map((el) => ({ text: el.textContent.trim().slice(0, 40), tag: el.tagName.toLowerCase(), ...box(el) }))
  const segs = [...root.querySelectorAll('span.bg-site-org-line')].map(box).filter((s) => s.w > 0 && s.h > 0)
  return { width: r1(o.width), height: r1(o.height), cards, segs }
}

const byText = (cards, prefix) => {
  const c = cards.find((k) => k.text.startsWith(prefix))
  if (!c) throw new Error('card not found: ' + prefix)
  return c
}
const horizontals = (segs) => segs.filter((s) => s.h === 1 && s.w > 1)
const verticals = (segs) => segs.filter((s) => s.w === 1 && s.h > 1)
const near = (a, b, tol) => Math.abs(a - b) <= tol

function rows(m) {
  const { cards, segs } = m
  const gov = byText(cards, 'Taleh')
  const firstDept = byText(cards, 'İnformasiya təhlükəsizliyi')
  const azer = byText(cards, 'Azər')
  const aliyar = byText(cards, 'Əliyar')
  const togrul = byText(cards, 'Toğrul')
  const ali = byText(cards, 'Əli İsmayıl')
  const vusal = byText(cards, 'Vüsal Cahangir')
  const guler = byText(cards, 'Gülər')
  const odenis = byText(cards, 'Ödəniş xidmətləri')
  const rashad = byText(cards, 'Rəşad')
  const tural = byText(cards, 'Tural')
  const anar = byText(cards, 'Anar')
  const H = horizontals(segs)
  const V = verticals(segs)
  const bar = H.filter((s) => s.y > gov.y + gov.h && s.y < aliyar.y).sort((a, b) => b.w - a.w)[0]
  const comb = V.find((s) => s.x > gov.x + gov.w && s.x < firstDept.x)
  const govLeft = H.find((s) => near(s.y, gov.y + gov.h / 2, 3) && s.x + s.w <= gov.x + 1)
  const aliyarChild = H.find((s) => near(s.x, aliyar.x + aliyar.w, 1) && s.y > aliyar.y && s.y < aliyar.y + aliyar.h)
  const gulerSide = H.find((s) => near(s.x, guler.x + guler.w, 1) && s.y > guler.y && s.y < guler.y + guler.h)
  // The riser is drawn in pieces (one per row it passes); take the lowest end of the rightmost x.
  const riserX = Math.max(...V.filter((s) => s.x > guler.x + guler.w).map((s) => s.x))
  const riserParts = V.filter((s) => near(s.x, riserX, 0.5))
  const sideRiser = riserParts.length ? { x: riserX, y: Math.min(...riserParts.map((s) => s.y)), h: Math.max(...riserParts.map((s) => s.y + s.h)) - Math.min(...riserParts.map((s) => s.y)) } : null
  const sideTicks = H.filter((s) => near(s.x + s.w, riserX, 1) && s.y > guler.y + guler.h)
  const dirTop = Math.min(...cards.filter((c) => /baş direktoru/.test(c.text) || c.text.startsWith('Azər')).map((c) => c.y))
  const deputyTops = [togrul, ali, vusal, guler].map((c) => c.y)
  const aliyarDrops = V.filter((s) => aliyarChild && near(s.y + s.h, togrul.y, 1) && s.x > aliyar.x + aliyar.w)
  return [
    // [what, measured, figma, rule (if the rule deliberately differs, R5), note]
    ['chart width', m.width, 971, null],
    ['governor card x', gov.x, 14747, null],
    ['governor card y', gov.y, 678, null],
    ['governor card w×h', `${gov.w}×${gov.h}`, '266×98', null],
    ['governor list x', firstDept.x, 15144, null],
    ['governor list first row centre y', firstDept.y + firstDept.h / 2, 674, null],
    ['comb x', comb?.x, 15115, null],
    ['governor → Azər line y', govLeft?.y, 731, 727, 'R5: card centre'],
    ['governor → Azər line left end x', govLeft?.x, 14430, 14426, 'R5: column centre'],
    ['Azər column x', azer.x, 14392, null],
    ['director row top y', dirTop, 1119, null],
    ['deputies bar y', bar?.y, 829, null],
    ['deputies bar from x', bar?.x, 14536.5, null],
    ['deputies bar to x', bar ? bar.x + bar.w : undefined, 15176.5, null],
    ['Əliyar top y', aliyar.y, 886, null],
    ['Əliyar x', aliyar.x, 14465, null],
    ['other deputies top y', deputyTops.join(' / '), 966, null],
    ['Toğrul x', togrul.x, 14615, null],
    ['Əli x', ali.x, 14768, 14765, 'R5: centred over columns'],
    ['Vüsal x', vusal.x, 14918, 14915, 'R5: groups right of Əli 3 px left'],
    ['Gülər card x', guler.x, 15103.5, 15100.5, 'R5: groups right of Əli 3 px left'],
    ['Gülər columns x', [rashad, tural, anar].map((c) => c.x).join(' / '), '15068 / 15142 / 15216', '15065 / 15139 / 15213', 'R5'],
    ['Əliyar → children line y', aliyarChild?.y, 920, 'decided here', 'R5: centre 936 or fixed 34'],
    ['Əliyar → children line x', aliyarChild ? `${aliyarChild.x}–${aliyarChild.x + aliyarChild.w}` : undefined, '14610–14843', null],
    ['Əliyar → children drops x', aliyarDrops.map((s) => s.x).join(' / '), '14690 / 14843', null],
    // A drop must start on the parent's line, not above it (a stub sticking up was a bug found on 2026-11-26).
    ['Əliyar → children drops top y', aliyarDrops.filter((s) => s.x < togrul.x + togrul.w || near(s.x, ali.x + ali.w / 2, 1)).map((s) => s.y).join(' / '), '920 / 920', null],
    ['Ödəniş block y', odenis.y, 1194, 1197, 'R5: row + 68 + 10'],
    ['Gülər → side line y', gulerSide?.y, 1014, 1016, 'R5: card centre'],
    ['side riser x', sideRiser?.x, 15363, null],
    ['side riser bottom y', sideRiser ? sideRiser.y + sideRiser.h : undefined, 1308, 1327, 'R5: centre of the last side department'],
    ['side ticks y', sideTicks.map((s) => s.y).join(' / '), '1247 / 1308', '1265.5 / 1327', 'R5: Figma ticks 5 / 11 below the card top, rule: centre'],
    ['side departments x', cards.filter((c) => /İnsan resursları|Strategiya və layihə/.test(c.text)).map((c) => `${c.x} (${c.w})`).join(' / '), '15288 (68)', '15285 (68)', 'R5'],
    ['open block departments x', cards.filter((c) => /Maliyyə idarəetməsi|Satınalmalar/.test(c.text)).map((c) => `${c.x} (${c.w})`).join(' / '), '15216 (68)', '15213 (68)', 'R5'],
  ]
}

function table(list) {
  const out = ['| Ölçü | DOM | Figma | Qayda (R5) | Fərq |', '|---|---|---|---|---|']
  for (const [what, dom, figma, rule, note] of list) {
    const target = typeof rule === 'number' ? rule : figma
    const diff = typeof dom === 'number' && typeof target === 'number' ? Math.round((dom - target) * 10) / 10 : ''
    out.push(`| ${what} | ${dom ?? '—'} | ${figma} | ${rule ?? ''}${note ? ` (${note})` : ''} | ${diff} |`)
  }
  return out.join('\n')
}

const overlaps = (cards) => {
  const hits = []
  for (let i = 0; i < cards.length; i++)
    for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i]
      const b = cards[j]
      if (a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5) hits.push(`${a.text} ✕ ${b.text}`)
    }
  return hits
}

/** Lines that cut through a card's inside (1 px inset). */
const crossings = (cards, segs) => {
  const hits = []
  for (const s of segs)
    for (const c of cards)
      if (s.x < c.x + c.w - 1 && c.x + 1 < s.x + s.w && s.y < c.y + c.h - 1 && c.y + 1 < s.y + s.h)
        hits.push(`${c.text} ← line ${s.x},${s.y} ${s.w}×${s.h}`)
  return hits
}

const report = []
const { proc, ws } = await launch()
const cdp = client(ws)
try {
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 1200, deviceScaleFactor: 1, mobile: false })

  // T017 — the Figma tree.
  await open(cdp, `${BASE}/az/organization?section=divisions`)
  const closed = await evaluate(cdp, collect, { ox: OX, oy: OY })
  report.push('## T017 — Figma nöqtələri (az, Figma fikstürü)', '', table(rows(closed)), '')
  report.push(`Kart sayı ${closed.cards.length}, xətt seqmenti ${closed.segs.length}.`, '')
  fs.writeFileSync(path.join(DIR, 'cards.txt'), [...closed.cards].sort((a, b) => a.x - b.x || a.y - b.y).map((c) => `${c.x}\t${c.y}\t${c.w}×${c.h}\t${c.text}`).join('\n'))
  report.push(`Kəsişən kartlar: ${overlaps(closed.cards).join('; ') || 'yoxdur'}`)
  report.push(`Kartın içindən keçən xətlər: ${crossings(closed.cards, closed.segs).join('; ') || 'yoxdur'}`, '')

  // T022 — every open/closed combination of the dropdown blocks.
  const count = await evaluate(cdp, () => document.querySelectorAll('section[tabindex="0"] details').length)
  report.push(`## T022 — açılan bloklar (${count} ədəd, ${2 ** count} birləşmə)`, '')
  const moved = (base, next, ignore) =>
    base.filter((c) => !ignore(c)).flatMap((c) => {
      const n = next.find((k) => k.text === c.text)
      return n && (n.x !== c.x || n.y !== c.y) ? [`${c.text}: (${c.x},${c.y}) → (${n.x},${n.y})`] : []
    })
  for (let mask = 1; mask < 2 ** count; mask++) {
    await evaluate(cdp, (mk) => document.querySelectorAll('section[tabindex="0"] details').forEach((d, i) => (d.open = !!(mk & (1 << i)))), mask)
    const m = await evaluate(cdp, collect, { ox: OX, oy: OY })
    const openBoxes = await evaluate(
      cdp,
      (arg) => {
        const o = document.querySelector('section[tabindex="0"] > div').getBoundingClientRect()
        return [...document.querySelectorAll('section[tabindex="0"] details[open]')].map((d) => {
          const col = d.closest('.flex-col[style*="width: 68px"]')?.parentElement?.closest('.flex-col[style*="width: 68px"]') ?? d
          const r = col.getBoundingClientRect()
          return { x: r.left - o.left + arg.ox, w: r.width }
        })
      },
      { ox: OX },
    )
    const inOpenColumn = (c) => openBoxes.some((b) => c.x >= b.x - 0.5 && c.x < b.x + b.w)
    report.push(`- birləşmə ${mask.toString(2).padStart(count, '0')}: kəsişmə ${overlaps(m.cards).join('; ') || 'yoxdur'}; xətt kartdan keçir ${crossings(m.cards, m.segs).join('; ') || 'yox'}`)
    report.push(`  - açılan sütundan kənarda yerini dəyişən kart: ${moved(closed.cards, m.cards, inOpenColumn).join('; ') || 'yoxdur'}`)
    report.push(`  - açıq siyahının departamentləri: ${m.cards.filter((c) => !closed.cards.some((k) => k.text === c.text)).map((c) => `${c.text} (${c.x},${c.y} ${c.w}×${c.h})`).join('; ')}`)
  }
  await evaluate(cdp, () => document.querySelectorAll('section[tabindex="0"] details').forEach((d) => (d.open = false)))

  // T022 — keyboard: Tab to the first summary, Enter opens, Space closes.
  const key = async (k, code, keyCode, text) => {
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: keyCode, text })
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: keyCode })
    await sleep(100)
  }
  await evaluate(cdp, () => document.querySelector('section[tabindex="0"] summary').focus())
  const focused = await evaluate(cdp, () => document.activeElement?.tagName)
  await key('Enter', 'Enter', 13, '\r')
  const afterEnter = await evaluate(cdp, () => document.querySelector('section[tabindex="0"] details').open)
  await key(' ', 'Space', 32, ' ')
  const afterSpace = await evaluate(cdp, () => document.querySelector('section[tabindex="0"] details').open)
  report.push('', `Klaviatura: fokus ${focused}, Enter → open=${afterEnter}, Space → open=${afterSpace}`)

  // T022 — no JavaScript. The whole page sits in Next's streamed `<div hidden>` without JS (the root
  // `[locale]/loading.tsx` boundary), so the chart's server HTML and the page CSS go into a script-free document.
  const snap = await evaluate(cdp, () => ({
    html: document.querySelector('section[tabindex="0"]').outerHTML,
    css: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href),
    rootClass: document.documentElement.className,
  }))
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: true })
  const { frameTree } = await cdp.send('Page.getFrameTree')
  await cdp.send('Page.setDocumentContent', {
    frameId: frameTree.frame.id,
    html: `<!doctype html><html class="${snap.rootClass}"><head>${snap.css.map((h) => `<link rel="stylesheet" href="${h}">`).join('')}</head><body><main style="padding:40px">${snap.html}</main></body></html>`,
  })
  await sleep(1500)
  const scripts = (await cdp.send('Runtime.evaluate', { expression: 'document.scripts.length', returnByValue: true })).result.value
  report.push(`JS-siz sənəd: script sayı ${scripts}`)
  const click = async () => {
    const { result } = await cdp.send('Runtime.evaluate', {
      expression: `(() => { const s = document.querySelector('section[tabindex="0"] summary'); s.scrollIntoView({block:'center'}); const r = s.getBoundingClientRect(); const x = r.left + r.width/2, y = r.top + 10; const hit = document.elementFromPoint(x, y); return JSON.stringify({x, y, hit: hit ? hit.tagName + '.' + String(hit.className).slice(0, 60) + ' in summary=' + !!hit.closest('summary') : null}) })()`,
      returnByValue: true,
    })
    const { x, y, hit } = JSON.parse(result.value)
    report.push(`JS-siz klik nöqtəsi (${Math.round(x)}, ${Math.round(y)}): ${hit}`)
    for (const type of ['mousePressed', 'mouseReleased']) await cdp.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 })
    await sleep(200)
    return (await cdp.send('Runtime.evaluate', { expression: `document.querySelector('section[tabindex="0"] details').open`, returnByValue: true })).result.value
  }
  const first = await click()
  const second = await click()
  report.push(`JS-siz: birinci klik → open=${first}, ikinci klik → open=${second}`, '')
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: false })

  // T018 — the same tree, director 13's name stretched (proxy serves it for locale=en).
  await open(cdp, `${BASE}/en/organization?section=divisions`)
  const long = await evaluate(cdp, collect, { ox: OX, oy: OY })
  const shahin = byText(long.cards, 'Şahin')
  const shahin0 = byText(closed.cards, 'Şahin')
  const below = long.cards.filter((c) => near(c.x, shahin.x, 0.5) && c.y > shahin.y)
  report.push('## T018 — uzun ad (en, Şahin 4+ sətir)', '')
  report.push(`Şahin kartı: hündürlük ${shahin0.h} → ${shahin.h}`)
  report.push(`Altındakı kartlar: ${below.map((c) => `${c.text} y ${closed.cards.find((k) => near(k.x, c.x, 0.5) && k.y > shahin0.y)?.y} → ${c.y}`).join('; ')}`)
  report.push(`Kəsişən kartlar: ${overlaps(long.cards).join('; ') || 'yoxdur'}`)
  report.push(`Kartın içindən keçən xətlər: ${crossings(long.cards, long.segs).join('; ') || 'yoxdur'}`)

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 1200, deviceScaleFactor: 1, mobile: false })
  await open(cdp, `${BASE}/az/organization?section=divisions`)
  const y = await evaluate(cdp, () => {
    const s = document.querySelector('section[tabindex="0"]')
    s.scrollIntoView()
    const r = s.getBoundingClientRect()
    return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height }
  })
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...y, width: y.w, height: y.h, scale: 1 } })
  fs.writeFileSync(path.join(DIR, 'chart.png'), Buffer.from(shot.data, 'base64'))
} finally {
  fs.writeFileSync(path.join(DIR, 'report.md'), report.join('\n') + '\n')
  console.log(report.join('\n'))
  await cdp.send('Browser.close').catch(() => {})
  cdp.close()
  proc.kill()
}
