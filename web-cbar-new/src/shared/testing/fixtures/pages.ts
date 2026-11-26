/**
 * Səhifə ağacı fikstürü — 11 üst bölmə: nav zolağında 9 (spec 056: 1360-dan 9, 1024–1359-da 8), hamburgerdə
 * 2 — xarici keçid və "Menyularda yox" qeyd olunmuş kök ("İstinadlar", spec 056). 3 səviyyə, `navUrl`-lu node-lar
 * və `FEATURE_ROUTES` slug-ları (spec 002 contracts/routes.md §3).
 */
import type { PageNode } from '@/entities/page-node'

import type { PageDetail } from '@/features/pages/model/schemas'

function node(
  id: number,
  title: string,
  slug: string,
  children: PageNode[] = [],
  navUrl: string | null = null,
): PageNode {
  // The API always sends showInSideNav (spec 041); shown is its default.
  return { id, title, slug, navUrl, showInSideNav: true, children }
}

export const pageTreeAz: PageNode[] = [
  node(1, 'Haqqımızda', 'haqqimizda', [
    node(11, 'Tarix', 'tarix', [
      node(111, 'Sədrlər', 'sedrler', [node(1111, 'Dərin', 'derin')]),
    ]),
    node(
      12,
      'Təşkilati struktur və idarəetmə',
      'teskilati-struktur-ve-idareetme',
    ),
  ]),
  node(2, 'Pul siyasəti', 'pul-siyaseti', [
    node(21, 'Faiz dəhlizi', 'faiz-dehlizi'),
  ]),
  node(3, 'Maliyyə sabitliyi', 'maliyye-sabitliyi', [
    node(31, 'Maliyyə sabitliyi hesabatı', 'maliyye-sabitliyi-hesabati'),
    node(32, 'Dayanıqlı Maliyyə', 'dayaniqli-maliyye', [
      node(321, 'Dayanıqlı maliyyə üzrə hesabatlar', 'dayaniqli-maliyye-uzre-hesabatlar'),
    ]),
  ]),
  node(4, 'Statistika', 'statistika', [
    node(41, 'Məzənnələr', 'mezenneler', [], '/currencies'),
  ]),
  node(5, 'Media', 'media', [
    node(51, 'Press relizlər', 'press-relizler'),
    node(52, 'Fotoqalereya', 'fotoqalereya'),
  ]),
  node(6, 'Nəşrlər və tədqiqatlar', 'nesrler-ve-tedqiqatlar'),
  node(7, 'İnsan resursları', 'insan-resurslari'),
  node(8, 'Qanunvericilik', 'qanunvericilik', [
    node(81, 'Hüquqi əsaslar', 'merkezi-bankin-huquqi-esaslari'),
  ]),
  node(10, 'Ödəniş sistemləri', 'odenis-sistemleri'),
  node(9, 'E-xidmətlər', 'e-xidmetler', [], 'https://www.e-cbar.az/'),
  // "Menyularda yox" on a root: out of the wide-screen hamburger panel only (spec 056).
  { ...node(92, 'İstinadlar', 'istinadlar'), showInSideNav: false },
]

export const pageTreeEn: PageNode[] = [
  node(1, 'About us', 'about-us', [node(11, 'History', 'history')]),
  node(2, 'Monetary policy', 'monetary-policy'),
  node(5, 'Media', 'media', [node(51, 'Press releases', 'press-releases')]),
  node(4, 'Statistics', 'statistics'),
]

export const pageDetailFixture: PageDetail = {
  id: 21,
  title: 'Faiz dəhlizi',
  slug: 'faiz-dehlizi',
  content: '<p>Mərkəzi Bankın faiz dəhlizi <a href="/media/12">sənəd</a>.</p>',
  assets: [
    {
      mediaId: 301,
      title: 'Qərar 2025',
      mimeType: 'application/pdf',
      sizeBytes: 120_000,
      group: '2025',
      url: '/media/301',
    },
    {
      mediaId: 302,
      title: 'Qərar 2024',
      mimeType: 'application/pdf',
      sizeBytes: 98_000,
      group: '2024',
      url: '/media/302',
    },
    {
      mediaId: 303,
      title: 'Cədvəl',
      mimeType: 'application/vnd.ms-excel',
      sizeBytes: 45_000,
      group: null,
      url: '/media/303',
    },
    {
      mediaId: 304,
      title: 'Şəkil',
      mimeType: 'image/png',
      sizeBytes: 45_000,
      group: null,
      url: '/media/304',
    },
  ],
}

/** Məzmunu boş, alt səhifələri olan bölmə. */
export const parentPageFixture: PageDetail = {
  id: 1,
  title: 'Haqqımızda',
  slug: 'haqqimizda',
  content: null,
  assets: [],
}
