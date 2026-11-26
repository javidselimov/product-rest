import { describe, expect, it } from 'vitest'

import { prepareCmsHtml } from '@/shared/lib/cms-html'
import { legacyCmsHtml, legacyCounts } from '@/shared/testing/fixtures/cms-html'
import { renderApp, screen } from '@/shared/testing/render'

import { CmsContent } from './cms-content'

// The shape the admin editor saves: the header-row button only reaches the first row, so the column headings are <td>.
const listTableHtml =
  '<table style="min-width: 75px"><colgroup><col><col><col></colgroup><tbody>' +
  '<tr><th colspan="3" rowspan="1"><p>SİYAHI (sığorta vasitəçiləri)</p></th></tr>' +
  '<tr><td><p>№</p></td><td><p>SOYAD, AD, ATA ADI</p></td><td><p>SAAT</p></td></tr>' +
  '<tr><td><p>1</p></td><td><p>Ağazadə Cavid Həmid oğlu</p></td><td><p>09:30</p></td></tr>' +
  '</tbody></table>'

describe('CmsContent', () => {
  it('renders legacy markup without structural loss', () => {
    const { container } = renderApp(
      <CmsContent html={prepareCmsHtml(legacyCmsHtml)} />,
    )

    expect(container.querySelectorAll('details[data-accordion]')).toHaveLength(legacyCounts.accordions)
    expect(container.querySelectorAll('table')).toHaveLength(legacyCounts.tables)
    expect(container.querySelectorAll('iframe')).toHaveLength(legacyCounts.iframes)
    expect(container.querySelectorAll('script')).toHaveLength(0)
  })

  it('a media link stays same-origin and opens in a new window', () => {
    renderApp(<CmsContent html={prepareCmsHtml(legacyCmsHtml)} />)

    const link = screen.getByRole('link', { name: 'qiymət sabitliyi' })

    expect(link).toHaveAttribute('href', '/media/12')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('the accordion opens and closes through <details>, without JS', () => {
    const { container } = renderApp(
      <CmsContent html={prepareCmsHtml(legacyCmsHtml)} />,
    )
    const details = container.querySelector('details[data-accordion]') as HTMLDetailsElement

    expect(details.open).toBe(false)
    details.open = true
    expect(details.open).toBe(true)
  })

  it('keeps the merged title cell and the three columns of a list table, as the editor saves them', () => {
    const { container } = renderApp(<CmsContent html={prepareCmsHtml(listTableHtml)} variant="about" tables="list" />)

    expect(container.querySelector('[data-slot="cms-content"]')).toHaveAttribute('data-tables', 'list')
    expect(screen.getByRole('columnheader', { name: 'SİYAHI (sığorta vasitəçiləri)' })).toHaveAttribute('colspan', '3')
    expect(screen.getByRole('table').querySelectorAll('tr:nth-child(3) > td')).toHaveLength(3)
    expect(screen.getByRole('cell', { name: '09:30' })).toBeInTheDocument()
  })

  it('leaves tables of other pages in the default style', () => {
    const { container } = renderApp(<CmsContent html={prepareCmsHtml(listTableHtml)} variant="about" />)

    expect(container.querySelector('[data-slot="cms-content"]')).not.toHaveAttribute('data-tables')
  })

  it('renders nothing for empty content', () => {
    const { container } = renderApp(<CmsContent html="" />)

    expect(container.querySelector('[data-slot="cms-content"]')).toBeNull()
  })
})
