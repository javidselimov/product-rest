import { describe, expect, it } from 'vitest'

import { filterPapers, paginate } from '@/features/working-papers/model/select'
import { publicationsTreeAz } from '@/shared/testing/fixtures/publications-section'
import { workingPapersAz } from '@/shared/testing/fixtures/working-papers'
import { renderApp, screen, within } from '@/shared/testing/render'
import { buildSectionShell } from '@/widgets/section-shell'

import { WorkingPapersView } from './index'
import type { WorkingPapersViewData } from './loader'

const BASE = '/az/isci-meqaleler-silsilesi'

function data(overrides: Partial<WorkingPapersViewData> & { q?: string; year?: number } = {}): WorkingPapersViewData {
  const q = overrides.q ?? ''
  const year = overrides.year
  const { items, page, total } = paginate(filterPapers(workingPapersAz, { q, year }), 1)
  return {
    locale: 'az',
    title: 'İşçi məqalələri',
    introHtml: '<p>İşçi məqalələr Mərkəzi Bankın əməkdaşları tərəfindən aparılan tədqiqat işlərini əhatə edir.</p>',
    basePath: BASE,
    q,
    year,
    years: [2026, 2025, 2024],
    rows: items.map((paper) => ({ ...paper, href: `${BASE}/${paper.key}` })),
    page,
    total,
    pageSize: 10,
    shell: buildSectionShell({
      section: 'publications',
      tree: publicationsTreeAz(),
      locale: 'az',
      current: { slug: 'isci-meqaleler-silsilesi' },
      pageUrl: 'https://cbar.az' + BASE,
      pageTitle: 'İşçi məqalələri',
    }),
    ...overrides,
  }
}

describe('WorkingPapersView (spec 054 US1)', () => {
  it('shows the intro, a GET search form, the heading, ten rows and the pagination', () => {
    renderApp(<WorkingPapersView data={data()} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'İşçi məqalələri' })).toBeInTheDocument()
    expect(screen.getByText(/İşçi məqalələr Mərkəzi Bankın/)).toBeInTheDocument()
    const form = screen.getByRole('search', { name: 'Məqalə axtarışı' })
    expect(form).toHaveAttribute('method', 'get')
    expect(form).toHaveAttribute('action', BASE)
    expect(within(form).getByRole('searchbox', { name: 'Məqalə axtarışı' })).toHaveAttribute('placeholder', 'Məqalə adı, müəllif və ya açar söz')
    expect(within(form).getByRole('button', { name: 'Axtar' })).toHaveAttribute('type', 'submit')
    expect(within(form).getByRole('link', { name: 'Filtrləri təmizlə' })).toHaveAttribute('href', BASE)
    expect(screen.getByRole('heading', { level: 2, name: 'Bütün məqalələr' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').filter((li) => li.querySelector('[data-slot="paper-row"]'))).toHaveLength(10)
    expect(screen.getByRole('link', { name: /^2$|səhifə 2|page 2/i })).toHaveAttribute('href', `${BASE}?page=2`)
  })

  it('makes each row one link to the paper page with number, year, title, authors and language', () => {
    renderApp(<WorkingPapersView data={data()} />, { locale: 'az' })
    const row = screen.getByRole('link', { name: /02\/2025/ })
    expect(row).toHaveAttribute('href', `${BASE}/02-2025`)
    expect(row).toHaveTextContent('№ 02/2025')
    expect(row).toHaveTextContent('Tarix: 2025')
    expect(row).toHaveTextContent('Elmir Muxtarov, Əli Hacılı')
    expect(row).toHaveTextContent('İngilis dili')
  })

  it('keeps the search in every year link and marks the chosen year', () => {
    renderApp(<WorkingPapersView data={data({ q: 'inflyasiya', year: 2024 })} />, { locale: 'az' })
    const list = screen.getByRole('list', { name: 'İl seçimi', hidden: true })
    expect(within(list).getByRole('link', { name: '2025', hidden: true })).toHaveAttribute('href', `${BASE}?q=inflyasiya&year=2025`)
    expect(within(list).getByRole('link', { name: 'Hamısı', hidden: true })).toHaveAttribute('href', `${BASE}?q=inflyasiya`)
    expect(within(list).getByRole('link', { name: '2024', hidden: true })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('İl: 2024')).toBeInTheDocument()
    // The chosen year rides along with the next search.
    expect(document.querySelector('input[type="hidden"][name="year"]')).toHaveAttribute('value', '2024')
  })

  it('shows the empty state with the clear link when nothing matches', () => {
    renderApp(<WorkingPapersView data={data({ q: 'zzzz' })} />, { locale: 'az' })
    expect(screen.getByText('Axtarışa uyğun məqalə tapılmadı.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Filtrləri təmizlə' })).toHaveLength(2)
    expect(document.querySelector('[data-slot="paper-row"]')).toBeNull()
  })
})
