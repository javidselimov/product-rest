import { describe, expect, it } from 'vitest'

import { renderApp, screen } from '@/shared/testing/render'

import { ContentList } from './content-list'

describe('ContentList', () => {
  it('elementləri keçid, tarix və badge ilə render edir', () => {
    renderApp(
      <ContentList
        items={[{ key: 'a', title: 'Qanun', href: '/az/laws/q', dateLabel: '15 yanvar 2026', badge: 'Bank' }]}
        error={false}
        emptyLabel="Yoxdur"
        errorLabel="Xəta"
      />,
    )

    expect(screen.getByRole('link', { name: 'Qanun' })).toHaveAttribute('href', '/az/laws/q')
    expect(screen.getByText('Bank')).toBeInTheDocument()
    expect(screen.getByText('15 yanvar 2026')).toBeInTheDocument()
  })

  it('boş və xəta vəziyyətləri', () => {
    const { rerender } = renderApp(<ContentList items={[]} error={false} emptyLabel="Yoxdur" errorLabel="Xəta" />)
    expect(screen.getByText('Yoxdur')).toBeInTheDocument()

    rerender(<ContentList items={null} error emptyLabel="Yoxdur" errorLabel="Xəta" />)
    expect(screen.getByText('Xəta')).toBeInTheDocument()
  })
})
