import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { useLiveStreamStore } from '@/features/live-stream/model/store'
import type { LiveStream } from '@/features/media/model/live-stream'
import { MobileNav } from '@/shell/mobile-nav'
import { buildNavSections } from '@/shell/nav'
import { SiteHeader } from '@/shell/site-header'
import { SiteShell } from '@/shell/site-shell'
import { pageTreeAz } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, waitFor, within } from '@/shared/testing/render'
import { navigationState } from '@/shared/testing/setup'

const stream: LiveStream = {
  id: 7,
  title: 'İdarə Heyətinin brifinqi',
  embedUrl: 'https://www.youtube-nocookie.com/embed/live12345',
}

describe('Canlı yayım düyməsi', () => {
  afterEach(() => {
    sessionStorage.clear()
    navigationState.pathname = '/az'
    useLiveStreamStore.setState({ open: false })
  })

  it('başlıqda yalnız aktiv yayım olanda görünür', () => {
    const { unmount } = renderApp(<SiteHeader locale="az" tree={pageTreeAz} hasLiveStream />, { locale: 'az' })
    expect(screen.getByRole('button', { name: 'Canlı yayım' })).toHaveAttribute('aria-haspopup', 'dialog')
    unmount()

    renderApp(<SiteHeader locale="az" tree={pageTreeAz} />, { locale: 'az' })
    expect(screen.queryByRole('button', { name: 'Canlı yayım' })).toBeNull()
  })

  it('popup bağlanandan sonra düymə onu yenidən açır', async () => {
    const user = userEvent.setup()
    renderApp(
      <SiteShell locale="az" tree={pageTreeAz} liveStream={stream}>
        <p />
      </SiteShell>,
      { locale: 'az' },
    )

    await screen.findByRole('dialog', { name: /İdarə Heyətinin brifinqi/ })
    await user.click(screen.getByRole('button', { name: 'Bağla' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await user.click(screen.getByRole('button', { name: 'Canlı yayım' }))
    const dialog = await screen.findByRole('dialog', { name: /İdarə Heyətinin brifinqi/ })
    expect(within(dialog).getByTitle('Video: İdarə Heyətinin brifinqi')).toBeInTheDocument()
  })

  it('yayım yoxdursa qabıqda nə düymə, nə popup var', () => {
    renderApp(
      <SiteShell locale="az" tree={pageTreeAz}>
        <p />
      </SiteShell>,
      { locale: 'az' },
    )
    expect(screen.queryByRole('button', { name: 'Canlı yayım' })).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('mobil menyuda: klik çekmecəni bağlayır və dialoqu açır', async () => {
    const user = userEvent.setup()
    const { all } = buildNavSections(pageTreeAz, 'az')
    renderApp(<MobileNav locale="az" sections={all} hasLiveStream />, { locale: 'az' })

    await user.click(screen.getByRole('button', { name: 'Menyunu aç' }))
    await screen.findByRole('navigation', { name: 'Mobil menyu' })
    await user.click(screen.getByRole('button', { name: 'Canlı yayım' }))

    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Mobil menyu' })).toBeNull())
    expect(useLiveStreamStore.getState().open).toBe(true)
  })
})
