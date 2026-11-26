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
// @ts-expect-error -- app tsconfig-də Node tipləri yoxdur; yalnız test mühiti (multipart) üçün
import { File as NodeFile } from 'node:buffer'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { z } from 'zod'

import { AppProviders } from '@/app/providers/app-providers'
import { MediaLibraryPage } from '@/pages/media-library'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { mediaStore } from '@/shared/testing/handlers/media'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const mediaRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/media-library',
  validateSearch: z.object({
    page: z.number().int().min(1).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
  }),
  component: MediaLibraryPage,
})
const routeTree = rootRoute.addChildren([layoutRoute.addChildren([mediaRoute])])

/**
 * jsdom-un `FormData`/`File`-ı Node fetch `Request`-ində (MSW) qəbul olunmur.
 * Native FormData `Response#formData()`-dan, native File `node:buffer`-dən alınır.
 */
async function nativeMultipartClasses() {
  const form = await new Response('a=1', {
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  }).formData()
  return {
    FormData: form.constructor as typeof FormData,
    File: NodeFile as unknown as typeof File,
  }
}

function renderPage(path = '/media-library') {
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

describe('Media kitabxanası', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    mediaStore.reset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('kart grid-i fixture fayllarını göstərir', async () => {
    renderPage()
    expect(
      await screen.findByRole('heading', { name: 'Media kitabxanası' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('hesabat-2025.pdf')).toBeInTheDocument()
    expect(screen.getByText('placeholder-1.svg')).toBeInTheDocument()
    expect(screen.getByText('arxiv.zip')).toBeInTheDocument()
    expect(screen.getByText('6 qeyd · səhifə 1 / 1')).toBeInTheDocument()
    // Ölçülər API-dən gəlmir — hər kartda "—".
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(6)
  })

  it('axtarış URL-ə yazılır və siyahı daralır', async () => {
    const user = userEvent.setup()
    const router = renderPage()
    await screen.findByText('hesabat-2025.pdf')
    await user.type(screen.getByLabelText('Fayl axtar'), 'hesabat')
    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ search: 'hesabat' }),
    )
    expect(router.state.location.search).not.toHaveProperty('page')
    await waitFor(() =>
      expect(screen.queryByText('arxiv.zip')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('hesabat-2025.pdf')).toBeInTheDocument()
  })

  it('sərbəst faylın silinməsi: kart yox olur, toast', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('mezenne.xlsx')
    await user.click(
      screen.getByRole('button', { name: 'mezenne.xlsx faylını sil' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText('"mezenne.xlsx" faylı silinsin?'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    await waitFor(() =>
      expect(screen.queryByText('mezenne.xlsx')).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('Fayl silindi')).toBeInTheDocument()
    expect(mediaStore.all().some((m) => m.id === 4)).toBe(false)
  })

  it('məzmuna bağlı faylın silinməsi (409): dialoq bağlanır, banner API mesajını göstərir', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('hesabat-2025.pdf')
    await user.click(
      screen.getByRole('button', { name: 'hesabat-2025.pdf faylını sil' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Sil' }))
    expect(
      await screen.findByText('File is attached to content; detach it first.'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('hesabat-2025.pdf')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bildirişi bağla' }))
    expect(
      screen.queryByText('File is attached to content; detach it first.'),
    ).not.toBeInTheDocument()
  })

  it('yükləmə: yeni fayl kart kimi görünür, toast', async () => {
    // Multipart üçün yalnız bu testdə Node-un öz siniflərinə keçilir (bax: nativeMultipartClasses).
    const native = await nativeMultipartClasses()
    vi.stubGlobal('FormData', native.FormData)
    vi.stubGlobal('File', native.File)

    const user = userEvent.setup()
    renderPage()
    await screen.findByText('hesabat-2025.pdf')
    const input = screen.getByLabelText('Fayl yüklə')
    const file = new native.File(['%PDF-1.4 test'], 'yeni-sened.pdf', {
      type: 'application/pdf',
    })
    await user.upload(input, file)
    expect(await screen.findByText('yeni-sened.pdf')).toBeInTheDocument()
    expect(
      await screen.findByText('"yeni-sened.pdf" yükləndi'),
    ).toBeInTheDocument()
    expect(
      mediaStore.all().some((m) => m.originalName === 'yeni-sened.pdf'),
    ).toBe(true)
  })
})
