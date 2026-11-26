import { describe, expect, it } from 'vitest'

import { renderApp, screen } from '@/shared/testing/render'

import { ListPagination, pageWindow } from './list-pagination'

describe('pageWindow', () => {
  it('az səhifədə hamısını göstərir', () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('çox səhifədə üç nöqtə qoyur', () => {
    expect(pageWindow(10, 20)).toEqual([1, null, 9, 10, 11, null, 20])
    expect(pageWindow(1, 20)).toEqual([1, 2, null, 20])
  })
})

describe('ListPagination', () => {
  it('tək səhifədə render olunmur', () => {
    const { container } = renderApp(
      <ListPagination basePath="/az/laws" params={{}} page={1} total={5} pageSize={10} />,
    )

    expect(container.querySelector('[data-slot="list-pagination"]')).toBeNull()
  })

  it('keçidlər filtr parametrlərini qoruyur və cari səhifəni işarələyir', () => {
    renderApp(
      <ListPagination
        basePath="/az/laws"
        params={{ type: 'law', categoryId: 3 }}
        page={2}
        total={45}
        pageSize={10}
      />,
    )

    const current = screen.getByRole('link', { current: 'page' })
    expect(current).toHaveTextContent('2')

    const third = screen.getByRole('link', { name: '3' })
    expect(third).toHaveAttribute('href', '/az/laws?type=law&categoryId=3&page=3')

    const first = screen.getByRole('link', { name: '1' })
    expect(first).toHaveAttribute('href', '/az/laws?type=law&categoryId=3')
  })

  it('əvvəlki/növbəti keçidlərin əlçatan adı kit kataloqundan az dilində gəlir', () => {
    renderApp(
      <ListPagination basePath="/az/laws" params={{}} page={2} total={30} pageSize={10} />,
      { locale: 'az' },
    )

    expect(screen.getByRole('link', { name: 'Əvvəlki səhifəyə keç' })).toHaveAttribute(
      'href',
      '/az/laws',
    )
    expect(screen.getByRole('link', { name: 'Növbəti səhifəyə keç' })).toHaveAttribute(
      'href',
      '/az/laws?page=3',
    )
  })

  it('ilk səhifədə əvvəlki, sonuncuda növbəti keçid yoxdur', () => {
    renderApp(
      <ListPagination basePath="/az/laws" params={{}} page={3} total={30} pageSize={10} />,
      { locale: 'en' },
    )

    expect(screen.queryByRole('link', { name: 'Go to next page' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Go to previous page' })).toBeInTheDocument()
  })
})
