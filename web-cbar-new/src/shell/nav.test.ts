import { describe, expect, it } from 'vitest'

import type { PageNode } from '@/entities/page-node'
import { hideInSideNav } from '@/shared/testing/factories'
import { pageTreeAz, pageTreeEn } from '@/shared/testing/fixtures/pages'
import { publicationsTreeAz } from '@/shared/testing/fixtures/publications-section'

import { MAX_DEPTH, VISIBLE_SECTIONS, VISIBLE_SECTIONS_NARROW } from './constants'
import { buildNavSections, footerSections, isTopLinkSection, navFor } from './nav'

describe('navFor — üstünlük sırası', () => {
  it('navUrl nisbi olanda locale prefiksi alır', () => {
    expect(navFor({ id: 1, title: 'x', slug: 'mezenneler', navUrl: '/currencies', children: [] }, 'en')).toEqual({
      href: '/en/currencies',
      external: false,
    })
  })

  it('navUrl mütləq olanda xarici keçiddir', () => {
    expect(navFor({ id: 1, title: 'x', slug: 'e', navUrl: 'https://www.e-cbar.az/', children: [] }, 'az')).toEqual({
      href: 'https://www.e-cbar.az/',
      external: true,
    })
  })

  it('feature slug-ı route-a xəritələnir (hər iki dil)', () => {
    expect(navFor({ id: 1, title: 'x', slug: 'press-relizler', navUrl: null, children: [] }, 'az').href).toBe(
      '/az/press-releases',
    )
    expect(
      navFor({ id: 1, title: 'x', slug: 'legal-framework-of-the-central-bank', navUrl: null, children: [] }, 'en')
        .href,
    ).toBe('/en/laws')
  })

  it('adi səhifə /{locale}/{slug} olur', () => {
    expect(navFor({ id: 1, title: 'x', slug: 'haqqimizda', navUrl: null, children: [] }, 'az').href).toBe(
      '/az/haqqimizda',
    )
  })
})

describe('buildNavSections', () => {
  const nav = buildNavSections(pageTreeAz, 'az')

  it('ilk 9 bölmə nav zolağındadır, qalanı overflow-dadır (spec 056, Figma I813:25657;9:29)', () => {
    expect(VISIBLE_SECTIONS).toBe(9)
    expect(nav.visible).toHaveLength(VISIBLE_SECTIONS)
    expect(nav.visible[2].title).toBe('Maliyyə sabitliyi')
    expect(nav.overflow.map((s) => s.title)).toEqual(['E-xidmətlər', 'İstinadlar'])
    expect(nav.overflow[0].external).toBe(true)
  })

  it('1024–1359 enində zolağa daha az bölmə sığır (research R2)', () => {
    expect(VISIBLE_SECTIONS_NARROW).toBeLessThan(VISIBLE_SECTIONS)
  })

  it('dərinlik 3-də kəsilir', () => {
    const about = nav.visible[0]
    const history = about.children[0]
    const chairs = history.children[0]

    expect(chairs.title).toBe('Sədrlər')
    expect(chairs.children).toEqual([])
    expect(MAX_DEPTH).toBe(3)
  })

  it('alt bölmənin navUrl-i və feature slug-ı işlənir', () => {
    const stats = nav.visible[3]
    expect(stats.children[0].href).toBe('/az/currencies')

    const media = nav.visible[4]
    expect(media.children.map((c) => c.href)).toEqual(['/az/press-releases', '/az/media/galleries'])
  })
})

