import { describe, expect, it } from 'vitest'

import { aboutTreeAz, aboutTreeEn } from '@/shared/testing/fixtures/about'
import { hideInSideNav } from '@/shared/testing/factories'
import { cooperationTreeAz, cooperationTreeEn } from '@/shared/testing/fixtures/cooperation-section'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { publicationsTreeAz } from '@/shared/testing/fixtures/publications-section'

import { buildSectionShell } from './model'

const base = { section: 'about' as const, locale: 'az' as const, pageUrl: 'https://www.cbar.az/az/x', pageTitle: 'Səhifə' }

describe('buildSectionShell', () => {
  it('CMS səhifəsi: breadcrumb ağacdan, son element link deyil', () => {
    const shell = buildSectionShell({ ...base, tree: aboutTreeAz, current: { slug: 'pul-siyaseti-ve-maliyye-sabitliyi-komitesi' } })
    expect(shell.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Haqqımızda', href: '/az/haqqimizda' },
      { label: 'Təşkilati struktur və idarəetmə', href: '/az/teskilati-struktur-ve-idareetme' },
      { label: 'Pul Siyasəti və Maliyyə Sabitliyi Komitəsi', href: null },
    ])
  })

  it('feature səhifəsi (`?section=board`): menyuda cari və açıq zəncir', () => {
    const shell = buildSectionShell({ ...base, tree: aboutTreeAz, current: { href: '/az/organization?section=board' } })
    expect(shell.crumbs.at(-1)).toEqual({ label: 'İdarə Heyəti', href: null })
    const structure = shell.nav.find((n) => n.key.startsWith('3-'))!
    expect(structure.open).toBe(true)
    expect(structure.children.find((c) => c.current)?.href).toBe('/az/organization?section=board')
    expect(shell.nav.find((n) => n.key.startsWith('2-'))?.open).toBe(false)
  })

  it('bio: əməkdaş adı ayrıca son element, ana qovşaq link olaraq qalır', () => {
    const shell = buildSectionShell({ ...base, tree: aboutTreeAz, current: { href: '/az/organization?section=board' }, trail: 'Taleh Kazımov' })
    expect(shell.crumbs.slice(-2)).toEqual([
      { label: 'İdarə Heyəti', href: '/az/organization?section=board' },
      { label: 'Taleh Kazımov', href: null },
    ])
    expect(shell.share.title).toBe('Taleh Kazımov')
  })

  it('ana qovşaq ağacda yoxdursa trail bir dəfə yazılır', () => {
    const shell = buildSectionShell({ ...base, pageTitle: 'Ad', tree: aboutTreeAz, current: { href: '/az/organization?section=yoxdur' }, trail: 'Ad' })
    expect(shell.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Haqqımızda', href: '/az/haqqimizda' },
      { label: 'Ad', href: null },
    ])
  })

  it('menyu iki səviyyədir', () => {
    const shell = buildSectionShell({ ...base, tree: aboutTreeAz, current: { slug: 'tarixi' } })
    const copy = shell.nav.find((n) => n.title.includes('Kopya'))!
    expect(copy.children.length).toBeGreaterThan(0)
    expect(copy.children.every((c) => c.children.length === 0)).toBe(true)
  })

  it('Kopya səhifəsi: menyu Kopya kökündən, İdarə Heyəti (Kopya) görünür', () => {
    const shell = buildSectionShell({ ...base, tree: aboutTreeAz, current: { href: '/az/organization?section=board&copy=1' } })
    expect(shell.nav.map((n) => n.title)).toEqual(['Tarix (Kopya)', 'Təşkilati struktur və idarəetmə (Kopya)', 'Missiya və dəyərlər (Kopya)', 'Əlaqə (Kopya)'])
    const structure = shell.nav[1]!
    expect(structure.open).toBe(true)
    expect(structure.children.find((c) => c.current)).toMatchObject({ title: 'İdarə Heyəti (Kopya)', href: '/az/organization?section=board&copy=1' })
    expect(shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Haqqımızda', 'Haqqımızda (Kopya)', 'Təşkilati struktur və idarəetmə (Kopya)', 'İdarə Heyəti (Kopya)'])
    // Orijinal səhifədə menyu dəyişmir.
    expect(buildSectionShell({ ...base, tree: aboutTreeAz, current: { slug: 'tarixi' } }).nav[0]?.title).toBe('Tarixi')
  })

  it('Media bölməsi (spec 028): giriş səhifəsində aktiv yoxdur, siyahı href-i ilə bənd aktiv, Kopya kökü', () => {
    const media = { ...base, section: 'media' as const, tree: mediaTreeAz, pageTitle: 'Media' }

    const landing = buildSectionShell({ ...media, current: { slug: 'media' } })
    expect(landing.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Media', href: null },
    ])
    expect(landing.nav).toHaveLength(mediaTreeAz[0]!.children.length)
    expect(landing.nav.some((n) => n.current || n.open)).toBe(false)

    // Redaktor `navUrl`-ı `/media/galleries` edəndən sonra siyahı səhifəsi menyuda aktivdir.
    const tree = [{ ...mediaTreeAz[0]!, children: mediaTreeAz[0]!.children.map((n) => (n.slug === 'fotoqalereya' ? { ...n, navUrl: '/media/galleries' } : n)) }]
    const list = buildSectionShell({ ...media, tree, current: { href: '/az/media/galleries' }, pageTitle: 'Fotoqalereya' })
    expect(list.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Media', 'Fotoqalereya'])
    expect(list.nav.find((n) => n.current)?.title).toBe('Fotoqalereya')

    // Qalereya detalı: ağacda olmayan ad `trail` ilə son elementdir.
    const detail = buildSectionShell({ ...media, tree, current: { href: '/az/media/galleries' }, pageTitle: 'Açılış', trail: 'Açılış' })
    expect(detail.crumbs.slice(-2)).toEqual([
      { label: 'Fotoqalereya', href: '/az/media/galleries' },
      { label: 'Açılış', href: null },
    ])

    // "Media (Kopya)" səhifəsində menyu Kopya kökündən qurulur.
    const copy = buildSectionShell({ ...media, current: { slug: 'media-copy' } })
    expect(copy.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Media', 'Media (Kopya)'])
    expect(copy.nav.every((n) => n.title.endsWith('(Kopya)'))).toBe(true)
  })

  it('"Beynəlxalq əməkdaşlıq" (spec 043): kökdə aktiv bənd yoxdur, alt səhifədə bənd cari, Kopya kökü', () => {
    const cooperation = { ...base, section: 'cooperation' as const, tree: cooperationTreeAz, pageTitle: 'Beynəlxalq əməkdaşlıq' }

    const landing = buildSectionShell({ ...cooperation, current: { slug: 'beynelxalq-emekdasliq' } })
    expect(landing.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Beynəlxalq əməkdaşlıq', href: null },
    ])
    expect(landing.nav.map((n) => n.href)).toEqual(cooperationTreeAz[0]!.children.map((n) => `/az/${n.slug}`))
    expect(landing.nav.some((n) => n.current || n.open)).toBe(false)

    const child = buildSectionShell({ ...cooperation, current: { slug: 'merkezi-banklarla-emekdasliq' }, pageTitle: 'Mərkəzi banklarla əməkdaşlıq' })
    expect(child.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Beynəlxalq əməkdaşlıq', 'Mərkəzi banklarla əməkdaşlıq'])
    expect(child.nav.find((n) => n.current)?.title).toBe('Mərkəzi banklarla əməkdaşlıq')

    const copy = buildSectionShell({ ...cooperation, current: { slug: 'beynelxalq-tedbirler-copy' } })
    expect(copy.nav.map((n) => n.title).every((t) => t.endsWith('(Kopya)'))).toBe(true)
    expect(copy.nav.find((n) => n.current)?.title).toBe('Beynəlxalq tədbirlər (Kopya)')

    const en = buildSectionShell({ ...cooperation, locale: 'en', tree: cooperationTreeEn, current: { slug: 'international-cooperation' } })
    expect(en.crumbs.map((c) => c.label)).toEqual(['Home', 'International Cooperation'])
  })

  it('en ağacı və boş ağac', () => {
    expect(buildSectionShell({ ...base, locale: 'en', tree: aboutTreeEn, current: { slug: 'history' } }).crumbs[0]).toEqual({ label: 'Home', href: '/en' })
    const empty = buildSectionShell({ ...base, tree: [], current: { slug: 'tarixi' } })
    expect(empty.nav).toEqual([])
    expect(empty.crumbs).toEqual([
      { label: 'Ana səhifə', href: '/az' },
      { label: 'Səhifə', href: null },
    ])
  })
})

