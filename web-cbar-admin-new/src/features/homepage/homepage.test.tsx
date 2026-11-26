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
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import azHomepage from '@/locales/az/homepage.json'
import enHomepage from '@/locales/en/homepage.json'
import { HomepageBlocksPage } from '@/pages/homepage-blocks'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { formatDateTime } from '@/shared/crud/date-io'
import { i18n } from '@/shared/i18n'
import { runningLineFixtures } from '@/shared/testing/fixtures/homepage'
import {
  bannersStore,
  homepageHandlers,
  homepageLinksStore,
  resetHomepageStores,
} from '@/shared/testing/handlers/homepage'
import { server } from '@/shared/testing/server'
import {
  bannersModule,
  homepageLinksModule,
  newsSliderModule,
  publicationsModule,
  runningLinesModule,
} from './model/modules'

// Test-lokal route tree — app route tree-yə toxunulmur.
const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const hubRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/homepage-blocks',
  component: HomepageBlocksPage,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    hubRoute,
    ...createCrudRoutes(layoutRoute, registerModule(bannersModule)),
    ...createCrudRoutes(layoutRoute, registerModule(newsSliderModule)),
    ...createCrudRoutes(layoutRoute, registerModule(runningLinesModule)),
    ...createCrudRoutes(layoutRoute, registerModule(homepageLinksModule)),
    ...createCrudRoutes(layoutRoute, registerModule(publicationsModule)),
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

describe('Ana səhifə blokları', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'homepage', azHomepage, true, true)
    i18n.addResourceBundle('en', 'homepage', enHomepage, true, true)
  })

  beforeEach(() => {
    resetHomepageStores()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-ləri yenidən əlavə et.
    server.use(...homepageHandlers)
  })

  it('hub: seven block cards; a card opens its section', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/homepage-blocks')
    expect(
      await screen.findByRole('heading', { name: 'Ana səhifə blokları' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Bölməni aç:/ })).toHaveLength(7)
    await user.click(
      screen.getByRole('link', { name: 'Bölməni aç: Bannerlər' }),
    )
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/homepage-blocks/banners'),
    )
    expect(
      await screen.findByRole('heading', { name: 'Bannerlər' }),
    ).toBeInTheDocument()
  })

  it('bannerlər siyahısı: items envelope — sətirlər var, səhifələmə xülasəsi yoxdur', async () => {
    renderCrud('/homepage-blocks/banners')
    expect(
      await screen.findByRole('heading', { name: 'Bannerlər' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Manat 20 il')).toBeInTheDocument()
    expect(screen.getByText('Maliyyə savadlılığı')).toBeInTheDocument()
    expect(screen.queryByText(/qeyd · səhifə/)).not.toBeInTheDocument()
    // Bölmə tabları hər blok səhifəsində eynidir.
    expect(
      screen.getByRole('tab', { name: 'Məlumat sətirləri' }),
    ).toBeInTheDocument()
    // Aktiv/qeyri-aktiv nişanları.
    expect(screen.getAllByText('Aktiv').length).toBeGreaterThan(0)
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
  })

  it('yalnız şəkilli banner tərcüməsiz saxlanır (translations: {})', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/homepage-blocks/banners/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni banner' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Seç' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(
      await within(dialog).findByRole('button', {
        name: 'placeholder-1.svg faylını seç',
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('#1 · placeholder-1.svg')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/homepage-blocks/banners'),
    )
    // Toast store-u testlər arasında qalır — bir neçə eyni toast ola bilər.
    expect(
      (await screen.findAllByText('Qeyd yaradıldı')).length,
    ).toBeGreaterThan(0)

    const created = bannersStore.all().find((r) => r.id === 4)
    expect(created).toBeDefined()
    expect(created?.mediaId).toBe(1)
    expect(created?.translations).toEqual({})
    expect(created?.isActive).toBe(true)
    expect(created?.sortOrder).toBe(0)
    expect(created?.startsAt).toBeNull()
  })

  it('sürüşən sətirlər: başlanğıc/bitmə vaxtı siyahıda formatlı görünür', async () => {
    renderCrud('/homepage-blocks/running-lines')
    expect(
      await screen.findByText(
        'Mart ayının uçot dərəcəsi qərarı 20 martda açıqlanacaq',
      ),
    ).toBeInTheDocument()
    const first = runningLineFixtures[0]
    expect(
      screen.getByText(formatDateTime(first.startsAt, 'az')),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatDateTime(first.endsAt, 'az')),
    ).toBeInTheDocument()
    expect(screen.queryByText(first.startsAt as string)).not.toBeInTheDocument()
    // Tarixi olmayan sətirdə tire.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('link yaratma: AZ başlıq + URL → payload, toast, siyahıya qayıdış', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/homepage-blocks/links/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni link' }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Valyuta kalkulyatoru',
    )
    await user.type(
      screen.getByLabelText('URL (AZ)', { exact: false }),
      'https://www.cbar.az/calculator',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/homepage-blocks/links'),
    )
    // Toast store-u testlər arasında qalır — bir neçə eyni toast ola bilər.
    expect(
      (await screen.findAllByText('Qeyd yaradıldı')).length,
    ).toBeGreaterThan(0)
    const created = homepageLinksStore
      .all()
      .find((r) => r.translations.az?.title === 'Valyuta kalkulyatoru')
    expect(created?.translations).toEqual({
      az: {
        title: 'Valyuta kalkulyatoru',
        url: 'https://www.cbar.az/calculator',
      },
    })
    expect(created?.sortOrder).toBe(0)
    expect(created?.isActive).toBe(true)
    expect(await screen.findByText('Valyuta kalkulyatoru')).toBeInTheDocument()
  })

  it('link validasiyası: başlıq heç bir dildə yoxdur → sorğu getmir', async () => {
    const user = userEvent.setup()
    renderCrud('/homepage-blocks/links/new')
    await screen.findByRole('heading', { name: 'Yeni link' })
    const before = homepageLinksStore.all().length
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Başlıq ən azı bir dildə doldurulmalıdır'),
    ).toBeInTheDocument()
    expect(homepageLinksStore.all().length).toBe(before)
  })
})
