import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderApp, screen, waitFor, within } from '@/shared/testing/render'

import { DecisionsDialog } from './decisions-dialog'
import type { DecisionsDialogData } from './model'

const tile = (key: string, day: number, month: string, type: string, state: 'past' | 'next' | 'future') => ({
  key,
  day,
  month,
  type,
  state,
  label: `${day} ${month}, ${type}, ${state}`,
})

const data: DecisionsDialogData = {
  title: 'Pul siyasəti qərarlarının açıqlanması qrafiki',
  subtitle: '2026-cı il · Mərkəzi Bankın İdarə Heyəti',
  next: { label: 'Növbəti açıqlama', date: '29 oktyabr 2026', type: 'Press-reliz və mətbuat konfransı' },
  tiles: [
    tile('2026-02-04', 4, 'fev', 'Press-reliz və mətbuat konfransı', 'past'),
    tile('2026-04-02', 2, 'apr', 'Press-reliz', 'past'),
    tile('2026-05-06', 6, 'may', 'Press-reliz və mətbuat konfransı', 'past'),
    tile('2026-06-24', 24, 'iyn', 'Press-reliz', 'past'),
    tile('2026-07-31', 31, 'iyl', 'Press-reliz və mətbuat konfransı', 'past'),
    tile('2026-09-23', 23, 'sen', 'Press-reliz', 'past'),
    tile('2026-10-29', 29, 'okt', 'Press-reliz və mətbuat konfransı', 'next'),
    tile('2026-12-23', 23, 'dek', 'Press-reliz', 'future'),
  ],
  empty: 'Bu il üçün qrafik hələ dərc olunmayıb.',
  allLabel: 'Bütün qərarlar',
  allHref: '/az/media/events?type=1',
}

function renderDialog(overrides: Partial<DecisionsDialogData> = {}) {
  renderApp(
    <DecisionsDialog data={{ ...data, ...overrides }}>
      Qrafikə uyğun
    </DecisionsDialog>,
    { locale: 'az' },
  )
  return screen.getByRole('link', { name: 'Qrafikə uyğun' })
}

describe('Decisions dialog (spec 039 US3)', () => {
  it('is a link to the decisions in the events list until it is clicked', () => {
    const trigger = renderDialog()
    expect(trigger).toHaveAttribute('href', '/az/media/events?type=1')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the year of decisions: subtitle, next announcement and every date', async () => {
    const user = userEvent.setup()
    await user.click(renderDialog())

    const dialog = await screen.findByRole('dialog', { name: 'Pul siyasəti qərarlarının açıqlanması qrafiki' })
    expect(within(dialog).getByText('2026-cı il · Mərkəzi Bankın İdarə Heyəti')).toBeInTheDocument()

    const next = within(dialog).getByText('Növbəti açıqlama').closest('[data-slot="decisions-next"]') as HTMLElement
    expect(within(next).getByText('29 oktyabr 2026')).toBeInTheDocument()
    expect(within(next).getByText('Press-reliz və mətbuat konfransı')).toBeInTheDocument()

    const tiles = within(dialog).getAllByRole('listitem')
    expect(tiles).toHaveLength(8)
    expect(tiles.map((t) => t.getAttribute('data-state'))).toEqual(['past', 'past', 'past', 'past', 'past', 'past', 'next', 'future'])
    expect(tiles[6]).toHaveAttribute('aria-current', 'date')
    expect(tiles[0]).toHaveAccessibleName('4 fev, Press-reliz və mətbuat konfransı, past')
    expect(within(dialog).getByRole('link', { name: 'Bütün qərarlar' })).toHaveAttribute('href', '/az/media/events?type=1')
  })

  it('closes on Escape and returns focus to the link', async () => {
    const user = userEvent.setup()
    const trigger = renderDialog()
    await user.click(trigger)
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('says so for a year without dates and shows no next card without a planned decision', async () => {
    const user = userEvent.setup()
    await user.click(renderDialog({ tiles: [], next: null }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Bu il üçün qrafik hələ dərc olunmayıb.')).toBeInTheDocument()
    expect(within(dialog).queryByText('Növbəti açıqlama')).not.toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'Bütün qərarlar' })).toBeInTheDocument()
  })

  it('leaves a modified click to the browser', async () => {
    const user = userEvent.setup()
    const trigger = renderDialog()
    await user.keyboard('{Control>}')
    await user.click(trigger)
    await user.keyboard('{/Control}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
