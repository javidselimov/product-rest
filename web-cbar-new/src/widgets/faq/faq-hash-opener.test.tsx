import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FaqHashOpener } from './faq-hash-opener'

function page() {
  document.body.innerHTML = `
    <details id="topic"><summary>Pul siyasəti</summary>
      <ul><li><details id="sual-101"><summary>1. Pul siyasəti nədir?</summary><p>Cavab</p></details></li></ul>
    </details>`
  return { topic: document.getElementById('topic') as HTMLDetailsElement, question: document.getElementById('sual-101') as HTMLDetailsElement }
}

describe('FaqHashOpener (spec 051 FR-016a)', () => {
  afterEach(() => {
    window.location.hash = ''
    document.body.innerHTML = ''
  })

  it('opens the linked question and its topic and scrolls to it', () => {
    const { topic, question } = page()
    const scroll = vi.fn()
    question.scrollIntoView = scroll
    window.location.hash = '#sual-101'

    render(<FaqHashOpener />, { container: document.body.appendChild(document.createElement('div')) })

    expect(topic.open).toBe(true)
    expect(question.open).toBe(true)
    expect(scroll).toHaveBeenCalled()
  })

  it('leaves other fragments and malformed ones alone', () => {
    const { topic } = page()
    window.location.hash = '#sual-%E0'
    render(<FaqHashOpener />, { container: document.body.appendChild(document.createElement('div')) })
    expect(topic.open).toBe(false)

    window.location.hash = '#other'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    expect(topic.open).toBe(false)
  })
})
