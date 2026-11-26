/**
 * "Publications and research" fixtures (spec 054). The tree is the test environment's (dump 2026-09-14, pages 62–76 and the
 * consumer section's 102, 103) after the `0041` seed: two group pages (ids 9001, 9002 stand for the new rows), the Figma
 * order, the six pages outside Figma out of every menu, "Ödəniş xidmətləri" only in the dropdown menus, the menu group
 * labels (data only until spec 055) and the "(Kopya)" draft untouched.
 */
import type { PageNode } from '@/entities/page-node'
import type { PageDetail } from '@/features/pages/model/schemas'

type Menu = Pick<PageNode, 'showInSideNav' | 'showInDropdownNav' | 'menuGroup'>

const leaf = (id: number, title: string, slug: string, menu: Menu = {}): PageNode => ({
  id,
  title,
  slug,
  navUrl: null,
  children: [],
  ...menu,
})

const HIDDEN: Menu = { showInSideNav: false }
const DROPDOWN_ONLY: Menu = { showInSideNav: false, showInDropdownNav: true }

export const RESEARCH_GROUP_ID = 9001
export const PUBLICATIONS_GROUP_ID = 9002

export function publicationsTreeAz(): PageNode[] {
  const strategies: Menu = { menuGroup: 'Strategiyalar və konsepsiyalar' }
  return [
    {
      id: 62,
      title: 'Nəşrlər və tədqiqatlar',
      slug: 'nesrler-ve-tedqiqatlar',
      navUrl: null,
      children: [
        {
          ...leaf(RESEARCH_GROUP_ID, 'Tədqiqatlar', 'tedqiqatlar'),
          children: [leaf(74, 'Ekonometrik modellər', 'ekonometrik-modeller'), leaf(73, 'İşçi məqalələri', 'isci-meqaleler-silsilesi')],
        },
        {
          ...leaf(PUBLICATIONS_GROUP_ID, 'Nəşrlər, hesabatlar və sənədlər', 'nesrler-hesabatlar-ve-senedler'),
          children: [
            leaf(63, 'İllik hesabat', 'illik-hesabat'),
            leaf(75, 'Sahələrarası maliyyə axınlarının təhlili', 'sahelerarasi-maliyye-axinlarinin-tehlili'),
            leaf(76, 'Mikromaliyyə Modeli üzrə Strateji Çərçivə', 'mikromaliyye-modeli-uzre-strateji-cercive', strategies),
            leaf(69, 'Maliyyə bazarlarında kibertəhlükəsizlik Strategiyası', 'maliyye-bazarlarinda-kibertehlukesizlik-strategiyasi', strategies),
            leaf(66, 'Azərbaycan Respublikası Mərkəzi Bankının risk əsaslı nəzarət üzrə Siyasət Konsepsiyası', 'risk-esasli-nezaret-uzre-siyaset-konsepsiyasi', strategies),
            leaf(
              67,
              'Azərbaycan Respublikası Mərkəzi Bankının 2024-2029-cu illəri əhatə edəcək Nəzarət Texnologiyaları üzrə Yol Xəritəsinin qısa icmalı',
              'nezaret-texnologiyalari-uzre-yol-xeritesi',
              strategies,
            ),
            leaf(103, 'Rəqəmsal fırıldaqçılıq statistikası', 'reqemsal-firildaqciliq-statistikasi'),
            leaf(102, 'Ödəniş xidmətləri', 'odenis-xidmetleri', { ...DROPDOWN_ONLY, menuGroup: 'Ödəniş sistemləri' }),
          ],
        },
        leaf(64, 'Maliyyə sabitliyi hesabatı', 'maliyye-sabitliyi-hesabati', HIDDEN),
        leaf(65, 'Bank sektoru üzrə makroprudensial siyasət çərçivəsi', 'bank-sektoru-uzre-makroprudensial-siyaset-cercivesi', HIDDEN),
        leaf(68, 'İstehlakçıların hüquqlarının müdafiəsi və Maliyyə savadlılığı', 'istehlakcilarin-huquqlarinin-mudafiesi-ve-maliyye-savadliligi', HIDDEN),
        leaf(70, 'Dayanıqlı Maliyyə üzrə Yol Xəritəsi', 'dayaniqli-maliyye-uzre-yol-xeritesi', HIDDEN),
        leaf(71, 'Kreditləşmə fəaliyyəti və maliyyələşmə mənbələrinə dair sorğu', 'kreditlesme-fealiyyeti-ve-maliyyelesme-menbelerine-dair-sorgu', HIDDEN),
        leaf(
          72,
          'Maliyyə xidmətləri sahəsində tənzimləyici çərçivənin hazırlıq səviyyəsinin təhlili',
          'maliyye-xidmetleri-sahesinde-tenzimleyici-cercivenin-hazirliq-seviyyesinin-tehlili',
          HIDDEN,
        ),
        {
          ...leaf(371, 'Nəşrlər və tədqiqatlar (Kopya)', 'nesrler-ve-tedqiqatlar-copy', HIDDEN),
          children: [leaf(372, 'İllik hesabat (Kopya)', 'illik-hesabat-copy')],
        },
      ],
    },
    { id: 77, title: 'Media', slug: 'media', navUrl: null, children: [leaf(78, 'Xəbərlər', 'xeberler')] },
  ]
}

