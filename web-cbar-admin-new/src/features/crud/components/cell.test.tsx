import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderCellValue } from './cell'

const t = (key: string) => `T(${key})`

describe('renderCellValue', () => {
  const row = {
    id: 1,
    status: 'published',
    publishedAt: '2025-09-07T10:00:00Z',
    translations: { az: { title: 'Salam' } },
    empty: '',
  }

  it('düz mətn, dot path və boş → "—"', () => {
    expect(
      renderCellValue(
        { key: 'translations.az.title', headerKey: 'x' },
        row,
        t,
        'ns',
        'az',
      ),
    ).toBe('Salam')
    expect(
      renderCellValue({ key: 'empty', headerKey: 'x' }, row, t, 'ns', 'az'),
    ).toBe('—')
    expect(
      renderCellValue({ key: 'missing', headerKey: 'x' }, row, t, 'ns', 'az'),
    ).toBe('—')
  })

  it('date/datetime formatlayır', () => {
    expect(
      renderCellValue(
        { key: 'publishedAt', headerKey: 'x', render: 'date' },
        row,
        t,
        'ns',
        'az',
      ),
    ).toMatch(/2025/)
    expect(
      renderCellValue(
        { key: 'publishedAt', headerKey: 'x', render: 'datetime' },
        row,
        t,
        'ns',
        'az',
      ),
    ).toMatch(/2025/)
  })

  it('badge etiketi namespace ilə tərcümə edilir, custom renderCell çağırılır', () => {
    render(
      <>
        {renderCellValue(
          {
            key: 'status',
            headerKey: 'x',
            render: 'badge',
            badgePalette: { published: 'green' },
            badgeLabelKey: { published: 'common:status.published' },
          },
          row,
          t,
          'ns',
          'az',
        )}
        {renderCellValue(
          {
            key: 'id',
            headerKey: 'x',
            render: 'custom',
            renderCell: (r) => `#${r.id}`,
          },
          row,
          t,
          'ns',
          'az',
        )}
      </>,
    )
    expect(screen.getByText('T(common:status.published)')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
  })
})
