import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { mediaTreeAz } from '@/shared/testing/fixtures/media-section'
import { pressReleaseDetailFixture } from '@/shared/testing/fixtures/press-releases'
import { cleanup, renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'
import type { Locale } from '@/shared/i18n'

import { PressReleaseView } from './index'
import { loadPressRelease } from './loader'

const useMediaTree = () => server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(mediaTreeAz)))

async function renderDetail(slug: string, locale: Locale = 'az') {
  const data = await loadPressRelease(locale, slug)
  if (!data) throw new Error(`no fixture for ${slug}`)
  return renderApp(<PressReleaseView data={data} />, { locale })
}

const gallery = () => screen.queryByRole('region', { name: 'Fotoqalereya' })
const attachments = () => screen.queryByRole('region', { name: 'Əlavə sənədlər' })
const crumbs = () =>
  within(screen.getByRole('navigation', { name: 'Səhifənin yeri' }))
    .getAllByRole('listitem')
    .map((li) => li.textContent?.trim())
    .filter(Boolean)

describe('Interview detail (spec 033 US2)', () => {
  const pdfButton = () => screen.queryByRole('link', { name: 'PDF kimi yüklə' })

  it('title, text and a download button; no cover, no gallery, no date', async () => {
    const { container } = await renderDetail('cop29-sonrasi')

    expect(screen.getByRole('heading', { level: 1, name: 'COP29-dan sonrakı dövr' })).toBeInTheDocument()
    expect(screen.getByText('Cavab mətni.')).toBeInTheDocument()

    expect(pdfButton()).toHaveAttribute('href', '/media/852')
    // Migrated files are named by hash, so the saved file takes the title.
    expect(pdfButton()).toHaveAttribute('download', 'COP29-dan sonrakı dövr.pdf')
    expect(pdfButton()).not.toHaveAttribute('target')
    expect(pdfButton()).toHaveAttribute('data-print', 'hide')

    expect(container.querySelector('[data-slot="press-release-cover"]')).toBeNull()
    expect(gallery()).toBeNull()
    expect(container.querySelector('time')).toBeNull()
    // The first photo is only the list card, and the button is the only way to the PDF.
    expect(attachments()).toBeNull()
    expect(container.querySelector('[data-slot="press-release"] img')).toBeNull()
  })

  it('the button comes after the text', async () => {
    const { container } = await renderDetail('cop29-sonrasi')

    const children = [...container.querySelector('[data-slot="press-release"]')!.children]
    expect(children.map((el) => el.getAttribute('data-slot'))).toEqual(['cms-content', 'press-release-pdf'])
  })

  it('a scanned item: an empty editor field leaves no empty block, the button stays', async () => {
    const { container } = await renderDetail('toronto-merkezi')

    expect(container.querySelector('[data-slot="cms-content"]')).toBeNull()
    expect(pdfButton()).toHaveAttribute('href', '/media/853')
  })

  it('no PDF: no button, the text opens normally', async () => {
    await renderDetail('reuters-tv')

    expect(screen.getByText('Yalnız mətn.')).toBeInTheDocument()
    expect(pdfButton()).toBeNull()
    expect(attachments()).toBeNull()
  })

  it('two PDFs and two photos: the first PDF is the button, the second PDF and photo are file rows', async () => {
    await renderDetail('nk-cixis')

    expect(pdfButton()).toHaveAttribute('href', '/media/855')
    const links = within(attachments()!).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/media/857', '/media/858'])
    expect(within(attachments()!).getByRole('link', { name: /foto-2\.jpg/ })).toBeInTheDocument()
  })

  it('English label', async () => {
    await renderDetail('cop29-sonrasi', 'en')

    expect(screen.getByRole('link', { name: 'Save as PDF' })).toHaveAttribute('href', '/media/852')
  })

  it('news and announcements have no download button', async () => {
    await renderDetail('ucot-derecesi')
    expect(pdfButton()).toBeNull()
    cleanup()

    await renderDetail('elan-1')
    expect(pdfButton()).toBeNull()
  })

  it('sits under its own menu item', async () => {
    const tree = structuredClone(mediaTreeAz)
    const node = tree.flatMap((root) => root.children).find((item) => item.id === 80)!
    node.title = 'Müsahibələr və çıxışlar'
    node.navUrl = '/press-releases?type=3'
    server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(tree)))

    await renderDetail('cop29-sonrasi')

    expect(crumbs()).toContain('Müsahibələr və çıxışlar')
  })
})

