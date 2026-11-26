/**
 * Figma blokları (spec 024 US2): kontrakt nümunəsi parser-dən keçib render olunur.
 */
import { describe, expect, it } from 'vitest'

import { parseAbout } from '@/features/about-content/model/parse'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { aboutContractHtml } from '@/shared/testing/fixtures/about'
import { renderApp, screen, within } from '@/shared/testing/render'

import { AboutBlocks } from './about-blocks'

const render = (html: string, layout: 'about-main' | 'mission') =>
  renderApp(<AboutBlocks blocks={parseAbout(prepareCmsHtml(html), layout)} locale="az" />, { locale: 'az' })

describe('AboutBlocks — about-main', () => {
  it('tarix kartları siyahı kimi, tarix və mətn ilə', () => {
    const { container } = render(aboutContractHtml.main, 'about-main')
    const cards = container.querySelector('[data-slot="date-cards"]') as HTMLElement
    const items = within(cards).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]!).getByText('11.02.1992')).toBeInTheDocument()
    expect(items[0]).toHaveTextContent('Fərman')
  })

  it('vurğulanmış qutu başlığı H2-dir, gövdə göstərilir', () => {
    const { container } = render(aboutContractHtml.main, 'about-main')
    const box = container.querySelector('[data-slot="highlight-box"]') as HTMLElement
    expect(within(box).getByRole('heading', { level: 2, name: 'Mərkəzi Bankın məqsədləri' })).toBeInTheDocument()
    expect(box).toHaveTextContent('qiymətlərin sabitliyidir')
  })

  it('funksiyalar accordion-dur, yalnız birincisi açıq', () => {
    const { container } = render(aboutContractHtml.main, 'about-main')
    const details = container.querySelectorAll('details[data-accordion]')
    expect(details).toHaveLength(2)
    expect((details[0] as HTMLDetailsElement).open).toBe(true)
    expect((details[1] as HTMLDetailsElement).open).toBe(false)
  })

  it('adi məzmun Figma tipoqrafiyası variantındadır', () => {
    const { container } = render(aboutContractHtml.main, 'about-main')
    const contents = container.querySelectorAll('[data-slot="cms-content"]')
    expect([...contents].every((el) => el.getAttribute('data-variant') === 'about')).toBe(true)
  })
})

describe('AboutBlocks — history (spec 026 US1, US6)', () => {
  const renderHistory = () =>
    renderApp(<AboutBlocks blocks={parseAbout(prepareCmsHtml(aboutContractHtml.history), 'history')} locale="az" />, { locale: 'az' })

  it('hero vurğusu em ilə', () => {
    const { container } = renderHistory()
    expect(container.querySelector('[data-slot="history-hero"] em')).toHaveTextContent('mərkəzi bankçılıq')
  })

  it('il oxu lövbər linkləridir, hər ilin panelinin id-si var (JS-siz işləyir)', () => {
    const { container } = renderHistory()
    const nav = screen.getByRole('navigation', { name: 'İllər' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['1919', '#year-1919'],
      ['1992', '#year-1992'],
    ])
    expect([...container.querySelectorAll('[data-panel]')].map((p) => p.id)).toEqual(['year-1919', 'year-1992'])
  })

  it('bütün illərin məzmunu DOM-dadır: başlıqlar H3, şəkillər linkdə, ilsiz sətir də (FR-017)', () => {
    const { container } = renderHistory()
    const card = container.querySelector('[data-slot="history-card"]') as HTMLElement
    expect(within(card).getAllByRole('heading', { level: 3 })).toHaveLength(3)
    expect(within(card).getByRole('img', { name: 'Fərman' })).toHaveAttribute('src', expect.stringMatching(/\/media\/121$/))
    expect(within(card).getByRole('link', { name: 'Şəkli böyüt: Fərman' })).toHaveAttribute('href', '/media/121')
    expect(card).toHaveTextContent('İli olmayan sətir.')
  })

  it('ilk il aktivdir, digər panel aktiv deyil', () => {
    const { container } = renderHistory()
    const panels = container.querySelectorAll('[data-panel]')
    expect(panels[0]).toHaveAttribute('data-active')
    expect(panels[1]).not.toHaveAttribute('data-active')
    const nav = screen.getByRole('navigation', { name: 'İllər' })
    expect(within(nav).getByRole('link', { name: '1919' })).toHaveAttribute('aria-current', 'step')
  })

  it('hadisə mətni tünd kart variantındadır', () => {
    const { container } = renderHistory()
    const contents = container.querySelectorAll('[data-slot="history-card"] [data-slot="cms-content"]')
    expect([...contents].every((el) => el.getAttribute('data-variant') === 'history')).toBe(true)
  })
})

describe('AboutBlocks — mission', () => {
  it('banner mətni və dəyər sətirləri başlıqları ilə', () => {
    const { container } = render(aboutContractHtml.mission, 'mission')
    expect(container.querySelector('[data-slot="mission-banner"]')).toHaveTextContent('maliyyə sabitliyini təmin etmək')
    const rows = container.querySelector('[data-slot="value-rows"]') as HTMLElement
    expect(within(rows).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Dürüstlük', 'Cavabdehlik'])
  })

  it('ikon yalnız şəkli olan dəyərdə, dekorativ alt ilə', () => {
    const { container } = render(aboutContractHtml.mission, 'mission')
    const icons = container.querySelectorAll('[data-slot="value-rows"] img')
    expect(icons).toHaveLength(1)
    expect(icons[0]).toHaveAttribute('src', '/media/123')
    expect(icons[0]).toHaveAttribute('alt', '')
    expect(screen.queryByText('<img')).toBeNull()
  })
})
