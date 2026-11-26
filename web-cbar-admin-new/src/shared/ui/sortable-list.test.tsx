import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { SortableList } from './sortable-list'

type Row = { id: number; name: string }
const rows: Row[] = [
  { id: 1, name: 'Birinci' },
  { id: 2, name: 'İkinci' },
  { id: 3, name: 'Üçüncü' },
]

const labels = {
  list: 'Suallar',
  moveUp: (name: string) => `${name} — yuxarı`,
  moveDown: (name: string) => `${name} — aşağı`,
  moved: (name: string, position: number) => `${name} ${position}-ci yerə keçdi`,
}

/** The caller keeps the order, as the FAQ topic form does after a save. */
function Harness({ onReorder }: { onReorder: (ids: number[]) => void }) {
  const [items, setItems] = useState(rows)
  return (
    <SortableList
      items={items}
      getKey={(row) => row.id}
      getLabel={(row) => row.name}
      renderItem={(row) => <span>{row.name}</span>}
      labels={labels}
      onReorder={(ids) => {
        onReorder(ids)
        setItems(ids.map((id) => rows.find((row) => row.id === id)!))
      }}
    />
  )
}

const order = () => within(screen.getByRole('list', { name: 'Suallar' })).getAllByRole('listitem').map((li) => li.textContent)

describe('SortableList (spec 051)', () => {
  it('moves a row with the keyboard buttons and announces it', async () => {
    const onReorder = vi.fn()
    render(<Harness onReorder={onReorder} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Üçüncü — yuxarı' }))

    expect(onReorder).toHaveBeenCalledWith([1, 3, 2])
    expect(order()).toEqual(['Birinci', 'Üçüncü', 'İkinci'])
    expect(screen.getByRole('status')).toHaveTextContent('Üçüncü 2-ci yerə keçdi')
  })

  it('disables the moves that leave the list', () => {
    render(<Harness onReorder={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Birinci — yuxarı' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Üçüncü — aşağı' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Birinci — aşağı' })).toBeEnabled()
  })

  it('moves a row dropped on another', () => {
    const onReorder = vi.fn()
    render(<Harness onReorder={onReorder} />)
    const [first, , third] = within(screen.getByRole('list')).getAllByRole('listitem')
    const dataTransfer = { effectAllowed: '', setData: vi.fn(), getData: vi.fn() }

    fireEvent.dragStart(first!, { dataTransfer })
    fireEvent.dragOver(third!, { dataTransfer })
    fireEvent.drop(third!, { dataTransfer })

    expect(onReorder).toHaveBeenCalledWith([2, 3, 1])
    expect(order()).toEqual(['İkinci', 'Üçüncü', 'Birinci'])
  })
})
