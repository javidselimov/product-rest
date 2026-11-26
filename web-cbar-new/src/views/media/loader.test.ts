import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaPageAz, mediaPageEn, mediaTreeAz, mediaTreeEn } from '@/shared/testing/fixtures/media-section'
import { server } from '@/shared/testing/server'

import { loadMedia } from './loader'

function useMediaCms() {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, ({ request }) =>
      HttpResponse.json(new URL(request.url).searchParams.get('locale') === 'en' ? mediaTreeEn : mediaTreeAz),
    ),
    http.get(`${API}/api/v1/pages/media`, ({ request }) =>
      HttpResponse.json(new URL(request.url).searchParams.get('locale') === 'en' ? mediaPageEn : mediaPageAz),
    ),
  )
}

describe('loadMedia (spec 028 US1)', () => {
  it('CMS "Media" səhifəsi + ağac: başlıq, giriş mətni, menyu kökün uşaqlarından, heç biri aktiv deyil', async () => {
    useMediaCms()
    const data = await loadMedia('az')

    expect(data.title).toBe('Media')
    expect(data.html).toContain('Mərkəzi Bankın kommunikasiyası')
    expect(data.shell.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Media', href: null },
    ])
    expect(data.shell.nav.map((n) => n.title)).toEqual(mediaTreeAz[0]!.children.map((n) => n.title))
    expect(data.shell.nav.some((n) => n.current)).toBe(false)
    // Items with a `navUrl` carry the locale; "Tədbirlər" opens the events list, and its old pages stay out of the menu (spec 034).
    expect(data.shell.nav.find((n) => n.title === 'Press-relizlər')?.href).toBe('/az/press-releases?type=1')
    expect(data.shell.nav.find((n) => n.title === 'Tədbirlər')).toMatchObject({ open: false })
    expect(data.shell.nav.find((n) => n.title === 'Tədbirlər')).toMatchObject({ href: '/az/media/events', children: [] })
  })

  it('en: breadcrumb "Home", en məzmun və en ağacı', async () => {
    useMediaCms()
    const data = await loadMedia('en')

    expect(data.shell.crumbs[0]).toEqual({ label: 'Home', href: '/en' })
    expect(data.html).toContain('communication')
    expect(data.shell.nav[0]?.href).toBe('/en/press-releases?type=1')
  })

  it('ağac sorğusu uğursuz olanda menyu boş, breadcrumb iki səviyyə, məzmun qalır (FR-008)', async () => {
    useMediaCms()
    server.use(http.get(`${API}/api/v1/pages/tree`, () => new HttpResponse(null, { status: 500 })))
    const data = await loadMedia('az')

    expect(data.shell.nav).toEqual([])
    expect(data.shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Media'])
    expect(data.html).not.toBe('')
  })

  it('CMS səhifəsi yoxdursa başlıq saytın etiketidir, məzmun boşdur, səhifə sınmır (FR-008)', async () => {
    server.use(http.get(`${API}/api/v1/pages/media`, () => new HttpResponse(null, { status: 404 })))
    const data = await loadMedia('az')

    expect(data.title).toBe('Media')
    expect(data.html).toBe('')
    expect(data.attachments).toEqual([])
    expect(data.shell.crumbs.at(-1)).toEqual({ label: 'Media', href: null })
  })
})
