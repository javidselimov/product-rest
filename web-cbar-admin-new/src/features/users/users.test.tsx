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
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import az from '@/locales/az/users.json'
import en from '@/locales/en/users.json'
import { UserFormPage, UsersPage } from '@/pages/users'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import { makeStrongPassword } from '@/shared/testing/factories'
import { usersHandlers, usersStore } from '@/shared/testing/handlers/users'
import { server } from '@/shared/testing/server'
import { usersModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(usersModule), {
      list: UsersPage,
      form: UserFormPage,
    }),
  ]),
])

function renderUsers(path: string) {
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

const STRONG_PASSWORD = makeStrongPassword()

describe('İstifadəçilər', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'users', az, true, true)
    i18n.addResourceBundle('en', 'users', en, true, true)
  })

  beforeEach(() => {
    usersStore.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-lər yenidən əlavə olunur.
    server.use(...usersHandlers)
  })

  afterEach(() => {
    server.events.removeAllListeners()
  })

  it('siyahı: sətirlər, rol və status nişanları', async () => {
    renderUsers('/users')
    expect(
      await screen.findByRole('heading', { name: 'İstifadəçilər' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('admin')).toBeInTheDocument()
    expect(screen.getByText('aysel.m')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
    expect(screen.getByText('Moderator')).toBeInTheDocument()
    expect(screen.getByText('MEAS meneceri')).toBeInTheDocument()
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
    expect(screen.getByText('3 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('yaratma: zəif şifrə client validasiyasında dayanır, sorğu getmir', async () => {
    const user = userEvent.setup()
    renderUsers('/users/new')
    await screen.findByRole('heading', { name: 'Yeni istifadəçi' })
    await user.type(screen.getByLabelText('İstifadəçi adı'), 'yeni.user')
    await user.type(screen.getByLabelText('E-poçt'), 'yeni@cbar.az')
    await user.type(screen.getByLabelText('Şifrə'), 'weak')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText(
        'Şifrə ən azı 8 simvol olmalı, böyük hərf, kiçik hərf, rəqəm və xüsusi simvol saxlamalıdır',
      ),
    ).toBeInTheDocument()
    expect(usersStore.all()).toHaveLength(3)
  })

  it('yaratma: güclü şifrə → siyahıda yeni sətir, rol nişanı "Moderator"', async () => {
    const user = userEvent.setup()
    const router = renderUsers('/users/new')
    await screen.findByRole('heading', { name: 'Yeni istifadəçi' })
    // İlkin rol moderator-dur.
    expect(screen.getByRole('combobox')).toHaveTextContent('Moderator')
    await user.type(screen.getByLabelText('İstifadəçi adı'), 'yeni.user')
    await user.type(screen.getByLabelText('E-poçt'), 'yeni@cbar.az')
    await user.type(screen.getByLabelText('Şifrə'), STRONG_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/users'))
    expect(await screen.findByText('Qeyd yaradıldı')).toBeInTheDocument()
    const cell = await screen.findByText('yeni.user')
    const row = cell.closest('tr')
    expect(row).not.toBeNull()
    expect(within(row!).getByText('Moderator')).toBeInTheDocument()
    const created = usersStore.all().find((u) => u.username === 'yeni.user')
    expect(created).toMatchObject({
      email: 'yeni@cbar.az',
      roleId: 2,
      roleCode: 'moderator',
    })
    expect(created).not.toHaveProperty('password')
  })

  it('yaratma: məşğul username → 409 mesajı formada', async () => {
    const user = userEvent.setup()
    renderUsers('/users/new')
    await screen.findByRole('heading', { name: 'Yeni istifadəçi' })
    await user.type(screen.getByLabelText('İstifadəçi adı'), 'admin')
    await user.type(screen.getByLabelText('E-poçt'), 'basqa@cbar.az')
    await user.type(screen.getByLabelText('Şifrə'), STRONG_PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Username is already in use.'),
    ).toBeInTheDocument()
    expect(usersStore.all()).toHaveLength(3)
  })

  it('redaktə: username kilidli, aktiv checkbox var, PUT gövdəsində username yoxdur', async () => {
    const bodies: Record<string, unknown>[] = []
    server.events.on('request:start', async ({ request }) => {
      if (request.method === 'PUT')
        bodies.push((await request.clone().json()) as Record<string, unknown>)
    })
    const user = userEvent.setup()
    const router = renderUsers('/users/2')
    const username = await screen.findByLabelText('İstifadəçi adı')
    expect(username).toBeDisabled()
    expect(username).toHaveValue('aysel.m')
    expect(screen.queryByLabelText('Şifrə')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent('Moderator')
    const active = screen.getByRole('checkbox', { name: 'Aktiv' })
    expect(active).toBeChecked()

    const email = screen.getByLabelText('E-poçt')
    await user.clear(email)
    await user.type(email, 'aysel.yeni@cbar.az')
    await user.click(active)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/users'))
    expect(
      await screen.findByText('Dəyişikliklər yadda saxlanıldı'),
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(1)
    expect(bodies[0]).toEqual({
      email: 'aysel.yeni@cbar.az',
      roleId: 2,
      isActive: false,
    })
    expect(usersStore.get(2)).toMatchObject({
      username: 'aysel.m',
      email: 'aysel.yeni@cbar.az',
      isActive: false,
    })
  })

  it('şifrə sıfırlama dialoqu: uğurda toast', async () => {
    const user = userEvent.setup()
    renderUsers('/users')
    await screen.findByText('aysel.m')
    await user.click(
      screen.getByRole('button', { name: 'Şifrəni sıfırla: aysel.m' }),
    )
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText('Şifrəni sıfırla — aysel.m'),
    ).toBeInTheDocument()
    await user.type(
      within(dialog).getByLabelText('Yeni şifrə'),
      STRONG_PASSWORD,
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Şifrəni sıfırla' }),
    )
    expect(
      await screen.findByText('"aysel.m" üçün şifrə yeniləndi'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('öz hesabını silmə (id 1): 409 mesajı dialoq içində', async () => {
    const user = userEvent.setup()
    renderUsers('/users')
    await screen.findByText('admin')
    await user.click(screen.getByRole('button', { name: 'Sil: admin' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(
        /"admin" istifadəçisi silinsin\? Hesab deaktiv edilir/,
      ),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(
      await within(dialog).findByText('You cannot delete your own account.'),
    ).toBeInTheDocument()
    expect(usersStore.get(1)).not.toBeNull()
  })
})
