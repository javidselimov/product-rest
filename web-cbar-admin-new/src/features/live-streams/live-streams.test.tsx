import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import az from '@/locales/az/liveStreams.json'
import en from '@/locales/en/liveStreams.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { isYoutubeUrl } from '@/shared/crud/youtube-url'
import { i18n } from '@/shared/i18n'
import { message } from '@/shared/testing/handlers/lib/errors'
import {
  liveStreamsHandlers,
  liveStreamsStore,
} from '@/shared/testing/handlers/live-streams'
import { server } from '@/shared/testing/server'
import { liveStreamsModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(liveStreamsModule)),
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

describe('isYoutubeUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=abc',
    'https://youtube.com/live/abc',
    'https://m.youtube.com/watch?v=abc',
    'https://youtu.be/abc',
    'http://www.youtube.com/watch?v=abc',
  ])('qəbul edir: %s', (url) => expect(isYoutubeUrl(url)).toBe(true))

  it.each([
    'youtube.com/watch?v=abc',
    'https://vimeo.com/123',
    'https://youtube.com.evil.az/watch?v=abc',
    'javascript:alert(1)',
    'https://stream.cbar.az/live/x.m3u8',
  ])('rədd edir: %s', (url) => expect(isYoutubeUrl(url)).toBe(false))
})

describe('Canlı yayımlar', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'liveStreams', az, true, true)
    i18n.addResourceBundle('en', 'liveStreams', en, true, true)
  })

  beforeEach(() => {
    liveStreamsStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-lər yenidən əlavə olunur.
    server.use(...liveStreamsHandlers)
  })

  it('siyahı: tərcümə fallback-ı, tarix sütunları, Aktiv/Qeyri-aktiv nişanı', async () => {
    renderCrud('/live-streams')
    expect(
      await screen.findByRole('heading', { name: 'Canlı yayımlar' }),
    ).toBeInTheDocument()
    const table = await screen.findByRole('table')
    expect(
      await within(table).findByText('Mətbuat konfransı'),
    ).toBeInTheDocument()
    // Yalnız EN tərcüməsi olan yayım EN başlığı ilə görünür.
    expect(within(table).getByText('Financial forum')).toBeInTheDocument()
    for (const header of ['Tarix', 'Yaradılma vaxtı', 'Yenilənmə vaxtı']) {
      expect(
        within(table).getByRole('columnheader', { name: header }),
      ).toBeInTheDocument()
    }
    expect(within(table).getByText('Aktiv')).toBeInTheDocument()
    expect(within(table).getByText('Qeyri-aktiv')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).toBeNull()
  })

  it('yaratma: YouTube olmayan URL rədd olunur; düzgün link saxlanılır, default aktivdir', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/live-streams/new')
    expect(
      await screen.findByRole('heading', { name: /Yeni canlı yayım/i }),
    ).toBeInTheDocument()
    const before = liveStreamsStore.store.all().length

    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Forum yayımı',
    )
    const urlInput = screen.getByLabelText('YouTube URL', { exact: false })
    await user.type(urlInput, 'https://stream.cbar.az/live/x.m3u8')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(await screen.findByText(az.validation.url)).toBeInTheDocument()
    expect(liveStreamsStore.store.all()).toHaveLength(before)
    expect(router.state.location.pathname).toBe('/live-streams/new')

    await user.clear(urlInput)
    await user.type(urlInput, 'https://www.youtube.com/watch?v=forum1')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/live-streams'),
    )
    const created = liveStreamsStore.store
      .all()
      .find((row) => row.translations.az?.title === 'Forum yayımı')
    expect(created).toMatchObject({
      streamUrl: 'https://www.youtube.com/watch?v=forum1',
      isLive: true,
      startsAt: null,
    })
    const table = await screen.findByRole('table')
    expect(within(table).getByText('Forum yayımı')).toBeInTheDocument()
  })

  it('redaktə: aktiv işarəsi götürülür, siyahıda Qeyri-aktiv görünür', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/live-streams/1')
    const checkbox = await screen.findByLabelText('Aktiv')
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/live-streams'),
    )
    expect(liveStreamsStore.store.get(1)).toMatchObject({ isLive: false })
  })

  it('siyahıdan status: klik PUT tam DTO göndərir, düymə və toast yenilənir', async () => {
    const user = userEvent.setup()
    renderCrud('/live-streams')
    const toggle = await screen.findByRole('button', {
      name: 'Statusu dəyiş: Mətbuat konfransı (Aktiv)',
    })
    await user.click(toggle)

    expect(
      await screen.findByText('"Mətbuat konfransı" qeyri-aktiv edildi'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', {
        name: 'Statusu dəyiş: Mətbuat konfransı (Qeyri-aktiv)',
      }),
    ).toBeInTheDocument()
    // Digər sahələr toxunulmaz qalır — PUT tam DTO ilə gedir.
    expect(liveStreamsStore.store.get(1)).toMatchObject({
      isLive: false,
      streamUrl: 'https://www.youtube.com/watch?v=cbarLive01',
      startsAt: '2026-06-10T11:00:00+00:00',
      translations: {
        az: { title: 'Mətbuat konfransı' },
        en: { title: 'Press conference' },
      },
    })

    // Geri aktiv etmək.
    await user.click(
      screen.getByRole('button', {
        name: 'Statusu dəyiş: Mətbuat konfransı (Qeyri-aktiv)',
      }),
    )
    await waitFor(() =>
      expect(liveStreamsStore.store.get(1)).toMatchObject({ isLive: true }),
    )
  })

  it('siyahıdan status: API xətası toast ilə göstərilir, store dəyişmir', async () => {
    const user = userEvent.setup()
    server.use(
      http.put('/api/v1/video-streams/:id', () =>
        message(404, 'Yayım tapılmadı'),
      ),
    )
    renderCrud('/live-streams')
    await user.click(
      await screen.findByRole('button', {
        name: 'Statusu dəyiş: Mətbuat konfransı (Aktiv)',
      }),
    )
    expect(await screen.findByText('Yayım tapılmadı')).toBeInTheDocument()
    expect(liveStreamsStore.store.get(1)).toMatchObject({ isLive: true })
  })

  it('silmə: dialoq tərcümə başlığını göstərir', async () => {
    const user = userEvent.setup()
    renderCrud('/live-streams')
    await screen.findByText('Mətbuat konfransı')
    await user.click(
      screen.getByRole('button', { name: 'Sil: Mətbuat konfransı' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/"Mətbuat konfransı" qeydi silinsin/),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    await waitFor(() =>
      expect(screen.queryByText('Mətbuat konfransı')).not.toBeInTheDocument(),
    )
    expect(liveStreamsStore.store.get(1)).toBeNull()
  })
})
