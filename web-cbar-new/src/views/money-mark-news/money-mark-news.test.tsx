import { describe, expect, it } from 'vitest'

import { renderApp, screen } from '@/shared/testing/render'
import { MoneyMarkNewsItemView } from '@/views/money-mark-news-item'
import { loadMoneyMarkNewsItem } from '@/views/money-mark-news-item/loader'

import { MoneyMarkNewsView } from './index'
import { loadMoneyMarkNews } from './loader'

describe('pul nişanları xəbərləri', () => {
  it('siyahı səhifələnir və geri keçidi var', async () => {
    const data = await loadMoneyMarkNews('az', { page: '2' })
    renderApp(<MoneyMarkNewsView data={data} />, { locale: 'az' })

    expect(screen.getByRole('heading', { level: 1, name: 'Milli valyuta xəbərləri' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Valyuta xəbəri 11' })).toHaveAttribute(
      'href',
      '/az/national-currency/news/valyuta-xeberi-11',
    )
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/az/national-currency/news')
    expect(screen.getByRole('link', { name: 'Milli valyutaya qayıt' })).toHaveAttribute('href', '/az/national-currency')
  })

  it('detal məzmunu hazırlanır və render olunur', async () => {
    const data = await loadMoneyMarkNewsItem('az', 'yeni-200-manat')
    renderApp(<MoneyMarkNewsItemView data={data!} />, { locale: 'az' })

    expect(data?.html).toContain(`/media/71`)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Yeni 200 manatlıq əskinas')
    expect(screen.getByRole('link', { name: 'Xəbərlərə qayıt' })).toHaveAttribute('href', '/az/national-currency/news')
    await expect(loadMoneyMarkNewsItem('en', 'yoxdur')).resolves.toBeNull()
  })
})
