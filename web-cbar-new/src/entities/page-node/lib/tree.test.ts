import { describe, expect, it } from 'vitest'

import { aboutTreeAz, aboutTreeEn } from '@/shared/testing/fixtures/about'
import { consumerTreeAz, consumerTreeEn } from '@/shared/testing/fixtures/consumer-section'
import { cooperationTreeAz, cooperationTreeEn } from '@/shared/testing/fixtures/cooperation-section'
import { literacyTreeAz, literacyTreeEn } from '@/shared/testing/fixtures/literacy-section'
import { mediaTreeAz, mediaTreeEn } from '@/shared/testing/fixtures/media-section'
import { publicationsTreeAz, publicationsTreeEn } from '@/shared/testing/fixtures/publications-section'

import { pageTreeSchema, type PageNode } from '../model/schemas'
import {
  ABOUT_SECTION_TITLES,
  aboutSection,
  activeChainIds,
  findChain,
  findChainBy,
  flattenTree,
  hrefFor,
  isCurrentNode,
  isInDropdownNav,
  isInSideNav,
  isSectionCopy,
  isWorkingPapersSlug,
  nodeHref,
  SECTION_TITLES,
  sectionKeyOf,
  sectionRoot,
  WORKING_PAPERS_SLUG,
} from './tree'

const tree: PageNode[] = [
  {
    id: 1,
    title: 'Haqqımızda',
    slug: 'haqqimizda',
    navUrl: null,
    children: [
      {
        id: 2,
        title: 'Tarix',
        slug: 'tarix',
        navUrl: null,
        children: [{ id: 3, title: 'Sədrlər', slug: 'sedrler', navUrl: null, children: [] }],
      },
    ],
  },
  { id: 4, title: 'Media', slug: 'media', navUrl: '/media', children: [] },
]

describe('findChain', () => {
  it('3 səviyyəli zənciri kökdən qaytarır', () => {
    expect(findChain(tree, 'sedrler')?.map((n) => n.slug)).toEqual(['haqqimizda', 'tarix', 'sedrler'])
  })

  it('kök node üçün tək elementli zəncir verir', () => {
    expect(findChain(tree, 'media')?.map((n) => n.id)).toEqual([4])
  })

  it('tapılmayan slug üçün null', () => {
    expect(findChain(tree, 'yoxdur')).toBeNull()
  })
})

describe('hrefFor / flattenTree', () => {
  it('zənciri locale prefiksi ilə yola çevirir', () => {
    expect(hrefFor(findChain(tree, 'tarix') ?? [], 'en')).toBe('/en/haqqimizda/tarix')
  })

  it('flattenTree dərinliyi qeyd edir', () => {
    expect(flattenTree(tree).map((e) => `${e.node.slug}:${e.depth}`)).toEqual([
      'haqqimizda:1',
      'tarix:2',
      'sedrler:3',
      'media:1',
    ])
  })
})

describe('About köməkçiləri (spec 024)', () => {
  const about = aboutTreeAz[0]!

  it('aboutSection kökü başlıqla tapır, kopya alt ağacı kökün uşağıdır', () => {
    expect(aboutSection(aboutTreeAz)?.slug).toBe('haqqimizda')
    expect(aboutSection(aboutTreeEn)?.slug).toBe('about-us')
    expect(about.children.some((n) => n.slug === 'haqqimizda-copy')).toBe(true)
    expect(aboutSection(tree.slice(1))).toBeNull()
  })

  it('nodeHref: daxili navUrl locale ilə, xarici olduğu kimi, yoxsa slug', () => {
    const board = findChain(aboutTreeAz, 'idare-heyeti')!.at(-1)!
    expect(nodeHref(board, 'az')).toBe('/az/organization?section=board')
    expect(nodeHref({ ...board, navUrl: 'https://e-cbar.az' }, 'az')).toBe('https://e-cbar.az')
    expect(nodeHref(about, 'en')).toBe('/en/haqqimizda')
  })

  it('findChainBy feature ünvanı ilə zənciri tapır', () => {
    const chain = findChainBy(aboutTreeAz, (n) => isCurrentNode(n, 'az', { href: '/az/organization?section=divisions' }))
    expect(chain?.map((n) => n.slug)).toEqual(['haqqimizda', 'teskilati-struktur-ve-idareetme', 'struktur-bolmeler'])
  })

  it('activeChainIds yalnız cari səhifəyə aparan qovşaqları qaytarır', () => {
    const ids = activeChainIds(about, (n) => isCurrentNode(n, 'az', { href: '/az/organization?section=board' }))
    expect([...ids].sort((a, b) => a - b)).toEqual([1, 3, 233])
    expect(activeChainIds(about, (n) => isCurrentNode(n, 'az', { slug: 'tarixi' })).has(3)).toBe(false)
  })
})

