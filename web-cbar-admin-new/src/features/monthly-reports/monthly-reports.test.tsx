/**
 * Monthly reports in the panel (spec 052 US1), through the real routes and the MSW store: the series tabs, the period
 * labels and the deleted-file badge, "Yeni" on the month after the newest, the 409 of a taken month and a report
 * without a file.
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
import { MonthlyReportsFormPage, MonthlyReportsPage } from '@/pages/monthly-reports'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { monthlyReportsHandlers, monthlyReportsStore } from '@/shared/testing/handlers/monthly-reports'
import { server } from '@/shared/testing/server'
import { monthlyReportsModuleBase } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'test-layout', component: Outlet })
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(monthlyReportsModuleBase), {
      list: MonthlyReportsPage,
      form: MonthlyReportsFormPage,
    }),
  ]),
])

function renderReports(path: string) {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })
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
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}

/** Request bodies of a method on the reports endpoints, read before the store handles them. */
function spyBodies(method: 'post' | 'put') {
  const bodies: unknown[] = []
  const path = method === 'post' ? '/api/v1/monthly-reports' : '/api/v1/monthly-reports/:id'
  server.use(
    http[method](path, async ({ request }) => {
      bodies.push(await request.clone().json())
      return undefined
    }),
  )
  return bodies
}

async function pickFile(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('button', { name: 'Seç' })[0]!)
  const picker = await screen.findByRole('dialog')
  await user.click(await within(picker).findByRole('button', { name: 'hesabat-2025.pdf faylını seç' }))
}

describe('Aylıq hesabatlar', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    monthlyReportsStore.store.reset()
    server.use(...monthlyReportsHandlers)
  })

  it('lists the newest period first, with the period of each series and a deleted file flagged', async () => {
    renderReports('/monthly-reports')

    await screen.findByRole('row', { name: /Sığorta indeksi/ })
    const reports = screen.getAllByRole('row').filter((row) => /indeksi/.test(row.textContent ?? ''))
    expect(reports.map((row) => row.textContent)).toEqual([
      expect.stringMatching(/Bank indeksi.*May 2026/),
      expect.stringMatching(/Sığorta indeksi/),
      expect.stringMatching(/Bank indeksi.*Aprel 2026/),
    ])
    expect(screen.getByRole('row', { name: /Sığorta indeksi/ })).toHaveTextContent('İyun 2025 – May 2026')
    expect(screen.getByRole('row', { name: /Sığorta indeksi/ })).toHaveTextContent('Fayl silinib')
    expect(screen.getByRole('row', { name: /Bank indeksi.*Aprel 2026/ })).toHaveTextContent('EN yoxdur')
  })

  it('narrows the list to a series tab', async () => {
    const user = userEvent.setup()
    renderReports('/monthly-reports')

    await screen.findByRole('row', { name: /Sığorta indeksi/ })
    await user.click(screen.getByRole('tab', { name: 'Bank indeksi' }))

    await waitFor(() => expect(screen.queryByRole('row', { name: /Sığorta indeksi/ })).not.toBeInTheDocument())
    expect(screen.getAllByRole('row', { name: /Bank indeksi/ })).toHaveLength(2)
  })

  it('opens "Yeni" from a series tab on the month after its newest, and saves the report', async () => {
    const posts = spyBodies('post')
    const user = userEvent.setup()
    const router = renderReports('/monthly-reports?series=bank-complaint-index')

    await screen.findByRole('row', { name: /May 2026/ })
    await user.click(screen.getByRole('button', { name: 'Yeni' }))

    expect(await screen.findByRole('combobox', { name: 'Seriya' })).toHaveTextContent('Bank indeksi')
    expect(screen.getByRole('spinbutton', { name: 'İl' })).toHaveValue(2026)
    expect(screen.getByRole('combobox', { name: 'Ay' })).toHaveTextContent('İyun')

    await pickFile(user)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/monthly-reports'))
    expect(posts).toEqual([
      { series: 'bank-complaint-index', year: 2026, month: 6, status: 'draft', translations: { az: { mediaId: 3 } } },
    ])
    expect(await screen.findByRole('row', { name: /İyun 2026/ })).toBeInTheDocument()
  })

  it('shows the API message when the month is taken', async () => {
    const user = userEvent.setup()
    renderReports('/monthly-reports/new?series=bank-complaint-index&year=2026&month=5')

    await screen.findByRole('combobox', { name: 'Seriya' })
    await pickFile(user)
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    expect(await screen.findByText('Bu seriyada May 2026 üçün hesabat artıq var.')).toBeInTheDocument()
  })

  it('does not send a report without a file', async () => {
    const posts = spyBodies('post')
    const user = userEvent.setup()
    renderReports('/monthly-reports/new?series=bank-complaint-index&year=2026&month=7')

    await screen.findByRole('combobox', { name: 'Seriya' })
    await user.click(screen.getByRole('button', { name: 'Yadda saxla' }))

    expect(await screen.findByText('Fayl ən azı bir dildə doldurulmalıdır')).toBeInTheDocument()
    expect(posts).toEqual([])
  })
})
