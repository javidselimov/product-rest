/**
 * "Sual-cavab" in the panel (spec 051 US6): questions, topics and videos through the real routes and MSW stores —
 * the topic tabs and the missing-translation filter, a new question from a topic, the language pair rule, ordering a
 * topic's questions, the 409 of a topic with questions, a link without a YouTube id, and leaving unsaved changes.
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
import { FaqQuestionsFormPage, FaqQuestionsPage, FaqTopicsPage, FaqVideosPage } from '@/pages/faq'
import { loadRuntimeConfig } from '@/shared/config/runtime-config'
import {
  FAQ_YOUTUBE_INVALID,
  faqHandlers,
  faqQuestionsStore,
  faqTopicInUse,
  faqTopicsStore,
  faqVideosStore,
} from '@/shared/testing/handlers/faq'
import { server } from '@/shared/testing/server'
import { faqQuestionsModuleBase, faqTopicsModule, faqVideosModule } from './model/module'

const rootRoute = createRootRoute()
const layoutRoute = createRoute({ getParentRoute: () => rootRoute, id: 'test-layout', component: Outlet })
const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    ...createCrudRoutes(layoutRoute, registerModule(faqQuestionsModuleBase), {
      list: FaqQuestionsPage,
      form: FaqQuestionsFormPage,
    }),
    ...createCrudRoutes(layoutRoute, registerModule(faqTopicsModule), { list: FaqTopicsPage }),
    ...createCrudRoutes(layoutRoute, registerModule(faqVideosModule), { list: FaqVideosPage }),
  ]),
])

function renderFaq(path: string) {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

// jsdom has no pointer capture, scrollIntoView or Range measuring; the kit Select and ProseMirror call them.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}

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
const rowNames = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent ?? '')

describe('Sual-cavab', () => {
  beforeAll(async () => {
    await loadRuntimeConfig()
    const emptyRect = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => ({}) } as DOMRect
    if (!Range.prototype.getClientRects) Range.prototype.getClientRects = () => [] as unknown as DOMRectList
    if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => emptyRect
    if (!document.elementFromPoint) document.elementFromPoint = () => null
  })

  beforeEach(() => {
    faqTopicsStore.store.reset()
    faqQuestionsStore.store.reset()
    faqVideosStore.store.reset()
    server.use(...faqHandlers)
  })

  describe('Suallar', () => {
    it('lists questions with their number, topic and the missing language', async () => {
      renderFaq('/faq')

      const row = await screen.findByRole('row', { name: /Uçot dərəcəsi nədir\?/ })
      expect(within(row).getByText('2')).toBeInTheDocument()
      expect(within(row).getByText('Pul siyasəti')).toBeInTheDocument()
      expect(within(row).getByText('EN yoxdur')).toBeInTheDocument()
      const complete = screen.getByRole('row', { name: /Pul siyasəti nədir\?/ })
      expect(within(complete).queryByText('EN yoxdur')).not.toBeInTheDocument()
    })

    it('narrows the list to a topic tab and to questions without English', async () => {
      const user = userEvent.setup()
      renderFaq('/faq')

      await user.click(await screen.findByRole('tab', { name: 'Ödəniş sistemləri' }))
      await waitFor(() => expect(rowNames()).toEqual([expect.stringContaining('Ani ödəniş nədir?')]))

      await user.click(screen.getByRole('tab', { name: 'Hamısı' }))
      await user.click(await screen.findByRole('combobox', { name: 'Tərcümə' }))
      await user.click(await screen.findByRole('option', { name: 'EN yoxdur' }))
      await waitFor(() => expect(screen.queryByRole('row', { name: /Pul siyasəti nədir\?/ })).not.toBeInTheDocument())
      expect(screen.getByRole('row', { name: /Ani ödəniş nədir\?/ })).toBeInTheDocument()
    })

    it('opens "Yeni" from a topic tab with that topic chosen', async () => {
      const user = userEvent.setup()
      const router = renderFaq('/faq?topicId=2')

      await screen.findByRole('row', { name: /Ani ödəniş nədir\?/ })
      await user.click(screen.getByRole('button', { name: 'Yeni' }))

      expect(await screen.findByRole('combobox', { name: 'Mövzu' })).toHaveTextContent('Ödəniş sistemləri')
      expect(router.state.location.pathname).toBe('/faq/new')
    })

    it('refuses a language with a question but no answer', async () => {
      const posts = spyWriteBodies('post', faqQuestionsStore.base)
      const user = userEvent.setup()
      renderFaq('/faq/new?topicId=1')

      await user.type(await screen.findByRole('textbox', { name: /Sual \(AZ\)/ }), 'Manat nədir?')
      await user.click(save())

      expect(
        await screen.findByText('Bu dildə həm sualı, həm cavabı yazın, ya da hər ikisini boş saxlayın'),
      ).toBeInTheDocument()
      expect(posts).toHaveLength(0)
    })

    it('saves a question in its only language and does not send the empty one', async () => {
      const puts = spyWriteBodies('put', faqQuestionsStore.base)
      const user = userEvent.setup()
      const router = renderFaq('/faq/2')

      const question = await screen.findByRole('textbox', { name: /Sual \(AZ\)/ })
      await user.type(question, ' (yenilənib)')
      await user.click(save())

      await waitFor(() => expect(puts).toHaveLength(1))
      // A save goes back to the list without the unsaved-changes question.
      await waitFor(() => expect(router.state.location.pathname).toBe('/faq'))
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      expect(puts[0]).toMatchObject({ topicId: 1, status: 'published' })
      const translations = puts[0]?.translations as Record<string, { question: string }>
      expect(Object.keys(translations)).toEqual(['az'])
      expect(translations.az?.question).toBe('Uçot dərəcəsi nədir? (yenilənib)')
    })

    it('asks before leaving a form with unsaved changes', async () => {
      const user = userEvent.setup()
      const router = renderFaq('/faq/2')

      await user.type(await screen.findByRole('textbox', { name: /Sual \(AZ\)/ }), '!')
      await user.click(screen.getByRole('button', { name: 'Ləğv et' }))

      const dialog = await screen.findByRole('alertdialog', { name: 'Yadda saxlanmamış dəyişikliklər' })
      await user.click(within(dialog).getByRole('button', { name: 'Ləğv et' }))
      expect(router.state.location.pathname).toBe('/faq/2')

      await user.click(screen.getByRole('button', { name: 'Ləğv et' }))
      await user.click(await screen.findByRole('button', { name: 'Çıx' }))
      await waitFor(() => expect(router.state.location.pathname).toBe('/faq'))
    })
  })

  describe('Mövzular', () => {
    it('reorders a topic\'s questions from its form', async () => {
      const user = userEvent.setup()
      renderFaq('/faq/topics/1')

      const list = await screen.findByRole('list', { name: 'Mövzunun sualları' })
      await within(list).findByText('İnflyasiya necə ölçülür?')
      await user.click(screen.getByRole('button', { name: 'İnflyasiya necə ölçülür? — yuxarı' }))

      await waitFor(() =>
        expect(
          faqQuestionsStore.store
            .all()
            .filter((row) => row.topicId === 1)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((row) => row.id),
        ).toEqual([1, 3, 2]),
      )
      expect(screen.getByText('«İnflyasiya necə ölçülür?» 2-ci yerə keçdi')).toHaveAttribute('aria-live', 'polite')
      expect(screen.getByText(`/az/sual-cavab?topic=pul-siyaseti`)).toBeInTheDocument()
    })

    it('shows the API message when a topic with questions is deleted', async () => {
      const user = userEvent.setup()
      renderFaq('/faq/topics')

      await user.click(await screen.findByRole('button', { name: 'Sil: Pul siyasəti' }))
      const dialog = await screen.findByRole('alertdialog')
      await user.click(within(dialog).getByRole('button', { name: 'Sil' }))

      expect(await within(dialog).findByText(faqTopicInUse(3))).toBeInTheDocument()
      expect(faqTopicsStore.store.get(1)).not.toBeNull()
    })

    it('reorders the topics in the dialog over the list', async () => {
      const user = userEvent.setup()
      renderFaq('/faq/topics')

      await user.click(await screen.findByRole('button', { name: 'Sıranı dəyiş' }))
      const dialog = await screen.findByRole('dialog', { name: 'Mövzuların sırası' })
      await user.click(await within(dialog).findByRole('button', { name: 'Maliyyə savadlılığı — yuxarı' }))

      await waitFor(() =>
        expect([...faqTopicsStore.store.all()].sort((a, b) => a.sortOrder - b.sortOrder).map((row) => row.id)).toEqual([
          1, 3, 2,
        ]),
      )
    })
  })

  describe('Videolar', () => {
    it('refuses a YouTube link without a video', async () => {
      const posts = spyWriteBodies('post', faqVideosStore.base)
      const user = userEvent.setup()
      renderFaq('/faq/videos/new')

      await user.type(await screen.findByRole('textbox', { name: 'YouTube linki' }), 'https://www.youtube.com/')
      await user.type(screen.getByRole('textbox', { name: /Başlıq \(AZ\)/ }), 'Manat')
      await user.click(save())

      expect(await screen.findByText(FAQ_YOUTUBE_INVALID)).toBeInTheDocument()
      expect(posts).toHaveLength(0)

      await user.clear(screen.getByRole('textbox', { name: 'YouTube linki' }))
      await user.type(screen.getByRole('textbox', { name: 'YouTube linki' }), 'https://youtu.be/xyz789ABC')
      await user.click(save())
      await waitFor(() => expect(posts).toHaveLength(1))
      expect(faqVideosStore.store.all().map((row) => row.youtubeId)).toContain('xyz789ABC')
    })
  })
})
