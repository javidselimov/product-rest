/**
 * Working papers in the panel (spec 054 US2, `contracts/admin-ux.md` §2, §4), through the real routes and the MSW
 * store: the list's filters and search reach the API, "Yeni" carries the year, comma lists go out as arrays and come
 * back joined, server errors land on their field (and mark their language tab), the PDF picker offers documents only,
 * and leaving with unsaved changes asks first.
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
import { HttpResponse, http } from 'msw'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { AppProviders } from '@/app/providers/app-providers'
import { registerModule } from '@/features/crud/model/module-registry'
import { createCrudRoutes } from '@/features/crud/routes/create-crud-routes'
import { WorkingPapersFormPage, WorkingPapersPage } from '@/pages/working-papers'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { workingPapersHandlers, workingPapersStore } from '@/shared/testing/handlers/working-papers'
import { server } from '@/shared/testing/server'
import { workingPapersModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'test-layout', component: Outlet })
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(workingPapersModule), {
      list: WorkingPapersPage,
      form: WorkingPapersFormPage,
    }),
  ]),
])

function renderPapers(path: string) {
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

/** Request bodies of a method on the papers endpoints, read before the store handles them. */
function spyBodies(method: 'post' | 'put') {
  const bodies: Record<string, unknown>[] = []
  const path = method === 'post' ? '/api/v1/working-papers' : '/api/v1/working-papers/:id'
  server.use(
    http[method](path, async ({ request }) => {
      bodies.push((await request.clone().json()) as Record<string, unknown>)
      return undefined
    }),
  )
  return bodies
}

/** Query strings of the list requests. */
function spyListQueries() {
  const queries: URLSearchParams[] = []
  server.use(
    http.get('/api/v1/working-papers', ({ request }) => {
      queries.push(new URL(request.url).searchParams)
      return undefined
    }),
  )
  return queries
}

const save = () => screen.getByRole('button', { name: 'Yadda saxla' })
const numberField = () => screen.getByRole('spinbutton', { name: /^Nömrə/ })
const yearField = () => screen.getByRole('spinbutton', { name: /^İl/ })
const localeField = (label: string, locale: 'AZ' | 'EN') =>
  screen.getByRole('textbox', { name: new RegExp(`^${label} \\(${locale}\\)`) })

/** Fills the fields a valid paper needs, in az. */
async function fillMinimal(user: ReturnType<typeof userEvent.setup>, number: string, year: string) {
  await user.type(await screen.findByRole('textbox', { name: /^Başlıq \(AZ\)/ }), 'Yeni məqalə')
  await user.type(localeField('Müəlliflər', 'AZ'), 'Rauf Məmmədov')
  await user.clear(numberField())
  await user.type(numberField(), number)
  await user.clear(yearField())
  await user.type(yearField(), year)
}