describe('isTopLinkSection — üst zolaqda keçidi olan bölmə (spec 042)', () => {
  const byTitle = (title: string) => {
    const section = buildNavSections(pageTreeAz, 'az').all.find((s) => s.title === title)
    if (!section) throw new Error(`fixture-də "${title}" yoxdur`)
    return section
  }

  it('Media və İnsan resursları üst zolaqdadır', () => {
    expect(isTopLinkSection(byTitle('Media'), 'az')).toBe(true)
    expect(isTopLinkSection(byTitle('İnsan resursları'), 'az')).toBe(true)
  })

  it('en ağacında da ünvana görə tanınır', () => {
    const media = buildNavSections(pageTreeEn, 'en').all.find((s) => s.href === '/en/media')
    expect(media && isTopLinkSection(media, 'en')).toBe(true)
  })

  it('başqa bölmə, xarici keçid və alt bölmə üst zolaqda deyil', () => {
    expect(isTopLinkSection(byTitle('Maliyyə sabitliyi'), 'az')).toBe(false)
    expect(isTopLinkSection(byTitle('E-xidmətlər'), 'az')).toBe(false)
    expect(byTitle('Media').children.some((child) => isTopLinkSection(child, 'az'))).toBe(false)
  })

  it('başlığa yox, ünvana baxır', () => {
    expect(isTopLinkSection({ ...byTitle('Media'), title: 'Mediya' }, 'az')).toBe(true)
    expect(isTopLinkSection({ ...byTitle('Maliyyə sabitliyi'), title: 'Media' }, 'az')).toBe(false)
  })
})

describe('kök bölmənin menyu yeri — inDropdownNav (spec 056)', () => {
  const root = (overrides: Partial<PageNode>): PageNode => ({
    id: 1,
    title: 'İstinadlar',
    slug: 'istinadlar',
    navUrl: null,
    children: [{ id: 2, title: 'Alt', slug: 'alt', navUrl: null, children: [] }],
    ...overrides,
  })
  const section = (overrides: Partial<PageNode>) => buildNavSections([root(overrides)], 'az').all[0]

  it('"Menyularda yox" qeyd olunmuş kök (showInSideNav false) açılan menyulardan çıxmalıdır', () => {
    expect(section({ showInSideNav: false }).inDropdownNav).toBe(false)
  })

  it('bayraqsız və "Hər yerdə" kök menyudadır', () => {
    expect(section({}).inDropdownNav).toBe(true)
    expect(section({ showInSideNav: true }).inDropdownNav).toBe(true)
  })

  it('showInDropdownNav dəyəri sol menyu bayrağını üstələyir', () => {
    expect(section({ showInSideNav: false, showInDropdownNav: true }).inDropdownNav).toBe(true)
    expect(section({ showInSideNav: true, showInDropdownNav: false }).inDropdownNav).toBe(false)
  })

  it('alt bəndlər artıq süzülüb, həmişə menyudadır', () => {
    expect(section({ showInSideNav: false }).children.every((child) => child.inDropdownNav)).toBe(true)
  })

  it('gizli kök bölmələrin siyahısında (all) qalır — mobil çekmecə və planşet paneli onu göstərir', () => {
    const titles = buildNavSections(pageTreeAz, 'az').all.map((s) => s.title)
    expect(titles).toContain('İstinadlar')
  })
})

describe('footerSections', () => {
  it('allowlist başlıqlarını ağac sırası ilə seçir', () => {
    expect(footerSections(pageTreeAz, 'az').map((s) => s.title)).toEqual([
      'Haqqımızda',
      'Pul siyasəti',
      'Maliyyə sabitliyi',
      'Statistika',
      'Media',
      'Nəşrlər və tədqiqatlar',
      'İnsan resursları',
    ])
  })

  it('en ağacında da işləyir və uşaqları daşımır', () => {
    const sections = footerSections(pageTreeEn, 'en')

    expect(sections.map((s) => s.href)).toEqual(['/en/about-us', '/en/monetary-policy', '/en/media', '/en/statistics'])
    expect(sections.every((s) => s.children.length === 0)).toBe(true)
  })

  it('"Sual-cavab" kök səhifəsini ağac sırası ilə sonda göstərir (spec 051 FR-017a)', () => {
    const faq = { id: 131, title: 'Sual-cavab', slug: 'sual-cavab', navUrl: null, children: [] }

    const sections = footerSections([...pageTreeAz, faq], 'az')
    expect(sections.at(-1)).toMatchObject({ title: 'Sual-cavab', href: '/az/sual-cavab' })
    expect(sections.map((s) => s.title).indexOf('Sual-cavab')).toBeGreaterThan(sections.map((s) => s.title).indexOf('Nəşrlər və tədqiqatlar'))
  })

  it('uyğunluq yoxdursa ilk 6 bölməyə düşür', () => {
    const tree = pageTreeAz.map((n) => ({ ...n, title: `X ${n.title}` }))

    expect(footerSections(tree, 'az')).toHaveLength(6)
  })
})