/** en: pages 68, 72, 75 and 103 have no en translation, so they are not in the en tree. */
export function publicationsTreeEn(): PageNode[] {
  const strategies: Menu = { menuGroup: 'Strategies and concepts' }
  return [
    {
      id: 62,
      title: 'Publications and research',
      slug: 'publications-and-research',
      navUrl: null,
      children: [
        {
          ...leaf(RESEARCH_GROUP_ID, 'Research', 'research'),
          children: [leaf(74, 'Econometric models', 'econometric-models'), leaf(73, 'Working papers', 'working-paper-series')],
        },
        {
          ...leaf(PUBLICATIONS_GROUP_ID, 'Publications, reports and documents', 'publications-reports-and-documents'),
          children: [
            leaf(63, 'Annual reports', 'annual-reports'),
            leaf(76, 'Strategic Framework for a Microfinance Model', 'strategic-framework-for-a-microfinance-model', strategies),
            leaf(69, 'Cybersecurity Strategy in Financial Markets', 'cybersecurity-strategy-in-financial-markets', strategies),
            leaf(66, 'Risk-Based Supervision Policy Concept', 'risk-based-supervision-policy-concept', strategies),
            leaf(67, 'Brief Overview of the Supervision Technologies Road Map', 'brief-overview-of-the-supervision-technologies-road-map', strategies),
            leaf(102, 'Payment services', 'payment-services', { ...DROPDOWN_ONLY, menuGroup: 'Payment systems' }),
          ],
        },
        leaf(64, 'Financial Stability Report', 'financial-stability-report', HIDDEN),
        leaf(65, 'Banking sector macroprudential policy framework', 'banking-sector-macroprudential-policy-framework', HIDDEN),
        leaf(70, 'Sustainable Finance Roadmap', 'sustainable-finance-roadmap', HIDDEN),
        leaf(71, 'Credit Conditions and Funding Sources Survey Results', 'credit-conditions-and-funding-sources-survey-results', HIDDEN),
      ],
    },
    { id: 77, title: 'Media', slug: 'media', navUrl: null, children: [leaf(78, 'News', 'news')] },
  ]
}

const WP_INTRO_AZ =
  '<p>İşçi məqalələr Mərkəzi Bankın əməkdaşları tərəfindən aparılan tədqiqat işlərini əhatə edir. İşçi məqalələr silsiləsinin dərc olunmasında əsas məqsəd mövzular ətrafında müzakirələri stimullaşdırmaqdır.</p>'

