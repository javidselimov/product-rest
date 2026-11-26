import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { publicationsTreeAz } from '@/shared/testing/fixtures/publications-section'
import { workingPaperBareAz, workingPaperDetailAz } from '@/shared/testing/fixtures/working-papers'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { WorkingPaperView } from './index'
import { loadWorkingPaperPage, paperKeyOf, resolveWorkingPaperRoute } from './loader'

function serveTree() {
  server.use(http.get(`${API}/api/v1/pages/tree`, () => HttpResponse.json(publicationsTreeAz())))
}

describe('paperKeyOf (spec 054 research R4)', () => {
  it('reads NN-YYYY under the list slug of either locale, nothing else', () => {
    expect(paperKeyOf(['isci-meqaleler-silsilesi', '02-2025'])).toBe('02-2025')
    expect(paperKeyOf(['nesrler-ve-tedqiqatlar', 'working-paper-series', '01-2013'])).toBe('01-2013')
    expect(paperKeyOf(['isci-meqaleler-silsilesi'])).toBeNull()
    expect(paperKeyOf(['isci-meqaleler-silsilesi', '2-2025'])).toBeNull()
    expect(paperKeyOf(['illik-hesabat', '02-2025'])).toBeNull()
  })
})

describe('resolveWorkingPaperRoute (spec 054 research R4)', () => {
  const key = workingPaperDetailAz.key

  it('is null for an address that is not a working paper, a malformed escape included', async () => {
    await expect(resolveWorkingPaperRoute('az', ['isci-meqaleler-silsilesi'])).resolves.toBeNull()
    await expect(resolveWorkingPaperRoute('az', ['illik-hesabat', key])).resolves.toBeNull()
    await expect(resolveWorkingPaperRoute('az', ['%', key])).resolves.toBeNull()
    await expect(resolveWorkingPaperRoute('az', ['isci-meqaleler-silsilesi', '%'])).resolves.toBeNull()
  })

  it("renders the paper on this locale's address", async () => {
    serveTree()
    const route = await resolveWorkingPaperRoute('az', ['isci-meqaleler-silsilesi', key])
    expect(route?.kind).toBe('page')
    expect(route?.kind === 'page' && route.data.paper.key).toBe(key)
  })

  it("sends the other locale's address to this locale's paper (the language switcher keeps the slug)", async () => {
    serveTree()
    await expect(resolveWorkingPaperRoute('az', ['working-paper-series', key])).resolves.toEqual({
      kind: 'redirect',
      href: `/az/isci-meqaleler-silsilesi/${key}`,
    })
  })

  it("sends it to this locale's list when the paper has no translation here", async () => {
    server.use(
      http.get(`${API}/api/v1/working-papers/:key`, () => HttpResponse.json({ title: 'Not Found', status: 404 }, { status: 404 })),
    )
    await expect(resolveWorkingPaperRoute('en', ['isci-meqaleler-silsilesi', key])).resolves.toEqual({
      kind: 'redirect',
      href: '/en/working-paper-series',
    })
  })

  it("is a 404 for a paper missing on this locale's own address", async () => {
    serveTree()
    await expect(resolveWorkingPaperRoute('az', ['isci-meqaleler-silsilesi', '09-1999'])).resolves.toEqual({ kind: 'not-found' })
  })
})

describe('loadWorkingPaperPage (spec 054 FR-010, FR-011)', () => {
  it('loads the paper, the breadcrumb with the title as the last level and keeps "İşçi məqalələri" current', async () => {
    serveTree()
    const data = await loadWorkingPaperPage('az', workingPaperDetailAz.key)

    expect(data?.paper.code).toBe('02/2025')
    expect(data?.shell.crumbs.map((c) => c.label)).toEqual([
      'Ana səhifə',
      'Nəşrlər və tədqiqatlar',
      'Tədqiqatlar',
      'İşçi məqalələri',
      workingPaperDetailAz.title,
    ])
    expect(data?.shell.crumbs.at(-1)?.href).toBeNull()
    const research = data?.shell.nav.find((item) => item.title === 'Tədqiqatlar')
    expect(research?.children.find((item) => item.current)?.title).toBe('İşçi məqalələri')
    expect(data?.file).toMatchObject({ id: 2210, title: workingPaperDetailAz.title, sizeBytes: 2_002_780 })
    expect(data?.description.startsWith('Effektiv pul siyasətinin')).toBe(true)
  })

  it('is null for a malformed key, without asking the API, and for a paper missing in the locale', async () => {
    serveTree()
    let asked = false
    server.use(
      http.get(`${API}/api/v1/working-papers/:key`, () => {
        asked = true
        return undefined
      }),
    )
    expect(await loadWorkingPaperPage('az', '2-2025')).toBeNull()
    expect(asked).toBe(false)
    expect(await loadWorkingPaperPage('az', '09-1999')).toBeNull()
  })
})

describe('WorkingPaperView (spec 054 ui-contract §4)', () => {
  it('shows the four meta fields, the abstract paragraphs, keywords and JEL as text, and the PDF card with its size', async () => {
    serveTree()
    const data = await loadWorkingPaperPage('az', workingPaperDetailAz.key)
    renderApp(<WorkingPaperView data={data!} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: workingPaperDetailAz.title })).toBeInTheDocument()
    const meta = document.querySelector('[data-slot="paper-meta"]') as HTMLElement
    expect(within(meta).getAllByRole('term').map((dt) => dt.textContent)).toEqual(['Müəllif(lər)', 'Nömrə', 'Dil', 'Tarix'])
    expect(within(meta).getAllByRole('definition').map((dd) => dd.textContent)).toEqual([
      'Elmir Muxtarov, Əli Hacılı, Aygün Qarayeva, Vüqar Əhmədov',
      '02/2025',
      'İngilis dili',
      '2025',
    ])
    const abstract = screen.getByRole('region', { name: 'Xülasə' })
    expect(within(abstract).getAllByRole('paragraph')).toHaveLength(2)
    expect(screen.getByRole('region', { name: 'Açar sözlər' })).toHaveTextContent('banklararası pul bazarında overnayt faizlər, məcburi ehtiyatlar')
    expect(screen.getByRole('region', { name: 'JEL təsnifatı' })).toHaveTextContent('C22, E53, E58, G21')
    const card = document.querySelector('[data-slot="document-card"]') as HTMLElement
    expect(card).toHaveTextContent(workingPaperDetailAz.title)
    expect(card).toHaveAttribute('href', '/media/2210')
    expect(card).toHaveTextContent('1,9 MB')
  })

  it('leaves out every empty block with its heading', async () => {
    serveTree()
    const data = await loadWorkingPaperPage('az', workingPaperBareAz.key)
    renderApp(<WorkingPaperView data={data!} />, { locale: 'az' })

    expect(screen.queryByRole('region', { name: 'Xülasə' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Açar sözlər' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'JEL təsnifatı' })).toBeNull()
    expect(document.querySelector('[data-slot="document-card"]')).toBeNull()
  })
})