describe('"Sol menyuda göstər" açılan menyulardan da çıxarır (spec 048)', () => {
  // Section roots (1, 5), an item with a subtree (11) and leaves (51, the only child 81) are off in the left menu.
  const hidden = hideInSideNav(pageTreeAz, [1, 5, 11, 51, 81])
  const titles = (sections: ReturnType<typeof buildNavSections>['all']) => sections.map((s) => s.title)

  it('kök bölmələr nav çubuğunda, panel və çekmecədə qalır', () => {
    const nav = buildNavSections(hidden, 'az')
    const base = buildNavSections(pageTreeAz, 'az')
    expect(titles(nav.visible)).toEqual(titles(base.visible))
    expect(titles(nav.overflow)).toEqual(titles(base.overflow))
    expect(titles(nav.all)).toEqual(titles(base.all))
  })

  it('gizli bənd alt ağacı ilə mega-menyu, panel və çekmecədən çıxır, qardaşları qalır', () => {
    const { visible, all } = buildNavSections(hidden, 'az')
    const about = all.find((s) => s.title === 'Haqqımızda')
    const media = all.find((s) => s.title === 'Media')
    const laws = all.find((s) => s.title === 'Qanunvericilik')

    expect(about?.children.map((c) => c.title)).toEqual(['Təşkilati struktur və idarəetmə'])
    expect(media?.children.map((c) => c.title)).toEqual(['Fotoqalereya'])
    expect(laws?.children).toEqual([])
    // The bar's mega menu is built from the same sections.
    expect(visible[0]).toEqual(about)
  })

  it('en ağacında da işləyir', () => {
    const { all } = buildNavSections(hideInSideNav(pageTreeEn, [11]), 'en')
    expect(all.find((s) => s.title === 'About us')?.children).toEqual([])
    expect(all.find((s) => s.title === 'Media')?.children.map((c) => c.title)).toEqual(['Press releases'])
  })

  it('footer bölmələri dəyişmir', () => {
    // The footer renders title and address; a root's menu flag (`inDropdownNav`, spec 056) is not read there.
    const links = (sections: ReturnType<typeof footerSections>) => sections.map(({ title, href, external }) => ({ title, href, external }))
    expect(links(footerSections(hidden, 'az'))).toEqual(links(footerSections(pageTreeAz, 'az')))
  })
})

describe('the publications section in the dropdown menus (spec 054 US5)', () => {
  const publications = buildNavSections(publicationsTreeAz(), 'az').all.find((s) => s.title === 'Nəşrlər və tədqiqatlar')!

  it('has the two groups as columns and "Ödəniş xidmətləri" last in the second, without the pages outside Figma', () => {
    expect(publications.children.map((c) => c.title)).toEqual(['Tədqiqatlar', 'Nəşrlər, hesabatlar və sənədlər'])
    const docs = publications.children[1]!.children.map((c) => c.title)
    expect(docs).toHaveLength(8)
    expect(docs.at(-1)).toBe('Ödəniş xidmətləri')
    expect(docs).not.toContain('Kreditləşmə fəaliyyəti və maliyyələşmə mənbələrinə dair sorğu')
  })
})
