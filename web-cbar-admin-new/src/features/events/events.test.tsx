/**
 * Events and categories in the panel (spec 034 US1), through the real routes and MSW stores.
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
import az from '@/locales/az/events.json'
import en from '@/locales/en/events.json'
import { EventsFormPage, EventsPage } from '@/pages/events'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import { i18n } from '@/shared/i18n'
import {
  eventCategoriesStore,
  eventsHandlers,
  eventsStore,
} from '@/shared/testing/handlers/events'
import { galleriesHandlers } from '@/shared/testing/handlers/galleries'
import { pagesHandlers } from '@/shared/testing/handlers/pages'
import { pressReleasesHandlers } from '@/shared/testing/handlers/press-releases'
import { server } from '@/shared/testing/server'
import { eventCategoriesModule, eventsModuleBase } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(eventsModuleBase), {
      list: EventsPage,
      form: EventsFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(eventCategoriesModule)),
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

// jsdom has no pointer capture or scrollIntoView; the kit Select and Combobox call them.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

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

describe('Tədbirlər', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    i18n.addResourceBundle('az', 'events', az, true, true)
    i18n.addResourceBundle('en', 'events', en, true, true)
  })

  beforeEach(() => {
    eventsStore.store.reset()
    eventCategoriesStore.store.reset()
    server.use(
      ...eventsHandlers,
      ...galleriesHandlers,
      ...pressReleasesHandlers,
      ...pagesHandlers,
    )
  })

  describe('list', () => {
    it('shows events, with a dash for a legacy event without a type or category', async () => {
      renderCrud('/events')

      const decision = await screen.findByRole('row', {
        name: /Faiz dəhlizinə dair qərar/,
      })
      expect(within(decision).getByText('Pul siyasəti')).toBeInTheDocument()
      expect(within(decision).getByText('Qərar')).toBeInTheDocument()
      expect(within(decision).getByText('Dərc olunub')).toBeInTheDocument()

      const legacy = screen.getByRole('row', { name: /COP29/ })
      expect(within(legacy).getAllByText('—').length).toBeGreaterThanOrEqual(2)
    })

    it('narrows the list by a category from the panel', async () => {
      renderCrud('/events?categoryId=1')

      expect(
        await screen.findByRole('row', { name: /Faiz dəhlizinə dair qərar/ }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('row', { name: /COP29/ }),
      ).not.toBeInTheDocument()
    })

    it('links the categories section as a tab', async () => {
      renderCrud('/events')

      expect(
        await screen.findByRole('tab', { name: 'Bölmələr' }),
      ).toBeInTheDocument()
    })
  })

  describe('form', () => {
    it('sends typed values and null for what is left empty', async () => {
      eventsStore.store.get(1)!.startTime = null
      const user = userEvent.setup()
      renderCrud('/events/1')

      const title = await screen.findByRole('textbox', { name: 'Başlıq (AZ)' })
      expect(title).toHaveValue('Faiz dəhlizinə dair qərar')
      expect(screen.getByLabelText('Saat')).toHaveValue('')
      await user.type(screen.getByLabelText('Saat'), '10:30')

      const puts = spyWriteBodies('put', eventsStore.base)
      await user.click(save())

      await waitFor(() => expect(puts).toHaveLength(1))
      expect(puts[0]).toMatchObject({
        type: 1,
        categoryId: 1,
        status: 'published',
        startsOn: '2026-12-23',
        endsOn: null,
        startTime: '10:30',
        galleryId: null,
        pressReleaseId: null,
        pageId: null,
      })
    })

    it('offers no scheduled status', async () => {
      const user = userEvent.setup()
      renderCrud('/events/new')

      await openSelect(
        user,
        await screen.findByRole('combobox', { name: 'Status' }),
      )

      const options = screen
        .getAllByRole('option')
        .map((option) => option.textContent)
      expect(options).toContain('Dərc olunub')
      expect(options).not.toContain('Planlaşdırılıb')
    })

    it('does not save an end date before the start date', async () => {
      const bodies = spyWriteBodies('put', eventsStore.base)
      eventsStore.store.get(1)!.endsOn = '2026-12-01'
      const user = userEvent.setup()
      renderCrud('/events/1')

      await screen.findByRole('textbox', { name: 'Başlıq (AZ)' })
      await user.click(save())

      expect(
        await screen.findByText(
          'Bitmə tarixi başlanğıc tarixindən əvvəl ola bilməz',
        ),
      ).toBeInTheDocument()
      expect(bodies).toHaveLength(0)
    })

    it('needs a start date and a title', async () => {
      const bodies = spyWriteBodies('post', eventsStore.base)
      const user = userEvent.setup()
      renderCrud('/events/new')

      await screen.findByRole('textbox', { name: 'Başlıq (AZ)' })
      await user.click(save())

      expect(
        await screen.findByText('Başlanğıc tarixi sahəsi məcburidir'),
      ).toBeInTheDocument()
      expect(bodies).toHaveLength(0)
    })

    it('links a gallery chosen from the searchable list', async () => {
      const bodies = spyWriteBodies('put', eventsStore.base)
      const user = userEvent.setup()
      renderCrud('/events/1')

      await user.click(
        await screen.findByRole('combobox', { name: 'Qalereya' }),
      )
      await user.click((await screen.findAllByRole('option'))[0])
      await user.click(save())

      await waitFor(() => expect(bodies).toHaveLength(1))
      expect(bodies[0].galleryId).toEqual(expect.any(Number))
    })

    it('keeps a link that is outside the loaded list readable', async () => {
      const event = eventsStore.store.get(1)!
      event.pressReleaseId = 99999
      event.pressRelease = { id: 99999, title: 'Köhnə reliz' }
      renderCrud('/events/1')

      expect(
        await screen.findByRole('combobox', { name: 'Press reliz' }),
      ).toHaveTextContent('Köhnə reliz')
    })
  })

  describe('categories', () => {
    it('adds a category', async () => {
      const user = userEvent.setup()
      renderCrud('/events/categories/new')

      await user.type(
        await screen.findByRole('textbox', { name: 'Ad (AZ)' }),
        'Maliyyə sabitliyi',
      )
      await user.click(save())

      expect(
        await screen.findByRole('row', { name: /Maliyyə sabitliyi/ }),
      ).toBeInTheDocument()
    })

    it('refuses to delete a category in use and says why', async () => {
      const user = userEvent.setup()
      renderCrud('/events/categories')

      await user.click(
        await screen.findByRole('button', { name: 'Sil: Pul siyasəti' }),
      )
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', {
          name: 'Sil',
        }),
      )

      expect(
        await screen.findAllByText(/The category is used by an event/),
      ).not.toHaveLength(0)
      expect(eventCategoriesStore.store.get(1)).not.toBeNull()
    })

    it('deletes a category nobody uses', async () => {
      const user = userEvent.setup()
      renderCrud('/events/categories')

      await user.click(
        await screen.findByRole('button', { name: 'Sil: İstifadəsiz' }),
      )
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', {
          name: 'Sil',
        }),
      )

      await waitFor(() => expect(eventCategoriesStore.store.get(3)).toBeNull())
    })
  })
})
