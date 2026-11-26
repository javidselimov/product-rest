// Spec 060 measuring proxy (run from the repo root: node specs/060-org-chart-auto-layout/measure/proxy.mjs): /api/v1/organization/chart from the Figma fixture, the rest to the test api-cbar.
// locale=az → the fixture as is; locale=en → the same tree with director 13's name stretched to 4 lines (US2-4).
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const fixture = path.join(ROOT, 'product-rest/web-cbar-new/src/shared/testing/fixtures/org-chart-figma.ts')
const { figmaOrgChart } = await import(pathToFileURL(fixture).href)
const UPSTREAM = 'https://api-cbar-test.cbar.az'
const LONG_ID = 13
const LONG_NAME = 'Şahin Aydın oğlu Mahmudzadə Mahmudzadə Mahmudzadə Mahmudzadə Mahmudzadə'

// Figma's director cards say "Baş direktor"; the test data says "Mərkəzi Bankın baş direktoru" (3 lines in 60 px),
// which makes every director card taller than Figma's 68 and moves everything below. Compare like with like.
const DIRECTOR = 3
const figmaTexts = figmaOrgChart.map((n) => (n.kind === DIRECTOR ? { ...n, role: 'Baş direktor' } : n))
const long = figmaTexts.map((n) => (n.id === LONG_ID ? { ...n, name: LONG_NAME } : n))

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    if (url.pathname === '/api/v1/organization/chart') {
      const body = JSON.stringify(url.searchParams.get('locale') === 'en' ? long : figmaTexts)
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      return res.end(body)
    }
    const up = https.request(UPSTREAM + req.url, { method: req.method, headers: { ...req.headers, host: new URL(UPSTREAM).host } }, (r) => {
      res.writeHead(r.statusCode, r.headers)
      r.pipe(res)
    })
    up.on('error', (e) => {
      res.writeHead(502)
      res.end(String(e))
    })
    req.pipe(up)
  })
  .listen(5199, () => console.log('proxy :5199'))
