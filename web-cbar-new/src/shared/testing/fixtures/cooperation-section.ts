/**
 * "International cooperation" fixtures (spec 043), taken from the test environment (api-cbar-test) on 2026-11-12.
 *
 * Tree: the root (id 120) with 5 children (554, the membership page of spec 046, added by an editor after 2026-11-12) and the editor's draft "Beynəlxalq əməkdaşlıq (Kopya)" (a child of
 * the root, as in About and Media). Page: the root's CMS intro. The global `pageTreeAz` is unchanged — the
 * tests serve this tree with `server.use`.
 */
import type { PageNode } from '@/entities/page-node'

import type { PageDetail } from '@/features/pages/model/schemas'

const leaf = (id: number, title: string, slug: string): PageNode => ({ id, title, slug, navUrl: null, children: [] })

export const cooperationTreeAz: PageNode[] = [
  {
    id: 120,
    title: 'Beynəlxalq əməkdaşlıq',
    slug: 'beynelxalq-emekdasliq',
    navUrl: null,
    children: [
      leaf(121, 'Beynəlxalq təşkilatlarla əməkdaşlıq', 'beynelxalq-teskilatlarla-emekdasliq'),
      leaf(122, 'Mərkəzi banklarla əməkdaşlıq', 'merkezi-banklarla-emekdasliq'),
      leaf(554, 'Beynəlxalq təşkilatlarda üzvlük', 'beynelxalq-teskilatlarda-uzvluk'),
      leaf(123, 'Beynəlxalq tədbirlər', 'beynelxalq-tedbirler'),
      leaf(124, 'AMB tərəfindən təqdim edilən texniki yardımlar', 'amb-terefinden-teqdim-edilen-texniki-yardimlar'),
      {
        id: 466,
        title: 'Beynəlxalq əməkdaşlıq (Kopya)',
        slug: 'beynelxalq-emekdasliq-copy',
        navUrl: null,
        children: [
          leaf(467, 'Beynəlxalq təşkilatlarla əməkdaşlıq (Kopya)', 'beynelxalq-teskilatlarla-emekdasliq-copy'),
          leaf(468, 'Mərkəzi banklarla əməkdaşlıq (Kopya)', 'merkezi-banklarla-emekdasliq-copy'),
          leaf(469, 'Beynəlxalq tədbirlər (Kopya)', 'beynelxalq-tedbirler-copy'),
          leaf(470, 'AMB tərəfindən təqdim edilən texniki yardımlar (Kopya)', 'amb-terefinden-teqdim-edilen-texniki-yardimlar-copy'),
        ],
      },
    ],
  },
]

export const cooperationTreeEn: PageNode[] = [
  {
    id: 120,
    title: 'International Cooperation',
    slug: 'international-cooperation',
    navUrl: null,
    children: [
      leaf(121, 'Cooperation with international organizations', 'cooperation-with-international-organizations'),
      leaf(122, 'Cooperation with central banks', 'cooperation-with-central-banks'),
      leaf(554, 'Membership in international organizations', 'membership-in-international-organizations'),
      leaf(123, 'International events', 'international-events'),
      leaf(124, 'Technical assistance by the CBA', 'technical-assistance-by-the-cba'),
      {
        id: 466,
        title: 'International Cooperation (Copy)',
        slug: 'international-cooperation-copy',
        navUrl: null,
        children: [leaf(467, 'Cooperation with international organizations (Copy)', 'cooperation-with-international-organizations-copy')],
      },
    ],
  },
]

export const cooperationPageAz: PageDetail = {
  id: 120,
  title: 'Beynəlxalq əməkdaşlıq',
  slug: 'beynelxalq-emekdasliq',
  content:
    '<p>Azərbaycan Respublikasının milli iqtisadiyyatının dünya iqtisadi sisteminə inteqrasiyasının dərinləşdiyi bir dövrdə mərkəzi bankçılığın bütün funksional istiqamətləri üzrə fəaliyyətin müasir tələblərə uyğun səmərəli təşkili və beynəlxalq standartların tətbiqi məqsədilə beynəlxalq maliyyə-kredit təşkilatları və mərkəzi bankçılıq işi üzrə beynəlxalq nüfuza malik ölkələrlə qarsılıqlı faydalı əməkdaşlıq münasibətlərinin qurulması mühüm əhəmiyyət kəsb edir.</p>\n' +
    '<p>Azərbaycan Mərkəzi Bankının (AMB) fəaliyyətinin bütün istiqamətlərində işin beynəlxalq standartlara uyğunlaşdırılmasının əsas hədəf olması beynəlxalq təcrübənin öyrənilməsi və əməkdaşlığın genişləndirilməsini, beynəlxalq imicin yüksəldilməsini daha da aktuallaşdırır.</p>',
  assets: [],
}

/**
 * The membership table of the spec 046 seed (Figma `2287:120701`): organization, year — in the design's
 * order, newest year first. The page text is the editor's table, header row in `th` cells.
 */
export const membershipRows: readonly (readonly [string, string])[] = [
  ['Beynəlxalq Maliyyə İstehlakçılarının Müdafiəsi Təşkilatı', '2025'],
  ['İqtisadi Əməkdaşlıq və İnkişaf Təşkilatının Beynəlxalq Maliyyə Savadlılığı Şəbəkəsi', '2025'],
  ['Berlin Qrup üzrə Açıq Maliyyə İşçi Qrupu', '2025'],
  ['Qlobal Maliyyə İnnovasiyaları Şəbəkəsi', '2025'],
  ['Beynəlxalq Qiymətli Kağızlar Komissiyaları Təşkilatının “Artım və inkişaf etməkdə olan bazarlar Komitəsi”', '2024'],
  ['Beynəlxalq Pul Nişanları Assosiasiyası', '2022'],
  ['Dayanıqlı Bankçılıq və Maliyyə Şəbəkəsi', '2022'],
  ['Beynəlxalq Qiymətli Kağızlar Komissiyaları Təşkilatı', '2020'],
  ['Beynəlxalq Sığorta Nəzarəti Qurumları Assosiasiyası', '2020'],
  ['Bazel Komitəsinin Bazel Konsultativ Qrupu', '2020'],
  ['MDB-yə üzv dövlətlərin qiymətli kağızlar bazarının tənzimlənməsi üzrə səlahiyyətli orqanlarının rəhbərləri Şurası', '2020'],
  ['Maliyyə Savadlılığı üzrə Beynəlxalq Şəbəkə', '2011'],
  ['Pulların Saxtalaşdırılmasına qarşı Mərkəzi Banklar Qrupu', '2005'],
  ['Mərkəzi Asiya, Qara Dəniz Regionu və Balkan ölkələrinin Mərkəzi Bank Sədrləri Klubu', '1997'],
]

const membershipCell = (tag: 'td' | 'th', text: string) => `<${tag} colspan="1" rowspan="1"><p>${text}</p></${tag}>`

export const membershipPageAz: PageDetail = {
  id: 554,
  title: 'Beynəlxalq təşkilatlarda üzvlük',
  slug: 'beynelxalq-teskilatlarda-uzvluk',
  content:
    '<table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody>' +
    `<tr>${membershipCell('th', 'Təşkilat')}${membershipCell('th', 'Üzvlük tarixi')}</tr>` +
    membershipRows.map(([name, year]) => `<tr>${membershipCell('td', name)}${membershipCell('td', year)}</tr>`).join('') +
    '</tbody></table>',
  assets: [],
}