/** The working papers page (73) as the test environment has it: the intro, then the legacy year accordions of links. */
export const workingPapersPageAz: PageDetail = {
  id: 73,
  title: 'İşçi məqalələri',
  slug: 'isci-meqaleler-silsilesi',
  content:
    WP_INTRO_AZ +
    '<details data-accordion=""><summary>2025</summary><div data-type="details-content"><div><a href="https://www.cbar.az/page-895/nowcasting-household-consumption?language=az">02/2025. Likvidlik şəraitindən asılı overnayt banklararası faiz dərəcəsinin dəyişkənliyi</a></div></div></details>' +
    '<details data-accordion=""><summary>2024</summary><div data-type="details-content"><div><a href="https://www.cbar.az/page-889/nowcasting-household-consumption?language=az">04/2024. Qeyri-neft ÜDM-nin qısamüddətli proqnozlaşdırılması modellərin qurulması</a></div></div></details>',
  assets: [],
}

export const workingPapersPageEn: PageDetail = {
  id: 73,
  title: 'Working papers',
  slug: 'working-paper-series',
  content: '<p>Working papers cover research by the Central Bank staff.</p><details data-accordion=""><summary>2025</summary><div data-type="details-content"><div><a href="https://www.cbar.az/page-895/x?language=en">02/2025. Paper</a></div></div></details>',
  assets: [],
}

export { WP_INTRO_AZ }

const MEDIA = (mediaId: number, title: string, sizeBytes = 2_961_312) => ({ mediaId, title, mimeType: 'application/pdf', sizeBytes, group: null, url: `/media/${mediaId}` })
const link = (id: number, text: string) => `<p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/${id}" data-media-link="">${text}</a></p>`
const year = (label: string, body: string) => `<details data-accordion=""><summary>${label}</summary><div data-type="details-content">${body}</div></details>`

/** The annual report (63) cut to two years, with the font link before and a note after the accordions. */
export const annualReportAz: PageDetail = {
  id: 63,
  title: 'İllik hesabat',
  slug: 'illik-hesabat',
  content:
    link(1537, 'Hesabatların aydın oxunması üçün bu şrifti yükləyin') +
    year('2024', link(948, '31 dekabr 2024-cü il tarixinə Maliyyə Hesabatları') + link(949, '2024-cü il üçün Mərkəzi Bankın illik hesabatı')) +
    year('2025', link(947, '31 dekabr 2025-ci il tarixinə Konsolidasiya edilmiş Maliyyə Hesabatları')) +
    '<p>Əvvəlki illərin hesabatları arxivdədir.</p>',
  assets: [MEDIA(1537, 'Şrift', 108_943), MEDIA(947, 'a'), MEDIA(948, 'b'), MEDIA(949, 'c')],
}

/** A single-document page (66) with its Figma intro. */
export const riskConceptAz: PageDetail = {
  id: 66,
  title: 'Azərbaycan Respublikası Mərkəzi Bankının risk əsaslı nəzarət üzrə Siyasət Konsepsiyası',
  slug: 'risk-esasli-nezaret-uzre-siyaset-konsepsiyasi',
  content:
    '<p>Konsepsiya “2024–2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası” çərçivəsində hazırlanıb.</p>' +
    link(1033, 'Azərbaycan Respublikasının Mərkəzi Bankının risk əsaslı nəzarət üzrə Siyasət Konsepsiyası'),
  assets: [MEDIA(1033, 'Konsepsiya', 591_888), MEDIA(1034, 'Concept (en)', 500_000)],
}

/** Econometric models (74): the file is only among the page's assets. */
export const econometricAz: PageDetail = {
  id: 74,
  title: 'Ekonometrik modellər',
  slug: 'ekonometrik-modeller',
  content: '<p>Ekonometrik və riyazi modellər əsas makroiqtisadi göstəricilərin proqnozlaşdırılmasında istifadə olunur.</p>',
  assets: [MEDIA(2001, 'Mərkəzi Bankda istifadə olunan modellər', 1_200_000)],
}

/** The section root (62): plain text. */
export const publicationsRootAz: PageDetail = {
  id: 62,
  title: 'Nəşrlər və tədqiqatlar',
  slug: 'nesrler-ve-tedqiqatlar',
  content: '<p>Azərbaycan Respublikasının Mərkəzi Bankında aparılan tədqiqat işlərinin əsas məqsədi…</p>',
  assets: [],
}
