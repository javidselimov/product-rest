import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteImage } from './site-image'

const skeleton = (container: HTMLElement) => container.querySelector('[data-slot="skeleton"]')

function renderImage(src = '/media/1') {
  const view = render(
    <div className="relative">
      <SiteImage src={src} alt="Bank" fill sizes="100vw" />
    </div>,
  )
  return { ...view, image: screen.getByRole('img', { name: 'Bank' }) }
}

describe('SiteImage', () => {
  it('shows the pulse until the image arrives', async () => {
    const { container, image } = renderImage()
    expect(skeleton(container)).toBeInTheDocument()
    expect(skeleton(container)).toHaveAttribute('aria-hidden', 'true')
    expect(image).toHaveAttribute('data-state', 'loading')

    fireEvent.load(image)

    await waitFor(() => expect(image).toHaveAttribute('data-state', 'loaded'))
    expect(skeleton(container)).not.toBeInTheDocument()
  })

  it('stops the pulse when the image fails', async () => {
    const { container, image } = renderImage()

    fireEvent.error(image)

    await waitFor(() => expect(image).toHaveAttribute('data-state', 'error'))
    expect(skeleton(container)).not.toBeInTheDocument()
  })

  it('goes back to loading when the source changes', async () => {
    const { container, image, rerender } = renderImage()
    fireEvent.load(image)
    await waitFor(() => expect(image).toHaveAttribute('data-state', 'loaded'))

    rerender(
      <div className="relative">
        <SiteImage src="/media/2" alt="Bank" fill sizes="100vw" />
      </div>,
    )

    expect(screen.getByRole('img', { name: 'Bank' })).toHaveAttribute('data-state', 'loading')
    expect(skeleton(container)).toBeInTheDocument()
  })

  it('has no pulse without a box to fill', () => {
    const { container } = render(<SiteImage src="/media/1" alt="Bank" width={112} height={84} />)
    expect(skeleton(container)).not.toBeInTheDocument()
  })

  it('leaves the pulse out on request', () => {
    const { container } = render(<SiteImage src="/media/1" alt="Bank" fill sizes="100vw" skeleton={false} />)
    expect(skeleton(container)).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Bank' })).toHaveAttribute('data-state', 'loading')
  })
})
