import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { imagePopupDismissalKey } from '@/features/image-popup/model/dismissal'
import type { ImagePopup } from '@/features/image-popup/model/image-popup'
import { useImagePopupStore } from '@/features/image-popup/model/store'
import { renderApp, screen, waitFor } from '@/shared/testing/render'
import { navigationState } from '@/shared/testing/setup'

import { ImagePopupDialog } from './image-popup-dialog'

const popup: ImagePopup = {
  id: 4,
  imageUrl: '/media/1',
  link: 'https://www.cbar.az/az/page-40',
  altText: 'Maliyyə savadlılığı həftəsi',
}

/** Brauzer "refresh"-i: store yenidən yaranır, sessionStorage qalır. */
function freshPage(pathname: string, value: ImagePopup | null = popup) {
  navigationState.pathname = pathname
  useImagePopupStore.setState({ open: false })
  return renderApp(<ImagePopupDialog popup={value} />, { locale: 'az' })
}

const dialog = () => screen.queryByRole('dialog')

/** Effekt işləsin deyə bir tick gözlə, sonra popup-ın açılmadığını yoxla. */
async function expectStaysClosed() {
  await waitFor(() => expect(useImagePopupStore.getState().open).toBe(false))
  expect(dialog()).toBeNull()
}

async function closeDialog() {
  await userEvent.setup().click(screen.getByRole('button', { name: 'Bağla' }))
  await waitFor(() => expect(dialog()).toBeNull())
}

/** jsdom naviqasiya etmir; klik handler-i işləsin, keçid isə baş verməsin. */
function blockNavigation() {
  const stop = (e: Event) => e.preventDefault()
  window.addEventListener('click', stop, { capture: true })
  return () => window.removeEventListener('click', stop, { capture: true })
}

describe('ImagePopupDialog', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    navigationState.pathname = '/az'
    useImagePopupStore.setState({ open: false })
  })

  it('ilk açılışda popup çıxır: şəkil media proxy ünvanı və alt mətni ilə', async () => {
    freshPage('/az')

    const el = await screen.findByRole('dialog', { name: 'Maliyyə savadlılığı həftəsi' })
    expect(el).toHaveAttribute('data-slot', 'image-popup-dialog')
    const img = screen.getByRole('img', { name: 'Maliyyə savadlılığı həftəsi' })
    expect(img).toHaveAttribute('src', '/media/1')
  })

  it('popup yoxdursa heç nə render olunmur', () => {
    const { container } = freshPage('/az', null)
    expect(container).toBeEmptyDOMElement()
    expect(dialog()).toBeNull()
  })

  it('× basılanda qeyd yazılır, eyni səhifənin refresh-ində çıxmır', async () => {
    const first = freshPage('/az/haqqimizda')
    await screen.findByRole('dialog')
    expect(document.querySelector('[data-slot="dialog-close"]')).not.toBeNull()
    await closeDialog()
    expect(sessionStorage.getItem(imagePopupDismissalKey(4))).toBe('1')

    first.unmount()
    freshPage('/az/haqqimizda')
    await expectStaysClosed()
  })

  it('bağlanandan sonra başqa səhifədə və başqa dildə də çıxmır', async () => {
    const view = freshPage('/az')
    await screen.findByRole('dialog')
    await closeDialog()

    navigationState.pathname = '/az/media'
    view.rerender(<ImagePopupDialog popup={popup} />)
    await expectStaysClosed()

    view.unmount()
    freshPage('/en/media')
    await expectStaysClosed()
  })

  it('yeni sessiya (storage boş) və yeni popup (başqa id) yenidən çıxır', async () => {
    sessionStorage.setItem(imagePopupDismissalKey(4), '1')
    const first = freshPage('/az', { ...popup, id: 5 })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    first.unmount()

    sessionStorage.clear()
    freshPage('/az')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('xarici link yeni tabda açılır; klik qeyd yazır və bağlayır', async () => {
    freshPage('/az')
    const link = await screen.findByRole('link', { name: 'Ətraflı (yeni tabda açılır)' })
    expect(link).toHaveAttribute('href', 'https://www.cbar.az/az/page-40')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    const unblock = blockNavigation()
    fireEvent.click(link)
    unblock()
    await waitFor(() => expect(dialog()).toBeNull())
    expect(sessionStorage.getItem(imagePopupDismissalKey(4))).toBe('1')
  })

  it('daxili link eyni tabda; klik qeyd yazır, hədəf səhifədə popup çıxmır', async () => {
    freshPage('/az', { ...popup, link: '/az/page-40?x=1#y' })
    const link = await screen.findByRole('link', { name: 'Ətraflı' })
    expect(link).toHaveAttribute('href', '/az/page-40?x=1#y')
    expect(link).not.toHaveAttribute('target')

    const unblock = blockNavigation()
    fireEvent.click(link)
    unblock()
    await waitFor(() => expect(dialog()).toBeNull())
    expect(sessionStorage.getItem(imagePopupDismissalKey(4))).toBe('1')
  })

  it('link yoxdursa şəkil keçidə sarılmır; alt yoxdursa başlıq "Elan"-dır', async () => {
    freshPage('/az', { ...popup, link: null, altText: null })
    expect(await screen.findByRole('dialog', { name: 'Elan' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('şəkil yüklənməyəndə popup bağlanır, qeyd yazılmır', async () => {
    freshPage('/az')
    await screen.findByRole('dialog')
    fireEvent.error(screen.getByRole('img'))
    await waitFor(() => expect(dialog()).toBeNull())
    expect(sessionStorage.getItem(imagePopupDismissalKey(4))).toBeNull()
  })

  it('Esc bağlayır və qeyd yazır', async () => {
    freshPage('/az')
    await screen.findByRole('dialog')
    await userEvent.setup().keyboard('{Escape}')
    await waitFor(() => expect(dialog()).toBeNull())
    expect(sessionStorage.getItem(imagePopupDismissalKey(4))).toBe('1')
  })
})
