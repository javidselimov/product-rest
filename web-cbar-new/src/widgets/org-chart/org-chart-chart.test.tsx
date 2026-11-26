/**
 * Desktop org chart (spec 060): laid out from the tree, blocks open with native `<details>`.
 */
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { figmaOrgChart } from '@/shared/testing/fixtures/org-chart-figma'
import { renderApp, screen, within } from '@/shared/testing/render'

import type { OrgChartCardData } from './model'
import { OrgChartChart } from './org-chart-chart'

const href = (n: (typeof figmaOrgChart)[number]) =>
  n.link ? (n.link.type === 'staff' ? `/az/organization/staff/detail/${n.link.id}` : `/az/organization/divisions/${n.link.id}`) : null

const nodes: OrgChartCardData[] = figmaOrgChart.map((n) => ({
  id: n.id,
  parentId: n.parentId,
  kind: n.kind,
  name: n.name,
  role: n.role,
  curatorDirect: n.curatorDirect,
  href: href(n),
  departmentsOpen: n.departmentsOpen,
}))

const LABEL = 'Struktur sxemi (üfüqi sürüşdürülür)'
const renderChart = (data: OrgChartCardData[] = nodes) => renderApp(<OrgChartChart nodes={data} label={LABEL} />, { locale: 'az' })

describe('OrgChartChart', () => {
  it('shows every card, without coordinates, in a keyboard-scrollable region (FR-002, FR-009)', () => {
    renderChart()
    const region = screen.getByRole('region', { name: LABEL })
    expect(region).toHaveAttribute('tabindex', '0')
    for (const n of nodes) expect(within(region).getAllByText(n.name, { exact: false }).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Taleh Tahir oğlu Kazımov/ })).toHaveAttribute('href', '/az/organization/staff/detail/3')
  })

  it('opens and closes a block’s departments with a click; the summary holds no link (US1, FR-006)', async () => {
    const user = userEvent.setup()
    renderChart()
    const summary = screen.getByText('Kredit Fəaliyyətinin Tənzimlənməsi bloku').closest('summary')!
    const details = summary.closest('details')!
    expect(details.open).toBe(false)
    expect(within(summary).queryByRole('link')).toBeNull()
    expect(details).not.toHaveAttribute('name')

    await user.click(summary)
    expect(details.open).toBe(true)
    expect(within(details).getByRole('link', { name: 'Kredit fəaliyyəti departamenti 1' })).toHaveAttribute('href', '/az/organization/divisions/900')

    await user.click(summary)
    expect(details.open).toBe(false)
  })

  // Enter/Space on a <summary> is the browser's own behaviour, which jsdom does not emulate: the keyboard
  // and no-JS paths are checked in a real browser (tasks T022).

  it('shows an always-open block’s departments with no dropdown, the deputy’s side departments beside them (L7, L10)', () => {
    renderChart()
    const block = screen.getByText('Təşkilatı inkişaf bloku')
    expect(block.closest('details')).toBeNull()
    // The block card's wrapper and, under it, the row of the block's and the deputy's side departments.
    const row = block.closest('.relative')!.parentElement!
    for (const name of ['Maliyyə idarəetməsi departamenti', 'Satınalmalar departamenti', 'İnsan resursları departamenti'])
      expect(within(row).getByRole('link', { name })).toBeInTheDocument()
  })

  it('a block without departments is no dropdown', () => {
    renderChart()
    expect(screen.getByText('Maliyyə Monitorinqi bloku').closest('details')).toBeNull()
  })

  it('works against an older api-cbar without departmentsOpen: block 37 is then a dropdown (FR-016)', () => {
    renderChart(nodes.map((n) => ({ ...n, departmentsOpen: false })))
    expect(screen.getByText('Təşkilatı inkişaf bloku').closest('details')).not.toBeNull()
  })
})
