// Spec 060 US4 (run from the repo root: node specs/060-org-chart-auto-layout/measure/admin-mock.mjs; then the panel with
// VITE_API_PROXY_TARGET=http://localhost:5198 npx vite --port 5179): a stand-in api-cbar-admin for looking at the panel's chart preview. Serves the Figma tree (with the
// "Baş direktor" roles the site measurement used) in the admin list shape, a fake session, empty staff/divisions.
import http from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const fixture = path.join(ROOT, 'product-rest/web-cbar-new/src/shared/testing/fixtures/org-chart-figma.ts')
const { figmaOrgChart } = await import(pathToFileURL(fixture).href)
const DIRECTOR = 3

const nodes = figmaOrgChart.map((n, i) => ({
  id: n.id,
  parentId: n.parentId,
  kind: n.kind,
  staffId: null,
  divisionId: null,
  curatorDirect: n.curatorDirect,
  sortOrder: i + 1,
  isActive: true,
  departmentsOpen: n.departmentsOpen,
  layout: null,
  connector: null,
  updatedAt: '2026-11-26T09:00:00+00:00',
  translations: { az: { title: n.name, subtitle: n.kind === DIRECTOR ? 'Baş direktor' : n.role } },
  linked: {},
}))

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
const jwt = () =>
  `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({
    sub: '1',
    preferred_username: 'admin',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'admin',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.sig`

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    const p = url.pathname.replace(/^\/api\/v1/, '')
    if (p === '/auth/refresh' || p === '/auth/login')
      return json(res, 200, { accessToken: jwt(), expiresAt: new Date(Date.now() + 3600e3).toISOString() })
    if (p === '/organization/chart' && req.method === 'GET') return json(res, 200, nodes)
    if (req.method === 'GET') return json(res, 200, [])
    res.writeHead(204)
    res.end()
  })
  .listen(5198, () => console.log('admin mock :5198'))
