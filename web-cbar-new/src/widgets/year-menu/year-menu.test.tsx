import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderApp, screen, within } from '@/shared/testing/render'

import { YearMenu, type YearMenuOption } from './year-menu'

const options: YearMenuOption[] = [
  { key: 'all', label: 'Hamısı', href: '/az/isci-meqaleler-silsilesi?q=inflyasiya', selected: false },
  { key: '2025', label: '2025', href: '/az/isci-meqaleler-silsilesi?q=inflyasiya&year=2025', selected: true },
  { key: '2024', label: '2024', href: '/az/isci-meqaleler-silsilesi?q=inflyasiya&year=2024', selected: false },
]

describe('YearMenu (spec 054 ui-contract §3, §5)', () => {
  it('is a closed native disclosure whose button shows the chosen value', () => {
    renderApp(<YearMenu summary="İl: 2025" label="İl seçimi" options={options} />, { locale: 'az' })

    const details = screen.getByText('İl: 2025').closest('details')
    expect(details).not.toBeNull()
    expect(details).not.toHaveAttribute('open')
  })

  it('lists every option as a plain link that keeps the other parameters, the chosen one marked', async () => {
    const user = userEvent.setup()
    renderApp(<YearMenu summary="İl: 2025" label="İl seçimi" options={options} />, { locale: 'az' })

    await user.click(screen.getByText('İl: 2025'))
    const list = screen.getByRole('list', { name: 'İl seçimi' })
    const links = within(list).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Hamısı', '2025', '2024'])
    expect(links[2]).toHaveAttribute('href', '/az/isci-meqaleler-silsilesi?q=inflyasiya&year=2024')
    expect(within(list).getByRole('link', { name: '2025' })).toHaveAttribute('aria-current', 'true')
    expect(within(list).getByRole('link', { name: 'Hamısı' })).not.toHaveAttribute('aria-current')
  })

  it('shows a visible label before the button when one is given (year archives)', () => {
    renderApp(<YearMenu summary="2025" label="İl" visibleLabel options={options} />, { locale: 'az' })
    expect(screen.getByText('İl', { selector: '[data-slot="year-menu-label"]' })).toBeInTheDocument()
  })
})
