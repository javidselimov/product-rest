/**
 * Memorandums in the panel (spec 045), through the real routes and the MSW store.
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
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import {
  memorandumsHandlers,
  memorandumsStore,
} from '@/shared/testing/handlers/memorandums'
import { server } from '@/shared/testing/server'
import { SIGNED_YEAR_MIN } from './model/constants'
import { memorandumsModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(memorandumsModule)),
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
const organizationAz = () => screen.findByRole('textbox', { name: /^Təşkilat \(AZ\)/ })

describe('Memorandumlar', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    memorandumsStore.store.reset()
    server.use(...memorandumsHandlers)
  })

  it('lists memorandums with their country, year and status, newest year first', async () => {
    renderCrud('/memorandums')

    const row = await screen.findByRole('row', { name: /Slovakiya Milli Bankı/ })
    expect(within(row).getByText('Slovakiya')).toBeInTheDocument()
    expect(within(row).getByText('2026')).toBeInTheDocument()
    expect(within(row).getByText('Dərc olunub')).toBeInTheDocument()

    const names = screen.getAllByRole('row').map((item) => item.textContent ?? '')
    const position = (name: string) => names.findIndex((text) => text.includes(name))
    expect(position('Slovakiya Milli Bankı')).toBeLessThan(position('Çin Xalq Bankı'))
    expect(position('Çin Xalq Bankı')).toBeLessThan(position('Pakistan İslam Respublikası Mərkəzi Bankı'))
  })

  it('creates a memorandum in one language, with the year as a number', async () => {
    const posts = spyWriteBodies('post', memorandumsStore.base)
    const user = userEvent.setup()
    renderCrud('/memorandums/new')

    await user.type(await organizationAz(), 'Gürcüstan Milli Bankı')
    await user.type(screen.getByRole('textbox', { name: /^Ölkə \(AZ\)/ }), 'Gürcüstan')
    await user.type(screen.getByRole('spinbutton', { name: /İmzalanma ili/ }), '2025')
    await user.click(save())

    await waitFor(() => expect(posts).toHaveLength(1))
    expect(posts[0]).toMatchObject({ signedYear: 2025, sortOrder: 0, showAz: true, showEn: true })
    const translations = posts[0]?.translations as Record<string, unknown>
    expect(Object.keys(translations)).toEqual(['az'])
    expect(translations.az).toEqual({ organization: 'Gürcüstan Milli Bankı', country: 'Gürcüstan' })
  })

  it('asks for the country of a language that has an organization', async () => {
    const posts = spyWriteBodies('post', memorandumsStore.base)
    const user = userEvent.setup()
    renderCrud('/memorandums/new')

    await user.type(await organizationAz(), 'Gürcüstan Milli Bankı')
    await user.type(screen.getByRole('spinbutton', { name: /İmzalanma ili/ }), '2025')
    await user.click(save())

    expect(await screen.findByText('Bu dildə ölkəni yazın və ya dili tam boş saxlayın')).toBeInTheDocument()
    expect(posts).toHaveLength(0)
  })

  it('does not save a year before the first possible one', async () => {
    const posts = spyWriteBodies('post', memorandumsStore.base)
    const user = userEvent.setup()
    renderCrud('/memorandums/new')

    await user.type(await organizationAz(), 'Gürcüstan Milli Bankı')
    await user.type(screen.getByRole('textbox', { name: /^Ölkə \(AZ\)/ }), 'Gürcüstan')
    await user.type(screen.getByRole('spinbutton', { name: /İmzalanma ili/ }), String(SIGNED_YEAR_MIN - 1))
    await user.click(save())

    await waitFor(() => expect(screen.getByRole('spinbutton', { name: /İmzalanma ili/ })).toBeInvalid())
    expect(posts).toHaveLength(0)
  })

  it('adds the English text to a memorandum that had only Azerbaijani', async () => {
    const puts = spyWriteBodies('put', memorandumsStore.base)
    const user = userEvent.setup()
    renderCrud('/memorandums/3')

    await user.type(await screen.findByRole('textbox', { name: /^Təşkilat \(EN\)/ }), 'State Bank of Pakistan')
    await user.type(screen.getByRole('textbox', { name: /^Ölkə \(EN\)/ }), 'Pakistan')
    await user.click(save())

    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0]).toMatchObject({
      signedYear: 1996,
      translations: {
        az: { organization: 'Pakistan İslam Respublikası Mərkəzi Bankı', country: 'Pakistan' },
        en: { organization: 'State Bank of Pakistan', country: 'Pakistan' },
      },
    })
  })

  it('removes a memorandum from the list after it is deleted', async () => {
    const user = userEvent.setup()
    renderCrud('/memorandums')

    const row = await screen.findByRole('row', { name: /Çin Xalq Bankı/ })
    await user.click(within(row).getByRole('button', { name: /sil/i }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: /sil/i }))

    await waitFor(() => expect(screen.queryByRole('row', { name: /Çin Xalq Bankı/ })).toBeNull())
    expect(screen.getByRole('row', { name: /Slovakiya Milli Bankı/ })).toBeInTheDocument()
  })
})
