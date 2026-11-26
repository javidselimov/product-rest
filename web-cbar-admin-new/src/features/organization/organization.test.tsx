/**
 * Təşkilat modulları — test-lokal route tree ilə real istifadəçi axını
 * (crud-engine.test.tsx naxışı). API cavabları MSW `organizationHandlers`
 * (real `array` kontraktı) ilə gəlir; mock assert edilmir.
 */

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
import azOrganization from '@/locales/az/organization.json'
import enOrganization from '@/locales/en/organization.json'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  divisionsStore,
  officesStore,
  organizationHandlers,
  staffStore,
} from '@/shared/testing/handlers/organization'
import { server } from '@/shared/testing/server'
import { divisionsModule, officesModule, staffModule } from './model/modules'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(staffModule)),
    ...createCrudRoutes(layoutRoute, registerModule(divisionsModule)),
    ...createCrudRoutes(layoutRoute, registerModule(officesModule)),
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

describe('Təşkilat modulları', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'organization', azOrganization, true, true)
    i18n.addResourceBundle('en', 'organization', enOrganization, true, true)

    // jsdom-da olmayan Range ölçmə API-ləri — ProseMirror (richtext sahəsi) çağırır.
    const emptyRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    } as DOMRect
    if (!Range.prototype.getClientRects) {
      Range.prototype.getClientRects = () => [] as unknown as DOMRectList
    }
    if (!Range.prototype.getBoundingClientRect) {
      Range.prototype.getBoundingClientRect = () => emptyRect
    }
    if (!document.elementFromPoint) {
      document.elementFromPoint = () => null
    }
  })

  beforeEach(() => {
    divisionsStore.store.reset()
    officesStore.store.reset()
    staffStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — handler-ləri yenidən əlavə et.
    server.use(...organizationHandlers)
  })

  it('şöbələr siyahısı: ad tərcümədən, aktiv nişanı, səhifələmə yoxdur', async () => {
    renderCrud('/organization/divisions')
    expect(
      await screen.findByRole('heading', { name: 'Şöbələr' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Pul siyasəti departamenti'),
    ).toBeInTheDocument()
    expect(screen.getByText('Statistika şöbəsi')).toBeInTheDocument()
    expect(screen.getAllByText('Aktiv').length).toBe(2)
    expect(screen.getByText('Qeyri-aktiv')).toBeInTheDocument()
    expect(screen.queryByText(/qeyd · səhifə/)).not.toBeInTheDocument()
    // Bölmə tabları üç alt bölməni göstərir.
    expect(screen.getByRole('tab', { name: 'Heyət' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ofislər' })).toBeInTheDocument()
  })

  it('heyət: URL-dəki type filtri sorğuya gedir (type=2 → yalnız baş direktorlar)', async () => {
    renderCrud('/organization/staff?type=2')
    expect(await screen.findByText('Rəşad Orucov')).toBeInTheDocument()
    expect(screen.queryByText('Taleh Kazımov')).not.toBeInTheDocument()
    expect(screen.queryByText('Rəna Məlikova')).not.toBeInTheDocument()
    // Filtr tabı URL-dən oxunur: "Baş direktor" tabı aktivdir, "Hamısı" yox.
    expect(screen.getByRole('tab', { name: 'Baş direktor' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Hamısı' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    // Tip seçimi select deyil — filtr kartı yoxdur.
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('heyət: filtrsiz siyahıda hər üç tip nişanı görünür, ID sütunu yoxdur, Sıra birincidir', async () => {
    renderCrud('/organization/staff')
    expect(await screen.findByText('Taleh Kazımov')).toBeInTheDocument()
    expect(screen.getByText('Rəşad Orucov')).toBeInTheDocument()
    expect(screen.getByText('Rəna Məlikova')).toBeInTheDocument()
    // Tab etiketi və vəzifə sütunu da eyni mətndir — yalnız tip nişanları sayılır.
    const badges = (text: string) =>
      screen.getAllByText(text).filter((el) => el.dataset.slot === 'badge')
    expect(badges('İdarə heyəti')).toHaveLength(2)
    expect(badges('Baş direktor')).toHaveLength(1)
    expect(badges('Sədrin müşaviri')).toHaveLength(1)
    expect(screen.getByRole('tab', { name: 'Hamısı' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const headers = screen
      .getAllByRole('columnheader')
      .map((el) => el.textContent?.trim())
    expect(headers[0]).toBe('Sıra')
    expect(headers).not.toContain('ID')
  })

  it('heyət: tip tabına klik cədvəli yalnız o tipə daraldır və URL-ə yazır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/organization/staff')
    expect(await screen.findByText('Taleh Kazımov')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Sədrin müşaviri' }))
    expect(await screen.findByText('Rəna Məlikova')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('Taleh Kazımov')).not.toBeInTheDocument(),
    )
    expect(screen.queryByText('Rəşad Orucov')).not.toBeInTheDocument()
    expect(router.state.location.search).toMatchObject({ type: '3' })

    await user.click(screen.getByRole('tab', { name: 'Hamısı' }))
    expect(await screen.findByText('Taleh Kazımov')).toBeInTheDocument()
    expect(router.state.location.search).not.toHaveProperty('type')
  })

  it('heyət yaratma: formda tərcümeyi-hal redaktoru var, AZ ad ilə saxlanılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/organization/staff/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni əməkdaş' }),
    ).toBeInTheDocument()
    // Richtext sahəsi (bio) lazy redaktoru yükləyir — alət paneli görünməlidir.
    expect(
      await screen.findAllByRole(
        'button',
        { name: 'Qalın' },
        { timeout: 10_000 },
      ),
    ).not.toHaveLength(0)
    expect(
      screen.getByText('Tərcümeyi-hal (AZ)', { exact: false }),
    ).toBeInTheDocument()
    expect(screen.getByText('Foto')).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Ad, soyad (AZ)', { exact: false }),
      'Nigar Hüseynova',
    )
    await user.type(
      screen.getByLabelText('Vəzifə (AZ)', { exact: false }),
      'Baş iqtisadçı',
    )
    await user.type(screen.getByLabelText('Telefon'), '+994 12 000 00 00')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/organization/staff'),
    )
    expect(await screen.findByText('Qeyd yaradıldı')).toBeInTheDocument()
    const created = staffStore.store
      .all()
      .find((r) => r.translations.az?.fullName === 'Nigar Hüseynova')
    expect(created).toBeDefined()
    expect(created?.type).toBe(1)
    expect(created?.isActive).toBe(true)
    expect(created?.sortOrder).toBe(0)
    expect(created?.phone).toBe('+994 12 000 00 00')
    expect(created?.photoMediaId).toBeNull()
    expect(created?.translations.az?.position).toBe('Baş iqtisadçı')
    expect(created?.translations.en).toBeUndefined()
    expect(await screen.findByText('Nigar Hüseynova')).toBeInTheDocument()
    // Lazy TipTap chunk + yazma — yüklənmə altında default 5 s kifayət etmir.
  }, 20_000)

  it('ofis yaratma: iki dildə ünvan payload-a düşür', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/organization/offices/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni ofis' }),
    ).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Ad (AZ)', { exact: false }),
      'Lənkəran regional ofisi',
    )
    await user.type(
      screen.getByLabelText('Ünvan (AZ)', { exact: false }),
      'Lənkəran şəhəri, Sabir küç. 5',
    )
    await user.click(screen.getByRole('tab', { name: 'EN' }))
    await user.type(
      screen.getByLabelText('Ad (EN)', { exact: false }),
      'Lankaran Regional Office',
    )
    await user.type(
      screen.getByLabelText('Ünvan (EN)', { exact: false }),
      '5 Sabir St., Lankaran',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/organization/offices'),
    )
    const created = officesStore.store
      .all()
      .find((r) => r.translations.az?.name === 'Lənkəran regional ofisi')
    // Rəhbər və əsasnamə hər dil üçün ayrıdır; seçilməyən sənəd null gedir.
    expect(created?.translations).toEqual({
      az: {
        name: 'Lənkəran regional ofisi',
        address: 'Lənkəran şəhəri, Sabir küç. 5',
        phone: '',
        directorName: '',
        regulationMediaId: null,
      },
      en: {
        name: 'Lankaran Regional Office',
        address: '5 Sabir St., Lankaran',
        phone: '',
        directorName: '',
        regulationMediaId: null,
      },
    })
    expect(created?.photoMediaId).toBeNull()
    expect(
      await screen.findByText('Lənkəran şəhəri, Sabir küç. 5'),
    ).toBeInTheDocument()
  })

  it('ofis redaktəsi: detail yüklənir, ünvan dəyişikliyi PUT ilə saxlanılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/organization/offices/2')
    const address = await screen.findByLabelText('Ünvan (AZ)', { exact: false })
    expect(address).toHaveValue('Naxçıvan şəhəri, Təbriz küç. 10')
    await user.clear(address)
    await user.type(address, 'Naxçıvan şəhəri, Təbriz küç. 12')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/organization/offices'),
    )
    expect(officesStore.store.get(2)?.translations.az?.address).toBe(
      'Naxçıvan şəhəri, Təbriz küç. 12',
    )
  })

  it('ofis redaktəsi: AZ əsasnaməsinin fayl adı detail-dən göstərilir, foto sahəsi ümumidir', async () => {
    renderCrud('/organization/offices/1')
    expect(
      await screen.findByLabelText('Rəhbər (AZ)', { exact: false }),
    ).toHaveValue('Hacıyev Fuad Həsən oğlu')
    expect(screen.getByText('#3 · hesabat-2025.pdf')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('heyət redaktəsi: mətbuat fotosu əlavə et → aşağı köçür (tam siyahı) → çıxar', async () => {
    const photosList = () =>
      screen.getByRole('list', { name: 'Mətbuat üçün fotoşəkillər' })
    const photoMediaIds = () =>
      staffStore.store.get(1)?.photos.map((photo) => photo.mediaId)
    const user = userEvent.setup()
    renderCrud('/organization/staff/1')
    expect(
      await screen.findByLabelText('Ad, soyad (AZ)', { exact: false }),
    ).toHaveValue('Taleh Kazımov')
    expect(
      within(photosList()).getByText('placeholder-1.svg'),
    ).toBeInTheDocument()

    // Əlavə et: artıq bağlı fayl seçicidə söndürülüb, yenisi seçilir.
    await user.click(screen.getByRole('button', { name: 'Foto əlavə et' }))
    const picker = await screen.findByRole('dialog')
    expect(
      await within(picker).findByRole('button', {
        name: 'placeholder-1.svg faylını seç',
      }),
    ).toBeDisabled()
    await user.click(
      within(picker).getByRole('button', {
        name: 'placeholder-2.svg faylını seç',
      }),
    )
    expect(await screen.findByText('Foto əlavə edildi')).toBeInTheDocument()
    expect(
      await within(photosList()).findByText('placeholder-2.svg'),
    ).toBeInTheDocument()
    expect(photoMediaIds()).toEqual([1, 2])

    // Aşağı köçür: mock tam id dəstini tələb edir — natamam siyahı 400 verərdi.
    await user.click(
      screen.getByRole('button', {
        name: 'placeholder-1.svg fotosunu aşağı köçür',
      }),
    )
    expect(await screen.findByText('Sıra yeniləndi')).toBeInTheDocument()
    expect(photoMediaIds()).toEqual([2, 1])
    await waitFor(() => {
      const rows = within(photosList()).getAllByRole('listitem')
      expect(rows[0]).toHaveTextContent('placeholder-2.svg')
    })

    // Çıxar: təsdiq dialoqu → siyahıdan yox olur, fayl kitabxanada qalır.
    await user.click(
      screen.getByRole('button', { name: 'placeholder-2.svg fotosunu çıxar' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Çıxar' }))
    expect(await screen.findByText('Foto çıxarıldı')).toBeInTheDocument()
    expect(photoMediaIds()).toEqual([1])
  })
})
