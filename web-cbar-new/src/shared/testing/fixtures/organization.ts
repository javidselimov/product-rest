import type {
  Division,
  Office,
  OrgChartNode,
  StaffMember,
} from '@/features/organization/model/schemas'

/**
 * Org chart (spec 027) — a small cut of Figma `2007:86377`: the governor, a department reporting
 * to the curator, a deputy → block → department. The full Figma tree is `org-chart-figma.ts`.
 * The default handler returns an empty list (the old CMS image path); tests pass this with `server.use`.
 */
export const orgChartNodes: OrgChartNode[] = [
  { id: 1, parentId: null, kind: 1, curatorDirect: false, name: 'Taleh Kazımov', role: 'Mərkəzi Bankın sədri', link: { type: 'staff', id: 1 }, departmentsOpen: false },
  { id: 2, parentId: 1, kind: 5, curatorDirect: true, name: 'Sədrin ofisi şöbəsi', role: null, link: null, departmentsOpen: false },
  { id: 3, parentId: 1, kind: 2, curatorDirect: false, name: 'Aliyə Məmmədova', role: 'Sədrin müavini', link: { type: 'staff', id: 2 }, departmentsOpen: false },
  { id: 4, parentId: 3, kind: 4, curatorDirect: false, name: 'Hüquq bloku', role: null, link: { type: 'division', id: 2 }, departmentsOpen: false },
  { id: 5, parentId: 4, kind: 5, curatorDirect: false, name: 'Hüquq departamenti', role: null, link: { type: 'division', id: 2 }, departmentsOpen: false },
]

export const boardMembers: StaffMember[] = [
  {
    id: 1,
    type: 1,
    fullName: 'Taleh Kazımov',
    position: 'İdarə Heyətinin sədri',
    receptionDays: 'Çərşənbə',
    phone: '966',
    bio: '<p>Sədr haqqında.</p>',
    photoUrl: '/media/21',
    photos: [
      { mediaId: 31, originalName: 'portret.jpg', mimeType: 'image/jpeg', sizeBytes: 8_598_323, width: 4000, height: 6000, url: '/media/31' },
      { mediaId: 32, originalName: 'yaxin-plan.jpg', mimeType: 'image/jpeg', sizeBytes: 4_823_449, width: 3000, height: 3000, url: '/media/32' },
    ],
  },
  {
    id: 2,
    type: 1,
    fullName: 'Aliyə Məmmədova',
    position: 'Sədrin müavini',
    receptionDays: null,
    phone: null,
    bio: null,
    photoUrl: null,
    photos: [],
  },
]

export const managementMembers: StaffMember[] = [
  {
    id: 3,
    type: 2,
    fullName: 'Rəşad Orucov',
    position: 'Baş direktor',
    receptionDays: null,
    phone: null,
    bio: '<p>Bio.</p>',
    photoUrl: '/media/23',
    photos: [],
  },
]

export const adviserMembers: StaffMember[] = [
  {
    id: 4,
    type: 3,
    fullName: 'Rəna Məlikova',
    position: 'Sədrin müşaviri',
    receptionDays: null,
    phone: null,
    bio: null,
    photoUrl: null,
    photos: [],
  },
]

export const divisions: Division[] = [
  {
    id: 1,
    name: 'Pul siyasəti departamenti',
    description: '<p>Pul siyasətinin <a href="/media/9">hazırlanması</a>.</p>',
    regulation: { mediaId: 31, originalName: 'pul-siyaseti-esasname.pdf', mimeType: 'application/pdf', sizeBytes: 204800, url: '/media/31' },
  },
  { id: 2, name: 'Hüquq departamenti', description: null, regulation: null },
]

export const offices: Office[] = [
  {
    id: 1,
    name: 'Gəncə ərazi idarəsi',
    address: 'Gəncə şəhəri, Nizami küç. 1',
    phone: '(+994 22) 256 12 34',
    directorName: 'Hacıyev Fuad Həsən oğlu',
    photoUrl: '/media/41',
    regulation: { mediaId: 51, originalName: 'gence-esasname.pdf', mimeType: 'application/pdf', sizeBytes: 240_113, url: '/media/51' },
  },
  { id: 2, name: 'Naxçıvan ərazi idarəsi', address: null, phone: null, directorName: null, photoUrl: null, regulation: null },
]
