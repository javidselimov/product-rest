import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import az from '@/locales/az/videos.json'
import en from '@/locales/en/videos.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import { videosHandlers, videosStore } from '@/shared/testing/handlers/videos'
import { server } from '@/shared/testing/server'
import { videosModule } from './model/modules'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(videosModule)),
  ]),
])

function renderCrud(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

describe('Videolar', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'videos', az, true, true)
    i18n.addResourceBundle('en', 'videos', en, true, true)
  })

  beforeEach(() => {
    videosStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-lər yenidən əlavə olunur.
    server.use(...videosHandlers)
  })

  it('video siyahısı: düz başlıq, aktiv nişanı, yayım tabı yoxdur', async () => {
    renderCrud('/videos')
    expect(
      await screen.findByRole('heading', { name: 'Videolar' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Pul siyasəti haqqında brifinq'),
    ).toBeInTheDocument()
    expect(screen.getByText('Annual report presentation')).toBeInTheDocument()
    expect(screen.getByText('https://youtu.be/cbar0003')).toBeInTheDocument()
    // Canlı yayımlar spec 006-dan ayrıca bölmədir.
    expect(screen.queryByRole('tab', { name: 'Yayımlar' })).toBeNull()
    expect(screen.getAllByText('Aktiv').length).toBe(2)
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
  })

  it('video yaratma: sxemsiz URL → validasiya mesajı, sorğu getmir; düzəldikdə saxlanılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/videos/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni video' }),
    ).toBeInTheDocument()
    const before = videosStore.store.all().length

    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni brifinq',
    )
    const urlInput = screen.getByLabelText('YouTube URL', { exact: false })
    await user.type(urlInput, 'youtube.com/watch?v=abc')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(await screen.findByText(az.validation.url)).toBeInTheDocument()
    expect(videosStore.store.all()).toHaveLength(before)
    expect(router.state.location.pathname).toBe('/videos/new')

    await user.clear(urlInput)
    await user.type(urlInput, 'https://www.youtube.com/watch?v=abc')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/videos'))
    expect(await screen.findByText('Qeyd yaradıldı')).toBeInTheDocument()
    const created = videosStore.store
      .all()
      .find((row) => row.translations.az?.title === 'Yeni brifinq')
    expect(created).toMatchObject({
      youtubeUrl: 'https://www.youtube.com/watch?v=abc',
      publishedAt: null,
      sortOrder: 0,
      isActive: true,
    })
    expect(created?.translations).toEqual({ az: { title: 'Yeni brifinq' } })
    expect(await screen.findByText('Yeni brifinq')).toBeInTheDocument()
  })

  it('YouTube-dan kənar https linki qəbul olunur (host yoxlanılmır — canlı yayımdan fərqli)', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/videos/new')
    await screen.findByRole('heading', { name: 'Yeni video' })
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Vimeo videosu',
    )
    await user.type(
      screen.getByLabelText('YouTube URL', { exact: false }),
      'https://vimeo.com/123',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/videos'))
    expect(
      videosStore.store
        .all()
        .find((row) => row.translations.az?.title === 'Vimeo videosu'),
    ).toMatchObject({ youtubeUrl: 'https://vimeo.com/123' })
  })
})
