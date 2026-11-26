/** Page mocks: a three-level tree, protection flags, legacy HTML content. */

export interface PageRecord {
  id: number
  parentId: number | null
  sortOrder: number
  status: string
  showInFooter: boolean
  navUrl: string | null
  /** Booleans, except `showInDropdownNav` (spec 054), which is null until an editor places the page. */
  flags: Record<string, boolean | null>
  translations: Record<
    string,
    {
      title: string
      slug: string
      content: string | null
      menuGroup?: string | null
    }
  >
  assets: {
    id: number
    mediaId: number
    originalName: string
    mimeType: string
    sizeBytes: number
    sortOrder: number
    groupLabel: string | null
    translations: Record<string, { title: string }>
  }[]
}

const flags = (overrides: Record<string, boolean> = {}) => ({
  active: true,
  visible: true,
  showAz: true,
  showEn: true,
  readonly: false,
  disabled: false,
  removable: true,
  removableAll: false,
  movableU: true,
  movableD: true,
  movableL: false,
  movableR: false,
  selected: false,
  collapsed: false,
  showInSideNav: true,
  showInDropdownNav: null,
  ...overrides,
})

export const LEGACY_PAGE_HTML =
  '<h2>Haqqımızda</h2><p>Mərkəzi Bank <a href="/media/3" data-media-link="">hesabat</a> dərc edir.</p>' +
  '<details data-accordion=""><summary>2024</summary><div data-type="details-content"><p>İllik hesabat.</p></div></details>' +
  '<table><tbody><tr><th>Göstərici</th><th>Dəyər</th></tr><tr><td>Uçot dərəcəsi</td><td>7%</td></tr></tbody></table>' +
  '<p><a href="/media/1"><img src="/media/1" alt="Bina"></a></p>' +
  '<iframe src="https://www.google.com/maps/embed?pb=x" width="600" height="450" style="border:0" allowfullscreen="" loading="lazy"></iframe>'

export const pageFixtures: PageRecord[] = [
  {
    id: 1,
    parentId: null,
    sortOrder: 1,
    status: 'published',
    showInFooter: true,
    navUrl: null,
    flags: flags({ removableAll: true }),
    translations: {
      az: {
        title: 'Haqqımızda',
        slug: 'haqqimizda',
        content: LEGACY_PAGE_HTML,
      },
      en: {
        title: 'About us',
        slug: 'about-us',
        content: '<p>About the bank.</p>',
      },
    },
    assets: [
      {
        id: 11,
        mediaId: 3,
        originalName: 'hesabat-2025.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 240113,
        sortOrder: 1,
        groupLabel: '2025',
        translations: {
          az: { title: 'İllik hesabat' },
          en: { title: 'Annual report' },
        },
      },
      {
        id: 12,
        mediaId: 4,
        originalName: 'mezenne.xlsx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        sizeBytes: 51200,
        sortOrder: 2,
        groupLabel: null,
        translations: {
          az: { title: 'Məzənnə cədvəli' },
          en: { title: 'Rate table' },
        },
      },
    ],
  },
  {
    id: 2,
    parentId: 1,
    sortOrder: 1,
    status: 'published',
    showInFooter: false,
    navUrl: null,
    flags: flags({ readonly: true }),
    translations: {
      az: { title: 'Tarix', slug: 'tarix', content: '<p>Bankın tarixi.</p>' },
      en: { title: 'History', slug: 'history', content: '<p>History.</p>' },
    },
    assets: [],
  },
  {
    id: 3,
    parentId: 2,
    sortOrder: 1,
    status: 'draft',
    showInFooter: false,
    navUrl: null,
    flags: flags(),
    translations: {
      az: { title: 'Sədrlər', slug: 'sedrler', content: '<p>Sədrlər.</p>' },
    },
    assets: [],
  },
  {
    id: 4,
    parentId: 1,
    sortOrder: 2,
    status: 'published',
    showInFooter: false,
    navUrl: 'https://example.org/reh',
    flags: flags({ visible: false, active: false }),
    translations: {
      az: {
        title: 'Rəhbərlik',
        slug: 'rehberlik',
        content: '<p>Rəhbərlik.</p>',
      },
      en: {
        title: 'Management',
        slug: 'management',
        content: '<p>Management.</p>',
      },
    },
    assets: [],
  },
  {
    id: 5,
    parentId: null,
    sortOrder: 2,
    status: 'published',
    showInFooter: false,
    navUrl: null,
    flags: flags(),
    translations: {
      az: {
        title: 'Pul siyasəti',
        slug: 'pul-siyaseti',
        content: LEGACY_PAGE_HTML,
      },
      en: {
        title: 'Monetary policy',
        slug: 'monetary-policy',
        content: '<p>Policy.</p>',
      },
    },
    assets: [],
  },
  {
    id: 6,
    parentId: null,
    sortOrder: 3,
    status: 'archived',
    showInFooter: false,
    navUrl: null,
    flags: flags({ removable: false, movableU: false, movableD: false }),
    translations: {
      az: {
        title: 'Qanunvericilik',
        slug: 'qanunvericilik',
        content: '<p>Qanunlar.</p>',
      },
      en: {
        title: 'Legislation',
        slug: 'legislation',
        content: '<p>Laws.</p>',
      },
    },
    assets: [],
  },
]