describe('Bölmə köməkçiləri (spec 028)', () => {
  it('sectionRoot Media kökünü az/en başlıqla tapır, Kopya kökün uşağıdır', () => {
    expect(sectionRoot(mediaTreeAz, 'media')?.id).toBe(77)
    expect(sectionRoot(mediaTreeEn, 'media')?.slug).toBe('media')
    expect(sectionRoot(mediaTreeAz, 'about')).toBeNull()
    expect(mediaTreeAz[0]!.children.some((n) => isSectionCopy(n, 'media'))).toBe(true)
    expect(isSectionCopy(mediaTreeAz[0]!, 'media')).toBe(false)
  })

  it('sectionKeyOf kökün bölməsini verir, şablonsuz bölmə üçün null', () => {
    const all = [...aboutTreeAz, ...mediaTreeAz, ...tree.slice(1)]
    expect(sectionKeyOf(all, aboutTreeAz[0]!)).toBe('about')
    expect(sectionKeyOf(all, mediaTreeAz[0]!)).toBe('media')
    expect(sectionKeyOf(all, tree[1]!)).toBeNull()
  })

  it('"Beynəlxalq əməkdaşlıq" şablon bölməsidir (spec 043): az/en kök, Kopya kökün uşağıdır', () => {
    expect(sectionKeyOf(cooperationTreeAz, cooperationTreeAz[0]!)).toBe('cooperation')
    expect(sectionKeyOf(cooperationTreeEn, cooperationTreeEn[0]!)).toBe('cooperation')
    expect(sectionRoot(cooperationTreeAz, 'media')).toBeNull()
    expect(cooperationTreeAz[0]!.children.filter((n) => isSectionCopy(n, 'cooperation')).map((n) => n.slug)).toEqual(['beynelxalq-emekdasliq-copy'])
    expect(cooperationTreeEn[0]!.children.some((n) => isSectionCopy(n, 'cooperation'))).toBe(true)
  })

  it('"Maliyyə savadlılığı" is a template section (spec 047): az/en root, the draft is a child of the root', () => {
    const az = literacyTreeAz()
    const en = literacyTreeEn()
    expect(sectionKeyOf(az, az[0]!)).toBe('literacy')
    expect(sectionKeyOf(en, en[0]!)).toBe('literacy')
    expect(az[0]!.children.filter((n) => isSectionCopy(n, 'literacy')).map((n) => n.slug)).toEqual(['maliyye-savadliligi-copy'])
    expect(en[0]!.children.some((n) => isSectionCopy(n, 'literacy'))).toBe(true)
  })

  it('"İstehlakçıların və investorların hüquqları" is a template section (spec 050): az/en root, the draft is a child', () => {
    const az = consumerTreeAz()
    const en = consumerTreeEn()
    expect(sectionKeyOf(az, az[0]!)).toBe('consumer')
    expect(sectionKeyOf(en, en[0]!)).toBe('consumer')
    expect(az[0]!.children.filter((n) => isSectionCopy(n, 'consumer')).map((n) => n.slug)).toEqual([
      'istehlakcilarin-ve-investorlarin-huquqlari-copy',
    ])
    expect(sectionKeyOf(az, az[1]!)).toBe('media')
  })

  it('"Nəşrlər və tədqiqatlar" is a template section (spec 054): az/en root, the draft is a child', () => {
    const az = publicationsTreeAz()
    const en = publicationsTreeEn()
    expect(sectionKeyOf(az, az[0]!)).toBe('publications')
    expect(sectionKeyOf(en, en[0]!)).toBe('publications')
    expect(az[0]!.children.filter((n) => isSectionCopy(n, 'publications')).map((n) => n.slug)).toEqual(['nesrler-ve-tedqiqatlar-copy'])
    expect(sectionKeyOf(az, az[1]!)).toBe('media')
  })

  it('the working papers page is recognised by its slug in both locales (spec 054)', () => {
    expect(isWorkingPapersSlug('isci-meqaleler-silsilesi')).toBe(true)
    expect(isWorkingPapersSlug('working-paper-series')).toBe(true)
    expect(isWorkingPapersSlug('isci-meqaleler-silsilesi-copy')).toBe(false)
    expect(WORKING_PAPERS_SLUG).toEqual({ az: 'isci-meqaleler-silsilesi', en: 'working-paper-series' })
  })

  it('About qısayolları eyni nəticəni verir', () => {
    expect(aboutSection(aboutTreeAz)).toBe(sectionRoot(aboutTreeAz, 'about'))
    expect(ABOUT_SECTION_TITLES).toBe(SECTION_TITLES.about)
  })
})

