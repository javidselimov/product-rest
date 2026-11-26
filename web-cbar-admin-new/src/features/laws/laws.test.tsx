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
import az from '@/locales/az/laws.json'
import en from '@/locales/en/laws.json'
import { LawsFormPage, LawsPage } from '@/pages/laws'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  lawCategoriesStore,
  lawsHandlers,
  lawsStore,
  resetLawsStores,
} from '@/shared/testing/handlers/laws'
import { server } from '@/shared/testing/server'
import { lawCategoriesModule, lawsModuleBase } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(lawsModuleBase), {
      list: LawsPage,
      form: LawsFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(lawCategoriesModule)),
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

// jsdom-da pointer capture API-si yoxdur — kit Select-in trigger-i onu çağırır.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

/** Kit Select-i açır: klik açmasa (jsdom pointer məhdudiyyəti) ArrowDown ilə. */
async function openSelect(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement,
) {
  await user.click(trigger)
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    trigger.focus()
    await user.keyboard('{ArrowDown}')
  }
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
}

describe('Qanunlar bölməsi', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'laws', az, true, true)
    i18n.addResourceBundle('en', 'laws', en, true, true)
  })

  beforeEach(() => {
    resetLawsStores()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — bölmə handler-ləri yenidən əlavə et.
    server.use(...lawsHandlers)
  })

  it('siyahı: kateqoriya adı lookup-dan, tip və status nişanları, bölmə tabları', async () => {
    renderCrud('/laws')
    expect(
      await screen.findByRole('heading', { name: 'Qanunlar' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Qanun 1')).toBeInTheDocument()
    expect(
      screen.getAllByText('Konstitusiya qanunları').length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('Qayda').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dərc olunub').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('tab', { name: 'Kateqoriyalar' }),
    ).toBeInTheDocument()
    expect(screen.getByText('25 qeyd · səhifə 1 / 2')).toBeInTheDocument()
  })

  it('status filtri URL-dən sorğuya gedir (status=published)', async () => {
    renderCrud('/laws?status=published')
    expect(await screen.findByText('Qanun 1')).toBeInTheDocument()
    expect(screen.queryByText('Qanun 2')).not.toBeInTheDocument()
    expect(screen.getByText('7 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('kateqoriya yaradılır → /laws/new kateqoriya seçimində görünür (B1 invalidasiya)', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/laws')
    // Lookup əvvəlcədən yüklənir — invalidasiya olmasa köhnə siyahı qalardı.
    await screen.findByText('Qanun 1')

    router.history.push('/laws/categories/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni kateqoriya' }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Ad (AZ)', { exact: false }),
      'Valyuta tənzimi',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/laws/categories'),
    )
    expect(await screen.findByText('Valyuta tənzimi')).toBeInTheDocument()
    expect(
      lawCategoriesStore.store
        .all()
        .find((c) => c.translations.az?.name === 'Valyuta tənzimi'),
    ).toBeDefined()

    router.history.push('/laws/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni qanun' }),
    ).toBeInTheDocument()
    const trigger = screen.getByRole('combobox', { name: 'Kateqoriya' })
    await openSelect(user, trigger)
    expect(
      await screen.findByRole('option', { name: 'Valyuta tənzimi' }),
    ).toBeInTheDocument()
  })

  it('yaratma: kateqoriyasız → məcburi xətası; seçildikdən sonra POST keçir', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/laws/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni qanun' }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Yeni qanun mətni',
    )
    const before = lawsStore.store.all().length
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Kateqoriya sahəsi məcburidir'),
    ).toBeInTheDocument()
    expect(lawsStore.store.all().length).toBe(before)

    const trigger = screen.getByRole('combobox', { name: 'Kateqoriya' })
    await openSelect(user, trigger)
    await user.click(
      await screen.findByRole('option', { name: 'Bank qanunvericiliyi' }),
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/laws'))
    // Toaster testlər arasında qalır — əvvəlki testin toast-ı da görünə bilər.
    expect(
      (await screen.findAllByText('Qeyd yaradıldı')).length,
    ).toBeGreaterThan(0)
    const created = lawsStore.store
      .all()
      .find((l) => l.translations.az?.title === 'Yeni qanun mətni')
    expect(created).toMatchObject({
      categoryId: 2,
      type: 1,
      status: 'draft',
      publishedAt: null,
    })
    expect(created?.translations).toEqual({
      az: { title: 'Yeni qanun mətni', description: '' },
    })
  })

  it('redaktə: sənədlər bölməsi, seçicidən bağla, sonra ayır', async () => {
    const user = userEvent.setup()
    renderCrud('/laws/1')
    expect(
      await screen.findByLabelText('Başlıq (AZ)', { exact: false }),
    ).toHaveValue('Qanun 1')
    const list = await screen.findByRole('list', { name: 'Sənədlər' })
    expect(within(list).getByText('hesabat-2025.pdf')).toBeInTheDocument()
    // Spec 030 regression: ordering is a press-release feature; laws keep the plain list.
    expect(
      within(list).queryByRole('button', { name: /köçür$/ }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sənəd əlavə et' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(
      await within(dialog).findByRole('button', {
        name: 'qanun.docx faylını seç',
      }),
    )
    expect(await screen.findByText('Sənəd bağlandı')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        within(screen.getByRole('list', { name: 'Sənədlər' })).getByText(
          'qanun.docx',
        ),
      ).toBeInTheDocument(),
    )
    expect(lawsStore.store.get(1)?.assets.map((a) => a.mediaId)).toEqual([3, 5])
    // Spec 033: the file language belongs to press releases, a law row stays plain.
    expect(
      within(screen.getByRole('list', { name: 'Sənədlər' })).queryByRole('combobox'),
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'qanun.docx sənədini ayır' }),
    )
    const confirm = await screen.findByRole('alertdialog')
    await user.click(within(confirm).getByRole('button', { name: 'Ayır' }))
    expect(await screen.findByText('Sənəd ayrıldı')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('qanun.docx')).not.toBeInTheDocument(),
    )
    expect(lawsStore.store.get(1)?.assets.map((a) => a.mediaId)).toEqual([3])
  })

  it('kateqoriya silmə: qanunlara bağlıdırsa 409 mesajı dialoqda qalır', async () => {
    const user = userEvent.setup()
    renderCrud('/laws/categories')
    expect(
      await screen.findByRole('heading', { name: 'Kateqoriyalar' }),
    ).toBeInTheDocument()
    await screen.findByText('Konstitusiya qanunları')
    await user.click(
      screen.getByRole('button', { name: 'Sil: Konstitusiya qanunları' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(
        /"Konstitusiya qanunları" kateqoriyası silinsin/,
      ),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(
      await within(dialog).findByText(
        'Category is referenced by laws; reassign or delete them first.',
      ),
    ).toBeInTheDocument()
    expect(lawCategoriesStore.store.get(1)).not.toBeNull()
  })
})
