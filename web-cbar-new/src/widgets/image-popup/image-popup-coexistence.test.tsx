import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useImagePopupStore } from '@/features/image-popup/model/store'
import type { ImagePopup } from '@/features/image-popup/model/image-popup'
import { dismissalKey } from '@/features/live-stream/model/dismissal'
import { useLiveStreamStore } from '@/features/live-stream/model/store'
import type { LiveStream } from '@/features/media/model/live-stream'
import { renderApp, screen, waitFor } from '@/shared/testing/render'
import { navigationState } from '@/shared/testing/setup'
import { LiveStreamDialog } from '@/widgets/live-stream/live-stream-dialog'

import { ImagePopupDialog } from './image-popup-dialog'

const stream: LiveStream = {
  id: 7,
  title: 'İdarə Heyətinin brifinqi',
  embedUrl: 'https://www.youtube-nocookie.com/embed/live12345',
}

const popup: ImagePopup = { id: 4, imageUrl: '/media/1', link: null, altText: 'Elan şəkli' }

/** `SiteShell` kimi: canlı yayım dialoqu, ardınca şəkilli popup. */
function freshPage(liveStream: LiveStream | null = stream) {
  navigationState.pathname = '/az'
  useLiveStreamStore.setState({ open: false })
  useImagePopupStore.setState({ open: false })
  return renderApp(
    <>
      <LiveStreamDialog stream={liveStream} />
      <ImagePopupDialog popup={popup} liveStreamId={liveStream?.id} />
    </>,
    { locale: 'az' },
  )
}

const liveDialog = () => screen.queryByRole('dialog', { name: /İdarə Heyətinin brifinqi/ })
const imageDialog = () => screen.queryByRole('dialog', { name: 'Elan şəkli' })

async function closeOpenDialog() {
  await userEvent.setup().click(screen.getByRole('button', { name: 'Bağla' }))
}

describe('canlı yayım + şəkilli popup növbəsi', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    navigationState.pathname = '/az'
    useLiveStreamStore.setState({ open: false })
    useImagePopupStore.setState({ open: false })
  })

  it('təmiz sessiya: yalnız canlı yayım görünür; o bağlananda şəkilli popup açılır', async () => {
    freshPage()
    expect(await screen.findByRole('dialog', { name: /İdarə Heyətinin brifinqi/ })).toBeInTheDocument()
    expect(useImagePopupStore.getState().open).toBe(false)
    expect(imageDialog()).toBeNull()

    await closeOpenDialog()
    expect(await screen.findByRole('dialog', { name: 'Elan şəkli' })).toBeInTheDocument()
    expect(liveDialog()).toBeNull()
  })

  it('hər ikisi bağlanıb, refresh → heç biri açılmır', async () => {
    const first = freshPage()
    await screen.findByRole('dialog', { name: /İdarə Heyətinin brifinqi/ })
    await closeOpenDialog()
    await screen.findByRole('dialog', { name: 'Elan şəkli' })
    await closeOpenDialog()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    first.unmount()
    freshPage()
    await waitFor(() => {
      expect(useLiveStreamStore.getState().open).toBe(false)
      expect(useImagePopupStore.getState().open).toBe(false)
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('canlı yayım bu sessiyada əvvəlcədən bağlanıb → yalnız şəkilli popup açılır', async () => {
    sessionStorage.setItem(dismissalKey(7), '1')
    freshPage()
    expect(await screen.findByRole('dialog', { name: 'Elan şəkli' })).toBeInTheDocument()
    expect(liveDialog()).toBeNull()
  })

  it('canlı yayım yoxdur → şəkilli popup dərhal açılır', async () => {
    freshPage(null)
    expect(await screen.findByRole('dialog', { name: 'Elan şəkli' })).toBeInTheDocument()
  })
})
