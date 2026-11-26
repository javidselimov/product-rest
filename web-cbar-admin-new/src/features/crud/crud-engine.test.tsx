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
import { HttpResponse, http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import { server } from '@/shared/testing/server'
import {
  itemsModule,
  itemsStore,
  nextModule,
  sampleI18n,
  sampleModule,
  sampleStore,
} from './fixtures/sample-module'
import { registerModule } from './model/module-registry'
import { createCrudRoutes } from './routes/create-crud-routes'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(sampleModule)),
    ...createCrudRoutes(layoutRoute, registerModule(itemsModule)),
    ...createCrudRoutes(layoutRoute, registerModule(nextModule)),
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

describe('CRUD mühərriki', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'sample', sampleI18n.az, true, true)
    i18n.addResourceBundle('en', 'sample', sampleI18n.en, true, true)
    server.use(...sampleStore.handlers, ...itemsStore.handlers)
  })

  beforeEach(() => {
    sampleStore.store.reset()
    itemsStore.store.reset()
    // resetHandlers() setup.ts-də hər testdən sonra çağırılır — nümunə handler-ləri yenidən əlavə et.
    server.use(...sampleStore.handlers, ...itemsStore.handlers)
  })

  it('paged siyahı: sətirlər, nişan və səhifələmə xülasəsi', async () => {
    renderCrud('/samples')
    expect(
      await screen.findByRole('heading', { name: 'Nümunələr' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Nümunə 1')).toBeInTheDocument()
    expect(screen.getByText('25 qeyd · səhifə 1 / 2')).toBeInTheDocument()
    expect(screen.getAllByText('Dərc olunub').length).toBeGreaterThan(0)
    expect(screen.queryByText('Nümunə 21')).not.toBeInTheDocument()
  })

  it('səhifə 2 URL-ə düşür və növbəti sətirlər gəlir', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/samples')
    await screen.findByText('Nümunə 1')
    await user.click(screen.getByRole('link', { name: '2-ci səhifəyə keç' }))
    expect(await screen.findByText('Nümunə 21')).toBeInTheDocument()
    expect(router.state.location.search).toMatchObject({ page: 2 })
  })

  it('axtarış URL-ə yazılır, page silinir, siyahı daralır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/samples?page=2')
    await screen.findByText('Nümunə 21')
    await user.type(screen.getByLabelText('Axtar'), 'Nümunə 7')
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({
        search: 'Nümunə 7',
      }),
    )
    expect(router.state.location.search).not.toHaveProperty('page')
    expect(await screen.findByText('Nümunə 7')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByText('Nümunə 21')).not.toBeInTheDocument(),
    )
  })

  it('URL-dəki filtr sorğuya gedir (status=published)', async () => {
    renderCrud('/samples?status=published')
    expect(await screen.findByText('Nümunə 1')).toBeInTheDocument()
    expect(screen.queryByText('Nümunə 2')).not.toBeInTheDocument()
    expect(screen.getByText('9 qeyd · səhifə 1 / 1')).toBeInTheDocument()
  })

  it('yaratma: yalnız AZ başlıq → payload-da en yoxdur, toast, siyahıya qayıdış', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/samples/new')
    expect(
      await screen.findByRole('heading', { name: 'Yeni nümunə' }),
    ).toBeInTheDocument()
    await user.type(
      screen.getByLabelText('Başlıq (AZ)', { exact: false }),
      'Təzə qeyd',
    )
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/samples'))
    expect(await screen.findByText('Qeyd yaradıldı')).toBeInTheDocument()
    const created = sampleStore.store
      .all()
      .find((r) => r.translations.az?.title === 'Təzə qeyd')
    expect(created).toBeDefined()
    expect(created?.translations).toEqual({ az: { title: 'Təzə qeyd' } })
    expect(created?.isActive).toBe(true)
    expect(created?.sortOrder).toBe(0)
    expect(created?.mediaId).toBeNull()
  })

  it('validasiya: heç bir dildə başlıq yoxdur → sorğu getmir, tab nişanı', async () => {
    const user = userEvent.setup()
    renderCrud('/samples/new')
    await screen.findByRole('heading', { name: 'Yeni nümunə' })
    const before = sampleStore.store.all().length
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    expect(
      await screen.findByText('Başlıq ən azı bir dildə doldurulmalıdır'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Xəta').length).toBeGreaterThan(0)
    expect(sampleStore.store.all().length).toBe(before)
  })

  it('redaktə: detail yüklənir, dəyişiklik PUT ilə saxlanılır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/samples/2')
    const title = await screen.findByLabelText('Başlıq (AZ)', { exact: false })
    expect(title).toHaveValue('Nümunə 2')
    await user.clear(title)
    await user.type(title, 'Dəyişdirildi')
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/samples'))
    expect(sampleStore.store.get(2)?.translations.az?.title).toBe(
      'Dəyişdirildi',
    )
    expect(await screen.findByText('Dəyişdirildi')).toBeInTheDocument()
  })

  it('silmə: dialoq adı göstərir, təsdiqdən sonra sətir yox olur', async () => {
    const user = userEvent.setup()
    renderCrud('/samples')
    await screen.findByText('Nümunə 3')
    await user.click(screen.getByRole('button', { name: 'Sil: Nümunə 3' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/"Nümunə 3" qeydi silinsin/),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    await waitFor(() =>
      expect(screen.queryByText('Nümunə 3')).not.toBeInTheDocument(),
    )
    expect(sampleStore.store.get(3)).toBeNull()
    expect(await screen.findByText('Qeyd silindi')).toBeInTheDocument()
  })

  it('silmədə 409 → mesaj dialoq içində qalır', async () => {
    server.use(
      http.delete('/api/v1/samples/:id', () =>
        HttpResponse.json(
          { message: 'Qeyd asılı qeydlərə bağlıdır.' },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderCrud('/samples')
    await screen.findByText('Nümunə 4')
    await user.click(screen.getByRole('button', { name: 'Sil: Nümunə 4' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(
      await within(dialog).findByText('Qeyd asılı qeydlərə bağlıdır.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Nümunə 4')).toBeInTheDocument()
  })

  it('items envelope: səhifələmə control-u yoxdur', async () => {
    renderCrud('/sample-items')
    expect(await screen.findByText('Nümunə 1')).toBeInTheDocument()
    expect(screen.queryByText(/qeyd · səhifə/)).not.toBeInTheDocument()
  })

  it('kontrakt uyğunsuzluğu (rowSchema) error state kimi görünür', async () => {
    server.use(
      http.get('/api/v1/samples', () =>
        HttpResponse.json({
          items: [{ id: 'x' }],
          total: 1,
          page: 1,
          pageSize: 20,
        }),
      ),
    )
    renderCrud('/samples')
    expect(
      await screen.findByText(/API cavabı gözlənilən formada deyil/),
    ).toBeInTheDocument()
  })
  it('"Yeni" newSearch nəticəsini prefill filtrləri ilə birlikdə URL-ə qoyur (spec 052)', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/next-samples?status=published')

    await screen.findByText('Nümunə 1')
    await user.click(screen.getByRole('button', { name: 'Yeni' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/next-samples/new'))
    expect(router.state.location.search).toMatchObject({ status: 'published', sortOrder: 1 })
    expect(await screen.findByRole('spinbutton', { name: 'Sıra' })).toHaveValue(1)
  })

  it('newSearch olmayan modulda "Yeni" yalnız prefill filtrlərini daşıyır', async () => {
    const user = userEvent.setup()
    const router = renderCrud('/samples?status=published')

    await screen.findByText('Nümunə 1')
    await user.click(screen.getByRole('button', { name: 'Yeni' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/samples/new'))
    expect(router.state.location.search).toEqual({})
  })
})
