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
import azHomepage from '@/locales/az/homepage.json'
import azInfoLines from '@/locales/az/infoLines.json'
import enHomepage from '@/locales/en/homepage.json'
import enInfoLines from '@/locales/en/infoLines.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  infoLinesHandlers,
  infoLinesStore,
} from '@/shared/testing/handlers/info-lines'
import { server } from '@/shared/testing/server'
import { INFO_LINE_ALIASES, infoLinesModule } from './model/module'

// Test-lokal route tree — app route tree-yə toxunulmur.
const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(infoLinesModule)),
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

describe('Məlumat sətirləri', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'infoLines', azInfoLines, true, true)
    i18n.addResourceBundle('en', 'infoLines', enInfoLines, true, true)
    // Bölmə tabları `homepage:tabs.*` açarlarını paylaşır.
    i18n.addResourceBundle('az', 'homepage', azHomepage, true, true)
    i18n.addResourceBundle('en', 'homepage', enHomepage, true, true)
  })

  beforeEach(() => {
    infoLinesStore.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-ləri yenidən əlavə et.
    server.use(...infoLinesHandlers)
  })

  it('qruplu cavab sətirlərə düzləşir, total sətir sayıdır', async () => {
    renderCrud('/homepage-blocks/info-lines')
    expect(
      await screen.findByRole('heading', { name: 'Məlumat sətirləri' }),
    ).toBeInTheDocument()
    // Fərqli qruplardan sətirlər eyni cədvəldədir.
    expect(await screen.findByText('Uçot dərəcəsi')).toBeInTheDocument()
    expect(screen.getByText('İnflyasiya (illik)')).toBeInTheDocument()
    expect(screen.getByText('Dəhlizin aşağı həddi')).toBeInTheDocument()
    expect(screen.getByText('Pul bazası')).toBeInTheDocument()
    expect(screen.getAllByText('homepage_indicators')).toHaveLength(2)
    expect(screen.getByText('corridor_min')).toBeInTheDocument()
    expect(screen.getByText('7.25%')).toBeInTheDocument()
    expect(screen.getByText('5 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Məlumat sətirləri' }),
    ).toBeInTheDocument()
  })

  it('alias axtarışı URL-ə `alias=` kimi düşür və siyahı daralır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/homepage-blocks/info-lines')
    await screen.findByText('Uçot dərəcəsi')
    await user.type(screen.getByLabelText('Axtar'), 'corridor')
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ alias: 'corridor' }),
    )
    expect(router.state.location.search).not.toHaveProperty('search')
    expect(await screen.findByText('2 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    expect(screen.getByText('Dəhlizin aşağı həddi')).toBeInTheDocument()
    expect(screen.getByText('Dəhlizin yuxarı həddi')).toBeInTheDocument()
    expect(screen.queryByText('Uçot dərəcəsi')).not.toBeInTheDocument()
  })

  it('URL-dəki alias parametri sorğuya gedir', async () => {
    renderCrud('/homepage-blocks/info-lines?alias=money_base')
    expect(await screen.findByText('Pul bazası')).toBeInTheDocument()
    expect(screen.getByText('1 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    expect(screen.queryByText('Uçot dərəcəsi')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Axtar')).toHaveValue('money_base')
  })

  it('yaratma: alias ilk seçim (homepage_indicators), yalnız AZ başlıq', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/homepage-blocks/info-lines/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni məlumat sətri' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Alias' })).toHaveTextContent(
      'Əsas göstəricilər',
    )
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Manat məzənnəsi',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/homepage-blocks/info-lines',
      ),
    )
    // Toast store-u testlər arasında qalır — bir neçə eyni toast ola bilər.
    expect(
      (await screen.findAllByText('Qeyd yaradıldı')).length,
    ).toBeGreaterThan(0)
    const created = infoLinesStore
      .all()
      .find((r) => r.translations.az?.title === 'Manat məzənnəsi')
    expect(created).toBeDefined()
    expect(created?.alias).toBe(INFO_LINE_ALIASES[0])
    expect(created?.translations.en).toBeUndefined()
    expect(created?.year).toBeNull()
    expect(created?.sortOrder).toBe(0)
    expect(created?.isActive).toBe(true)
    expect(await screen.findByText('Manat məzənnəsi')).toBeInTheDocument()
  })

  it('redaktə: tək sətir detail-i yüklənir və PUT ilə saxlanılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/homepage-blocks/info-lines/3')
    const title = await screen.findByLabelText('Başlıq (AZ)', { exact: false })
    expect(title).toHaveValue('Dəhlizin aşağı həddi')
    expect(screen.getByRole('combobox', { name: 'Alias' })).toHaveTextContent(
      'Faiz dəhlizi — aşağı hədd',
    )
    await user.clear(title)
    await user.type(title, 'Aşağı hədd')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/homepage-blocks/info-lines',
      ),
    )
    expect(infoLinesStore.get(3)?.translations.az?.title).toBe('Aşağı hədd')
    expect(infoLinesStore.get(3)?.alias).toBe('corridor_min')
  })
})