describe('File language (spec 033 US3)', () => {
  const pdfButton = (name: string) => screen.queryByRole('link', { name })

  it('each language opens its own PDF and never sees the other one', async () => {
    await renderDetail('global-finance')
    expect(pdfButton('PDF kimi yüklə')).toHaveAttribute('href', '/media/861')
    expect(within(attachments()!).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(['/media/863'])
    cleanup()

    await renderDetail('global-finance', 'en')
    expect(pdfButton('Save as PDF')).toHaveAttribute('href', '/media/862')
    expect(screen.queryByText(/az-versiya/)).toBeNull()
  })

  it('only an Azerbaijani PDF: no button and no file in English', async () => {
    await renderDetail('reuters-agentliyi', 'en')

    expect(pdfButton('Save as PDF')).toBeNull()
    expect(attachments()).toBeNull()
    expect(screen.getByText('Yalnız AZ faylı var.')).toBeInTheDocument()
  })

  it('a file with no language shows in both', async () => {
    await renderDetail('toronto-merkezi', 'en')

    expect(pdfButton('Save as PDF')).toHaveAttribute('href', '/media/853')
  })
})

describe('News detail (spec 029 US3)', () => {
  it('first photo is the cover, the other four form the gallery, the PDF stays an attachment', async () => {
    const { container } = await renderDetail('ucot-derecesi')

    expect(screen.getByRole('heading', { level: 1, name: 'Uçot dərəcəsi dəyişməz saxlanılıb' })).toBeInTheDocument()
    const cover = container.querySelector('[data-slot="press-release-cover"] img')
    expect(cover?.getAttribute('src')).toContain(encodeURIComponent('/media/811'))
    expect(screen.getByText('30.09.2026')).toBeInTheDocument()
    expect(screen.getByText(/uçot dərəcəsini/)).toBeInTheDocument()

    expect(within(gallery()!).getAllByRole('button', { name: /nömrəli şəkli göstər/ })).toHaveLength(4)
    expect(within(attachments()!).getByRole('link', { name: /qerar\.pdf/ })).toHaveAttribute('href', '/media/801')
    // Photos are shown as photos, not offered again as files.
    expect(within(attachments()!).queryByText(/foto-\d\.jpg/)).toBeNull()
  })

  it('a single photo is only the cover — no gallery', async () => {
    const { container } = await renderDetail('press-reliz-4')

    expect(container.querySelector('[data-slot="press-release-cover"] img')?.getAttribute('src')).toContain(encodeURIComponent('/media/841'))
    expect(gallery()).toBeNull()
    expect(attachments()).toBeNull()
  })

  it('an announcement (spec 031) shows no cover and no gallery — its photo is listed as a downloadable file', async () => {
    const { container } = await renderDetail('elan-1')

    expect(screen.getByRole('heading', { level: 1, name: 'Elan 1' })).toBeInTheDocument()
    expect(container.querySelector('[data-slot="press-release-cover"]')).toBeNull()
    expect(gallery()).toBeNull()
    // The only <img>s are the file-type icons inside the attachment list — no photo is rendered as a photo.
    expect(container.querySelectorAll('[data-slot="press-release"] > :not([data-slot="attachments"]) img')).toHaveLength(0)
    expect(screen.getByText('Elan mətni.')).toBeInTheDocument()
    // Attachments keep the API order: the photo first, then the PDF.
    const links = within(attachments()!).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/media/821', '/media/822'])
    expect(within(attachments()!).getByRole('link', { name: /foto-1\.jpg/ })).toBeInTheDocument()
  })

  it('only an announcement body gets the list table style', async () => {
    const announcement = await renderDetail('elan-1')
    expect(announcement.container.querySelector('[data-slot="cms-content"]')).toHaveAttribute('data-tables', 'list')
    announcement.unmount()

    const news = await renderDetail('ucot-derecesi')
    expect(news.container.querySelector('[data-slot="cms-content"]')).not.toHaveAttribute('data-tables')
  })

  it('no photos: no cover box, no gallery; date, text and the file remain', async () => {
    const { container } = await renderDetail('press-reliz-2')

    expect(container.querySelector('[data-slot="press-release-cover"]')).toBeNull()
    expect(gallery()).toBeNull()
    expect(screen.getByText('Şəkilsiz xəbər.')).toBeInTheDocument()
    expect(within(attachments()!).getByRole('link', { name: /hesabat\.pdf/ })).toBeInTheDocument()
  })

  it('news sits under the news menu item: four-level breadcrumb, the last one is not a link', async () => {
    useMediaTree()
    await renderDetail('ucot-derecesi')

    expect(crumbs()).toEqual(['Ana səhifə', 'Media', 'Press-relizlər', 'Uçot dərəcəsi dəyişməz saxlanılıb'])
    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Press-relizlər' })).toHaveAttribute('aria-current', 'page')
    // The kit renders the current crumb as a disabled pseudo-link — not an anchor, no href.
    const current = within(screen.getByRole('navigation', { name: 'Səhifənin yeri' })).getByText('Uçot dərəcəsi dəyişməz saxlanılıb')
    expect(current.closest('a')).toBeNull()
    expect(current.closest('[aria-current="page"]')).not.toBeNull()
  })

  it('an announcement sits under the announcements menu item', async () => {
    useMediaTree()
    await renderDetail('elan-1')

    expect(crumbs()).toEqual(['Ana səhifə', 'Media', 'Elanlar', 'Elan 1'])
    const nav = screen.getByRole('navigation', { name: 'Bölmə naviqasiyası' })
    expect(within(nav).getByRole('link', { name: 'Elanlar' })).toHaveAttribute('aria-current', 'page')
  })

  it('a response without type (API before spec 029) is treated as news', async () => {
    useMediaTree()
    const withoutType: Partial<typeof pressReleaseDetailFixture> = { ...pressReleaseDetailFixture, slug: 'kohne' }
    delete withoutType.type
    server.use(http.get(`${API}/api/v1/press-releases/kohne`, () => HttpResponse.json(withoutType)))

    await renderDetail('kohne')

    expect(crumbs()).toContain('Press-relizlər')
  })

  it('unknown slug → null (the route answers 404)', async () => {
    await expect(loadPressRelease('az', 'yoxdur')).resolves.toBeNull()
  })
})
