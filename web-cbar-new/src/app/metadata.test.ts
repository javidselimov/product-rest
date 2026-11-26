/**
 * Hər route `generateMetadata` ixrac edir (spec 002 FR-012, tasks T070).
 *
 * Route faylları nazikdir və `renderApp` ilə test olunmur; burada yalnız fayl
 * səviyyəli müqavilə yoxlanılır: 18 route + `dynamic = 'force-dynamic'`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = join(process.cwd(), 'src', 'app', '[locale]')

function collectPages(dir: string): string[] {
  const result: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) result.push(...collectPages(full))
    else if (entry === 'page.tsx') result.push(full)
  }
  return result
}

const pages = collectPages(ROOT).map((file) => ({
  file,
  // Route group seqmentləri (`(content)`, spec 022) URL-ə daxil deyil — Next kimi çıxarılır.
  route: `/${relative(ROOT, file)
    .replace(/\\/g, '/')
    .replace(/\([^/]+\)\/?/g, '')
    .replace(/\/?page\.tsx$/, '')}`,
  source: readFileSync(file, 'utf8'),
}))

describe('route faylları', () => {
  it('18 route + AZIR (spec 021) + şöbə (spec 024) + media siyahıları (spec 028) + video detalı (spec 035) mövcuddur (contracts/routes.md §1)', () => {
    expect(pages.map((p) => p.route).sort()).toEqual(
      [
        '/',
        '/[...slug]',
        '/currencies',
        '/laws',
        '/laws/[slug]',
        '/media',
        '/media/events',
        '/media/events/[slug]',
        '/media/galleries',
        '/media/galleries/[id]',
        '/media/release-schedule',
        '/media/videos',
        '/media/videos/[id]',
        '/national-currency',
        '/national-currency/[slug]',
        '/national-currency/news',
        '/national-currency/news/[slug]',
        '/organization',
        '/organization/divisions/[id]',
        '/organization/staff/detail/[id]',
        '/press-releases',
        '/press-releases/[slug]',
        '/search',
        '/securities',
        '/statistics',
        '/statistics/azir',
      ].sort(),
    )
  })

  it.each(pages.map((p) => [p.route, p] as const))('%s generateMetadata ixrac edir', (_route, page) => {
    expect(page.source).toMatch(/export async function generateMetadata/)
  })

  it.each(pages.map((p) => [p.route, p] as const))('%s hər sorğuda serverdən render olunur', (_route, page) => {
    expect(page.source).toContain("export const dynamic = 'force-dynamic'")
  })

  it('route faylları nazikdir — loader və view-dan başqa məntiq yoxdur', () => {
    for (const page of pages) {
      expect(page.source, page.route).not.toMatch(/from '@\/features\//)
      expect(page.source, page.route).not.toMatch(/from '@\/server\/api-client'/)
    }
  })
})
