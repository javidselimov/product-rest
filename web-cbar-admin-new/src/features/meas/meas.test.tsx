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
import az from '@/locales/az/meas.json'
import en from '@/locales/en/meas.json'
import { MeasDocumentsFormPage, MeasDocumentsPage } from '@/pages/meas'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  measDocumentsStore,
  measEmitentsStore,
  measHandlers,
  resetMeasStores,
} from '@/shared/testing/handlers/meas'
import { server } from '@/shared/testing/server'
import {
  measDocumentsModuleBase,
  measEmitentsModule,
  measInfoTypesModule,
} from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(measDocumentsModuleBase), {
      list: MeasDocumentsPage,
      form: MeasDocumentsFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(measEmitentsModule)),
    ...createCrudRoutes(layoutRoute, registerModule(measInfoTypesModule)),
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

describe('MEAS bölməsi', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'meas', az, true, true)
    i18n.addResourceBundle('en', 'meas', en, true, true)
  })

  beforeEach(() => {
    resetMeasStores()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — bölmə handler-ləri yenidən əlavə et.
    server.use(...measHandlers)
  })

  it('sənəd siyahısı: DQN, emitent və məlumat tipi adları lookup-dan, bölmə tabları', async () => {
    renderCrud('/meas')
    expect(
      await screen.findByRole('heading', { name: 'MEAS sənədləri' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('AZ1001-2026')).toBeInTheDocument()
    expect(screen.getAllByText('Maliyyə Nazirliyi').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Yekun hesabat').length).toBeGreaterThan(0)
    expect(screen.getByRole('tab', { name: 'Emitentlər' })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Məlumat tipləri' }),
    ).toBeInTheDocument()
    expect(screen.getByText('25 qeyd · səhifə 1 / 2')).toBeInTheDocument()
  })

  it('DQN axtarışı URL-ə yazılır və siyahı daralır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/meas')
    await screen.findByText('AZ1001-2026')
    await user.type(screen.getByLabelText('Axtar'), 'AZ1007')
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ search: 'AZ1007' }),
    )
    expect(await screen.findByText('AZ1007-2026')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('AZ1001-2026')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('1 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('emitent filtri URL-dən sorğuya gedir (emitentId=2)', async () => {
    renderCrud('/meas?emitentId=2')
    expect(await screen.findByText('AZ1002-2026')).toBeInTheDocument()
    expect(screen.queryByText('AZ1001-2026')).not.toBeInTheDocument()
    expect(screen.queryByText('Maliyyə Nazirliyi')).not.toBeInTheDocument()
    expect(screen.getByText('8 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('emitent yaradılır və siyahıda görünür', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/meas/emitents/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni emitent' }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Ad (AZ)', { exact: false }),
      'Kapital Bank',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/meas/emitents'),
    )
    expect(await screen.findByText('Kapital Bank')).toBeInTheDocument()
    const created = measEmitentsStore.store
      .all()
      .find((e) => e.translations.az?.name === 'Kapital Bank')
    expect(created).toMatchObject({
      isActive: true,
      translations: { az: { name: 'Kapital Bank' } },
    })
  })

  it('sənəd redaktəsi: media sahəsi detail-dəki fayl adını göstərir, DQN dəyişikliyi PUT ilə saxlanılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/meas/1')
    const dqn = await screen.findByLabelText('DQN', { exact: false })
    expect(dqn).toHaveValue('AZ1001-2026')
    expect(screen.getByText('#3 · hesabat-2025.pdf')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Emitent' })).toHaveTextContent(
      'Maliyyə Nazirliyi',
    )

    await user.clear(dqn)
    await user.type(dqn, 'AZ9999-2026')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/meas'))
    expect(measDocumentsStore.store.get(1)).toMatchObject({
      dqn: 'AZ9999-2026',
      emitentId: 1,
      infoTypeId: 2,
      regDate: '2026-03-01',
      mediaId: 3,
      status: 'published',
    })
    expect(await screen.findByText('AZ9999-2026')).toBeInTheDocument()
  })

  it('yeni sənəd: emitent və məlumat tipi seçilmədən sorğu getmir', async () => {
    const user = userEvent.setup()
    renderCrud('/meas/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni sənəd' }),
    ).toBeInTheDocument()
    const before = measDocumentsStore.store.all().length
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Emitent sahəsi məcburidir'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Məlumat tipi sahəsi məcburidir'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Qeydiyyat tarixi sahəsi məcburidir'),
    ).toBeInTheDocument()
    expect(measDocumentsStore.store.all().length).toBe(before)
  })
})
