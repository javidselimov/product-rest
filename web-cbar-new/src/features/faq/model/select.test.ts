import { describe, expect, it } from 'vitest'

import { faqAz } from '@/shared/testing/fixtures/faq'

import { buildFaqView } from './select'

const all = (q = '', topic = '') => buildFaqView(faqAz, { q, topic })

describe('buildFaqView — view A (US1)', () => {
  it('lists every topic closed, with its questions numbered from 1 in the editor order', () => {
    const view = all()
    expect(view?.kind).toBe('all')
    if (view?.kind !== 'all') return
    expect(view.topics.map((t) => [t.slug, t.total, t.open])).toEqual([
      ['pul-siyaseti', 3, false],
      ['odenis-xidmetleri-ve-odenis-sistemleri', 2, false],
    ])
    expect(view.topics[0]!.questions.map((q) => [q.number, q.id, q.open])).toEqual([
      [1, 101, false],
      [2, 102, false],
      [3, 103, false],
    ])
    expect(view.matches).toBe(5)
  })

  it('prepares the answer HTML like page content', () => {
    const view = all()
    if (view?.kind !== 'all') throw new Error('view A expected')
    expect(view.topics[1]!.questions[0]!.answerHtml).toContain('<table>')
  })

  it('is null for an FAQ without topics, so the page falls back to its CMS text', () => {
    expect(buildFaqView({ topics: [], videos: [] }, { q: '', topic: '' })).toBeNull()
  })
})

describe('buildFaqView — search (US2)', () => {
  it('keeps only matching questions, open, with their original numbers, in open topics', () => {
    const view = all('repo')
    if (view?.kind !== 'all') throw new Error('view A expected')
    expect(view.topics).toHaveLength(1)
    expect(view.topics[0]).toMatchObject({ slug: 'pul-siyaseti', total: 1, open: true })
    expect(view.topics[0]!.questions.map((q) => [q.number, q.open])).toEqual([[3, true]])
    expect(view.matches).toBe(1)
  })

  it('folds case and the dotted/dotless i', () => {
    const lower = all('inflyasiya')
    const upper = all('İNFLYASİYA')
    expect(upper).toEqual({ ...lower, query: 'İNFLYASİYA' })
    if (lower?.kind !== 'all') throw new Error('view A expected')
    expect(lower.matches).toBe(1)
  })

  it('searches the answer text, not its markup', () => {
    const byAnswer = all('məzənnə')
    if (byAnswer?.kind !== 'all') throw new Error('view A expected')
    expect(byAnswer.topics[0]!.questions.map((q) => q.id)).toEqual([202])
    const byMarkup = all('href')
    if (byMarkup?.kind !== 'all') throw new Error('view A expected')
    expect(byMarkup.matches).toBe(0)
  })

  it('reports no match without topics, and a blank query is the first view', () => {
    const none = all('yoxdur-belə-söz')
    if (none?.kind !== 'all') throw new Error('view A expected')
    expect(none.topics).toEqual([])
    expect(none.matches).toBe(0)
    expect(all('   ')).toEqual(all())
  })
})

describe('buildFaqView — topic (US3)', () => {
  it('shows the chosen topic alone, with every topic as an option', () => {
    const view = all('', 'pul-siyaseti')
    expect(view?.kind).toBe('topic')
    if (view?.kind !== 'topic') return
    expect(view.topic.slug).toBe('pul-siyaseti')
    expect(view.topic.questions).toHaveLength(3)
    expect(view.options.map((o) => o.slug)).toEqual(['pul-siyaseti', 'odenis-xidmetleri-ve-odenis-sistemleri'])
  })

  it('falls back to view A for an unknown topic', () => {
    expect(all('', 'yoxdur')?.kind).toBe('all')
  })

  it('applies the search inside the topic; no match keeps the topic with no questions', () => {
    const match = all('repo', 'pul-siyaseti')
    if (match?.kind !== 'topic') throw new Error('view B expected')
    expect(match.topic.questions.map((q) => q.id)).toEqual([103])
    const none = all('repo', 'odenis-xidmetleri-ve-odenis-sistemleri')
    if (none?.kind !== 'topic') throw new Error('view B expected')
    expect(none.topic.questions).toEqual([])
    expect(none.matches).toBe(0)
  })
})
