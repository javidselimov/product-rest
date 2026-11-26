import { describe, expect, it } from 'vitest'

import {
  MENU_LOCATION_FLAGS,
  menuLocationOf,
  menuVisibility,
  placementUnder,
  rootPanelHidden,
  sideMenuVisibility,
  menuTreePlacementUnder,
  type MenuPageInput,
} from './menu-visibility'
import { DEFAULT_PAGE_FLAGS, type PageNode } from './schemas'

const page = (over: Partial<MenuPageInput> = {}): MenuPageInput => ({
  status: 'published',
  flags: DEFAULT_PAGE_FLAGS,
  titles: { az: 'Başlıq', en: 'Title' },
  ...over,
})

const node = (
  id: number,
  over: Partial<PageNode> = {},
  children: PageNode[] = [],
): PageNode => ({
  id,
  parentId: null,
  sortOrder: 1,
  status: 'published',
  title: `T${id}`,
  slug: `t${id}`,
  navUrl: null,
  flags: DEFAULT_PAGE_FLAGS,
  children,
  ...over,
})

describe('menuVisibility — səhifənin öz qaydaları (contracts §1–4)', () => {
  it('hamısı qaydasında → hər iki dildə görünür', () => {
    const r = menuVisibility(page(), null)
    expect(r.az).toEqual({ visible: true, reasons: [], promotedToRoot: false })
    expect(r.en.visible).toBe(true)
  })

  it('qaralama → status səbəbi', () => {
    expect(menuVisibility(page({ status: 'draft' }), null).az.reasons).toEqual([
      'status',
    ])
  })

  it('qeyri-aktiv və gizli', () => {
    const r = menuVisibility(
      page({
        flags: { ...DEFAULT_PAGE_FLAGS, active: false, visible: false },
      }),
      null,
    )
    expect(r.az.reasons).toEqual(['inactive', 'hidden'])
  })

  it('yalnız showEn söndürülüb → AZ görünür, EN localeOff', () => {
    const r = menuVisibility(
      page({ flags: { ...DEFAULT_PAGE_FLAGS, showEn: false } }),
      null,
    )
    expect(r.az.visible).toBe(true)
    expect(r.en.reasons).toEqual(['localeOff'])
  })

  it('EN başlığı boş və ya boşluqdur → noTitle', () => {
    expect(
      menuVisibility(page({ titles: { az: 'A', en: '   ' } }), null).en.reasons,
    ).toEqual(['noTitle'])
  })

  it('bir neçə səbəb cədvəl sırası ilə', () => {
    const r = menuVisibility(
      page({
        status: 'archived',
        flags: { ...DEFAULT_PAGE_FLAGS, visible: false, showAz: false },
        titles: { az: '', en: 'x' },
      }),
      null,
    )
    expect(r.az.reasons).toEqual(['status', 'hidden', 'localeOff', 'noTitle'])
  })
})

describe('menuVisibility — ağacdakı yer (contracts §5–6)', () => {
  it('dərinlik 4 → tooDeep', () => {
    const r = menuVisibility(page(), {
      az: { depth: 4, parentVisible: true },
      en: { depth: 3, parentVisible: true },
    })
    expect(r.az.reasons).toEqual(['tooDeep'])
    expect(r.en.visible).toBe(true)
  })

  it('valideyn görünmür, səhifə görünür → kökə qalxır', () => {
    const r = menuVisibility(page(), {
      az: { depth: 1, parentVisible: false },
      en: { depth: 2, parentVisible: true },
    })
    expect(r.az).toEqual({ visible: true, reasons: [], promotedToRoot: true })
    expect(r.en.promotedToRoot).toBe(false)
  })

  it('səhifə özü görünmürsə promotedToRoot false', () => {
    const r = menuVisibility(page({ status: 'draft' }), {
      az: { depth: 1, parentVisible: false },
      en: { depth: 1, parentVisible: false },
    })
    expect(r.az.promotedToRoot).toBe(false)
  })
})

