import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

import { API } from '@/shared/testing/api-base'
import { pageDetailFixture } from '@/shared/testing/fixtures/pages'
import { renderApp, screen, within } from '@/shared/testing/render'
import { server } from '@/shared/testing/server'

import { FaqView } from './index'
import { loadFaqPage } from './loader'

/** The FAQ CMS page in both locales: az `sual-cavab`, en `faq` (spec 051 FAQ_SLUG). */
function mockFaqPage() {
  server.use(
    http.get(`${API}/api/v1/pages/:slug`, ({ params, request }) => {
      const locale = new URL(request.url).searchParams.get('locale')
      const title = locale === 'en' ? 'Frequently asked questions' : 'Sual-cavab'
      return HttpResponse.json({ ...pageDetailFixture, id: 131, title, slug: String(params.slug), content: '<p>Köhnə mətn</p>', assets: [] })
    }),
  )
}

async function renderFaq(searchParams: Record<string, string> = {}, locale: 'az' | 'en' = 'az') {
  mockFaqPage()
  const data = await loadFaqPage(locale, locale === 'en' ? 'faq' : 'sual-cavab', searchParams)
  if (!data) throw new Error('FAQ data expected')
  renderApp(<FaqView data={data} />, { locale })
  return data
}

const topicCard = (name: string) => screen.getByText(name, { selector: 'summary span' }).closest('details')!
const question = (text: RegExp) => screen.getByText(text, { selector: 'summary span' }).closest('details')!