describe('pageTreeSchema', () => {
  it('children və navUrl olmayan node-u normallaşdırır', () => {
    const parsed = pageTreeSchema.parse([{ id: 9, title: 'X', slug: 'x' }])

    expect(parsed[0].children).toEqual([])
    expect(parsed[0].navUrl).toBeNull()
  })

  it('accepts the spec 054 menu fields, and a node without them (older API)', () => {
    const [withFields, without] = pageTreeSchema.parse([
      { id: 1, title: 'A', slug: 'a', navUrl: null, showInSideNav: false, showInDropdownNav: true, menuGroup: 'Ödəniş sistemləri', children: [] },
      { id: 2, title: 'B', slug: 'b', navUrl: null, showInDropdownNav: null, menuGroup: null, children: [] },
    ])
    expect(withFields?.showInDropdownNav).toBe(true)
    expect(withFields?.menuGroup).toBe('Ödəniş sistemləri')
    expect(without?.showInDropdownNav).toBeNull()
    expect(without?.menuGroup).toBeNull()
    expect(pageTreeSchema.parse([{ id: 3, title: 'C', slug: 'c' }])[0]?.showInDropdownNav).toBeUndefined()
  })
})

describe('isInSideNav (spec 041)', () => {
  const page: PageNode = { id: 7, title: 'Səhifə', slug: 'sehife', navUrl: null, children: [] }
  const none = new Set<number>()

  it('sahə yoxdursa bənd görünür', () => {
    expect(isInSideNav(page, none)).toBe(true)
  })

  it('bayraq açıqdırsa görünür', () => {
    expect(isInSideNav({ ...page, showInSideNav: true }, none)).toBe(true)
  })

  it('bayraq söndürülübsə və səhifə açıq zəncirdə deyilsə gizlidir', () => {
    expect(isInSideNav({ ...page, showInSideNav: false }, new Set([1, 2]))).toBe(false)
  })

  it('bayraq söndürülüb, amma səhifə və ya alt səhifəsi açıqdır: görünür', () => {
    expect(isInSideNav({ ...page, showInSideNav: false }, new Set([7]))).toBe(true)
  })

  it('sxem sahəni qəbul edir, yoxdursa boş saxlayır', () => {
    const [parsed] = pageTreeSchema.parse([{ id: 1, title: 'A', slug: 'a', navUrl: null, showInSideNav: false, children: [{ id: 2, title: 'B', slug: 'b', children: [] }] }])
    expect(parsed?.showInSideNav).toBe(false)
    expect(parsed?.children[0]?.showInSideNav).toBeUndefined()
  })
})

describe('isInDropdownNav (spec 048)', () => {
  const page: PageNode = { id: 7, title: 'Səhifə', slug: 'sehife', navUrl: null, children: [] }

  it('sahə yoxdursa və ya bayraq açıqdırsa açılan menyuda görünür', () => {
    expect(isInDropdownNav(page)).toBe(true)
    expect(isInDropdownNav({ ...page, showInSideNav: true })).toBe(true)
  })

  it('sol menyuda söndürülmüş səhifə açılan menyuda da yoxdur', () => {
    expect(isInDropdownNav({ ...page, showInSideNav: false })).toBe(false)
  })
})

describe('isInDropdownNav with showInDropdownNav (spec 054 data-model)', () => {
  const page: PageNode = { id: 7, title: 'Səhifə', slug: 'sehife', navUrl: null, children: [] }

  it('follows the left-menu flag while the dropdown flag is null or missing', () => {
    expect(isInDropdownNav({ ...page, showInDropdownNav: null })).toBe(true)
    expect(isInDropdownNav({ ...page, showInSideNav: false, showInDropdownNav: null })).toBe(false)
  })

  it('lists a page left out of the left menu when the dropdown flag says so ("Ödəniş xidmətləri")', () => {
    expect(isInDropdownNav({ ...page, showInSideNav: false, showInDropdownNav: true })).toBe(true)
    expect(isInSideNav({ ...page, showInSideNav: false, showInDropdownNav: true }, new Set())).toBe(false)
  })

  it('drops a page from the dropdown menus only, when the dropdown flag is off', () => {
    expect(isInDropdownNav({ ...page, showInSideNav: true, showInDropdownNav: false })).toBe(false)
    expect(isInSideNav({ ...page, showInSideNav: true, showInDropdownNav: false }, new Set())).toBe(true)
  })
})