describe('buildSectionShell: "Sol menyuda göstər" (spec 041)', () => {
  const media = { ...base, section: 'media' as const, pageTitle: 'Media' }
  // 81 Korporativ sosial məsuliyyət (yarpaq), 84 Tədbirlər (alt ağaclı), 407 Press-relizlər (Kopya).
  const tree = hideInSideNav(mediaTreeAz, [81, 84, 407])
  const titles = (nav: { title: string }[]) => nav.map((n) => n.title)
  const visibleTitles = mediaTreeAz[0]!.children.map((n) => n.title).filter((t) => t !== 'Korporativ sosial məsuliyyət' && t !== 'Tədbirlər')

  it('gizli bəndlər başqa səhifədə yoxdur, qalanların sırası dəyişmir', () => {
    const shell = buildSectionShell({ ...media, tree, current: { slug: 'media' } })
    expect(titles(shell.nav)).toEqual(visibleTitles)
  })

  it('gizli bəndin alt ağacı menyuya düşmür və kökə qalxmır', () => {
    const shell = buildSectionShell({ ...media, tree, current: { slug: 'elanlar' } })
    const all = JSON.stringify(shell.nav)
    expect(all).not.toContain('COP29')
    expect(shell.nav.find((n) => n.title === 'Elanlar')?.current).toBe(true)
  })

  it('bayraq breadcrumb-a təsir etmir', () => {
    const plain = buildSectionShell({ ...media, tree: mediaTreeAz, current: { slug: 'korporativ-sosial-mesuliyyet' } })
    const hidden = buildSectionShell({ ...media, tree, current: { slug: 'korporativ-sosial-mesuliyyet' } })
    expect(hidden.crumbs).toEqual(plain.crumbs)
    expect(hidden.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Media', 'Korporativ sosial məsuliyyət'])
  })

  it('gizli səhifənin özü açıqdır: öz yerində aktiv bənddir', () => {
    const shell = buildSectionShell({ ...media, tree, current: { slug: 'korporativ-sosial-mesuliyyet' } })
    const plain = buildSectionShell({ ...media, tree: mediaTreeAz, current: { slug: 'korporativ-sosial-mesuliyyet' } })
    expect(shell.nav.find((n) => n.current)?.title).toBe('Korporativ sosial məsuliyyət')
    expect(titles(shell.nav)).toEqual(titles(plain.nav).filter((t) => t !== 'Tədbirlər'))
  })

  it('gizli bəndin alt səhifəsi açıqdır: gizli bənd açılır, zəncir və breadcrumb tamdır', () => {
    const shell = buildSectionShell({ ...media, tree, current: { slug: 'cop29' } })
    const events = shell.nav.find((n) => n.title === 'Tədbirlər')
    expect(events?.open).toBe(true)
    expect(events?.children.find((c) => c.current)?.title).toBe('COP29')
    expect(shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Media', 'Tədbirlər', 'COP29'])
  })

  it('Kopya bölməsində də işləyir', () => {
    const shell = buildSectionShell({ ...media, tree, current: { slug: 'media-copy' } })
    expect(titles(shell.nav)).not.toContain('Press-relizlər (Kopya)')
    expect(titles(shell.nav)).toContain('Elanlar (Kopya)')
  })

  it('bayraqsız ağac əvvəlki kimidir', () => {
    const shell = buildSectionShell({ ...media, tree: mediaTreeAz, current: { slug: 'media' } })
    expect(shell.nav).toHaveLength(mediaTreeAz[0]!.children.length)
  })
})

describe('buildSectionShell — "Nəşrlər və tədqiqatlar" (spec 054 US4)', () => {
  const pub = { ...base, section: 'publications' as const, tree: publicationsTreeAz() }
  const titles = (items: { title: string }[]) => items.map((i) => i.title)

  it('the root shows the two groups closed, and no page outside Figma', () => {
    const shell = buildSectionShell({ ...pub, current: { slug: 'nesrler-ve-tedqiqatlar' } })
    expect(titles(shell.nav)).toEqual(['Tədqiqatlar', 'Nəşrlər, hesabatlar və sənədlər'])
    expect(shell.nav.every((item) => !item.open)).toBe(true)
  })

  it('a group page opens its group and marks it current', () => {
    const shell = buildSectionShell({ ...pub, current: { slug: 'tedqiqatlar' } })
    const [research, publications] = shell.nav
    expect(research).toMatchObject({ current: true, open: true })
    expect(titles(research!.children)).toEqual(['Ekonometrik modellər', 'İşçi məqalələri'])
    expect(publications?.open).toBe(false)
  })

  it('a leaf opens its group with seven items: "Ödəniş xidmətləri" is only in the dropdown menus', () => {
    const shell = buildSectionShell({ ...pub, current: { slug: 'illik-hesabat' } })
    const publications = shell.nav[1]!
    expect(publications.open).toBe(true)
    expect(publications.children).toHaveLength(7)
    expect(titles(publications.children)).not.toContain('Ödəniş xidmətləri')
    expect(publications.children.find((child) => child.current)?.title).toBe('İllik hesabat')
  })

  it('a page outside Figma opens by its address: the breadcrumb shows the section, the menu marks nothing', () => {
    const shell = buildSectionShell({ ...pub, current: { slug: 'kreditlesme-fealiyyeti-ve-maliyyelesme-menbelerine-dair-sorgu' } })
    expect(shell.crumbs.map((c) => c.label)).toEqual(['Ana səhifə', 'Nəşrlər və tədqiqatlar', 'Kreditləşmə fəaliyyəti və maliyyələşmə mənbələrinə dair sorğu'])
    // The page itself is open, so the left-menu exception lists it (spec 041), but no Figma item is current.
    const groups = shell.nav.filter((item) => item.children.length > 0 || item.title === 'Tədqiqatlar')
    expect(groups.every((item) => !item.current)).toBe(true)
  })

  it('the pages moved from the consumer section have this section in their breadcrumb', () => {
    const shell = buildSectionShell({ ...pub, current: { slug: 'reqemsal-firildaqciliq-statistikasi' } })
    expect(shell.crumbs.map((c) => c.label)).toEqual([
      'Ana səhifə',
      'Nəşrlər və tədqiqatlar',
      'Nəşrlər, hesabatlar və sənədlər',
      'Rəqəmsal fırıldaqçılıq statistikası',
    ])
  })
})
