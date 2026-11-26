/**
 * The release schedule in the panel (spec 039): rows, groups and periodicities, through the real
 * routes and MSW stores.
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
import {
  ReleaseScheduleItemsFormPage,
  ReleaseScheduleItemsPage,
} from '@/pages/release-schedule'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import {
  releaseScheduleGroupsStore,
  releaseScheduleHandlers,
  releaseScheduleItemsStore,
  releaseSchedulePeriodicitiesStore,
} from '@/shared/testing/handlers/release-schedule'
import { server } from '@/shared/testing/server'
import {
  releaseScheduleGroupsModule,
  releaseScheduleItemsModuleBase,
  releaseSchedulePeriodicitiesModule,
} from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'test-layout',
  component: Outlet,
})
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(releaseScheduleItemsModuleBase), {
      list: ReleaseScheduleItemsPage,
      form: ReleaseScheduleItemsFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(releaseScheduleGroupsModule)),
    ...createCrudRoutes(layoutRoute, registerModule(releaseSchedulePeriodicitiesModule)),
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

async function openSelect(user: ReturnType<typeof userEvent.setup>, trigger: HTMLElement) {
  await user.click(trigger)
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    trigger.focus()
    await user.keyboard('{ArrowDown}')
  }
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
}

async function choose(user: ReturnType<typeof userEvent.setup>, field: string, option: string) {
  await openSelect(user, await screen.findByRole('combobox', { name: field }))
  await user.click(await screen.findByRole('option', { name: option }))
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

describe('Yayım qrafiki', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
  })

  beforeEach(() => {
    releaseScheduleItemsStore.store.reset()
    releaseScheduleGroupsStore.store.reset()
    releaseSchedulePeriodicitiesStore.store.reset()
    server.use(...releaseScheduleHandlers)
  })

  describe('Sətirlər', () => {
    it('lists rows with their group, periodicity and timing mode', async () => {
      renderCrud('/release-schedule')

      const row = await screen.findByRole('row', {
        name: /Pul siyasəti ilə bağlı qəbul olunan qərarlar/,
      })
      expect(within(row).getByText('Pul və məzənnə siyasəti üzrə')).toBeInTheDocument()
      expect(within(row).getByText('Qərar müvafiq qaydada təsdiq edildikdə')).toBeInTheDocument()
      expect(within(row).getByText('Qərarlar qrafiki')).toBeInTheDocument()
      expect(within(row).getByText('Dərc olunub')).toBeInTheDocument()
    })

    it('creates a row in one language and sends no link in the text mode', async () => {
      const posts = spyWriteBodies('post', releaseScheduleItemsStore.base)
      const user = userEvent.setup()
      renderCrud('/release-schedule/new')

      await user.type(
        await screen.findByRole('textbox', { name: /Məzmun \(AZ\)/ }),
        'İllik inflyasiya',
      )
      await user.type(
        screen.getByRole('textbox', { name: /Təqdim olunma müddəti \(AZ\)/ }),
        'Növbəti ayın 20-dək',
      )
      await choose(user, 'Dövrilik', 'Aylıq')
      await user.click(save())

      await waitFor(() => expect(posts).toHaveLength(1))
      expect(posts[0]).toMatchObject({
        groupId: 1,
        periodicityId: 3,
        timingMode: 'text',
        timingUrl: null,
        sortOrder: 0,
        showAz: true,
        showEn: true,
      })
      const translations = posts[0]?.translations as Record<string, unknown>
      expect(Object.keys(translations)).toEqual(['az'])
      expect(translations.az).toEqual({ title: 'İllik inflyasiya', timing: 'Növbəti ayın 20-dək' })
    })

    it('needs a link in the link mode and refuses an unsafe one', async () => {
      const posts = spyWriteBodies('post', releaseScheduleItemsStore.base)
      const user = userEvent.setup()
      renderCrud('/release-schedule/new')

      await user.type(
        await screen.findByRole('textbox', { name: /Məzmun \(AZ\)/ }),
        'Normativ-xarakterli aktlar',
      )
      await choose(user, 'Müddət xanası', 'Link')
      await user.click(save())
      expect(await screen.findByText('"Link" rejimində link məcburidir')).toBeInTheDocument()

      const link = screen.getByRole('textbox', { name: 'Link' })
      await user.type(link, 'javascript:alert(1)')
      await user.click(save())
      expect(
        await screen.findByText('Link https://, http:// və ya / ilə başlamalıdır'),
      ).toBeInTheDocument()
      expect(posts).toHaveLength(0)

      await user.clear(link)
      await user.type(link, ' https://e-qanun.az ')
      await user.click(save())
      await waitFor(() => expect(posts).toHaveLength(1))
      expect(posts[0]).toMatchObject({ timingMode: 'link', timingUrl: 'https://e-qanun.az' })
    })

    it('drops the stored link when the mode leaves link', async () => {
      const puts = spyWriteBodies('put', releaseScheduleItemsStore.base)
      const user = userEvent.setup()
      renderCrud('/release-schedule/3')

      expect(await screen.findByRole('textbox', { name: 'Link' })).toHaveValue('https://e-qanun.az')
      await choose(user, 'Müddət xanası', 'Mətn')
      await user.click(save())

      await waitFor(() => expect(puts).toHaveLength(1))
      expect(puts[0]).toMatchObject({ timingMode: 'text', timingUrl: null })
    })

    it('points at the missing title of a language that was only started', async () => {
      const puts = spyWriteBodies('put', releaseScheduleItemsStore.base)
      const user = userEvent.setup()
      renderCrud('/release-schedule/1')

      await user.clear(await screen.findByRole('textbox', { name: /Məzmun \(EN\)/ }))
      await user.click(save())

      expect(
        await screen.findByText('Bu dildə məzmunu yazın və ya dili tam boş saxlayın'),
      ).toBeInTheDocument()
      expect(puts).toHaveLength(0)
    })

    it('filters the list by group', async () => {
      renderCrud('/release-schedule?groupId=2')

      expect(await screen.findByRole('row', { name: /Normativ-xarakterli aktlar/ })).toBeInTheDocument()
      expect(
        screen.queryByRole('row', { name: /Pul siyasətinin əsas istiqamətləri/ }),
      ).not.toBeInTheDocument()
    })
  })

  describe('Qruplar və dövriliklər', () => {
    it('switches between the three tabs', async () => {
      const user = userEvent.setup()
      const router = renderCrud('/release-schedule')

      await user.click(await screen.findByRole('tab', { name: 'Qruplar' }))
      expect(await screen.findByRole('row', { name: /Normativ-hüquqi baza üzrə/ })).toBeInTheDocument()
      expect(router.state.location.pathname).toBe('/release-schedule/groups')

      await user.click(screen.getByRole('tab', { name: 'Dövriliklər' }))
      expect(await screen.findByRole('row', { name: /İstifadə olunmayan/ })).toBeInTheDocument()
      expect(router.state.location.pathname).toBe('/release-schedule/periodicities')
    })

    it('creates a group that the row form then offers', async () => {
      const user = userEvent.setup()
      const router = renderCrud('/release-schedule/groups/new')

      await user.click(await screen.findByRole('button', { name: 'Yadda saxla' }))
      expect(await screen.findAllByRole('alert')).not.toHaveLength(0)

      await user.type(screen.getByRole('textbox', { name: /Ad \(AZ\)/ }), 'Statistika üzrə')
      await user.click(save())
      await waitFor(() =>
        expect(releaseScheduleGroupsStore.store.all().map((g) => g.translations.az?.name)).toContain(
          'Statistika üzrə',
        ),
      )

      await router.navigate({ to: '/release-schedule/new' })
      await openSelect(user, await screen.findByRole('combobox', { name: 'Qrup' }))
      expect(screen.getByRole('option', { name: 'Statistika üzrə' })).toBeInTheDocument()
    })

    it('refuses to delete a group in use, with the reason', async () => {
      const user = userEvent.setup()
      renderCrud('/release-schedule/groups')

      await user.click(
        await screen.findByRole('button', { name: 'Sil: Pul və məzənnə siyasəti üzrə' }),
      )
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sil' }),
      )

      expect(await screen.findByText(/The group is used by an item/)).toBeInTheDocument()
      expect(releaseScheduleGroupsStore.store.get(1)).toBeDefined()
    })

    it('deletes a periodicity no row uses, and refuses one in use', async () => {
      const user = userEvent.setup()
      renderCrud('/release-schedule/periodicities')

      await user.click(await screen.findByRole('button', { name: 'Sil: İstifadə olunmayan' }))
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sil' }),
      )
      await waitFor(() => expect(releaseSchedulePeriodicitiesStore.store.get(8)).toBeNull())

      await user.click(screen.getByRole('button', { name: 'Sil: Aylıq' }))
      await user.click(
        within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Sil' }),
      )
      expect(await screen.findByText(/The periodicity is used by an item/)).toBeInTheDocument()
    })
  })
})
