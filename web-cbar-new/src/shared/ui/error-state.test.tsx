import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderApp, screen } from '@/shared/testing/render'

import { ErrorState } from './error-state'

describe('ErrorState', () => {
  it('kind-ə görə i18n mesajı seçir (az)', () => {
    renderApp(<ErrorState kind="schema" />, { locale: 'az' })

    expect(screen.getByText('Serverdən gözlənilməyən formatda cavab gəldi')).toBeInTheDocument()
  })

  it('kind-ə görə i18n mesajı seçir (en)', () => {
    renderApp(<ErrorState kind="server" />, { locale: 'en' })

    expect(screen.getByText('A server error occurred. Please try again shortly')).toBeInTheDocument()
  })

  it('başlıq verilərsə onu göstərir və yenidən cəhd düyməsi işləyir', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()

    renderApp(<ErrorState title="Siyahı yüklənmədi" onRetry={onRetry} />, { locale: 'az' })

    await user.click(screen.getByRole('button', { name: 'Yenidən cəhd et' }))

    expect(screen.getByText('Siyahı yüklənmədi')).toBeInTheDocument()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