describe('İşçi məqalələri', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    workingPapersStore.store.reset()
    server.use(...workingPapersHandlers)
  })

  describe('list', () => {
    it('lists the papers newest first, with the code, a title in either language and the languages it is in', async () => {
      renderPapers('/working-papers')

      const first = await screen.findByRole('row', { name: /02\/2025/ })
      expect(first).toHaveTextContent('Pul siyasətinin ötürülmə mexanizmi')
      expect(first).toHaveTextContent('Dərc olunub')
      const codes = screen
        .getAllByRole('row')
        .map((row) => /\d{2}\/\d{4}/.exec(row.textContent ?? '')?.[0])
        .filter(Boolean)
      expect(codes).toEqual(['02/2025', '01/2025', '04/2024'])
      expect(screen.getByRole('row', { name: /01\/2025/ })).toHaveTextContent('EN yoxdur')
      expect(screen.getByRole('row', { name: /04\/2024/ })).toHaveTextContent('Exchange rate pass-through')
      expect(screen.getByRole('row', { name: /04\/2024/ })).toHaveTextContent('AZ yoxdur')
    })

    it('sends the year filter, the status filter and the search to the API', async () => {
      const queries = spyListQueries()
      const user = userEvent.setup()
      renderPapers('/working-papers')
      await screen.findByRole('row', { name: /04\/2024/ })

      await user.type(screen.getByRole('spinbutton', { name: 'İl' }), '2025')
      await waitFor(() => expect(screen.queryByRole('row', { name: /04\/2024/ })).not.toBeInTheDocument())
      expect(queries.at(-1)?.get('year')).toBe('2025')

      await user.click(screen.getByRole('combobox', { name: 'Status' }))
      await user.click(await screen.findByRole('option', { name: 'Dərc olunub' }))
      await waitFor(() => expect(queries.at(-1)?.get('status')).toBe('published'))

      await user.type(screen.getByRole('textbox', { name: 'Axtar' }), 'gözləntilərinin')
      await waitFor(() => expect(screen.queryByRole('row', { name: /02\/2025/ })).not.toBeInTheDocument())
      const last = queries.at(-1)
      expect(last?.get('search')).toBe('gözləntilərinin')
      expect(last?.get('year')).toBe('2025')
      expect(last?.get('status')).toBe('published')
      expect(screen.getByRole('row', { name: /01\/2025/ })).toBeInTheDocument()
    })

    it('opens "Yeni" with the year of the list filter', async () => {
      const user = userEvent.setup()
      renderPapers('/working-papers?year=2024')
      await screen.findByRole('row', { name: /04\/2024/ })

      await user.click(screen.getByRole('button', { name: 'Yeni' }))

      expect(await screen.findByRole('spinbutton', { name: /^İl/ })).toHaveValue(2024)
    })
  })

  describe('form', () => {
    it('sends the comma lists as trimmed arrays without blanks or repeats, the JEL codes upper-cased', async () => {
      const posts = spyBodies('post')
      const user = userEvent.setup()
      const router = renderPapers('/working-papers/new')

      await user.type(await screen.findByRole('textbox', { name: /^Başlıq \(AZ\)/ }), 'Yeni məqalə')
      await user.type(localeField('Müəlliflər', 'AZ'), ' Rauf Məmmədov , Leyla Quliyeva,, Rauf Məmmədov ')
      await user.type(localeField('Açar sözlər', 'AZ'), 'inflyasiya, , gözləntilər')
      await user.type(numberField(), '3')
      await user.type(yearField(), '2025')
      await user.type(screen.getByRole('textbox', { name: /^JEL kodları/ }), 'e58, C22, E58')
      await user.click(save())

      await waitFor(() => expect(router.state.location.pathname).toBe('/working-papers'))
      expect(posts).toEqual([
        {
          number: 3,
          year: 2025,
          paperLanguage: 'az',
          jelCodes: ['E58', 'C22'],
          status: 'draft',
          translations: {
            az: {
              title: 'Yeni məqalə',
              authors: ['Rauf Məmmədov', 'Leyla Quliyeva'],
              abstract: null,
              keywords: ['inflyasiya', 'gözləntilər'],
              mediaId: null,
            },
          },
        },
      ])
      expect(await screen.findByRole('row', { name: /03\/2025/ })).toBeInTheDocument()
    })

    it('shows the lists of a saved paper joined with commas, and sends them back unchanged', async () => {
      const puts = spyBodies('put')
      const user = userEvent.setup()
      renderPapers('/working-papers/1')

      expect(await screen.findByRole('textbox', { name: /^Müəlliflər \(AZ\)/ })).toHaveValue('Elvin Əliyev, Nigar Həsənova')
      expect(localeField('Açar sözlər', 'EN')).toHaveValue('monetary policy, interest rate')
      expect(screen.getByRole('textbox', { name: /^JEL kodları/ })).toHaveValue('E52, E58')
      expect(screen.getByRole('combobox', { name: /^Məqalənin dili/ })).toHaveTextContent('İngilis dili')

      await user.click(save())

      await waitFor(() => expect(puts).toHaveLength(1))
      expect(puts[0]).toMatchObject({
        number: 2,
        year: 2025,
        paperLanguage: 'en',
        jelCodes: ['E52', 'E58'],
        translations: {
          az: { authors: ['Elvin Əliyev', 'Nigar Həsənova'], mediaId: 3 },
          en: { keywords: ['monetary policy', 'interest rate'], abstract: 'The paper studies the interest rate channel.' },
        },
      })
    })

    it('keeps the legacy page id of a migrated paper, which the form does not show', async () => {
      const puts = spyBodies('put')
      const user = userEvent.setup()
      renderPapers('/working-papers/3')

      expect(await screen.findByRole('textbox', { name: /^Başlıq \(EN\)/ })).toHaveValue('Exchange rate pass-through')
      await user.click(save())

      await waitFor(() => expect(puts).toHaveLength(1))
      expect(puts[0]).toMatchObject({ legacyPageId: 371, paperLanguage: 'other', jelCodes: [] })
      expect(Object.keys(puts[0]?.translations as object)).toEqual(['en'])
    })

    it('shows the 409 of a number taken in its year under the number field', async () => {
      const user = userEvent.setup()
      renderPapers('/working-papers/new')

      await fillMinimal(user, '2', '2025')
      await user.click(save())

      await waitFor(() => expect(numberField()).toHaveAttribute('aria-invalid', 'true'))
      expect(numberField()).toHaveAccessibleDescription(/02\/2025 nömrəli məqalə artıq var\./)
    })

    it('puts a server error on the English authors under that field and marks the English tab', async () => {
      server.use(
        http.post('/api/v1/working-papers', () =>
          HttpResponse.json(
            {
              status: 400,
              title: 'Bad Request',
              message: 'Başlığı olan dildə ən azı bir müəllif yazın.',
              errors: { 'translations.en.authors': ['Başlığı olan dildə ən azı bir müəllif yazın.'] },
            },
            { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
          ),
        ),
      )
      const user = userEvent.setup()
      renderPapers('/working-papers/new')

      await fillMinimal(user, '5', '2025')
      await user.click(save())

      await waitFor(() => expect(localeField('Müəlliflər', 'EN')).toHaveAttribute('aria-invalid', 'true'))
      expect(localeField('Müəlliflər', 'EN')).toHaveAccessibleDescription(/ən azı bir müəllif yazın/)
      expect(screen.getByRole('tab', { name: /EN/ })).toHaveTextContent('Xəta')
      expect(screen.getByRole('tab', { name: /AZ/ })).not.toHaveTextContent('Xəta')
    })

    it('asks for the authors of a language that has a title, before sending anything', async () => {
      const posts = spyBodies('post')
      const user = userEvent.setup()
      renderPapers('/working-papers/new')

      await user.type(await screen.findByRole('textbox', { name: /^Başlıq \(AZ\)/ }), 'Yeni məqalə')
      await user.type(numberField(), '6')
      await user.type(yearField(), '2025')
      await user.click(save())

      await waitFor(() => expect(localeField('Müəlliflər', 'AZ')).toHaveAttribute('aria-invalid', 'true'))
      expect(screen.getByRole('tab', { name: /AZ/ })).toHaveTextContent('Xəta')
      expect(posts).toEqual([])
    })

    it('refuses a JEL code that is not a letter and one or two digits', async () => {
      const posts = spyBodies('post')
      const user = userEvent.setup()
      renderPapers('/working-papers/new')

      await fillMinimal(user, '7', '2025')
      await user.type(screen.getByRole('textbox', { name: /^JEL kodları/ }), 'E58, 123')
      await user.click(save())

      const jel = screen.getByRole('textbox', { name: /^JEL kodları/ })
      await waitFor(() => expect(jel).toHaveAttribute('aria-invalid', 'true'))
      expect(jel).toHaveAccessibleDescription(/"123" JEL kodu deyil/)
      expect(posts).toEqual([])
    })

    it('asks for a title when only other fields of a language are filled', async () => {
      const posts = spyBodies('post')
      const user = userEvent.setup()
      renderPapers('/working-papers/new')

      await fillMinimal(user, '8', '2025')
      await user.type(localeField('Müəlliflər', 'EN'), 'Rauf Mammadov')
      await user.click(save())

      await waitFor(() => expect(localeField('Başlıq', 'EN')).toHaveAttribute('aria-invalid', 'true'))
      expect(posts).toEqual([])
    })

    it('offers only documents for the PDF', async () => {
      const user = userEvent.setup()
      renderPapers('/working-papers/new')

      await user.click((await screen.findAllByRole('button', { name: 'Seç' }))[0]!)
      const dialog = await screen.findByRole('dialog', { name: 'Fayl seç' })
      expect(within(dialog).getByText(/Yalnız sənəd seçmək olar/)).toBeInTheDocument()
      expect(await within(dialog).findByRole('button', { name: 'placeholder-1.svg faylını seç' })).toBeDisabled()
      expect(within(dialog).getByRole('button', { name: 'hesabat-2025.pdf faylını seç' })).toBeEnabled()
    })

    it('asks before leaving with unsaved changes', async () => {
      const user = userEvent.setup()
      const router = renderPapers('/working-papers/new')

      await user.type(await screen.findByRole('textbox', { name: /^Başlıq \(AZ\)/ }), 'Yarımçıq')
      await user.click(screen.getByRole('button', { name: 'Ləğv et' }))

      const dialog = await screen.findByRole('alertdialog', { name: 'Yadda saxlanmamış dəyişikliklər' })
      await user.click(within(dialog).getByRole('button', { name: 'Ləğv et' }))
      expect(router.state.location.pathname).toBe('/working-papers/new')
    })
  })
})
