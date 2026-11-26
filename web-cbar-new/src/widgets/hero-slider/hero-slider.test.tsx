import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderApp, screen } from '@/shared/testing/render'

import { HeroSlider, type HeroSlide } from './hero-slider'

const slides: HeroSlide[] = [
  { key: 'a', title: 'Birinci', description: 'Təsvir', href: '/az/press-releases/a', imageUrl: 'http://api/media/1', dateLabel: '10 sentyabr 2026' },
  { key: 'b', title: 'İkinci', description: null, href: 'https://example.az', imageUrl: null, dateLabel: null },
]

describe('HeroSlider', () => {
  it('slaydları, sayğacı və keçid düymələrini render edir, ilk slayd aktivdir', () => {
    renderApp(<HeroSlider slides={slides} />, { locale: 'az' })

    expect(screen.getByRole('region', { name: 'Xəbər slayderi' })).toBeInTheDocument()
    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Əvvəlki slayd' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ətraflı' })).toHaveAttribute('href', '/az/press-releases/a')
  })

  it('növbəti düyməsi slaydı dəyişir; xarici keçid yeni pəncərədədir', async () => {
    const user = userEvent.setup()
    renderApp(<HeroSlider slides={slides} />, { locale: 'az' })

    await user.click(screen.getByRole('button', { name: 'Növbəti slayd' }))

    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'İkinci' })).toHaveAttribute('target', '_blank')

    await user.click(screen.getByRole('button', { name: 'Növbəti slayd' }))
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('tək slaydda sayğac və düymələr yoxdur', () => {
    renderApp(<HeroSlider slides={[slides[0]]} />, { locale: 'az' })

    expect(screen.queryByText('1/1')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Növbəti slayd' })).toBeNull()
  })

  it('boş siyahıda render olunmur', () => {
    const { container } = renderApp(<HeroSlider slides={[]} />)

    expect(container.querySelector('[data-slot="hero-slider"]')).toBeNull()
  })
})
