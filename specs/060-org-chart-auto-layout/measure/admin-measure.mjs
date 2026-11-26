// Spec 060 US4 (SC-007): open the panel's "Sxem" view in headless Edge, map its cards to Figma coordinates the same
// way measure-chart.mjs does for the site, compare with the site's cards.txt, and save a screenshot.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

// Output and the site's cards.txt (from measure-chart.mjs) are in the git-excluded .tmp-060 at the repo root.
const DIR = path.resolve(import.meta.dirname, '../../../.tmp-060')
fs.mkdirSync(DIR, { recursive: true })
const URL_ = process.argv[2] ?? 'http://localhost:5179/organization/chart?view=chart'
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9335
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const profile = path.join(DIR, `edge-profile-admin-${Date.now()}`)
const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' })
let wsUrl
for (let i = 0; i < 50 && !wsUrl; i++) {
  await sleep(200)
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    wsUrl = list.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension://'))?.webSocketDebuggerUrl
  } catch {}
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data)
  if (msg.id) pending.get(msg.id)?.(msg)
}
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })) })
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value

await send('Emulation.setDeviceMetricsOverride', { width: 1728, height: 1100, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: URL_ })
let ready = false
for (let i = 0; i < 100 && !ready; i++) {
  await sleep(300)
  ready = await evaluate(`!!document.querySelector('section.bg-org-surface > div button')`)
}
if (!ready) {
  console.log('chart not found; page text:', (await evaluate('document.body.innerText'))?.slice(0, 500))
  await send('Browser.close')
  proc.kill()
  process.exit(1)
}

const cards = JSON.parse(
  await evaluate(`(() => {
    const root = document.querySelector('section.bg-org-surface > div');
    const o = root.getBoundingClientRect();
    const r1 = (v) => Math.round(v * 10) / 10;
    const out = [...root.querySelectorAll('button, summary')].filter((el) => !el.closest('details:not([open])') || el.tagName === 'SUMMARY').map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r1(r.left - o.left + 14392), y: r1(r.top - o.top + 657), w: r1(r.width), h: r1(r.height), text: el.textContent.trim().slice(0, 40) };
    });
    return JSON.stringify(out);
  })()`),
)

const site = fs
  .readFileSync(path.join(DIR, 'cards.txt'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [x, y, wh, text] = line.split('\t')
    const [w, h] = wh.split('×').map(Number)
    return { x: Number(x), y: Number(y), w, h, text }
  })

const diffs = []
for (const s of site) {
  const a = cards.find((c) => c.text === s.text)
  if (!a) diffs.push(`missing in panel: ${s.text}`)
  else if (Math.abs(a.x - s.x) > 0.5 || Math.abs(a.y - s.y) > 0.5 || Math.abs(a.w - s.w) > 0.5 || Math.abs(a.h - s.h) > 0.5)
    diffs.push(`${s.text}: site ${s.x},${s.y} ${s.w}×${s.h} — panel ${a.x},${a.y} ${a.w}×${a.h}`)
}
console.log(`panel cards ${cards.length}, site cards ${site.length}, differences ${diffs.length}`)
diffs.forEach((d) => console.log('  ' + d))

const box = JSON.parse(
  await evaluate(`(() => { const s = document.querySelector('section.bg-org-surface'); const r = s.getBoundingClientRect(); return JSON.stringify({ x: r.left, y: r.top + scrollY, width: r.width, height: r.height }); })()`),
)
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...box, scale: 1 } })
fs.writeFileSync(path.join(DIR, 'admin-chart.png'), Buffer.from(shot.result.data, 'base64'))
const full = await send('Page.captureScreenshot', { format: 'png' })
fs.writeFileSync(path.join(DIR, 'admin-page.png'), Buffer.from(full.result.data, 'base64'))
await send('Browser.close')
proc.kill()
