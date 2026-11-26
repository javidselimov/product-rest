/**
 * International financial institutions in the panel (spec 044), through the real routes and the MSW store.
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
  ifiOrganizationsHandlers,
  ifiOrganizationsStore,
} from '@/shared/testing/handlers/ifi-organizations'
import { server } from '@/shared/testing/server'
import { ifiOrganizationsModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(ifiOrganizationsModule)),
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
const membershipsList = () => screen.findByRole('list', { name: 'Üzvlük tarixləri' })

describe('Beynəlxalq maliyyə təşkilatları', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    ifiOrganizationsStore.store.reset()
    server.use(...ifiOrganizationsHandlers)
  })

  it('lists organizations with their year and number of dates', async () => {
    renderCrud('/ifi-organizations')

    const row = await screen.findByRole('row', { name: /Dünya Bankı Qrupu/ })
    expect(within(row).getByText('1992')).toBeInTheDocument()
    expect(within(row).getByText('2')).toBeInTheDocument()
    expect(within(row).getByText('Dərc olunub')).toBeInTheDocument()
  })

  it('creates an organization in one language, with the year as a number', async () => {
    const posts = spyWriteBodies('post', ifiOrganizationsStore.base)
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/new')

    await user.type(await screen.findByRole('textbox', { name: /^Ad \(AZ\)/ }), 'Avropa Yenidənqurma və İnkişaf Bankı')
    await user.type(screen.getByRole('spinbutton', { name: /Üzvlük ili/ }), '1992')
    await user.type(screen.getByRole('textbox', { name: /Sayt ünvanı/ }), 'https://www.ebrd.com')
    await user.click(save())

    await waitFor(() => expect(posts).toHaveLength(1))
    expect(posts[0]).toMatchObject({ memberSince: 1992, websiteUrl: 'https://www.ebrd.com', logoMediaId: null })
    const translations = posts[0]?.translations as Record<string, unknown>
    expect(Object.keys(translations)).toEqual(['az'])
    expect(translations.az).toMatchObject({ name: 'Avropa Yenidənqurma və İnkişaf Bankı' })
  })

  it('does not save a website that is not an http address', async () => {
    const posts = spyWriteBodies('post', ifiOrganizationsStore.base)
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/new')

    await user.type(await screen.findByRole('textbox', { name: /^Ad \(AZ\)/ }), 'Bank')
    await user.type(screen.getByRole('textbox', { name: /Sayt ünvanı/ }), 'www.ebrd.com')
    await user.click(save())

    expect(await screen.findByText('Ünvan http:// və ya https:// ilə başlamalıdır')).toBeInTheDocument()
    expect(posts).toHaveLength(0)
  })

  it('asks for the name of a language that was only started', async () => {
    const puts = spyWriteBodies('put', ifiOrganizationsStore.base)
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/1')

    await user.clear(await screen.findByRole('textbox', { name: /^Ad \(EN\)/ }))
    await user.type(screen.getByRole('textbox', { name: /Əsas missiya \(EN\)/ }), 'Mission')
    await user.click(save())

    expect(await screen.findByText('Bu dilin adını yazın və ya dili tam boş saxlayın')).toBeInTheDocument()
    expect(puts).toHaveLength(0)
  })

  it('renames a membership date in place', async () => {
    const puts = spyWriteBodies('put', `${ifiOrganizationsStore.base}/1/memberships/12`)
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/1')

    const list = await membershipsList()
    expect(within(list).getByText('18.09.1992')).toBeInTheDocument()
    await user.click(within(list).getByRole('button', { name: /Çoxtərəfli .* — redaktə et/ }))

    const form = screen.getByRole('region', { name: 'Tarixi redaktə et' })
    const az = within(form).getByRole('textbox', { name: 'Qurumun adı (AZ)' })
    await user.clear(az)
    await user.type(az, 'ÇİZA')
    await user.type(within(form).getByRole('textbox', { name: 'Qurumun adı (EN)' }), 'MIGA')
    await user.click(within(form).getByRole('button', { name: 'Tarixi saxla' }))

    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0]).toEqual({ joinedOn: '1992-09-23', translations: { az: { name: 'ÇİZA' }, en: { name: 'MIGA' } } })
    expect(await within(await membershipsList()).findByText('ÇİZA')).toBeInTheDocument()
  })

  it('does not add a membership without a date', async () => {
    const posts = spyWriteBodies('post', `${ifiOrganizationsStore.base}/1/memberships`)
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/1')

    await membershipsList()
    await user.click(screen.getByRole('button', { name: 'Tarix əlavə et' }))
    const form = screen.getByRole('region', { name: 'Yeni tarix' })
    await user.type(within(form).getByRole('textbox', { name: 'Qurumun adı (AZ)' }), 'BİA')
    await user.click(within(form).getByRole('button', { name: 'Tarixi saxla' }))

    expect(await within(form).findByText('Tarixi seçin')).toBeInTheDocument()
    expect(posts).toHaveLength(0)
  })

  it('reorders the membership dates through the sub-resource', async () => {
    const puts = spyWriteBodies('put', `${ifiOrganizationsStore.base}/1/memberships/order`)
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/1')

    const list = await membershipsList()
    await user.click(within(list).getByRole('button', { name: /Beynəlxalq Yenidənqurma .* — aşağı/ }))

    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0]).toEqual({ ids: [12, 11] })
    expect(ifiOrganizationsStore.store.get(1)?.memberships.map((m) => m.id)).toEqual([12, 11])
  })

  it('deletes a membership date after confirmation', async () => {
    const user = userEvent.setup()
    renderCrud('/ifi-organizations/1')

    const list = await membershipsList()
    await user.click(within(list).getByRole('button', { name: /Çoxtərəfli .* — sil/ }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sil' }))

    await waitFor(() =>
      expect(ifiOrganizationsStore.store.get(1)?.memberships.map((m) => m.id)).toEqual([11]),
    )
  })
})
