import { describe, expect, it } from 'vitest'

import type { MemorandumsBlock } from '@/features/about-content/model/types'
import { YEAR_SORT } from '@/features/about-content/model/year-sort'
import { renderApp, screen, within } from '@/shared/testing/render'

import { Memorandums } from './memorandums'

const block: MemorandumsBlock = {
  kind: 'memorandums',
  introHtml: '<p>Giriş mətni</p>',
  rows: [
    { id: 1, organization: 'Slovakiya Milli Bankı', country: 'Slovakiya', year: 2026 },
    { id: 2, organization: 'Rusiya Federasiyasının Mərkəzi Bankı', country: 'Rusiya', year: 2026 },
    { id: 3, organization: 'Pakistan İslam Respublikası Mərkəzi Bankı', country: 'Pakistan', year: 1996 },
  ],
}

const TITLE_AZ = 'Xarici ölkələrin mərkəzi bankları və nəzarət qurumları ilə imzalanmış Anlaşma Memorandumları'

/** The organization of every body row, in the order shown. */
const organizations = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent)

describe('Memorandums', () => {
  it('shows the intro and a table named by its heading, with three columns', () => {
    renderApp(<Memorandums block={block} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: TITLE_AZ })).toBeInTheDocument()
    const table = screen.getByRole('table', { name: TITLE_AZ })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Təşkilat', 'Ölkə', 'Tarix'])

    const [, first] = within(table).getAllByRole('row')
    expect(
      within(first!)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual(['Slovakiya Milli Bankı', 'Slovakiya', '2026'])
  })

  it('shows the newest year first by default and marks that choice', () => {
    renderApp(<Memorandums block={block} locale="az" />, { locale: 'az' })

    expect(organizations()).toEqual(['Slovakiya Milli Bankı', 'Rusiya Federasiyasının Mərkəzi Bankı', 'Pakistan İslam Respublikası Mərkəzi Bankı'])
    expect(screen.getByRole('link', { name: 'əvvəlcə yenilər' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'əvvəlcə köhnələr' })).not.toHaveAttribute('aria-current')
  })

  it('offers both orders as links, so sorting works without JavaScript', () => {
    renderApp(<Memorandums block={block} locale="az" />, { locale: 'az' })

    expect(screen.getByRole('link', { name: 'əvvəlcə köhnələr' })).toHaveAttribute('href', '?sort=oldest')
    expect(screen.getByRole('link', { name: 'əvvəlcə yenilər' })).toHaveAttribute('href', '?sort=newest')
  })

  it('shows the oldest year first when asked, keeping the order inside a year', () => {
    renderApp(<Memorandums block={block} locale="az" sort={YEAR_SORT.OLDEST} />, { locale: 'az' })

    expect(organizations()).toEqual(['Pakistan İslam Respublikası Mərkəzi Bankı', 'Slovakiya Milli Bankı', 'Rusiya Federasiyasının Mərkəzi Bankı'])
    expect(screen.getByRole('link', { name: 'əvvəlcə köhnələr' })).toHaveAttribute('aria-current', 'true')
  })

  it('uses the English labels on the English page', () => {
    renderApp(<Memorandums block={block} locale="en" />, { locale: 'en' })

    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual(['Organization', 'Country', 'Date'])
    expect(screen.getByRole('link', { name: 'oldest first' })).toBeInTheDocument()
  })

  it('shows only the page text while there are no memorandums', () => {
    renderApp(<Memorandums block={{ ...block, rows: [] }} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
  })
})
