import { describe, expect, it } from 'vitest'

import type { MembershipsBlock } from '@/features/about-content/model/types'
import { YEAR_SORT } from '@/features/about-content/model/year-sort'
import { renderApp, screen, within } from '@/shared/testing/render'

import { Memberships } from './memberships'

const block: MembershipsBlock = {
  kind: 'memberships',
  introHtml: '<p>Giriş mətni</p>',
  // The editor's order: one row without a year, two rows of 2025.
  rows: [
    { organization: 'Bazel Konsultativ Qrupu', href: null, yearLabel: '2020', year: 2020 },
    { organization: 'FinCoNet', href: null, yearLabel: '2025', year: 2025 },
    { organization: 'Naməlum il', href: null, yearLabel: '', year: null },
    { organization: 'IOSCO', href: 'https://www.iosco.org/', yearLabel: '2025-ci il', year: 2025 },
    { organization: 'Sədrlər Klubu', href: null, yearLabel: '1997', year: 1997 },
  ],
  restHtml: '<p>Sonrakı mətn</p>',
}

const TITLE_AZ = 'Azərbaycan Respublikası Mərkəzi Bankının üzv olduğu təşkilatlar'

/** The organization of every body row, in the order shown. */
const organizations = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent)

describe('Memberships', () => {
  it('shows the intro, a two-column table named by a title only screen readers get, and the text after it', () => {
    renderApp(<Memberships block={block} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.getByText('Sonrakı mətn')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: TITLE_AZ })).toHaveClass('sr-only')
    const table = screen.getByRole('table', { name: TITLE_AZ })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Təşkilat', 'Üzvlük tarixi'])
  })

  it('shows the newest year first, keeps the editor order inside a year and the year-less row last', () => {
    renderApp(<Memberships block={block} locale="az" />, { locale: 'az' })

    expect(organizations()).toEqual(['FinCoNet', 'IOSCO', 'Bazel Konsultativ Qrupu', 'Sədrlər Klubu', 'Naməlum il'])
    expect(screen.getByText('Üzvlük tarixi:')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'əvvəlcə yenilər' })).toHaveAttribute('aria-current', 'true')
  })

  it('shows the oldest year first for the "oldest" order', () => {
    renderApp(<Memberships block={block} locale="az" sort={YEAR_SORT.OLDEST} />, { locale: 'az' })

    expect(organizations()).toEqual(['Sədrlər Klubu', 'Bazel Konsultativ Qrupu', 'FinCoNet', 'IOSCO', 'Naməlum il'])
    expect(screen.getByRole('link', { name: 'əvvəlcə köhnələr' })).toHaveAttribute('aria-current', 'true')
  })

  it('offers both orders as links, so sorting works without JavaScript', () => {
    renderApp(<Memberships block={block} locale="az" />, { locale: 'az' })

    expect(screen.getByRole('link', { name: 'əvvəlcə köhnələr' })).toHaveAttribute('href', '?sort=oldest')
    expect(screen.getByRole('link', { name: 'əvvəlcə yenilər' })).toHaveAttribute('href', '?sort=newest')
  })

  it('shows the year cell as the editor typed it and opens an organization link in a new tab', () => {
    renderApp(<Memberships block={block} locale="az" />, { locale: 'az' })

    const link = screen.getByRole('link', { name: 'IOSCO' })
    expect(link).toHaveAttribute('href', 'https://www.iosco.org/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('cell', { name: '2025-ci il' })).toBeInTheDocument()
  })

  it('has no table and no sort choice without rows, so the page reads as plain text', () => {
    renderApp(<Memberships block={{ ...block, rows: [] }} locale="az" />, { locale: 'az' })

    expect(screen.getByText('Giriş mətni')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryByRole('link', { name: 'əvvəlcə köhnələr' })).toBeNull()
  })

  it('speaks English on the English page', () => {
    renderApp(<Memberships block={block} locale="en" />, { locale: 'en' })

    expect(screen.getByRole('table', { name: 'Organizations the Central Bank of the Republic of Azerbaijan is a member of' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('table'))
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Organization', 'Year of membership'])
    expect(screen.getByRole('link', { name: 'oldest first' })).toBeInTheDocument()
  })
})
