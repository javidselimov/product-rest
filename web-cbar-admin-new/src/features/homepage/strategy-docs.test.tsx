/**
 * "Strategiya və sənədlər" in the panel (spec 057 US1): the homepage blocks tab and hub card, the list with its
 * "first three" note and broken-link badge, creating a document with a page picked from the tree, the client and server
 * field errors in their language tab, the image-only cover, ordering in the dialog and leaving unsaved changes.
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
import azHomepage from '@/locales/az/homepage.json'
import enHomepage from '@/locales/en/homepage.json'
import { HomepageBlocksPage } from '@/pages/homepage-blocks'
import { StrategyDocsFormPage, StrategyDocsPage } from '@/pages/homepage-blocks/strategy-docs'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import { homepageHandlers, resetHomepageStores, strategyDocsStore } from '@/shared/testing/handlers/homepage'
import { server } from '@/shared/testing/server'
import { STRATEGY_DOCS_PATH, strategyDocsModuleBase } from './model/strategy-docs'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'test-layout', component: Outlet })
const hubRoute = createRoute({ getParentRoute: () => layoutRoute, path: '/homepage-blocks', component: HomepageBlocksPage })
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    hubRoute,
    ...createCrudRoutes(layoutRoute, registerModule(strategyDocsModuleBase), {
      list: StrategyDocsPage,
      form: StrategyDocsFormPage,
    }),
  ]),
])

function renderPanel(path: string) {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

// jsdom has no pointer capture or scrollIntoView; the kit Select and Combobox call them.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}

function spyWriteBodies(method: 'post' | 'put', path: string) {
  const seen: Record<string, unknown>[] = []
  server.use(
    http[method](path, async ({ request }) => {
      seen.push((await request.clone().json()) as Record<string, unknown>)
    }),
  )
  return seen
}

const save = () => screen.getByRole('button', { name: 'Yadda saxla' })
const NEW_PATH = `${STRATEGY_DOCS_PATH}/new`

describe('Strategiya və sənədlər', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'homepage', azHomepage, true, true)
    i18n.addResourceBundle('en', 'homepage', enHomepage, true, true)
  })

  beforeEach(() => {
    resetHomepageStores()
    server.use(...homepageHandlers)
  })

  it('is a homepage blocks tab and hub card that opens the list', async () => {
    const user = userEvent.setup()
    const router = renderPanel('/homepage-blocks')

    expect(await screen.findByRole('link', { name: 'Bölməni aç: Strategiya və sənədlər' })).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Strategiya və sənədlər' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(STRATEGY_DOCS_PATH))
    expect(await screen.findByRole('row', { name: /2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası/ })).toBeInTheDocument()
  })

  it('says that the site shows the first three and marks a document without a working link', async () => {
    renderPanel(STRATEGY_DOCS_PATH)

    expect(await screen.findByText(/Saytda ilk üç dərc olunmuş sənəd göstərilir/)).toBeInTheDocument()
    const linked = await screen.findByRole('row', { name: /2024-2026-cı illərdə/ })
    expect(within(linked).getByText('Haqqımızda')).toBeInTheDocument()
    expect(within(linked).queryByText('Keçid işləmir')).not.toBeInTheDocument()
    const broken = screen.getByRole('row', { name: /Mikromaliyyə Modeli/ })
    expect(within(broken).getByText('Keçid işləmir')).toBeInTheDocument()
  })

  it('creates a document linked to a page picked from the tree', async () => {
    const posts = spyWriteBodies('post', '/api/v1/homepage-strategy-docs')
    const user = userEvent.setup()
    renderPanel(NEW_PATH)

    await user.type(await screen.findByRole('textbox', { name: /Başlıq \(AZ\)/ }), 'Kibertəhlükəsizlik Strategiyası')
    await user.click(screen.getByRole('combobox', { name: 'Səhifə' }))
    await user.click(await screen.findByRole('option', { name: 'Haqqımızda' }))
    await user.click(save())

    await waitFor(() => expect(posts).toHaveLength(1))
    // The engine sends an empty text field as ''; the API stores it as null.
    expect(posts[0]).toMatchObject({
      status: 'published',
      pageId: 1,
      translations: { az: { title: 'Kibertəhlükəsizlik Strategiyası', summary: '', coverMediaId: null, url: '' } },
    })
    expect(posts[0].translations).not.toHaveProperty('en')
    await waitFor(() =>
      expect(strategyDocsStore.all().some((row) => row.translations.az?.title === 'Kibertəhlükəsizlik Strategiyası')).toBe(true),
    )
  })

  it('asks for a title and a link before sending anything', async () => {
    const posts = spyWriteBodies('post', '/api/v1/homepage-strategy-docs')
    const user = userEvent.setup()
    renderPanel(NEW_PATH)

    await user.click(await screen.findByRole('button', { name: 'Yadda saxla' }))

    expect(await screen.findByText('Ən azı bir dildə başlıq yazın.')).toBeInTheDocument()
    expect(screen.getByText('Səhifə seçin və ya ən azı bir dildə ünvan yazın.')).toBeInTheDocument()
    expect(posts).toHaveLength(0)
  })

  it('refuses a javascript: address in the en tab and a language with text but no title', async () => {
    const posts = spyWriteBodies('post', '/api/v1/homepage-strategy-docs')
    const user = userEvent.setup()
    renderPanel(NEW_PATH)

    await user.type(await screen.findByRole('textbox', { name: /Başlıq \(AZ\)/ }), 'Strategiya')
    await user.type(screen.getByRole('textbox', { name: /Ünvan \(AZ\)/ }), '/az/strategiya')
    await user.click(screen.getByRole('tab', { name: /EN/ }))
    await user.type(await screen.findByRole('textbox', { name: /Ünvan \(EN\)/ }), 'javascript:alert(1)')
    await user.click(save())

    expect(await screen.findByText('Ünvan http://, https:// və ya / ilə başlamalıdır.')).toBeInTheDocument()
    expect(screen.getByText('Bu dildə mətn yazılıbsa, başlıq da yazılmalıdır.')).toBeInTheDocument()
    expect(posts).toHaveLength(0)
  })

  it('shows a server field error under the field of its language tab', async () => {
    const user = userEvent.setup()
    renderPanel(NEW_PATH)

    // The client lets a page id pass; the server answers that the page is gone.
    await user.type(await screen.findByRole('textbox', { name: /Başlıq \(AZ\)/ }), 'Strategiya')
    await user.click(screen.getByRole('combobox', { name: 'Səhifə' }))
    await user.click(await screen.findByRole('option', { name: 'Haqqımızda' }))
    server.use(
      http.post('/api/v1/homepage-strategy-docs', () =>
        Response.json(
          { title: 'Bad Request', status: 400, message: 'Seçilmiş səhifə tapılmadı.', errors: { pageId: ['Seçilmiş səhifə tapılmadı.'] } },
          { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )
    await user.click(save())

    expect(await screen.findByText('Seçilmiş səhifə tapılmadı.')).toBeInTheDocument()
  })

  it('offers only images for the cover', async () => {
    const user = userEvent.setup()
    renderPanel(NEW_PATH)

    await user.click((await screen.findAllByRole('button', { name: 'Seç' }))[0])
    const dialog = await screen.findByRole('dialog', { name: 'Fayl seç' })
    expect(within(dialog).getByText(/Yalnız şəkil seçmək olar/)).toBeInTheDocument()
    expect(await within(dialog).findByRole('button', { name: 'hesabat-2025.pdf faylını seç' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'placeholder-1.svg faylını seç' })).toBeEnabled()
  })

  it('reorders the documents in the dialog and saves each move', async () => {
    const puts = spyWriteBodies('put', '/api/v1/homepage-strategy-docs/order')
    const user = userEvent.setup()
    renderPanel(STRATEGY_DOCS_PATH)

    await user.click(await screen.findByRole('button', { name: 'Sıranı dəyiş' }))
    const dialog = await screen.findByRole('dialog', { name: 'Sənədlərin sırası' })
    await user.click(await within(dialog).findByRole('button', { name: /Mikromaliyyə Modeli üzrə Strateji Çərçivə — yuxarı/ }))

    await waitFor(() => expect(puts).toEqual([{ ids: [1, 3, 2] }]))
    await waitFor(() =>
      expect([...strategyDocsStore.all()].sort((a, b) => a.sortOrder - b.sortOrder).map((row) => row.id)).toEqual([1, 3, 2]),
    )
  })

  it('asks before leaving a changed form', async () => {
    const user = userEvent.setup()
    const router = renderPanel(`${STRATEGY_DOCS_PATH}/1`)

    const title = await screen.findByRole('textbox', { name: /Başlıq \(AZ\)/ })
    expect(title).toHaveValue('2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası')
    await user.type(title, ' (yeni)')
    await user.click(screen.getByRole('link', { name: 'Strategiya və sənədlər' }))

    const dialog = await screen.findByRole('alertdialog', { name: 'Yadda saxlanmamış dəyişikliklər' })
    await user.click(within(dialog).getByRole('button', { name: 'Ləğv et' }))
    expect(router.state.location.pathname).toBe(`${STRATEGY_DOCS_PATH}/1`)
  })
})
