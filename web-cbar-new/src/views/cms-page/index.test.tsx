import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { hideInSideNav } from '@/shared/testing/factories'
import { aboutPagesAz, aboutTreeAz } from '@/shared/testing/fixtures/about'
import { legacyCmsHtml, legacyCounts } from '@/shared/testing/fixtures/cms-html'
import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'
import { buildSectionShell } from '@/widgets/section-shell'

import { CmsPageView } from './index'
import type { CmsPageViewData } from './loader'

const base: CmsPageViewData = {
  locale: 'az',
  title: 'Pul siyasəti',
  slug: 'faiz-dehlizi',
  html: prepareCmsHtml(legacyCmsHtml),
  section: pageTreeAz[1],
  childPages: [],
  attachments: [
    { id: 1, title: 'Qərar 2025', mimeType: 'application/pdf', sizeBytes: 1000, group: '2025', url: '/media/301' },
  ],
  shellPage: null,
  faqTopics: [],
}

const komite = aboutPagesAz['pul-siyaseti-ve-maliyye-sabitliyi-komitesi']!
const aboutData: CmsPageViewData = {
  ...base,
  title: komite.title,
  slug: komite.slug,
  html: prepareCmsHtml(komite.content),
  section: aboutTreeAz[0]!,
  attachments: [],
  shellPage: {
    section: 'about',
    shell: buildSectionShell({
      section: 'about',
      tree: aboutTreeAz,
      locale: 'az',
      current: { slug: komite.slug },
      pageUrl: 'https://www.cbar.az/az/haqqimizda/teskilati-struktur-ve-idareetme/pul-siyaseti-ve-maliyye-sabitliyi-komitesi',
      pageTitle: komite.title,
    }),
    layout: 'plain',
    blocks: [{ kind: 'html', html: prepareCmsHtml(komite.content) }],
  },
}

describe('CmsPageView — "Haqqımızda" şablonu (spec 024 US1)', () => {
  it('breadcrumb ağacdandır, son element link deyil və aria-current daşıyır', () => {
    renderApp(<CmsPageView data={aboutData} />, { locale: 'az' })

    const crumbs = screen.getByRole('navigation', { name: 'Səhifənin yeri' })
    expect(within(crumbs).getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(within(crumbs).getByRole('link', { name: 'Haqqımızda' })).toHaveAttribute('href', '/az/haqqimizda')
    // Kit `BreadcrumbPage`: `role="link" aria-disabled` — keçid deyil, `href` yoxdur.
    const current = within(crumbs).getByText(komite.title)
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).not.toHaveAttribute('href')
    expect(current.closest('a')).toBeNull()
  })

  it('bir H1, menyuda cari səhifə və açıq qrup, köhnə sol ağac yoxdur', () => {
    renderApp(<CmsPageView data={aboutData} />, { locale: 'az' })

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: komite.title })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'İdarə Heyəti' })).toHaveAttribute('href', '/az/organization?section=board')
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('paylaşma linkləri cari ünvanı kodlanmış daşıyır və yeni tabda açılır', () => {
    renderApp(<CmsPageView data={aboutData} />, { locale: 'az' })

    const share = screen.getByRole('list', { name: 'Paylaş' })
    const facebook = within(share).getByRole('link', { name: /Facebook-da paylaş/ })
    expect(facebook.getAttribute('href')).toContain(encodeURIComponent(aboutData.shellPage!.shell.share.pageUrl))
    expect(facebook).toHaveAttribute('target', '_blank')
    expect(facebook).toHaveAttribute('rel', 'noopener noreferrer')
    expect(within(share).getByRole('link', { name: 'E-poçtla göndər' }).getAttribute('href')).toMatch(/^mailto:\?subject=/)
    expect(within(share).getByRole('button', { name: 'Çap et' })).toBeInTheDocument()
  })

  it('məzmun Figma tipoqrafiyası variantında render olunur', () => {
    const { container } = renderApp(<CmsPageView data={aboutData} />, { locale: 'az' })

    expect(container.querySelector('[data-slot="cms-content"]')).toHaveAttribute('data-variant', 'about')
    expect(container.textContent).toContain('kollegial orqandır')
  })
})

