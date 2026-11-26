/**
 * CSR projects and categories in the panel (spec 038), through the real routes and MSW stores.
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
import { http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import { CsrProjectsFormPage, CsrProjectsPage } from '@/pages/csr-projects'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import {
  csrCategoriesStore,
  csrProjectsHandlers,
  csrProjectsStore,
} from '@/shared/testing/handlers/csr-projects'
import { server } from '@/shared/testing/server'
import { csrCategoriesModule, csrProjectsModuleBase } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(csrProjectsModuleBase), {
      list: CsrProjectsPage,
      form: CsrProjectsFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(csrCategoriesModule)),
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

// jsdom has no pointer capture or scrollIntoView; the kit Select calls them.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

/** Records POST or PUT bodies, then falls through to the store. */
function spyWriteBodies(method: 'post' | 'put', base: string) {
  const seen: Record<string, unknown>[] = []
  server.use(
    http[method](`${base}*`, async ({ request }) => {
      seen.push((await request.clone().json()) as Record<string, unknown>)
    }),
  )
  return seen
}

const save = () => screen.getByRole('button', { name: 'Yadda saxla' })

describe('KSM layihələri', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    csrProjectsStore.store.reset()
    csrCategoriesStore.store.reset()
    server.use(...csrProjectsHandlers)
  })

  it('lists projects with their category and photo count', async () => {
    renderCrud('/csr-projects')

    const row = await screen.findByRole('row', {
      name: /Biləsuvar lisey-məktəb kompleksi/,
    })
    expect(within(row).getByText('Təhsil')).toBeInTheDocument()
    expect(within(row).getByText('Dərc olunub')).toBeInTheDocument()
    expect(within(row).getByText('2')).toBeInTheDocument()
  })

  it('creates a project in one language, without an empty second language', async () => {
    const posts = spyWriteBodies('post', csrProjectsStore.base)
    const user = userEvent.setup()
    renderCrud('/csr-projects/new')

    await user.type(
      await screen.findByRole('textbox', { name: /Kart başlığı \(AZ\)/ }),
      'Qanvermə',
    )
    await user.type(
      screen.getByRole('textbox', { name: /Qısa təsvir \(AZ\)/ }),
      'Birinci sətir{enter}ikinci sətir',
    )
    await user.type(
      screen.getByRole('textbox', { name: /Pəncərə başlığı \(AZ\)/ }),
      'Qanvermə aksiyası',
    )
    await user.click(save())

    await waitFor(() => expect(posts).toHaveLength(1))
    expect(posts[0]).toMatchObject({
      categoryId: 1,
      coverMediaId: null,
      sortOrder: 0,
      showAz: true,
      showEn: true,
    })
    const translations = posts[0]?.translations as Record<string, unknown>
    expect(Object.keys(translations)).toEqual(['az'])
    expect(translations.az).toMatchObject({
      cardTitle: 'Qanvermə',
      summary: 'Birinci sətir\nikinci sətir',
    })
  })

  it('does not save without a title', async () => {
    const posts = spyWriteBodies('post', csrProjectsStore.base)
    const user = userEvent.setup()
    renderCrud('/csr-projects/new')

    await screen.findByRole('textbox', { name: /Kart başlığı \(AZ\)/ })
    await user.click(save())

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    expect(posts).toHaveLength(0)
  })

  it('points at the missing fields of a language that was only started', async () => {
    const puts = spyWriteBodies('put', csrProjectsStore.base)
    const user = userEvent.setup()
    renderCrud('/csr-projects/1')

    const summary = await screen.findByRole('textbox', {
      name: /Qısa təsvir \(EN\)/,
    })
    await user.clear(summary)
    await user.click(save())

    expect(
      await screen.findByText('Bu dilin sahələrini tamamlayın və ya dili tam boş saxlayın'),
    ).toBeInTheDocument()
    expect(puts).toHaveLength(0)
  })

  it('reorders the photos through the sub-resource', async () => {
    const puts = spyWriteBodies('put', `${csrProjectsStore.base}/1/assets/order`)
    const user = userEvent.setup()
    renderCrud('/csr-projects/1')

    expect(await screen.findByText('birinci.jpg')).toBeInTheDocument()
    const [down] = screen.getAllByRole('button', { name: /aşağı/i })
    await user.click(down!)

    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0]).toEqual({ mediaIds: [2, 1] })
    expect(csrProjectsStore.store.get(1)?.assets.map((a) => a.mediaId)).toEqual([2, 1])
  })

  it('refuses to delete a category in use, with the reason', async () => {
    const user = userEvent.setup()
    renderCrud('/csr-projects/categories')

    await user.click(
      await screen.findByRole('button', { name: 'Sil: Təhsil' }),
    )
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Sil',
      }),
    )

    expect(
      await screen.findByText(/The category is used by a project/),
    ).toBeInTheDocument()
    expect(csrCategoriesStore.store.get(1)).toBeDefined()
  })
})