describe('menuVisibility — açılan menyular: showInDropdownNav ?? showInSideNav (spec 048, spec 054)', () => {
  const flags = (side: boolean, dropdown: boolean | null) =>
    page({ flags: { ...DEFAULT_PAGE_FLAGS, showInSideNav: side, showInDropdownNav: dropdown } })
  const off = flags(false, null)
  const at = (depth: number, dropdownHiddenAncestor = false) => ({ depth, parentVisible: depth > 1, dropdownHiddenAncestor })
  const both = (p: ReturnType<typeof at>) => ({ az: p, en: p })

  it('sol menyu söndürülüb, açılan bayraq boşdur → onu izləyir, hər iki dildə dropdownNavOff', () => {
    const r = menuVisibility(off, both(at(2)))
    expect(r.az).toEqual({ visible: false, reasons: ['dropdownNavOff'], promotedToRoot: false })
    expect(r.en.reasons).toEqual(['dropdownNavOff'])
  })

  it('"Yalnız açılan menyularda" (false + true) → üst menyuda görünür', () => {
    expect(menuVisibility(flags(false, true), both(at(2))).az.visible).toBe(true)
  })

  it('"Yalnız sol menyuda" (true + false) → üst menyuda yoxdur', () => {
    expect(menuVisibility(flags(true, false), both(at(2))).az.reasons).toEqual(['dropdownNavOff'])
  })

  it('kökdən aşağıdakı əcdad açılan menyularda yoxdur → parentDropdownNavOff', () => {
    expect(menuVisibility(page(), both(at(3, true))).az.reasons).toEqual(['parentDropdownNavOff'])
  })

  it('bölmə kökündə bayraqlar üst menyuya təsir etmir', () => {
    expect(menuVisibility(off, both(at(1))).az.visible).toBe(true)
  })

  it('yer bilinmirsə səhifənin öz bayraqları sayılır', () => {
    expect(menuVisibility(off, null).az.reasons).toEqual(['dropdownNavOff'])
  })

  it('dərinlik limiti ilə birlikdə göstərilir', () => {
    expect(menuVisibility(off, both(at(4))).az.reasons).toEqual(['dropdownNavOff', 'tooDeep'])
  })
})

describe('rootPanelHidden — kök bölmə geniş hamburger panelindən çıxır (spec 056 admin-ux)', () => {
  const root = { depth: 1, parentVisible: null }
  const child = { depth: 2, parentVisible: true }

  it('kök + "Menyularda yox" → geniş paneldə görünmür', () => {
    expect(rootPanelHidden(MENU_LOCATION_FLAGS.none, root, true)).toBe(true)
  })

  it('kök + "Bütün menyularda" → paneldədir', () => {
    expect(rootPanelHidden(MENU_LOCATION_FLAGS.all, root, true)).toBe(false)
  })

  it('kökdən aşağıdakı səhifəyə aid deyil — o, açılan menyulardan bütövlükdə çıxır', () => {
    expect(rootPanelHidden(MENU_LOCATION_FLAGS.none, child, false)).toBe(false)
  })

  it('ağac yüklənməyibsə valideynsiz səhifə kök sayılır', () => {
    expect(rootPanelHidden(MENU_LOCATION_FLAGS.none, null, true)).toBe(true)
    expect(rootPanelHidden(MENU_LOCATION_FLAGS.none, null, false)).toBe(false)
  })

  it('görünməyən valideynin altından kökə qalxan səhifə də kökdür', () => {
    expect(rootPanelHidden(MENU_LOCATION_FLAGS.none, root, false)).toBe(true)
  })
})

describe('menuLocationOf — üç seçim ↔ bayraq cütü (spec 054 admin-ux §3)', () => {
  const pair = (showInSideNav: boolean, showInDropdownNav: boolean | null) => ({ showInSideNav, showInDropdownNav })

  it('hər seçim öz cütünə qayıdır', () => {
    for (const [location, flags] of Object.entries(MENU_LOCATION_FLAGS)) {
      expect(menuLocationOf(flags)).toBe(location)
    }
  })

  it('heç vaxt seçilməmiş səhifə effektiv dəyərdən oxunur', () => {
    expect(menuLocationOf(pair(true, null))).toBe('all')
    expect(menuLocationOf(pair(false, null))).toBe('none')
  })

  it('"Yalnız sol menyuda" (true + false) heç bir seçim deyil', () => {
    expect(menuLocationOf(pair(true, false))).toBeNull()
  })
})

describe('placementUnder', () => {
  // 1 (kök) → 2 → 3 ; 4 (gizli kök) → 5
  const tree = [
    node(1, {}, [node(2, { parentId: 1 }, [node(3, { parentId: 2 })])]),
    node(4, { status: 'draft' }, [node(5, { parentId: 4 })]),
  ]

  it('valideyn yoxdur → kök', () => {
    expect(placementUnder(tree, null)).toEqual({
      depth: 1,
      parentVisible: null,
    })
  })

  it('görünən zəncirin altında dərinlik artır', () => {
    expect(placementUnder(tree, 1)).toEqual({ depth: 2, parentVisible: true })
    expect(placementUnder(tree, 3)).toEqual({ depth: 4, parentVisible: true })
  })

  it('görünməyən valideyn → səhifə kökə düşür', () => {
    expect(placementUnder(tree, 4)).toEqual({ depth: 1, parentVisible: false })
  })

  it('görünməyən babanın altındakı valideyn kökdür → uşaq 2-ci səviyyə', () => {
    expect(placementUnder(tree, 5)).toEqual({ depth: 2, parentVisible: true })
  })

  it('başlığı olmayan valideyn həmin dildə görünmür', () => {
    const noTitle = [node(7, { title: null })]
    expect(placementUnder(noTitle, 7)).toEqual({
      depth: 1,
      parentVisible: false,
    })
  })

  it('ağacda olmayan valideyn → yer bilinmir', () => {
    expect(placementUnder(tree, 99)).toBeNull()
  })
})

