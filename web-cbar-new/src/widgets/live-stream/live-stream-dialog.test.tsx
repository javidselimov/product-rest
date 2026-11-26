import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { dismissalKey } from '@/features/live-stream/model/dismissal'
import { useLiveStreamStore } from '@/features/live-stream/model/store'
import type { LiveStream } from '@/features/media/model/live-stream'
import { renderApp, screen, waitFor } from '@/shared/testing/render'
import { navigationState } from '@/shared/testing/setup'

import { LiveStreamDialog } from './live-stream-dialog'

const stream: LiveStream = {
  id: 7,
  title: 'İdarə Heyətinin brifinqi',
  embedUrl: 'https://www.youtube-nocookie.com/embed/live12345',
}

/** Brauzer "refresh"-i: store yenidən yaranır, sessionStorage qalır. */
function freshPage(pathname: string, value: LiveStream | null = stream) {
  navigationState.pathname = pathname
  useLiveStreamStore.setState({ open: false })
  return renderApp(<LiveStreamDialog stream={value} />, { locale: 'az' })
}

const dialog = () => screen.queryByRole('dialog')

async function closeDialog() {
  await userEvent.setup().click(screen.getByRole('button', { name: 'Bağla' }))
  await waitFor(() => expect(dialog()).toBeNull())
}

describe('LiveStreamDialog', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    navigationState.pathname = '/az'
    useLiveStreamStore.setState({ open: false })
  })

  it('ilk açılışda popup çıxır: başlıq, "Canlı" nişanı, nocookie pleyer (autoplay-siz)', async () => {
    freshPage('/az')

    const el = await screen.findByRole('dialog', { name: /İdarə Heyətinin brifinqi/ })
    expect(el).toHaveTextContent('Canlı')
    const frame = screen.getByTitle('Video: İdarə Heyətinin brifinqi')
    // Autoplay yoxdur — video yalnız istifadəçi play-ə basanda başlayır.
    expect(frame).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/live12345')
    expect(frame.getAttribute('allow')).not.toContain('autoplay')
  })

  it('bağlananda sessionStorage-ə yazılır, eyni səhifənin refresh-ində çıxmır', async () => {
    const first = freshPage('/az/haqqimizda')
    await screen.findByRole('dialog')
    await closeDialog()
    expect(sessionStorage.getItem(dismissalKey(7))).toBe('1')
    // Bağlananda pleyer DOM-dan çıxır — video dayanır.
    expect(screen.queryByTitle(/^Video:/)).toBeNull()

    first.unmount()
    freshPage('/az/haqqimizda')
    // Effekt işləsin deyə bir tick gözlə, sonra popup-ın açılmadığını yoxla.
    await waitFor(() => expect(useLiveStreamStore.getState().open).toBe(false))
    expect(dialog()).toBeNull()
  })

  it('bir səhifədə bağlanandan sonra başqa səhifədə və başqa dildə də çıxmır', async () => {
    const view = freshPage('/az')
    await screen.findByRole('dialog')
    await closeDialog()

    // Client naviqasiya: layout remount olmur, yalnız pathname dəyişir.
    navigationState.pathname = '/az/media'
    view.rerender(<LiveStreamDialog stream={stream} />)
    await waitFor(() => expect(useLiveStreamStore.getState().open).toBe(false))
    expect(dialog()).toBeNull()

    // Tam yüklənmə (birbaşa ünvan, dil dəyişdiricisi): store sıfırlanır, storage qalır.
    view.unmount()
    freshPage('/en/media')
    await waitFor(() => expect(useLiveStreamStore.getState().open).toBe(false))
    expect(dialog()).toBeNull()
  })

  it('yeni yayım bu sessiyada bağlanmış olsa da yenidən çıxır', async () => {
    sessionStorage.setItem(dismissalKey(7), '1')
    freshPage('/az', { ...stream, id: 8, title: 'Yeni yayım' })
    expect(await screen.findByRole('dialog', { name: /Yeni yayım/ })).toBeInTheDocument()
  })

  it('başlıq yoxdursa ümumi "Canlı yayım" adı işlənir', async () => {
    freshPage('/az', { ...stream, title: null })
    expect(await screen.findByTitle('Video: Canlı yayım')).toBeInTheDocument()
  })

  it('yayım yoxdursa heç nə render olunmur', () => {
    const { container } = freshPage('/az', null)
    expect(container).toBeEmptyDOMElement()
    expect(dialog()).toBeNull()
  })
})