describe('FAQ page — view A (spec 051 US1)', () => {
  it('shows the breadcrumb, the title, a full-width search without a topic choice, and the closed topic cards', async () => {
    await renderFaq()

    expect(screen.getByRole('link', { name: 'Ana səhifə' })).toHaveAttribute('href', '/az')
    expect(screen.getByRole('heading', { level: 1, name: 'Sual-cavab' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Suallarda axtar' })).toHaveAttribute('placeholder', 'Sualınızı axtarın, məsələn: inflyasiya, REPO, məzənnə')
    expect(screen.queryByRole('combobox')).toBeNull()

    expect(within(topicCard('Pul siyasəti')).getByText('3 sual')).toBeInTheDocument()
    expect(topicCard('Pul siyasəti')).not.toHaveAttribute('open')
    expect(topicCard('Ödəniş xidmətləri və ödəniş sistemləri')).not.toHaveAttribute('open')
  })

  it('opens a topic, then a question, and shows the numbered question and its answer with its markup', async () => {
    await renderFaq()
    const user = userEvent.setup()

    await user.click(screen.getByText('Pul siyasəti', { selector: 'summary span' }))
    expect(topicCard('Pul siyasəti')).toHaveAttribute('open')
    expect(within(topicCard('Pul siyasəti')).getByText('1. Pul siyasəti nədir?')).toBeInTheDocument()

    await user.click(screen.getByText('1. Pul siyasəti nədir?'))
    expect(question(/Pul siyasəti nədir/)).toHaveAttribute('open')
    expect(question(/Pul siyasəti nədir/)).toHaveAttribute('id', 'sual-101')

    const table = within(question(/lisenziya/)).getByRole('table')
    expect(within(table).getByText('Ödəniş xidmətləri')).toBeInTheDocument()
  })

  it('links each topic to its own view and shows the videos as YouTube links', async () => {
    await renderFaq()

    expect(within(topicCard('Pul siyasəti')).getByRole('link', { name: /Ayrıca aç/ })).toHaveAttribute('href', '/az/sual-cavab?topic=pul-siyaseti')
    expect(screen.getByRole('heading', { level: 2, name: 'Video sual-cavab' })).toBeInTheDocument()
    const video = screen.getByRole('link', { name: /Sığorta hadisəsi zamanı.*YouTube-da bax/ })
    expect(video).toHaveAttribute('href', 'https://www.youtube.com/watch?v=FZrEo1nXlgs')
    expect(video).toHaveAttribute('target', '_blank')
    expect(video).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('FAQ page — search (spec 051 US2)', () => {
  it('keeps the matching questions, open, in an open topic, and says how many', async () => {
    await renderFaq({ q: 'REPO' })

    expect(screen.getByRole('searchbox')).toHaveValue('REPO')
    expect(screen.queryByText('Ödəniş xidmətləri və ödəniş sistemləri', { selector: 'summary span' })).toBeNull()
    expect(topicCard('Pul siyasəti')).toHaveAttribute('open')
    expect(within(topicCard('Pul siyasəti')).getByText('1 sual')).toBeInTheDocument()
    expect(question(/REPO və əks-REPO/)).toHaveAttribute('open')
    expect(screen.getByText('3. REPO və əks-REPO nədir?')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 sual tapıldı')
  })

  it('shows an empty state with a link that clears the search, and keeps the videos', async () => {
    await renderFaq({ q: 'yoxdur-belə-söz' })

    expect(screen.getByText('«yoxdur-belə-söz» üzrə sual tapılmadı')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Axtarışı təmizlə' })).toHaveAttribute('href', '/az/sual-cavab')
    expect(screen.getByRole('heading', { level: 2, name: 'Video sual-cavab' })).toBeInTheDocument()
  })

  it('submits the search as a plain GET form to the page itself', async () => {
    await renderFaq()
    const form = screen.getByRole('search', { name: 'Suallarda axtar' })
    expect(form).toHaveAttribute('method', 'get')
    expect(form).toHaveAttribute('action', '/az/sual-cavab')
    expect(screen.getByRole('searchbox')).toHaveAttribute('name', 'q')
  })
})

describe('FAQ page — topic view B (spec 051 US3)', () => {
  it('shows the chosen topic as a heading with its numbered questions and a topic choice', async () => {
    await renderFaq({ topic: 'odenis-xidmetleri-ve-odenis-sistemleri' })

    expect(screen.getByRole('heading', { level: 2, name: 'Ödəniş xidmətləri və ödəniş sistemləri' })).toBeInTheDocument()
    expect(screen.getByText('1. Hansı fəaliyyət növləri lisenziya əsasında icra oluna bilər?')).toBeInTheDocument()
    expect(screen.queryByText('Pul siyasəti', { selector: 'summary span' })).toBeNull()

    const select = screen.getByRole('combobox', { name: 'Mövzu' })
    expect(select).toHaveValue('odenis-xidmetleri-ve-odenis-sistemleri')
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Bütün mövzular',
      'Pul siyasəti',
      'Ödəniş xidmətləri və ödəniş sistemləri',
    ])
  })

  it('submits the form when another topic is chosen', async () => {
    await renderFaq({ topic: 'pul-siyaseti' })
    const user = userEvent.setup()
    const form = screen.getByRole('search') as HTMLFormElement
    let submitted: string | null = null
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      submitted = new FormData(form).get('topic') as string
    })

    await user.selectOptions(screen.getByRole('combobox', { name: 'Mövzu' }), 'Bütün mövzular')
    expect(submitted).toBe('')
  })

  it('falls back to view A for an unknown topic', async () => {
    await renderFaq({ topic: 'yoxdur' })
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(topicCard('Pul siyasəti')).toBeInTheDocument()
  })
})

describe('FAQ page — en (spec 051 US4)', () => {
  it('shows the en topics and questions with the en labels', async () => {
    await renderFaq({}, 'en')

    expect(screen.getByRole('heading', { level: 1, name: 'Frequently asked questions' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search the questions' })).toBeInTheDocument()
    expect(within(topicCard('Monetary policy')).getByText('1 question')).toBeInTheDocument()
    expect(screen.getByText('1. What are inflation and deflation?')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Video Q&A' })).toBeNull()
  })

  it('searches the en texts', async () => {
    await renderFaq({ q: 'inflation' }, 'en')
    expect(screen.getByRole('status')).toHaveTextContent('1 question found')
  })

  it('shows only the topics the en response has: an az-only topic is not there', async () => {
    await renderFaq({}, 'en')

    expect(document.querySelectorAll('[data-slot="faq-topics"] > li')).toHaveLength(1)
    expect(screen.queryByText('Ödəniş xidmətləri və ödəniş sistemləri')).toBeNull()
    expect(screen.queryByText(/Pul siyasəti/)).toBeNull()
  })

  it('keeps the question anchor of the az page, so a shared #sual- link opens the same question', async () => {
    await renderFaq({}, 'en')
    expect(question(/What are inflation and deflation/)).toHaveAttribute('id', 'sual-102')
  })

  it('opens a topic by the same slug as in az (view B)', async () => {
    await renderFaq({ topic: 'pul-siyaseti' }, 'en')
    expect(screen.getByRole('heading', { level: 2, name: 'Monetary policy' })).toBeInTheDocument()
    expect(screen.getByText('1. What are inflation and deflation?')).toBeInTheDocument()
  })

  it('falls back to view A for a topic that has no en questions', async () => {
    await renderFaq({ topic: 'odenis-xidmetleri-ve-odenis-sistemleri' }, 'en')
    expect(screen.queryByRole('heading', { level: 2, name: /Ödəniş/ })).toBeNull()
    expect(topicCard('Monetary policy')).toBeInTheDocument()
  })

  it('says so in en when a search finds nothing', async () => {
    await renderFaq({ q: 'bitcoin' }, 'en')
    expect(screen.getByText('No questions found for “bitcoin”')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Clear the search' })).toHaveAttribute('href', '/en/faq')
  })
})