describe('menuTreePlacementUnder — sol menyu üçün yer (spec 041)', () => {
  const off = { ...DEFAULT_PAGE_FLAGS, showInSideNav: false }
  const dropdownOnly = { ...DEFAULT_PAGE_FLAGS, showInSideNav: false, showInDropdownNav: true }
  // 1 (bölmə kökü, sol menyuda söndürülüb) → 2 (söndürülüb) → 3 ; 1 → 6 ; 1 → 7 (yalnız açılan) → 8 ; 4 (qaralama) → 5
  const tree = [
    node(1, { flags: off }, [
      node(2, { parentId: 1, flags: off }, [node(3, { parentId: 2 })]),
      node(6, { parentId: 1 }),
      node(7, { parentId: 1, flags: dropdownOnly }, [node(8, { parentId: 7 })]),
    ]),
    node(4, { status: 'draft' }, [node(5, { parentId: 4 })]),
  ]

  it('kökdə bayraq əcdad sayılmır', () => {
    expect(menuTreePlacementUnder(tree, 1)).toEqual({ depth: 2, parentVisible: true, sideNavHiddenAncestor: false, dropdownHiddenAncestor: false })
  })

  it('valideyndə söndürülüb → sideNavHiddenAncestor', () => {
    expect(menuTreePlacementUnder(tree, 2)?.sideNavHiddenAncestor).toBe(true)
    expect(menuTreePlacementUnder(tree, 3)?.sideNavHiddenAncestor).toBe(true)
    // The same ancestor follows its left-menu flag in the dropdown menus (spec 054).
    expect(menuTreePlacementUnder(tree, 3)?.dropdownHiddenAncestor).toBe(true)
  })

  it('"yalnız açılan menyularda" valideyn sol menyunu gizlədir, açılan menyunu yox', () => {
    expect(menuTreePlacementUnder(tree, 7)).toMatchObject({ sideNavHiddenAncestor: true, dropdownHiddenAncestor: false })
  })

  it('qardaş budaq təsirlənmir', () => {
    expect(menuTreePlacementUnder(tree, 6)?.sideNavHiddenAncestor).toBe(false)
  })

  it('kökə qalxan valideyn bölmə köküdür, əcdad sayılmır', () => {
    expect(menuTreePlacementUnder(tree, 5)).toEqual({ depth: 2, parentVisible: true, sideNavHiddenAncestor: false, dropdownHiddenAncestor: false })
  })

  it('valideyn yoxdur və ya ağacda tapılmır', () => {
    expect(menuTreePlacementUnder(tree, null)).toEqual({ depth: 1, parentVisible: null, sideNavHiddenAncestor: false, dropdownHiddenAncestor: false })
    expect(menuTreePlacementUnder(tree, 99)).toBeNull()
  })
})

describe('sideMenuVisibility — sol menyu (spec 041, data-model vəziyyət cədvəli)', () => {
  const at = (depth: number, sideNavHiddenAncestor = false) => ({ depth, parentVisible: depth > 1, sideNavHiddenAncestor, dropdownHiddenAncestor: false })
  const both = (p: ReturnType<typeof at>) => ({ az: p, en: p })

  it('hamısı qaydasında → görünür', () => {
    expect(sideMenuVisibility(page(), both(at(2))).az).toEqual({ visible: true, reasons: [], openOnly: false })
  })

  it('üst menyunun öz səbəbləri sol menyuya da keçir', () => {
    const r = sideMenuVisibility(page({ flags: { ...DEFAULT_PAGE_FLAGS, visible: false } }), both(at(2)))
    expect(r.az).toEqual({ visible: false, reasons: ['hidden'], openOnly: false })
  })

  it('üst menyunun dərinlik limiti sol menyuya aid deyil', () => {
    expect(sideMenuVisibility(page(), both(at(4))).az.visible).toBe(true)
  })

  it('bölmə kökü → sectionRoot', () => {
    expect(sideMenuVisibility(page(), both(at(1))).az.reasons).toEqual(['sectionRoot'])
  })

  it('öz bayrağı söndürülüb → sideNavOff, özü açıq olanda görünür', () => {
    const r = sideMenuVisibility(page({ flags: { ...DEFAULT_PAGE_FLAGS, showInSideNav: false } }), both(at(2)))
    expect(r.en).toEqual({ visible: false, reasons: ['sideNavOff'], openOnly: true })
  })

  it('əcdadda söndürülüb → parentSideNavOff', () => {
    expect(sideMenuVisibility(page(), both(at(3, true))).az).toEqual({ visible: false, reasons: ['parentSideNavOff'], openOnly: true })
  })

  it('yer bilinmirsə yalnız səhifənin öz qaydaları', () => {
    expect(sideMenuVisibility(page({ flags: { ...DEFAULT_PAGE_FLAGS, showInSideNav: false } }), null).az.reasons).toEqual(['sideNavOff'])
    expect(sideMenuVisibility(page(), null).az.visible).toBe(true)
  })
})