describe('CmsPageView', () => {
  it('legacy markup sayları qorunur, sol ağac və əlavələr var', () => {
    const { container } = renderApp(<CmsPageView data={base} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Pul siyasəti' })).toBeInTheDocument()
    expect(container.querySelectorAll('details[data-accordion]')).toHaveLength(legacyCounts.accordions)
    expect(container.querySelectorAll('table')).toHaveLength(legacyCounts.tables)
    expect(container.querySelectorAll('iframe')).toHaveLength(legacyCounts.iframes)
    expect(screen.getByRole('complementary', { name: 'Bölmə naviqasiyası' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Sənədlər' })).toBeInTheDocument()
  })

  it('məzmun boş olanda alt səhifə kartları render olunur', () => {
    renderApp(
      <CmsPageView
        data={{ ...base, html: '', childPages: [{ key: '1', title: 'Tarix', href: '/az/haqqimizda/tarix' }] }}
      />,
      { locale: 'az' },
    )

    expect(screen.getByRole('link', { name: 'Tarix' })).toHaveAttribute('href', '/az/haqqimizda/tarix')
  })

  it('boş yeni səhifə (spec 056: Rəqəmsal maliyyə ekosisteminin səhifələri) başlıq və sol menyu ilə açılır', () => {
    const digital = {
      id: 9002,
      title: 'Rəqəmsal maliyyə ekosistemi',
      slug: 'reqemsal-maliyye-ekosistemi',
      navUrl: null,
      children: [{ id: 9003, title: 'Rəqəmsal KYC', slug: 'reqemsal-kyc', navUrl: null, children: [] }],
    }
    renderApp(
      <CmsPageView
        data={{ ...base, title: 'Rəqəmsal KYC', slug: 'reqemsal-kyc', html: prepareCmsHtml(null), section: digital, attachments: [] }}
      />,
      { locale: 'az' },
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Rəqəmsal KYC' })).toBeInTheDocument()
    const nav = screen.getByRole('complementary', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Rəqəmsal KYC' })).toHaveAttribute('href', '/az/reqemsal-kyc')
    expect(screen.queryByRole('region', { name: 'Sənədlər' })).toBeNull()
  })
})

describe('CmsPageView: FAQ link cards (spec 051 US5)', () => {
  const topics: CmsPageViewData['faqTopics'] = [
    { slug: 'pul-siyaseti', name: 'Pul siyasəti', questionCount: 23, href: '/az/sual-cavab?topic=pul-siyaseti' },
    { slug: 'repo', name: 'REPO əməliyyatları', questionCount: 4, href: '/az/sual-cavab?topic=repo' },
  ]
  const cards = () => within(screen.getByRole('list', { name: 'Sual-cavab' })).getAllByRole('link')

  it('shows a card per linked topic after the text, in order, each one link to the topic', () => {
    renderApp(<CmsPageView data={{ ...base, faqTopics: topics }} />, { locale: 'az' })

    expect(cards().map((link) => link.getAttribute('href'))).toEqual([
      '/az/sual-cavab?topic=pul-siyaseti',
      '/az/sual-cavab?topic=repo',
    ])
    const [first] = cards()
    expect(first).toHaveAccessibleName(/Pul siyasəti üzrə sual-cavab/)
    expect(first).toHaveTextContent('23 sual')
    expect(first).toHaveTextContent('Bax')
  })

  it('places the cards after the page text and before the files', () => {
    const { container } = renderApp(<CmsPageView data={{ ...base, faqTopics: topics }} />, { locale: 'az' })

    const content = container.querySelector('[data-slot="cms-content"]')!
    const list = screen.getByRole('list', { name: 'Sual-cavab' })
    const files = screen.getByRole('region', { name: 'Sənədlər' })
    expect(content.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(list.compareDocumentPosition(files) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('shows the cards in the section template too', () => {
    renderApp(<CmsPageView data={{ ...aboutData, faqTopics: topics }} />, { locale: 'az' })
    expect(cards()).toHaveLength(2)
  })

  it('shows no card on a page no topic links to', () => {
    renderApp(<CmsPageView data={base} />, { locale: 'az' })
    expect(screen.queryByRole('list', { name: 'Sual-cavab' })).toBeNull()
  })
})

describe('CmsPageView: "Sol menyuda göstər" (spec 041)', () => {
  // 2 "Tarixi" is turned off for the left menu.
  const tree = hideInSideNav(aboutTreeAz, [2])
  const shellFor = (slug: string, title: string) => ({
    ...aboutData.shellPage!,
    shell: buildSectionShell({ section: 'about', tree, locale: 'az', current: { slug }, pageUrl: 'https://www.cbar.az/az/x', pageTitle: title }),
  })

  it('başqa səhifədə gizli bənd sol menyuda yoxdur, breadcrumb dəyişmir', () => {
    renderApp(<CmsPageView data={{ ...aboutData, shellPage: shellFor(komite.slug, komite.title) }} />, { locale: 'az' })

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).queryByRole('link', { name: 'Tarixi' })).not.toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: komite.title })).toHaveAttribute('aria-current', 'page')
    expect(within(screen.getByRole('navigation', { name: 'Səhifənin yeri' })).getByRole('link', { name: 'Haqqımızda' })).toBeInTheDocument()
  })

  it('gizli səhifənin özü açıqdır: sol menyuda aktiv bənddir', () => {
    renderApp(<CmsPageView data={{ ...aboutData, title: 'Tarixi', slug: 'tarixi', shellPage: shellFor('tarixi', 'Tarixi') }} />, { locale: 'az' })

    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Tarixi' })).toHaveAttribute('aria-current', 'page')
  })
})
