import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RouterErrorFallback } from './error-boundary'

const originalLocation = window.location
let reload: ReturnType<typeof vi.fn>

beforeEach(() => {
  sessionStorage.clear()
  reload = vi.fn()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...originalLocation, reload },
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: originalLocation,
  })
})

describe('RouterErrorFallback (spec 004 FR-009)', () => {
  it('xətanı log-a yazır, amma raw mətni ekranda göstərmir', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('boom-internal')
    render(<RouterErrorFallback error={error} reset={() => {}} />)

    expect(screen.getByText('Nəsə səhv getdi')).toBeInTheDocument()
    expect(screen.queryByText(/boom-internal/)).toBeNull()
    expect(consoleError).toHaveBeenCalledWith(
      expect.any(String),
      error,
      expect.objectContaining({ source: 'router' }),
    )
    expect(reload).not.toHaveBeenCalled()
  })

  it('chunk yükləmə xətasında səhifəni bir dəfə yeniləyir', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <RouterErrorFallback
        error={
          new TypeError(
            'Failed to fetch dynamically imported module: /assets/x.js',
          )
        }
        reset={() => {}}
      />,
    )
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
