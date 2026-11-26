/**
 * The "Publications and research" section end to end: API response → loader → view (spec 054 US3, US4).
 */
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import type { PageDetail } from '@/features/pages/model/schemas'
import { API } from '@/shared/testing/api-base'
import {
  annualReportAz,
  econometricAz,
  publicationsRootAz,
  publicationsTreeAz,
  riskConceptAz,
  workingPapersPageAz,
} from '@/shared/testing/fixtures/publications-section'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { CmsPageView } from './index'
import { loadCmsPage } from './loader'

function serve(pages: PageDetail[]) {
  server.use(
    http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(publicationsTreeAz())),
    ...pages.map((page) => http.get(`${API}/api/v1/pages/${page.slug}`, () => HttpResponse.json(page))),
  )
}

async function open(page: PageDetail, query?: Record<string, string>) {
  serve([page])
  const data = await loadCmsPage('az', [page.slug])
  renderApp(<CmsPageView data={data!} query={query} />, { locale: 'az' })
  return data!
}

const cards = () => [...document.querySelectorAll('[data-slot="document-card"]')] as HTMLElement[]
const groupHeadings = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => h.textContent)

describe('publications year archive (spec 054 US3)', () => {
  it('opens on the newest year, with the font link above the year menu and the note after', async () => {
    const data = await open(annualReportAz)
    expect(data.shellPage?.layout).toBe('file-archive')

    expect(groupHeadings()).toEqual(['2025'])
    expect(cards().map((c) => c.getAttribute('href'))).toEqual(['/media/1537', '/media/947'])
    expect(cards()[0]).toHaveTextContent('Hesabatların aydın oxunması üçün bu şrifti yükləyin')
    expect(cards()[0]).toHaveTextContent('106 KB')
    const menu = document.querySelector('[data-slot="year-menu"]') as HTMLElement
    // The font card comes before the menu.
    expect(cards()[0]!.compareDocumentPosition(menu) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(menu.querySelector('summary')).toHaveTextContent('2025')
    expect(screen.getByText('Əvvəlki illərin hesabatları arxivdədir.')).toBeInTheDocument()
    // The cards are the files: no file list under the page.
    expect(document.querySelector('[data-slot="attachments"]')).toBeNull()
  })

  it('shows every year newest first with ?year=all and one year with ?year=2024', async () => {
    await open(annualReportAz, { year: 'all' })
    expect(groupHeadings()).toEqual(['2025', '2024'])
  })

  it('picks a year from the address and falls back to the newest for an unknown value', async () => {
    await open(annualReportAz, { year: '2024' })
    expect(groupHeadings()).toEqual(['2024'])
    expect(screen.getAllByRole('link', { name: /2024-cü il üçün/ }).length).toBeGreaterThan(0)
  })

  it('lists "Hamısı" and every year in the menu, the chosen one marked', async () => {
    await open(annualReportAz, { year: 'abc' })
    const list = screen.getByRole('list', { name: 'İl', hidden: true })
    expect(within(list).getAllByRole('link', { hidden: true }).map((l) => l.textContent)).toEqual(['Hamısı', '2025', '2024'])
    expect(within(list).getByRole('link', { name: '2025', hidden: true })).toHaveAttribute('aria-current', 'true')
    expect(within(list).getByRole('link', { name: 'Hamısı', hidden: true })).toHaveAttribute('href', '?year=all')
  })

  it('shows the working papers page text as an archive of plain links when there are no papers (FR-013)', async () => {
    const data = await open(workingPapersPageAz)
    expect(data.shellPage?.layout).toBe('file-archive')
    expect(screen.getByRole('link', { name: /02\/2025\. Likvidlik/ })).toHaveAttribute('href', expect.stringContaining('page-895'))
    expect(cards()).toHaveLength(0)
  })
})

describe('publications single-document pages (spec 054 US4)', () => {
  it('shows the intro and one card with its size, and no file list', async () => {
    const data = await open(riskConceptAz)
    expect(data.shellPage?.layout).toBe('document-list')
    expect(screen.getByText(/maliyyə sektorunun inkişaf Strategiyası/)).toBeInTheDocument()
    expect(cards()).toHaveLength(1)
    expect(cards()[0]).toHaveAttribute('href', '/media/1033')
    expect(cards()[0]).toHaveTextContent('578 KB')
    expect(document.querySelector('[data-slot="attachments"]')).toBeNull()
  })

  it('builds the card from the page file when the text links none (econometric models)', async () => {
    await open(econometricAz)
    expect(cards()).toHaveLength(1)
    expect(cards()[0]).toHaveTextContent('Mərkəzi Bankda istifadə olunan modellər')
  })

  it('shows the root as plain text in the section template', async () => {
    const data = await open(publicationsRootAz)
    expect(data.shellPage?.layout).toBe('plain')
    expect(screen.getByText(/tədqiqat işlərinin əsas məqsədi/)).toBeInTheDocument()
  })
})
