/**
 * "Financial literacy" page body (spec 047 US1): what a visitor sees and can do.
 */
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { parseAbout } from '@/features/about-content/model/parse'
import type { FinancialLiteracyBlock } from '@/features/about-content/model/types'
import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { rootAz, rootEn } from '@/shared/testing/fixtures/literacy-section'
import { renderApp, screen, within } from '@/shared/testing/render'

import { FinancialLiteracy } from './financial-literacy'

const blockOf = (html: string) => parseAbout(prepareCmsHtml(html), 'financial-literacy')[0] as FinancialLiteracyBlock

describe('FinancialLiteracy', () => {
  it('shows the sections, the definition quote with its source, four cards and seven target groups', () => {
    renderApp(<FinancialLiteracy block={blockOf(rootAz.content!)} locale="az" title="Maliyyə savadlılığı" />, { locale: 'az' })

    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'İnsan maliyyə cəhətdən necə sağlam ola bilər?',
      'Maliyyə savadlılığı nədir?',
      'Maliyyə sağlamlığının dörd prinsipi',
      'Mərkəzi Bankın fəaliyyəti',
      'Maliyyə sağlamlığınızın qayğısına birlikdə qalaq!',
    ])
    expect(screen.getByRole('heading', { level: 3, name: 'Əsas hədəf qrupları' })).toBeInTheDocument()

    const quote = screen.getByRole('figure')
    expect(within(quote).getByText(/davranışlar toplusudur/)).toBeInTheDocument()
    expect(within(quote).getByText('İƏİT (İqtisadi Əməkdaşlıq və İnkişaf Təşkilatı), 2012')).toBeInTheDocument()

    const [cards, groups] = screen.getAllByRole('list').filter((list) => list.closest('[data-slot^="literacy-"]') === list)
    expect(within(cards!).getAllByRole('listitem')).toHaveLength(4)
    expect(within(cards!).getByText('Rasional sərmayə')).toBeInTheDocument()
    expect(within(cards!).getByText('Risk və gəlirliliyi qiymətləndirərək investisiya etmək')).toBeInTheDocument()
    expect(within(groups!).getAllByRole('listitem')).toHaveLength(7)
    expect(within(groups!).getByText('Ev təsərrüfatı ilə məşğul olan yaşlı əhali')).toBeInTheDocument()
  })

  it('the gallery switches photos from its thumbnails', async () => {
    renderApp(<FinancialLiteracy block={blockOf(rootAz.content!)} locale="az" title="Maliyyə savadlılığı" />, { locale: 'az' })

    const gallery = screen.getByRole('region', { name: 'Fotoqalereya' })
    expect(within(gallery).getByText('Şəkil 1 / 7')).toBeInTheDocument()
    await userEvent.click(within(gallery).getByRole('button', { name: '3 nömrəli şəkli göstər' }))
    expect(within(gallery).getByText('Şəkil 3 / 7')).toBeInTheDocument()
    expect(within(gallery).getByRole('img', { name: 'Maliyyə savadlılığı — şəkil 3' })).toBeInTheDocument()
  })

  it('the banner button writes to the address of the editor\'s mail link', () => {
    renderApp(<FinancialLiteracy block={blockOf(rootAz.content!)} locale="az" title="Maliyyə savadlılığı" />, { locale: 'az' })

    expect(screen.getByText('Sizi də bu təşəbbüslərə qoşulmağa dəvət edirik!')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'mmpi@cbar.az-a yazın' })).toHaveAttribute('href', 'mailto:mmpi@cbar.az')
  })

  it('in English the button label is English', () => {
    renderApp(<FinancialLiteracy block={blockOf(rootEn.content!)} locale="en" title="Financial Literacy" />, { locale: 'en' })

    expect(screen.getByRole('link', { name: 'Write to mmpi@cbar.az' })).toHaveAttribute('href', 'mailto:mmpi@cbar.az')
    expect(screen.getByText('OECD (Organisation for Economic Co-operation and Development), 2012')).toBeInTheDocument()
  })

  it('without a banner quote there is no button', () => {
    renderApp(<FinancialLiteracy block={blockOf('<h2>Bölmə</h2><p>Mətn</p>')} locale="az" title="X" />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 2, name: 'Bölmə' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
